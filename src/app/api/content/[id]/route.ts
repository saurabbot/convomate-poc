import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const content = await prisma.scrapedContent.findFirst({
      where: {
        id: id,
        createdById: user.id,
      },
      include: {
        images: true,
        videos: true,
      },
    });

    if (!content) {
      return NextResponse.json({ error: "Content not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: content,
    });
  } catch (error) {
    console.error("Error fetching content:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, price, mainImage, images, videos } = body;

    const existingContent = await prisma.scrapedContent.findFirst({
      where: {
        id: id,
        createdById: user.id,
      },
    });

    if (!existingContent) {
      return NextResponse.json({ error: "Content not found" }, { status: 404 });
    }

    // Handle images and videos updates
    const updateData: {
      name: string;
      description: string;
      price: string;
      mainImage: string;
      updatedAt: Date;
      images?: { deleteMany: Record<string, never>; create: { url: string }[] };
      videos?: { deleteMany: Record<string, never>; create: { url: string }[] };
    } = {
      name: name || existingContent.name,
      description: description || existingContent.description,
      price: price || existingContent.price,
      mainImage: mainImage || existingContent.mainImage,
      updatedAt: new Date(),
    };

    // If images are provided, update them
    if (images && Array.isArray(images)) {
      updateData.images = {
        deleteMany: {},
        create: images
          .filter(img => img.url && img.url.trim())
          .map(img => ({ url: img.url }))
      };
    }

    // If videos are provided, update them
    if (videos && Array.isArray(videos)) {
      updateData.videos = {
        deleteMany: {},
        create: videos
          .filter(vid => vid.url && vid.url.trim())
          .map(vid => ({ url: vid.url }))
      };
    }

    const updatedContent = await prisma.scrapedContent.update({
      where: {
        id: id,
      },
      data: updateData,
      include: {
        images: true,
        videos: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedContent,
      message: "Content updated successfully",
    });
  } catch (error) {
    console.error("Error updating content:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const existingContent = await prisma.scrapedContent.findFirst({
      where: {
        id: id,
        createdById: user.id,
      },
    });

    if (!existingContent) {
      return NextResponse.json({ error: "Content not found" }, { status: 404 });
    }

    await prisma.scrapedContent.delete({
      where: {
        id: id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Content deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting content:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
