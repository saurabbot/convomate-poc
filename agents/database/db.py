import asyncio
import os
from typing import Optional, List, Dict, Any
import asyncpg
from dotenv import load_dotenv

load_dotenv()

class DatabaseManager:
    def __init__(self):
        self.connection_string = os.getenv("DATABASE_URL")
        if not self.connection_string:
            raise ValueError("DATABASE_URL environment variable is required")
        
        self.pool = None
    
    async def connect(self):
        if not self.pool:
            self.pool = await asyncpg.create_pool(
                self.connection_string,
                min_size=1,
                max_size=10,
                command_timeout=60
            )
    
    async def disconnect(self):
        if self.pool:
            await self.pool.close()
            self.pool = None
    
    async def check_if_scraped_content_has_images(self, content_id: str) -> bool:
        if not self.pool:
            await self.connect()
        
        async with self.pool.acquire() as connection:
            query = """
                SELECT EXISTS(
                    SELECT 1 
                    FROM "Image" 
                    WHERE "scrapedContentId" = $1
                ) as has_images
            """
            
            result = await connection.fetchrow(query, content_id)
            return result['has_images'] if result else False
    
    async def check_if_scraped_content_has_videos(self, content_id: str) -> bool:
        if not self.pool:
            await self.connect()
        async with self.pool.acquire() as connection:
            query = """
                SELECT EXISTS(
                    SELECT 1 
                    FROM "Video" 
                    WHERE "scrapedContentId" = $1
                ) as has_videos
            """
            
            result = await connection.fetchrow(query, content_id)
            return result['has_videos'] if result else False
    
    async def get_scraped_content_with_media_info(self, content_id: str) -> Optional[Dict[str, Any]]:
        if not self.pool:
            await self.connect()
        
        async with self.pool.acquire() as connection:
            query = """
                SELECT 
                    sc.*,
                    COUNT(DISTINCT i.id) as image_count,
                    COUNT(DISTINCT v.id) as video_count,
                    CASE WHEN COUNT(DISTINCT i.id) > 0 THEN true ELSE false END as has_images,
                    CASE WHEN COUNT(DISTINCT v.id) > 0 THEN true ELSE false END as has_videos
                FROM "ScrapedContent" sc
                LEFT JOIN "Image" i ON sc.id = i."scrapedContentId"
                LEFT JOIN "Video" v ON sc.id = v."scrapedContentId"
                WHERE sc.id = $1
                GROUP BY sc.id, sc.url, sc.name, sc."mainImage", sc.description, 
                         sc.price, sc."createdAt", sc."updatedAt", sc."createdById"
            """
            
            result = await connection.fetchrow(query, content_id)
            
            if result:
                return {
                    'id': result['id'],
                    'url': result['url'],
                    'name': result['name'],
                    'mainImage': result['mainImage'],
                    'description': result['description'],
                    'price': result['price'],
                    'createdAt': result['createdAt'],
                    'updatedAt': result['updatedAt'],
                    'createdById': result['createdById'],
                    'image_count': result['image_count'],
                    'video_count': result['video_count'],
                    'has_images': result['has_images'],
                    'has_videos': result['has_videos']
                }
            
            return None
    
    async def get_images_for_content(self, content_id: str) -> List[Dict[str, Any]]:
        """
        Get all images for a specific scraped content
        
        Args:
            content_id (str): The ID of the scraped content
            
        Returns:
            List of image dictionaries
        """
        if not self.pool:
            await self.connect()
        
        async with self.pool.acquire() as connection:
            query = """
                SELECT id, url, "createdAt", "updatedAt"
                FROM "Image" 
                WHERE "scrapedContentId" = $1
                ORDER BY "createdAt" ASC
            """
            
            rows = await connection.fetch(query, content_id)
            return [dict(row) for row in rows]
    
    async def get_videos_for_content(self, content_id: str) -> List[Dict[str, Any]]:
        """
        Get all videos for a specific scraped content
        
        Args:
            content_id (str): The ID of the scraped content
            
        Returns:
            List of video dictionaries
        """
        if not self.pool:
            await self.connect()
        
        async with self.pool.acquire() as connection:
            query = """
                SELECT id, url, "createdAt", "updatedAt"
                FROM "Video" 
                WHERE "scrapedContentId" = $1
                ORDER BY "createdAt" ASC
            """
            
            rows = await connection.fetch(query, content_id)
            return [dict(row) for row in rows]

# Global database instance
db = DatabaseManager()

# Convenience functions for easy import
async def check_if_scraped_content_has_images(content_id: str) -> bool:
    """Check if scraped content has images"""
    return await db.check_if_scraped_content_has_images(content_id)

async def check_if_scraped_content_has_videos(content_id: str) -> bool:
    """Check if scraped content has videos"""
    return await db.check_if_scraped_content_has_videos(content_id)

# Example usage
async def main():
    """Example usage of the database functions"""
    try:
        # Example content ID - replace with actual ID
        content_id = "example_content_id"
        
        # Check if content has images
        has_images = await check_if_scraped_content_has_images(content_id)
        print(f"Content {content_id} has images: {has_images}")
        
        # Check if content has videos
        has_videos = await check_if_scraped_content_has_videos(content_id)
        print(f"Content {content_id} has videos: {has_videos}")
        
        # Get detailed content info
        content_info = await db.get_scraped_content_with_media_info(content_id)
        if content_info:
            print(f"Content info: {content_info}")
        else:
            print("Content not found")
            
    except Exception as e:
        print(f"Error: {e}")
    finally:
        await db.disconnect()

if __name__ == "__main__":
    asyncio.run(main())