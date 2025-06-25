"""
Redis Cache Manager dla Predykcji ML
====================================
System caching dla FastAPI + Redis na Railway
Autor: EstymatorAI Team
"""

import redis.asyncio as redis
import json
import hashlib
import logging
from typing import Optional, Dict, Any
from datetime import datetime
import os
from contextlib import asynccontextmanager

logger = logging.getLogger(__name__)

class PredictionCache:
    """Manager cache'a dla predykcji ML z Redis"""
    
    def __init__(self):
        self.redis_client: Optional[redis.Redis] = None
        self.model_version = "estymatorai-v2.1-0.79pct"
        self.default_ttl = 60 * 60 * 6  # 6 godzin
        self.enabled = False
        
        # Metryki cache
        self.stats = {
            "hits": 0,
            "misses": 0,
            "errors": 0,
            "total_requests": 0
        }
    
    async def initialize(self):
        """Inicjalizacja połączenia z Redis"""
        try:
            redis_url = os.getenv("REDIS_URL")
            if not redis_url:
                logger.warning("REDIS_URL nie skonfigurowany - cache wyłączony")
                return
            
            # Podłączenie do Redis
            self.redis_client = redis.from_url(
                redis_url,
                encoding="utf-8",
                decode_responses=True,
                socket_connect_timeout=5,
                socket_timeout=5,
                retry_on_timeout=True,
                health_check_interval=30
            )
            
            # Test połączenia
            await self.redis_client.ping()
            self.enabled = True
            logger.info(f"✅ Redis cache połączony: {redis_url}")
            
        except Exception as e:
            logger.error(f"❌ Błąd połączenia z Redis: {e}")
            self.redis_client = None
            self.enabled = False
    
    async def close(self):
        """Zamknięcie połączenia z Redis"""
        if self.redis_client:
            await self.redis_client.close()
            logger.info("Redis połączenie zamknięte")
    
    def _generate_cache_key(self, request_data: Dict[str, Any]) -> str:
        """Generuje unikalny klucz cache dla żądania"""
        # Sortuj klucze dla konsystentności
        sorted_data = json.dumps(request_data, sort_keys=True, ensure_ascii=False)
        data_hash = hashlib.sha256(sorted_data.encode()).hexdigest()[:16]
        
        return f"prediction:{self.model_version}:{data_hash}"
    
    async def get_cached_prediction(self, request_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Pobiera predykcję z cache"""
        if not self.enabled:
            return None
        
        self.stats["total_requests"] += 1
        cache_key = self._generate_cache_key(request_data)
        
        try:
            cached_result = await self.redis_client.get(cache_key)
            
            if cached_result:
                self.stats["hits"] += 1
                result = json.loads(cached_result)
                result["cached"] = True
                result["cache_timestamp"] = datetime.now().isoformat()
                logger.info(f"🎯 Cache HIT: {cache_key[:32]}...")
                return result
            else:
                self.stats["misses"] += 1
                logger.info(f"🔍 Cache MISS: {cache_key[:32]}...")
                return None
                
        except Exception as e:
            self.stats["errors"] += 1
            logger.error(f"❌ Błąd odczytu cache: {e}")
            return None
    
    async def set_cached_prediction(
        self, 
        request_data: Dict[str, Any], 
        prediction_result: Dict[str, Any],
        ttl: Optional[int] = None
    ) -> bool:
        """Zapisuje predykcję do cache"""
        if not self.enabled:
            return False
        
        cache_key = self._generate_cache_key(request_data)
        ttl = ttl or self.default_ttl
        
        try:
            # Dodaj metadane cache
            cache_data = prediction_result.copy()
            cache_data.update({
                "cached": False,
                "cache_created": datetime.now().isoformat(),
                "cache_ttl": ttl,
                "model_version": self.model_version
            })
            
            await self.redis_client.set(
                cache_key,
                json.dumps(cache_data, ensure_ascii=False),
                ex=ttl
            )
            
            logger.info(f"💾 Cache SET: {cache_key[:32]}... (TTL: {ttl}s)")
            return True
            
        except Exception as e:
            self.stats["errors"] += 1
            logger.error(f"❌ Błąd zapisu cache: {e}")
            return False
    
    async def invalidate_model_cache(self, model_version: Optional[str] = None):
        """Usuwa wszystkie wpisy cache dla danej wersji modelu"""
        if not self.enabled:
            return 0
        
        version = model_version or self.model_version
        pattern = f"prediction:{version}:*"
        
        try:
            deleted_count = 0
            async for key in self.redis_client.scan_iter(match=pattern, count=100):
                await self.redis_client.delete(key)
                deleted_count += 1
            
            logger.info(f"🧹 Usunięto {deleted_count} wpisów cache dla modelu {version}")
            return deleted_count
            
        except Exception as e:
            logger.error(f"❌ Błąd czyszczenia cache: {e}")
            return 0
    
    async def get_cache_stats(self) -> Dict[str, Any]:
        """Zwraca statystyki cache"""
        stats = self.stats.copy()
        
        if stats["total_requests"] > 0:
            stats["hit_rate"] = round(stats["hits"] / stats["total_requests"] * 100, 2)
            stats["miss_rate"] = round(stats["misses"] / stats["total_requests"] * 100, 2)
            stats["error_rate"] = round(stats["errors"] / stats["total_requests"] * 100, 2)
        else:
            stats["hit_rate"] = 0.0
            stats["miss_rate"] = 0.0
            stats["error_rate"] = 0.0
        
        # Dodaj info o Redis
        if self.enabled and self.redis_client:
            try:
                redis_info = await self.redis_client.info("memory")
                stats["redis_memory_used"] = redis_info.get("used_memory_human", "N/A")
                stats["redis_connected"] = True
            except:
                stats["redis_connected"] = False
        else:
            stats["redis_connected"] = False
        
        stats["model_version"] = self.model_version
        stats["cache_enabled"] = self.enabled
        
        return stats
    
    async def health_check(self) -> Dict[str, Any]:
        """Health check dla Redis cache"""
        if not self.enabled:
            return {
                "status": "disabled",
                "redis_connected": False,
                "message": "Redis cache nie skonfigurowany"
            }
        
        try:
            latency = await self.redis_client.ping()
            return {
                "status": "healthy",
                "redis_connected": True,
                "latency_ms": latency * 1000 if latency else None,
                "model_version": self.model_version
            }
        except Exception as e:
            return {
                "status": "error",
                "redis_connected": False,
                "error": str(e)
            }

# Globalna instancja cache
cache_manager = PredictionCache()

@asynccontextmanager
async def get_cache():
    """Context manager dla cache"""
    yield cache_manager 