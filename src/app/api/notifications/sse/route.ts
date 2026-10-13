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
      const send = async () => {
        try {
          const count = await prisma.notification.count({
            where: { userId: session.userId, isRead: false },
          });
          const data = `data: ${JSON.stringify({ unreadCount: count })}\n\n`;
          controller.enqueue(encoder.encode(data));
        } catch {
          controller.close();
        }
      };

      await send();
      const interval = setInterval(send, 10000);

      request.signal.addEventListener("abort", () => {
        clearInterval(interval);
        controller.close();
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
