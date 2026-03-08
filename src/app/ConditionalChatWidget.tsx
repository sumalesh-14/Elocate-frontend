"use client";

import { usePathname } from "next/navigation";
import { ChatWidget } from "@/components/ChatBot/ChatWidget";

export default function ConditionalChatWidget() {
    const pathname = usePathname();

    // Don't show ChatWidget on driver pickup pages (they're standalone public pages)
    if (pathname?.startsWith('/driver/pickup/')) {
        return null;
    }

    return <ChatWidget />;
}
