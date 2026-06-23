import { AdminNav } from "@/components/admin-nav";
import { requireAdmin } from "@/lib/auth/guards";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <div className="container py-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-normal">Admin dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">Moderate content, reports, claims, matches, and platform health.</p>
        </div>
        <AdminNav />
      </div>
      {children}
    </div>
  );
}
