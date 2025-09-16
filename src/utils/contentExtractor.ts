import * as cheerio from 'cheerio'

export interface ExtractedContent {
  title: string
  description: string
  text: string
  images: Array<{
    src: string
    alt?: string
    width?: number
    height?: number
  }>
  videos: Array<{
    src: string
    title?: string
    duration?: string
    thumbnail?: string
  }>
  audio: Array<{
    src: string
    title?: string
    duration?: string
  }>
  embeds: Array<{
    src: string
    type?: string
    title?: string
    width?: number
    height?: number
  }>
}

export function extractMediaContent(html: string, baseUrl: string): ExtractedContent {
  const $ = cheerio.load(html)

  const title = $('title').text().trim() || 
                $('h1').first().text().trim() || 
                'Untitled'

  const description = $('meta[name="description"]').attr('content') ||
                     $('meta[property="og:description"]').attr('content') ||
                     ''

  const textContent = $('body').text().trim().slice(0, 5000) || ''

  const images = $('img').map((_, img) => {
    const $img = $(img)
    const src = $img.attr('src')
    if (!src || src.startsWith('data:')) return null
    
    return {
      src: resolveUrl(src, baseUrl),
      alt: $img.attr('alt') || undefined,
      width: parseInt($img.attr('width') || '0') || undefined,
      height: parseInt($img.attr('height') || '0') || undefined,
    }
  }).get().filter(Boolean)

  const videos = $('video').map((_, video) => {
    const $video = $(video)
    const src = $video.attr('src') || $video.find('source').first().attr('src')
    if (!src) return null
    
    return {
      src: resolveUrl(src, baseUrl),
      title: $video.attr('title') || undefined,
      duration: $video.attr('duration') || undefined,
      thumbnail: $video.attr('poster') ? resolveUrl($video.attr('poster')!, baseUrl) : undefined,
    }
  }).get().filter(Boolean)

  const audio = $('audio').map((_, audioEl) => {
    const $audio = $(audioEl)
    const src = $audio.attr('src') || $audio.find('source').first().attr('src')
    if (!src) return null
    
    return {
      src: resolveUrl(src, baseUrl),
      title: $audio.attr('title') || undefined,
      duration: $audio.attr('duration') || undefined,
    }
  }).get().filter(Boolean)

  const embeds = $('iframe, embed, object').map((_, embed) => {
    const $embed = $(embed)
    const src = $embed.attr('src') || $embed.attr('data')
    if (!src) return null
    
    return {
      src: resolveUrl(src, baseUrl),
      type: embed.tagName.toLowerCase(),
      title: $embed.attr('title') || undefined,
      width: parseInt($embed.attr('width') || '0') || undefined,
      height: parseInt($embed.attr('height') || '0') || undefined,
    }
  }).get().filter(Boolean)

  return {
    title,
    description,
    text: textContent,
    images,
    videos,
    audio,
    embeds,
  }
}

function resolveUrl(url: string, baseUrl: string): string {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  if (url.startsWith('//')) return `https:${url}`
  if (url.startsWith('/')) return new URL(url, baseUrl).href
  return new URL(url, baseUrl).href
}