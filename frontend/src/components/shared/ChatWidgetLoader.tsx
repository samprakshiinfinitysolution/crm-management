
"use client";

import dynamic from "next/dynamic";

const FloatingChatWidget = dynamic(
  () =>
    import("@/components/shared/FloatingChatWidget").then(
      (mod) => mod.FloatingChatWidget
    ),
  { ssr: false }
);

export default function ChatWidgetLoader() {
  return <FloatingChatWidget />;
}
