import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  return new Response("OK", { status: 200 });
}

export async function HEAD() {
  return NextResponse.json({}, { status: 200 });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { notificationType, notification } = body;

    console.log(`[arc-dashboard] Webhook received: ${notificationType}`, JSON.stringify(notification));

    // Log event details
    if (notificationType === "transactions.inbound") {
      console.log(`[arc-dashboard] Inbound TX: ${notification?.id} | Amount: ${notification?.amount} | State: ${notification?.state}`);
    }

    if (notificationType === "transactions.outbound") {
      console.log(`[arc-dashboard] Outbound TX: ${notification?.id} | Amount: ${notification?.amount} | State: ${notification?.state}`);
    }

    if (notificationType === "contracts.eventLog") {
      console.log(`[arc-dashboard] Contract Event: ${notification?.contractAddress} | ${notification?.eventSignature}`);
    }

    if (notificationType?.startsWith("gateway.")) {
      console.log(`[arc-dashboard] Gateway Event: ${notificationType} | ${notification?.id}`);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("[arc-dashboard] Webhook error:", error);
    return NextResponse.json({ received: true }, { status: 200 });
  }
}
