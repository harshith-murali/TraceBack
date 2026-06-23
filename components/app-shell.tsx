import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { Bell, LayoutDashboard, Plus, Search, ShieldCheck } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { currentDbUser } from "@/lib/auth/current-user";
import { prisma } from "@/lib/db/prisma";

export async function AppShell({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();
  const dbUser = userId ? await currentDbUser() : null;
  const unreadCount = dbUser
    ? await prisma.notification.count({ where: { userId: dbUser.id, readAt: null } })
    : 0;

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b bg-background/92 backdrop-blur">
        <div className="container flex min-h-[60px] items-center justify-between gap-4 py-3">
          <Link href="/" className="flex items-center gap-2 font-semibold tracking-normal">
            <span className="grid h-8 w-8 place-items-center rounded-md bg-primary text-primary-foreground">CL</span>
            <span className="hidden sm:inline">Campus Lost & Found</span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            <Button asChild variant="ghost" size="sm">
              <Link href="/posts">
                <Search className="h-4 w-4" />
                Browse
              </Link>
            </Button>
            <SignedIn>
              <Button asChild variant="ghost" size="sm">
                <Link href="/posts/new">
                  <Plus className="h-4 w-4" />
                  New post
                </Link>
              </Button>
              <Button asChild variant="ghost" size="sm">
                <Link href="/dashboard">
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>
              </Button>
              {dbUser?.role === "ADMIN" ? (
                <Button asChild variant="ghost" size="sm">
                  <Link href="/admin">
                    <ShieldCheck className="h-4 w-4" />
                    Admin
                  </Link>
                </Button>
              ) : null}
            </SignedIn>
          </nav>
          <div className="flex items-center gap-2">
            <SignedIn>
              <Button asChild variant="ghost" size="icon" aria-label="Notifications" title="Notifications">
                <Link href="/dashboard">
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 ? (
                    <span className="absolute ml-5 mb-5 grid h-4 min-w-4 place-items-center rounded-full bg-destructive px-1 text-[10px] text-destructive-foreground">
                      {unreadCount}
                    </span>
                  ) : null}
                </Link>
              </Button>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
            <SignedOut>
              <SignInButton mode="modal">
                <Button size="sm">Sign in</Button>
              </SignInButton>
            </SignedOut>
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
