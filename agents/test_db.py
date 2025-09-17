
import asyncio
import sys
import os

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database.db import check_if_scraped_content_has_images, check_if_scraped_content_has_videos, db

async def test_database_functions():
    """Test the database functions with sample data"""
    try:
        print("🔗 Connecting to database...")
        await db.connect()
        
        # First, let's get all scraped content to test with
        async with db.pool.acquire() as connection:
            query = 'SELECT id, name FROM "ScrapedContent" LIMIT 5'
            rows = await connection.fetch(query)
            
            if not rows:
                print("❌ No scraped content found in database")
                print("💡 Try scraping some content first using the web interface")
                return
            
            print(f"✅ Found {len(rows)} scraped content items")
            
            for row in rows:
                content_id = row['id']
                content_name = row['name']
                
                print(f"\n📄 Testing content: {content_name} (ID: {content_id})")
                
                # Test image check
                has_images = await check_if_scraped_content_has_images(content_id)
                print(f"   🖼️  Has images: {has_images}")
                
                # Test video check
                has_videos = await check_if_scraped_content_has_videos(content_id)
                print(f"   🎥 Has videos: {has_videos}")
                
                # Get detailed info
                content_info = await db.get_scraped_content_with_media_info(content_id)
                if content_info:
                    print(f"   📊 Image count: {content_info['image_count']}")
                    print(f"   📊 Video count: {content_info['video_count']}")
                    
                    # Get actual images and videos
                    if content_info['has_images']:
                        images = await db.get_images_for_content(content_id)
                        print(f"   🖼️  Images: {[img['url'][:50] + '...' if len(img['url']) > 50 else img['url'] for img in images[:3]]}")
                    
                    if content_info['has_videos']:
                        videos = await db.get_videos_for_content(content_id)
                        print(f"   🎥 Videos: {[vid['url'][:50] + '...' if len(vid['url']) > 50 else vid['url'] for vid in videos[:3]]}")
        
        print("\n✅ Database functions tested successfully!")
        
    except Exception as e:
        print(f"❌ Error testing database functions: {e}")
        import traceback
        traceback.print_exc()
    
    finally:
        print("🔌 Disconnecting from database...")
        await db.disconnect()

if __name__ == "__main__":
    print("🧪 Testing database functions...")
    asyncio.run(test_database_functions())
