"use client";

import TabBar from "./TabBar";
import { ToastProvider } from "./Toast";
import { RequestCountProvider } from "./RequestCountContext";

export default function ClientShell({
  children,
  initialRequestCount,
}: {
  children: React.ReactNode;
  initialRequestCount: number;
}) {
  return (
    <ToastProvider>
      <RequestCountProvider initial={initialRequestCount}>
        <main className="pb-20 min-h-screen">{children}</main>
        <TabBar />
      </RequestCountProvider>
    </ToastProvider>
  );
}
