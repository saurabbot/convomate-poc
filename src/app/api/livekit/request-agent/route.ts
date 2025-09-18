import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { AgentDispatchClient } from "livekit-server-sdk";
import { prisma } from "@/lib/prisma";
import { corsHeaders, handleOptionsRequest } from "@/lib/cors";

export async function OPTIONS(request: NextRequest) {
  return handleOptionsRequest();
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const body = await request.json();
    const { room, url } = body;

    if (!room) {
      return NextResponse.json(
        { error: "Room name is required" },
        { status: 400, headers: corsHeaders }
      );
    }

    const { LIVEKIT_API_KEY, LIVEKIT_API_SECRET, LIVEKIT_URL } = process.env;

    if (!LIVEKIT_API_KEY || !LIVEKIT_API_SECRET || !LIVEKIT_URL) {
      return NextResponse.json(
        { error: "Server configuration is missing" },
        { status: 500, headers: corsHeaders }
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
        { status: 404, headers: corsHeaders }
      );
    }

    const dispatchId = dispatches.find(
      (dispatch) => dispatch.agentName === agentName
    )?.id;

    if (dispatchId) {
      console.log("dispatchId already exists!", dispatchId);
      return NextResponse.json({ success: true }, { headers: corsHeaders });
    }
    const scrapedContent = await prisma.scrapedContent.findFirst({
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

    return NextResponse.json({ success: true }, { headers: corsHeaders });
  } catch (error) {
    console.error("Error requesting agent:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500, headers: corsHeaders }
    );
  }
}
