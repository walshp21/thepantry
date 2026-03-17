"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/pantry", label: "Pantry", emoji: "🥫" },
  { href: "/requests", label: "Requests", emoji: "🛒" },
  { href: "/recipes", label: "Recipes", emoji: "📖" },
];

export default function TabBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex bg-white/90 backdrop-blur border-t border-gray-200">
      {tabs.map((tab) => {
        const active = pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 text-xs font-medium transition-colors ${
              active ? "text-blue-600" : "text-gray-400"
            }`}
          >
            <span className="text-xl leading-none">{tab.emoji}</span>
            <span>{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
