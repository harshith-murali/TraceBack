import { BarChart3, CheckCircle2, ClipboardList, Flag, ShieldAlert, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/db/prisma";

export default async function AdminPage() {
  await requireAdmin();

  const [totalPosts, openPosts, matchedPosts, returnedPosts, hiddenPosts, reportsCount, matchesCount] = await Promise.all([
    prisma.post.count(),
    prisma.post.count({ where: { status: "OPEN" } }),
    prisma.post.count({ where: { status: "MATCHED" } }),
    prisma.post.count({ where: { status: "RETURNED" } }),
    prisma.post.count({ where: { status: "HIDDEN" } }),
    prisma.report.count({ where: { status: "OPEN" } }),
    prisma.matchSuggestion.count()
  ]);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Stat title="Total posts" value={totalPosts} icon={<ClipboardList className="h-4 w-4" />} />
      <Stat title="Open posts" value={openPosts} icon={<CheckCircle2 className="h-4 w-4" />} />
      <Stat title="Matched posts" value={matchedPosts} icon={<Sparkles className="h-4 w-4" />} />
      <Stat title="Returned posts" value={returnedPosts} icon={<BarChart3 className="h-4 w-4" />} />
      <Stat title="Hidden posts" value={hiddenPosts} icon={<ShieldAlert className="h-4 w-4" />} />
      <Stat title="Open reports" value={reportsCount} icon={<Flag className="h-4 w-4" />} />
      <Stat title="Match records" value={matchesCount} icon={<Sparkles className="h-4 w-4" />} />
    </div>
  );
}

function Stat({ title, value, icon }: { title: string; value: number; icon: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-5">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="mt-1 text-2xl font-semibold">{value}</p>
        </div>
        <div className="rounded-md bg-secondary p-2 text-primary">{icon}</div>
      </CardContent>
    </Card>
  );
}
