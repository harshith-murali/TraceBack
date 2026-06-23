"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

function isInternalHref(href: string) {
  try {
    const url = new URL(href, window.location.href);
    return url.origin === window.location.origin;
  } catch {
    return false;
  }
}

export function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, setPending] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const clearPendingSoon = window.setTimeout(() => setPending(false), 180);
    return () => window.clearTimeout(clearPendingSoon);
  }, [pathname, searchParams]);

  useEffect(() => {
    if (!pending) return;
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => setPending(false), 8000);
    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, [pending]);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const target = event.target as HTMLElement | null;
      const anchor = target?.closest("a[href]") as HTMLAnchorElement | null;
      if (!anchor || anchor.target || anchor.hasAttribute("download")) return;
      if (!isInternalHref(anchor.href)) return;

      const next = new URL(anchor.href);
      const current = new URL(window.location.href);
      if (next.pathname === current.pathname && next.search === current.search && next.hash) return;

      setPending(true);
    }

    function handleSubmit(event: SubmitEvent) {
      const form = event.target as HTMLFormElement | null;
      if (!form || form.method.toLowerCase() !== "get") return;
      const action = form.action || window.location.href;
      if (isInternalHref(action)) setPending(true);
    }

    function handlePopState() {
      setPending(true);
    }

    document.addEventListener("click", handleClick, true);
    document.addEventListener("submit", handleSubmit, true);
    window.addEventListener("popstate", handlePopState);

    return () => {
      document.removeEventListener("click", handleClick, true);
      document.removeEventListener("submit", handleSubmit, true);
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  if (!pending) return null;

  return (
    <>
      <div className="fixed inset-x-0 top-0 z-[80] h-1 overflow-hidden bg-primary/15">
        <div className="h-full w-1/3 animate-[nav-progress_1.1s_ease-in-out_infinite] bg-primary" />
      </div>
      <div className="fixed left-1/2 top-4 z-[81] flex -translate-x-1/2 items-center gap-2 rounded-md border bg-background px-3 py-2 text-sm font-medium shadow-soft">
        <Loader2 className="h-4 w-4 animate-spin text-primary" />
        Loading page...
      </div>
    </>
  );
}
