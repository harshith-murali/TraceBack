"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "next-themes";
import { Suspense, type ReactNode } from "react";
import { NavigationProgress } from "@/components/navigation-progress";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <Suspense fallback={null}>
          <NavigationProgress />
        </Suspense>
        {children}
      </ThemeProvider>
    </ClerkProvider>
  );
}
