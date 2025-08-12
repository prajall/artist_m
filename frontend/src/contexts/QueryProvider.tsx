"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { useState } from "react";

export const client = new QueryClient();

const QueryProvider = ({ children }: { children: React.ReactNode }) => {
  const [queryClient] = useState(client);

  return (
    <div>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </div>
  );
};

export default QueryProvider;
