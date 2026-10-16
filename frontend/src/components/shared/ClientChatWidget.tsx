"use client";

import dynamic from "next/dynamic";

// Code splitting: Chat widget with WebSocket subscriptions is deferred and loaded exclusively on the client
const FloatingChatWidget = dynamic(
  () =>
    import("@/components/shared/FloatingChatWidget").then(
      (mod) => mod.FloatingChatWidget
    ),
  { ssr: false }
);

export function ClientChatWidget() {
  return <FloatingChatWidget />;
}

export default ClientChatWidget;
