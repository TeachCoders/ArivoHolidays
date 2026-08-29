"use client";

import dynamic from "next/dynamic";

const ChatWidget = dynamic(() => import("@/feature/chat/components/ChatWidget"), {
  ssr: false,
  loading: () => null,
});

export function ChatWidgetWrapper() {
  return <ChatWidget />;
}
