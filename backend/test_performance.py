"""
Test API Performance - Đo tốc độ API sau optimize
"""

import asyncio
import time
import httpx


async def test_api_performance():
    """Test performance của API"""
    
    base_url = "http://localhost:8000"
    
    print("="*60)
    print("🧪 TEST API PERFORMANCE")
    print("="*60)
    print()
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        
        # Test 1: Health check
        print("1️⃣  Testing health endpoint...")
        start = time.time()
        try:
            response = await client.get(f"{base_url}/")
            elapsed = (time.time() - start) * 1000
            print(f"   ✅ Health: {response.status_code} ({elapsed:.0f}ms)")
        except Exception as e:
            print(f"   ❌ Error: {str(e)}")
            return
        
        # Test 2: List products (với cache headers)
        print("\n2️⃣  Testing products list API...")
        start = time.time()
        try:
            response = await client.get(f"{base_url}/api/products?limit=20")
            elapsed = (time.time() - start) * 1000
            data = response.json()
            
            response_size = len(response.content)
            products_count = len(data.get('products', []))
            
            print(f"   ✅ Status: {response.status_code}")
            print(f"   📦 Products: {products_count}")
            print(f"   📊 Response size: {response_size / 1024:.1f}KB")
            print(f"   ⏱️  Time: {elapsed:.0f}ms")
            
            # Analyze images
            total_images = 0
            for product in data.get('products', []):
                if product.get('image'):
                    total_images += 1
                total_images += len(product.get('images', []))
                
                variants = product.get('variants', {})
                if variants and 'colors' in variants:
                    for color in variants.get('colors', []):
                        total_images += len(color.get('images', []))
            
            print(f"   🖼️  Total images in response: {total_images}")
            
        except Exception as e:
            print(f"   ❌ Error: {str(e)}")
        
        # Test 3: Single product detail
        print("\n3️⃣  Testing single product API...")
        start = time.time()
        try:
            # Get first product ID
            response = await client.get(f"{base_url}/api/products?limit=1")
            products = response.json().get('products', [])
            
            if products:
                product_id = products[0]['id']
                
                start = time.time()
                response = await client.get(f"{base_url}/api/products/{product_id}")
                elapsed = (time.time() - start) * 1000
                
                response_size = len(response.content)
                product = response.json()
                
                print(f"   ✅ Status: {response.status_code}")
                print(f"   📊 Response size: {response_size / 1024:.1f}KB")
                print(f"   ⏱️  Time: {elapsed:.0f}ms")
                
                # Count images
                image_count = 1 if product.get('image') else 0
                image_count += len(product.get('images', []))
                
                variants = product.get('variants', {})
                if variants and 'colors' in variants:
                    for color in variants.get('colors', []):
                        image_count += len(color.get('images', []))
                
                print(f"   🖼️  Total images: {image_count}")
            
        except Exception as e:
            print(f"   ❌ Error: {str(e)}")
        
        # Test 4: Static image (với cache headers)
        print("\n4️⃣  Testing static image serving...")
        start = time.time()
        try:
            # Get first product image
            response = await client.get(f"{base_url}/api/products?limit=1")
            products = response.json().get('products', [])
            
            if products and products[0].get('image'):
                image_url = products[0]['image']
                
                start = time.time()
                response = await client.get(f"{base_url}{image_url}")
                elapsed = (time.time() - start) * 1000
                
                image_size = len(response.content)
                cache_control = response.headers.get('cache-control', 'N/A')
                etag = response.headers.get('etag', 'N/A')
                content_type = response.headers.get('content-type', 'N/A')
                
                print(f"   ✅ Status: {response.status_code}")
                print(f"   📊 Image size: {image_size / 1024:.1f}KB")
                print(f"   ⏱️  Time: {elapsed:.0f}ms")
                print(f"   🔖 Cache-Control: {cache_control}")
                print(f"   🏷️  ETag: {etag[:30]}...")
                print(f"   📄 Content-Type: {content_type}")
                
                # Check cache headers
                if 'max-age=31536000' in cache_control:
                    print(f"   ✅ Cache headers OK (1 year)")
                else:
                    print(f"   ⚠️  Cache headers not optimal")
            
        except Exception as e:
            print(f"   ❌ Error: {str(e)}")
    
    print("\n" + "="*60)
    print("✅ TEST COMPLETED")
    print("="*60)
    print()
    print("💡 Để đạt performance tốt nhất:")
    print("   1. Start backend: START_BACKEND.bat")
    print("   2. Verify cache headers: curl -I http://localhost:8000/uploads/products/...")
    print("   3. Test với browser DevTools Network tab")
    print("   4. Implement frontend lazy loading (xem PERFORMANCE_OPTIMIZATION_IMAGES.md)")
    print()


if __name__ == "__main__":
    asyncio.run(test_api_performance())
