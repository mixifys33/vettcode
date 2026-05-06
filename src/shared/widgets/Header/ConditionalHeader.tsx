"use client";

import { usePathname } from "next/navigation";
import Header from "./header";

// Pages where the header should be hidden (full-screen experiences)
const HIDDEN_HEADER_PATHS = [
  "/ai-assistant",
  "/inbox",
];

export default function ConditionalHeader() {
  const pathname = usePathname();
  
  // Check if current path should hide the header
  const shouldHideHeader = HIDDEN_HEADER_PATHS.some(path => 
    pathname === path || pathname?.startsWith(`${path}/`)
  );

  if (shouldHideHeader) {
    return null;
  }

  return <Header />;
}

