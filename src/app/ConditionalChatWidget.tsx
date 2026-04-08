"use client";

import { usePathname } from "next/navigation";
import { ChatWidget } from "@/components/ChatBot/ChatWidget";

export default function ConditionalChatWidget() {
    const pathname = usePathname();

    // Intermediary has its own Ops Co-Pilot widget mounted in its layout
    if (pathname?.startsWith('/intermediary')) {
        return null;
    }

    // Admin and driver pages don't need a chatbot
    if (pathname?.startsWith('/admin') || pathname?.startsWith('/driver/pickup/')) {
        return null;
    }

    return <ChatWidget />;
}
