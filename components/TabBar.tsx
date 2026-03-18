"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRequestCount } from "./RequestCountContext";

const tabs = [
  { href: "/pantry", label: "Pantry", emoji: "🥫" },
  { href: "/requests", label: "Requests", emoji: "🛒" },
  { href: "/recipes", label: "Recipes", emoji: "📖" },
];

export default function TabBar() {
  const pathname = usePathname();
  const { count } = useRequestCount();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex"
      style={{ backgroundColor: "var(--tab-bg)" }}
    >
      {tabs.map((tab) => {
        const active = pathname.startsWith(tab.href);
        const isRequests = tab.href === "/requests";
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className="flex-1 flex flex-col items-center gap-0.5 py-3 text-xs font-medium transition-all"
            style={{
              color: active ? "var(--tab-active)" : "rgba(255,255,255,0.4)",
            }}
          >
            <span className="relative text-xl leading-none">
              {tab.emoji}
              {isRequests && count > 0 && (
                <span
                  className="absolute -top-1 -right-2 min-w-[16px] h-4 rounded-full text-[10px] font-bold flex items-center justify-center px-1 text-white"
                  style={{ backgroundColor: "var(--red)" }}
                >
                  {count > 99 ? "99+" : count}
                </span>
              )}
            </span>
            <span className="tracking-wide">{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
