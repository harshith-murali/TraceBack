import { DashboardNav } from "@/components/dashboard-nav";
import { requireUser } from "@/lib/auth/guards";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  await requireUser();

  return (
    <div className="container py-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-normal">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage posts, claims, matches, and alerts.</p>
        </div>
        <DashboardNav />
      </div>
      {children}
    </div>
  );
}
