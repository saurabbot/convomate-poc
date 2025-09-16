-- CreateTable
CREATE TABLE "public"."scraped_content" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "text" TEXT,
    "screenshot" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "scraped_content_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."content_images" (
    "id" TEXT NOT NULL,
    "src" TEXT NOT NULL,
    "alt" TEXT,
    "width" INTEGER,
    "height" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "contentId" TEXT NOT NULL,

    CONSTRAINT "content_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."content_videos" (
    "id" TEXT NOT NULL,
    "src" TEXT NOT NULL,
    "title" TEXT,
    "duration" TEXT,
    "thumbnail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "contentId" TEXT NOT NULL,

    CONSTRAINT "content_videos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."content_audio" (
    "id" TEXT NOT NULL,
    "src" TEXT NOT NULL,
    "title" TEXT,
    "duration" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "contentId" TEXT NOT NULL,

    CONSTRAINT "content_audio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."content_embeds" (
    "id" TEXT NOT NULL,
    "src" TEXT NOT NULL,
    "type" TEXT,
    "title" TEXT,
    "width" INTEGER,
    "height" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "contentId" TEXT NOT NULL,

    CONSTRAINT "content_embeds_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "scraped_content_url_key" ON "public"."scraped_content"("url");

-- AddForeignKey
ALTER TABLE "public"."content_images" ADD CONSTRAINT "content_images_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "public"."scraped_content"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."content_videos" ADD CONSTRAINT "content_videos_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "public"."scraped_content"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."content_audio" ADD CONSTRAINT "content_audio_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "public"."scraped_content"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."content_embeds" ADD CONSTRAINT "content_embeds_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "public"."scraped_content"("id") ON DELETE CASCADE ON UPDATE CASCADE;
