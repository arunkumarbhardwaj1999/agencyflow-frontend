"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { AppToastStack } from "@/components/ui/app-toast-stack";
import { ConfirmDialogHost } from "@/components/ui/confirm-dialog";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 30_000, retry: 1 },
        },
      }),
  );
  return (
    <QueryClientProvider client={client}>
      {children}
      <AppToastStack />
      <ConfirmDialogHost />
    </QueryClientProvider>
  );
}
