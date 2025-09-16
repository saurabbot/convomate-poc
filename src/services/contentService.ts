import { prisma } from '@/lib/prisma'
import { ExtractedContent } from '@/utils/contentExtractor'

export class ContentService {
  async checkIfContentExists(url: string): Promise<boolean> {
    const allExistingContent = await prisma.scrapedContent.findMany({
      select: {
        title: true,
        url: true
      }
    })
    console.log("BEEP", allExistingContent)
    const existingContent = await prisma.scrapedContent.findUnique({
      where: { url }
    })
    console.log("Existing content", existingContent);
    return !!existingContent
  }

  async storeScrapedContent(url: string, content: ExtractedContent, screenshot?: string): Promise<string> {
    const result = await prisma.scrapedContent.create({
      data: {
        url,
        title: content.title,
        description: content.description,
        text: content.text,
        screenshot,
        images: {
          create: content.images.map(img => ({
            src: img.src,
            alt: img.alt,
            width: img.width,
            height: img.height,
          }))
        },
        videos: {
          create: content.videos.map(video => ({
            src: video.src,
            title: video.title,
            duration: video.duration,
            thumbnail: video.thumbnail,
          }))
        },
        audio: {
          create: content.audio.map(audio => ({
            src: audio.src,
            title: audio.title,
            duration: audio.duration,
          }))
        },
        embeds: {
          create: content.embeds.map(embed => ({
            src: embed.src,
            type: embed.type,
            title: embed.title,
            width: embed.width,
            height: embed.height,
          }))
        },
      },
    })

    return result.id
  }

  async getScrapedContent(url: string) {
    return await prisma.scrapedContent.findUnique({
      where: { url },
      include: {
        images: true,
        videos: true,
        audio: true,
        embeds: true,
      }
    })
  }

  async getAllScrapedContent() {
    return await prisma.scrapedContent.findMany({
      include: {
        images: true,
        videos: true,
        audio: true,
        embeds: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
  }
}

export const contentService = new ContentService()
