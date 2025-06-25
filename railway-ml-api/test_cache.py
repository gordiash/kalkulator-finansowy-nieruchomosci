"""
Test Script dla Redis Cache System
==================================
Testuje funkcjonalność cache dla EstymatorAI API
"""

import asyncio
import aiohttp
import json
import time
from typing import Dict, List

class CacheTestRunner:
    """Tester systemu cache"""
    
    def __init__(self, api_url: str = "http://localhost:8000"):
        self.api_url = api_url
        self.results = []
    
    async def test_single_request(self, session: aiohttp.ClientSession, payload: Dict) -> Dict:
        """Test pojedynczego żądania"""
        start_time = time.time()
        
        try:
            async with session.post(f"{self.api_url}/predict", json=payload) as response:
                if response.status == 200:
                    data = await response.json()
                    latency = (time.time() - start_time) * 1000  # ms
                    
                    return {
                        "success": True,
                        "latency_ms": round(latency, 2),
                        "cached": data.get("cached", False),
                        "price": data.get("price"),
                        "method": data.get("method"),
                        "error": None
                    }
                else:
                    return {
                        "success": False,
                        "latency_ms": (time.time() - start_time) * 1000,
                        "error": f"HTTP {response.status}"
                    }
        except Exception as e:
            return {
                "success": False,
                "latency_ms": (time.time() - start_time) * 1000,
                "error": str(e)
            }
    
    async def test_cache_hit_scenario(self):
        """Test scenariusza Cache HIT"""
        print("🎯 Test Cache HIT Scenario")
        print("=" * 50)
        
        # Identyczne żądanie 5 razy
        payload = {
            "city": "Olsztyn",
            "district": "Kortowo",
            "area": 65.5,
            "rooms": 3,
            "year": 2020,
            "locationTier": "high"
        }
        
        async with aiohttp.ClientSession() as session:
            results = []
            
            for i in range(5):
                print(f"Request {i+1}/5...", end=" ")
                result = await self.test_single_request(session, payload)
                results.append(result)
                
                if result["success"]:
                    status = "🎯 CACHE HIT" if result["cached"] else "🔍 CACHE MISS"
                    print(f"{status} - {result['latency_ms']}ms")
                else:
                    print(f"❌ ERROR: {result['error']}")
                
                # Krótka przerwa między żądaniami
                await asyncio.sleep(0.1)
        
        # Analiza wyników
        successful = [r for r in results if r["success"]]
        cache_hits = [r for r in successful if r["cached"]]
        cache_misses = [r for r in successful if not r["cached"]]
        
        print(f"\n📊 Wyniki:")
        print(f"  Successful: {len(successful)}/5")
        print(f"  Cache HITs: {len(cache_hits)}")
        print(f"  Cache MISSes: {len(cache_misses)}")
        
        if cache_hits:
            avg_hit_latency = sum(r["latency_ms"] for r in cache_hits) / len(cache_hits)
            print(f"  Avg HIT latency: {avg_hit_latency:.1f}ms")
        
        if cache_misses:
            avg_miss_latency = sum(r["latency_ms"] for r in cache_misses) / len(cache_misses)
            print(f"  Avg MISS latency: {avg_miss_latency:.1f}ms")
        
        return results
    
    async def test_different_requests(self):
        """Test różnych żądań (Cache MISS expected)"""
        print("\n🔍 Test Different Requests (Cache MISS)")
        print("=" * 50)
        
        payloads = [
            {"city": "Olsztyn", "area": 45.0, "rooms": 2, "year": 2018},
            {"city": "Olsztyn", "area": 75.5, "rooms": 4, "year": 2015},
            {"city": "Dywity", "area": 55.0, "rooms": 3, "year": 2021},
            {"city": "Stawiguda", "area": 60.0, "rooms": 3, "year": 2019},
        ]
        
        async with aiohttp.ClientSession() as session:
            results = []
            
            for i, payload in enumerate(payloads):
                print(f"Request {i+1}/{len(payloads)}...", end=" ")
                result = await self.test_single_request(session, payload)
                results.append(result)
                
                if result["success"]:
                    status = "🎯 CACHE HIT" if result["cached"] else "🔍 CACHE MISS"
                    print(f"{status} - {result['latency_ms']}ms - {payload['city']} {payload['area']}m²")
                else:
                    print(f"❌ ERROR: {result['error']}")
        
        return results
    
    async def test_cache_stats(self):
        """Test endpointu statystyk cache"""
        print("\n📈 Cache Statistics")
        print("=" * 50)
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(f"{self.api_url}/cache/stats") as response:
                    if response.status == 200:
                        stats = await response.json()
                        
                        print(f"  Total Requests: {stats.get('total_requests', 0)}")
                        print(f"  Cache Hits: {stats.get('hits', 0)}")
                        print(f"  Cache Misses: {stats.get('misses', 0)}")
                        print(f"  Hit Rate: {stats.get('hit_rate', 0):.1f}%")
                        print(f"  Redis Connected: {stats.get('redis_connected', False)}")
                        print(f"  Model Version: {stats.get('model_version', 'N/A')}")
                        
                        if stats.get('redis_memory_used'):
                            print(f"  Redis Memory: {stats['redis_memory_used']}")
                        
                        return stats
                    else:
                        print(f"❌ Error getting stats: HTTP {response.status}")
                        return None
        except Exception as e:
            print(f"❌ Error: {e}")
            return None
    
    async def test_health_check(self):
        """Test health check z cache info"""
        print("\n🏥 Health Check")
        print("=" * 50)
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(f"{self.api_url}/health") as response:
                    if response.status == 200:
                        health = await response.json()
                        
                        print(f"  API Status: {health.get('status', 'unknown')}")
                        
                        cache_info = health.get('cache', {})
                        print(f"  Cache Status: {cache_info.get('status', 'unknown')}")
                        print(f"  Redis Connected: {cache_info.get('redis_connected', False)}")
                        
                        if cache_info.get('latency_ms'):
                            print(f"  Redis Latency: {cache_info['latency_ms']:.1f}ms")
                        
                        models = health.get('models', {})
                        print(f"  Models Loaded: Ensemble={models.get('ensemble', False)}, RF={models.get('rf', False)}")
                        
                        return health
                    else:
                        print(f"❌ Error: HTTP {response.status}")
                        return None
        except Exception as e:
            print(f"❌ Error: {e}")
            return None
    
    async def test_cache_invalidation(self):
        """Test czyszczenia cache"""
        print("\n🧹 Cache Invalidation Test")
        print("=" * 50)
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(f"{self.api_url}/cache/invalidate") as response:
                    if response.status == 200:
                        result = await response.json()
                        print(f"  ✅ Cache cleared: {result.get('message', 'Unknown')}")
                        return result
                    else:
                        print(f"❌ Error: HTTP {response.status}")
                        return None
        except Exception as e:
            print(f"❌ Error: {e}")
            return None
    
    async def run_full_test_suite(self):
        """Uruchom pełny test suite"""
        print("🚀 Redis Cache Test Suite")
        print("=" * 80)
        
        # 1. Health Check
        await self.test_health_check()
        
        # 2. Initial Stats
        await self.test_cache_stats()
        
        # 3. Cache Invalidation (clear old data)
        await self.test_cache_invalidation()
        
        # 4. Different Requests (populate cache)
        await self.test_different_requests()
        
        # 5. Cache HIT Scenario
        await self.test_cache_hit_scenario()
        
        # 6. Final Stats
        await self.test_cache_stats()
        
        print("\n✅ Test Suite Completed!")

async def main():
    """Main test runner"""
    import sys
    
    api_url = "http://localhost:8000"
    if len(sys.argv) > 1:
        api_url = sys.argv[1]
    
    print(f"Testing API at: {api_url}")
    
    tester = CacheTestRunner(api_url)
    await tester.run_full_test_suite()

if __name__ == "__main__":
    asyncio.run(main()) 