"""
Cache service for external API calls with rate limiting
Part of FAZA 1: ZADANIE #002

Używa in-memory cache z opcjonalnym Redis w środowisku produkcyjnym.
Redis będzie potrzebny dopiero gdy zaczniemy intensywnie używać zewnętrznych API.
"""

import json
import time
import hashlib
from typing import Optional, Dict, Any
from datetime import datetime, timedelta
import asyncio
from asyncio_throttle import Throttler
import os
from functools import wraps

class CacheService:
    def __init__(self):
        """Initialize cache service with in-memory storage and optional Redis"""
        # Podstawowy in-memory cache
        self._memory_cache = {}
        self._cache_stats = {'hits': 0, 'misses': 0, 'sets': 0}
        
        # Opcjonalne Redis (tylko jeśli REDIS_URL jest ustawione)
        self.redis_available = False
        redis_url = os.getenv('REDIS_URL')
        
        if redis_url:
            try:
                import redis
                self.redis_client = redis.from_url(redis_url, decode_responses=True)
                self.redis_client.ping()
                self.redis_available = True
                print("✅ Redis cache available")
            except (ImportError, Exception) as e:
                print(f"ℹ️ Redis not available, using in-memory cache: {e}")
        else:
            print("ℹ️ No REDIS_URL set, using in-memory cache")
        
        # Rate limiters for external APIs
        self.overpass_throttler = Throttler(rate_limit=1, period=1.0)  # 1 req/sec
        self.openrouteservice_throttler = Throttler(rate_limit=40, period=60.0)  # 40 req/min
        self.nominatim_throttler = Throttler(rate_limit=1, period=1.0)  # 1 req/sec
        
    def _generate_cache_key(self, service: str, **kwargs) -> str:
        """Generate unique cache key from service name and parameters"""
        params_str = json.dumps(kwargs, sort_keys=True)
        hash_object = hashlib.md5(params_str.encode())
        return f"{service}:{hash_object.hexdigest()}"
    
    def _cleanup_memory_cache(self):
        """Remove expired entries from memory cache"""
        now = datetime.now()
        expired_keys = []
        
        for key, data in self._memory_cache.items():
            if datetime.fromisoformat(data['expires_at']) <= now:
                expired_keys.append(key)
        
        for key in expired_keys:
            del self._memory_cache[key]
            
        # Limit memory cache size (max 1000 entries)
        if len(self._memory_cache) > 1000:
            # Remove oldest 200 entries
            sorted_items = sorted(
                self._memory_cache.items(), 
                key=lambda x: x[1]['cached_at']
            )
            for key, _ in sorted_items[:200]:
                del self._memory_cache[key]
    
    def get_cached(self, service: str, ttl_hours: int = 24, **kwargs) -> Optional[Dict[Any, Any]]:
        """Get cached result if available and not expired"""
        cache_key = self._generate_cache_key(service, **kwargs)
        
        # Try Redis first if available
        if self.redis_available:
            try:
                cached = self.redis_client.get(cache_key)
                if cached:
                    data = json.loads(cached)
                    if datetime.fromisoformat(data['expires_at']) > datetime.now():
                        self._cache_stats['hits'] += 1
                        return data['result']
                    else:
                        self.redis_client.delete(cache_key)
            except Exception as e:
                print(f"Redis get error: {e}")
        
        # Fallback to in-memory cache
        self._cleanup_memory_cache()
        
        if cache_key in self._memory_cache:
            data = self._memory_cache[cache_key]
            if datetime.fromisoformat(data['expires_at']) > datetime.now():
                self._cache_stats['hits'] += 1
                return data['result']
            else:
                del self._memory_cache[cache_key]
        
        self._cache_stats['misses'] += 1
        return None
    
    def set_cached(self, service: str, result: Dict[Any, Any], ttl_hours: int = 24, **kwargs):
        """Cache result with TTL"""
        cache_key = self._generate_cache_key(service, **kwargs)
        expires_at = datetime.now() + timedelta(hours=ttl_hours)
        
        data = {
            'result': result,
            'expires_at': expires_at.isoformat(),
            'cached_at': datetime.now().isoformat()
        }
        
        # Try Redis first if available
        if self.redis_available:
            try:
                self.redis_client.setex(
                    cache_key, 
                    int(ttl_hours * 3600), 
                    json.dumps(data)
                )
                self._cache_stats['sets'] += 1
                return
            except Exception as e:
                print(f"Redis set error: {e}")
        
        # Fallback to in-memory cache
        self._memory_cache[cache_key] = data
        self._cache_stats['sets'] += 1
    
    def get_stats(self) -> Dict[str, Any]:
        """Get cache performance statistics"""
        total_requests = self._cache_stats['hits'] + self._cache_stats['misses']
        hit_rate = (self._cache_stats['hits'] / total_requests * 100) if total_requests > 0 else 0
        
        return {
            **self._cache_stats,
            'hit_rate_percent': round(hit_rate, 2),
            'memory_cache_size': len(self._memory_cache),
            'redis_available': self.redis_available
        }
    
    async def with_throttle(self, service: str, coro):
        """Execute coroutine with appropriate rate limiting"""
        throttler_map = {
            'overpass': self.overpass_throttler,
            'openrouteservice': self.openrouteservice_throttler,
            'nominatim': self.nominatim_throttler
        }
        
        throttler = throttler_map.get(service)
        if throttler:
            async with throttler:
                return await coro
        else:
            return await coro


class GeospatialCache:
    """Specialized cache for geospatial data with tile-based storage"""
    
    @staticmethod
    def lat_lon_to_tile(lat: float, lon: float, zoom: int = 10) -> tuple:
        """Convert lat/lon to tile coordinates for caching spatial data"""
        import math
        
        lat_rad = math.radians(lat)
        n = 2.0 ** zoom
        x = int((lon + 180.0) / 360.0 * n)
        y = int((1.0 - math.asinh(math.tan(lat_rad)) / math.pi) / 2.0 * n)
        
        return (x, y, zoom)
    
    @staticmethod
    def get_nearby_tiles(lat: float, lon: float, radius_km: float, zoom: int = 10) -> list:
        """Get list of tiles within radius for comprehensive caching"""
        import math
        
        # Approximate degrees per km at given latitude
        lat_per_km = 1.0 / 111.32
        lon_per_km = 1.0 / (111.32 * math.cos(math.radians(lat)))
        
        # Calculate bounding box
        lat_offset = radius_km * lat_per_km
        lon_offset = radius_km * lon_per_km
        
        tiles = []
        for dlat in [-lat_offset, 0, lat_offset]:
            for dlon in [-lon_offset, 0, lon_offset]:
                tile = GeospatialCache.lat_lon_to_tile(lat + dlat, lon + dlon, zoom)
                if tile not in tiles:
                    tiles.append(tile)
        
        return tiles


def cached_api_call(service: str, ttl_hours: int = 24):
    """Decorator for caching API calls"""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            cache = CacheService()
            
            # Try to get from cache first
            cached_result = cache.get_cached(service, ttl_hours, **kwargs)
            if cached_result is not None:
                return cached_result
            
            # If not cached, make the API call with throttling
            try:
                if asyncio.iscoroutinefunction(func):
                    result = await cache.with_throttle(service, func(*args, **kwargs))
                else:
                    result = func(*args, **kwargs)
                
                # Cache the result
                cache.set_cached(service, result, ttl_hours, **kwargs)
                return result
                
            except Exception as e:
                print(f"API call failed for {service}: {e}")
                # Return cached result even if expired, or empty dict
                cached_result = cache.get_cached(service, ttl_hours=999999, **kwargs)
                return cached_result or {}
        
        return wrapper
    return decorator


# Global cache instance
_global_cache = None

def get_cache() -> CacheService:
    """Get global cache instance (singleton pattern)"""
    global _global_cache
    if _global_cache is None:
        _global_cache = CacheService()
    return _global_cache 