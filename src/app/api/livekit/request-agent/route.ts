import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { AgentDispatchClient } from "livekit-server-sdk";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const body = await request.json();
    const { room, url } = body;

    if (!room) {
      return NextResponse.json(
        { error: "Room name is required" },
        { status: 400 }
      );
    }

    const { LIVEKIT_API_KEY, LIVEKIT_API_SECRET, LIVEKIT_URL } = process.env;

    if (!LIVEKIT_API_KEY || !LIVEKIT_API_SECRET || !LIVEKIT_URL) {
      return NextResponse.json(
        { error: "Server configuration is missing" },
        { status: 500 }
      );
    }

    const roomName = room;
    const agentName = process.env.NEXT_PUBLIC_AGENT_NAME || "context-agent";

    const agentDispatchClient = new AgentDispatchClient(
      LIVEKIT_URL,
      LIVEKIT_API_KEY,
      LIVEKIT_API_SECRET
    );

    const dispatches = await agentDispatchClient.listDispatch(roomName);
    if (dispatches.length === 0) {
      return NextResponse.json(
        { error: "No dispatches found for the room" },
        { status: 404 }
      );
    }

    const dispatchId = dispatches.find(
      (dispatch) => dispatch.agentName === agentName
    )?.id;

    if (dispatchId) {
      console.log("dispatchId already exists!", dispatchId);
      return NextResponse.json({ success: true });
    }

    const scrapedContent = await prisma.scrapedContent.findUnique({
      where: {
        url: url,
      },
    });
    console.log("scrapedContent", scrapedContent);
    const agentMetaData = {
      id: user?.id,
      contentId: scrapedContent?.id,
      name: user?.name,
      url: url,
      contentName: scrapedContent?.name,
      price: scrapedContent?.price,
      description: scrapedContent?.description,
    };
    console.log("agentMetaData", agentMetaData);

    await agentDispatchClient.createDispatch(roomName, agentName, {
      metadata: JSON.stringify(agentMetaData),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error requesting agent:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
