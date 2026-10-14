import { NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      let isClosed = false;

      const safeClose = () => {
        if (!isClosed) {
          isClosed = true;
          try {
            controller.close();
          } catch {
            // ignore if already closed
          }
        }
      };

      const send = async () => {
        if (isClosed || request.signal.aborted) return;
        try {
          const count = await prisma.notification.count({
            where: { userId: session.userId, isRead: false },
          });
          if (isClosed || request.signal.aborted) return;
          const data = `data: ${JSON.stringify({ unreadCount: count })}\n\n`;
          controller.enqueue(encoder.encode(data));
        } catch {
          safeClose();
        }
      };

      await send();
      const interval = setInterval(send, 10000);

      request.signal.addEventListener("abort", () => {
        clearInterval(interval);
        safeClose();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
