import type { Metadata } from "next";
import { DM_Serif_Display, DM_Sans } from "next/font/google";
import "./globals.css";
import ClientShell from "@/components/ClientShell";
import { db } from "@/lib/db";

const serif = DM_Serif_Display({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-serif",
});

const sans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Kitchen Hub",
  description: "Household pantry, requests, and recipes",
};

export const dynamic = "force-dynamic";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const result = await db.execute(
    "SELECT COUNT(*) as count FROM requests"
  );
  const initialRequestCount = Number(result.rows[0].count ?? 0);

  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`}>
      <body>
        <ClientShell initialRequestCount={initialRequestCount}>
          {children}
        </ClientShell>
      </body>
    </html>
  );
}
