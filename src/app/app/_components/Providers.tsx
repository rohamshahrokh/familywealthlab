"use client";

import * as React from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/finance-port/queryClient";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { PrivacyProvider } from "@/contexts/PrivacyContext";

/**
 * Root providers for the migrated `/app/*` shell.
 * — TanStack Query (talks to demo store via apiRequest)
 * — Radix TooltipProvider (required by many ported components)
 * — Toaster for use-toast
 */
export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <PrivacyProvider>
        <TooltipProvider>{children}</TooltipProvider>
      </PrivacyProvider>
      <Toaster />
    </QueryClientProvider>
  );
}
