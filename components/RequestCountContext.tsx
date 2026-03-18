"use client";

import { createContext, useContext, useState } from "react";

const RequestCountContext = createContext<{
  count: number;
  setCount: (n: number) => void;
}>({ count: 0, setCount: () => {} });

export function RequestCountProvider({
  initial,
  children,
}: {
  initial: number;
  children: React.ReactNode;
}) {
  const [count, setCount] = useState(initial);
  return (
    <RequestCountContext.Provider value={{ count, setCount }}>
      {children}
    </RequestCountContext.Provider>
  );
}

export function useRequestCount() {
  return useContext(RequestCountContext);
}
