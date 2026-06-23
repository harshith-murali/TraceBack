"use client";

import { Loader2 } from "lucide-react";

export function PendingOverlay({ show, label }: { show: boolean; label: string }) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[90] grid place-items-center bg-background/72 backdrop-blur-sm">
      <div className="w-[min(92vw,360px)] rounded-lg border bg-card p-6 text-center shadow-soft">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-sm font-semibold">{label}</p>
        <p className="mt-1 text-xs text-muted-foreground">Keep this tab open while the request finishes.</p>
      </div>
    </div>
  );
}
