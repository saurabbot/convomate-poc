import { NextRequest, NextResponse } from "next/server";
import { ZyteService } from "@/services/zyteService";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { VectorStore } from "@/services/vectorStore";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const body = await request.json();
    const { url, scrapeType } = body;
    if (!url || !scrapeType) {
      return NextResponse.json(
        { error: "URL and scrapType are required" },
        { status: 400 }
      );
    }
    const zyteService = new ZyteService();

    const data = await zyteService.getStructuredScrapedData(url, scrapeType);
    const { product } = data;
    console.log(product);
    const { name, price, mainImage, images, description, videos } = product;
    const scrapedContent = await prisma.scrapedContent.create({
      data: {
        url,
        name,
        price,
        createdBy: {
          connect: {
            id: user?.id,
          },
        },
        mainImage: mainImage?.url || "",
        description,
        images: {
          create: images?.map((image) => ({ url: image.url })),
        },
        videos: {
          create: videos?.map((video) => ({ url: video.url })),
        },
      },
    });
    const vectorStore = new VectorStore();
    await vectorStore.setup();
    vectorStore.data = scrapedContent;
    await vectorStore.upsertData();
    return NextResponse.json({ success: true, data: scrapedContent });
  } catch (error) {
    console.error("Error processing URL:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
