"""
Railway compatibility test for FAZA 1 dependencies
Part of ZADANIE #001 - Test kompatybilności z Railway.app deployment
"""

import sys
import importlib
import traceback
from typing import Dict, List
import os

def test_import(module_name: str, fallback_name: str = None) -> Dict[str, any]:
    """Test if a module can be imported successfully"""
    result = {
        'module': module_name,
        'status': 'success',
        'error': None,
        'version': None,
        'fallback_used': False
    }
    
    try:
        # Try primary import
        module = importlib.import_module(module_name)
        if hasattr(module, '__version__'):
            result['version'] = module.__version__
        return result
        
    except ImportError as e:
        if fallback_name:
            try:
                # Try fallback import
                module = importlib.import_module(fallback_name)
                result['fallback_used'] = True
                result['module'] = fallback_name
                if hasattr(module, '__version__'):
                    result['version'] = module.__version__
                return result
            except ImportError:
                pass
        
        result['status'] = 'failed'
        result['error'] = str(e)
        return result
    
    except Exception as e:
        result['status'] = 'error'
        result['error'] = f"Unexpected error: {str(e)}"
        return result

def test_onnx_functionality():
    """Test basic ONNX Runtime functionality"""
    try:
        import onnxruntime as ort
        import numpy as np
        
        # Test session creation capabilities
        providers = ort.get_available_providers()
        
        print(f"  Available ONNX providers: {providers}")
        
        # Test if we can create a simple session
        # This is just to verify basic functionality
        test_passed = len(providers) > 0 and 'CPUExecutionProvider' in providers
        
        return {
            'status': 'success' if test_passed else 'warning',
            'providers': providers,
            'cpu_available': 'CPUExecutionProvider' in providers
        }
        
    except Exception as e:
        return {
            'status': 'failed',
            'error': str(e)
        }

def test_opencv_functionality():
    """Test basic OpenCV functionality"""
    try:
        import cv2
        import numpy as np
        
        # Test basic image operations
        test_image = np.zeros((100, 100, 3), dtype=np.uint8)
        gray = cv2.cvtColor(test_image, cv2.COLOR_BGR2GRAY)
        
        return {
            'status': 'success',
            'version': cv2.__version__,
            'basic_ops': True
        }
        
    except Exception as e:
        return {
            'status': 'failed',
            'error': str(e)
        }

def main():
    """Main compatibility test function"""
    print("🚀 Railway Compatibility Test - FAZA 1 Dependencies")
    print("=" * 60)
    
    # Required modules for FAZA 1
    required_modules = [
        # ML and data processing
        ('numpy', None),
        ('pandas', None),
        ('scikit-learn', 'sklearn'),
        ('joblib', None),
        
        # Computer vision and image processing
        ('onnxruntime', None),
        ('cv2', 'opencv-python'),  # OpenCV
        ('PIL', 'pillow'),  # Pillow
        ('skimage', 'scikit-image'),
        
        # Geospatial and external APIs
        ('overpy', None),
        ('geopy', None),
        ('requests', None),
        
        # Caching and async (Redis optional)
        ('aiohttp', None),
        ('asyncio_throttle', 'asyncio-throttle'),
        
        # Utilities
        ('dotenv', 'python-dotenv'),
    ]
    
    results = []
    failed_count = 0
    
    print("\n📦 Testing module imports:")
    print("-" * 40)
    
    for module_name, fallback in required_modules:
        result = test_import(module_name, fallback)
        results.append(result)
        
        status_emoji = "✅" if result['status'] == 'success' else "❌"
        fallback_info = f" (using {result['module']})" if result['fallback_used'] else ""
        version_info = f" v{result['version']}" if result['version'] else ""
        
        print(f"{status_emoji} {module_name}{fallback_info}{version_info}")
        
        if result['status'] == 'failed':
            failed_count += 1
            print(f"   Error: {result['error']}")
    
    # Specific functionality tests
    print("\n🔧 Testing specific functionality:")
    print("-" * 40)
    
    # Test ONNX Runtime
    onnx_test = test_onnx_functionality()
    if onnx_test['status'] == 'success':
        print("✅ ONNX Runtime functionality")
        print(f"   CPU Provider: {'✅' if onnx_test['cpu_available'] else '❌'}")
    else:
        print(f"❌ ONNX Runtime functionality: {onnx_test.get('error', 'Unknown error')}")
        failed_count += 1
    
    # Test OpenCV
    cv_test = test_opencv_functionality()
    if cv_test['status'] == 'success':
        print(f"✅ OpenCV functionality v{cv_test['version']}")
    else:
        print(f"❌ OpenCV functionality: {cv_test.get('error', 'Unknown error')}")
        failed_count += 1
    
    # Summary
    print("\n📊 Summary:")
    print("-" * 40)
    total_tests = len(required_modules) + 2  # +2 for functionality tests
    passed_tests = total_tests - failed_count
    
    print(f"Total tests: {total_tests}")
    print(f"Passed: {passed_tests}")
    print(f"Failed: {failed_count}")
    
    if failed_count == 0:
        print("\n🎉 All tests passed! Environment is ready for FAZA 1 development.")
        return 0
    else:
        print(f"\n⚠️  {failed_count} test(s) failed. Check dependencies.")
        return 1

if __name__ == "__main__":
    exit(main()) 