/*
  Warnings:

  - You are about to drop the `content_audio` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `content_embeds` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `content_images` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `content_videos` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `scraped_content` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."content_audio" DROP CONSTRAINT "content_audio_contentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."content_embeds" DROP CONSTRAINT "content_embeds_contentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."content_images" DROP CONSTRAINT "content_images_contentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."content_videos" DROP CONSTRAINT "content_videos_contentId_fkey";

-- DropTable
DROP TABLE "public"."content_audio";

-- DropTable
DROP TABLE "public"."content_embeds";

-- DropTable
DROP TABLE "public"."content_images";

-- DropTable
DROP TABLE "public"."content_videos";

-- DropTable
DROP TABLE "public"."scraped_content";

-- CreateTable
CREATE TABLE "public"."ScrapedContent" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "mainImage" TEXT,
    "description" TEXT NOT NULL,
    "price" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "ScrapedContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Image" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "scrapedContentId" TEXT NOT NULL,

    CONSTRAINT "Image_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Video" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "scrapedContentId" TEXT NOT NULL,

    CONSTRAINT "Video_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ScrapedContent_url_key" ON "public"."ScrapedContent"("url");

-- AddForeignKey
ALTER TABLE "public"."ScrapedContent" ADD CONSTRAINT "ScrapedContent_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Image" ADD CONSTRAINT "Image_scrapedContentId_fkey" FOREIGN KEY ("scrapedContentId") REFERENCES "public"."ScrapedContent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Video" ADD CONSTRAINT "Video_scrapedContentId_fkey" FOREIGN KEY ("scrapedContentId") REFERENCES "public"."ScrapedContent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
