import type { Metadata } from "next";
import "./globals.css";
import TabBar from "@/components/TabBar";

export const metadata: Metadata = {
  title: "Kitchen Hub",
  description: "Household pantry, requests, and recipes",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900">
        <main className="pb-16 min-h-screen">{children}</main>
        <TabBar />
      </body>
    </html>
  );
}
