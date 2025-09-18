/*
  Warnings:

  - A unique constraint covering the columns `[url,createdById]` on the table `ScrapedContent` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."ScrapedContent_url_key";

-- CreateIndex
CREATE UNIQUE INDEX "ScrapedContent_url_createdById_key" ON "public"."ScrapedContent"("url", "createdById");
