import Link from "next/link";
import { Bell, CheckCircle2, ClipboardList, Handshake, Sparkles } from "lucide-react";
import { markNotificationsRead } from "@/actions/notifications";
import { SubmitButton } from "@/components/submit-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUser } from "@/lib/auth/guards";
import { prisma } from "@/lib/db/prisma";

export default async function DashboardPage() {
  const user = await requireUser();

  const [postsCount, openPosts, claimsCount, matchesCount, notifications] = await Promise.all([
    prisma.post.count({ where: { ownerId: user.id } }),
    prisma.post.count({ where: { ownerId: user.id, status: "OPEN" } }),
    prisma.claimRequest.count({ where: { OR: [{ claimantId: user.id }, { post: { ownerId: user.id } }] } }),
    prisma.matchSuggestion.count({
      where: {
        dismissed: false,
        OR: [{ lostPost: { ownerId: user.id } }, { foundPost: { ownerId: user.id } }]
      }
    }),
    prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 8
    })
  ]);

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Stat title="Total posts" value={postsCount} icon={<ClipboardList className="h-4 w-4" />} />
        <Stat title="Open posts" value={openPosts} icon={<CheckCircle2 className="h-4 w-4" />} />
        <Stat title="Claims" value={claimsCount} icon={<Handshake className="h-4 w-4" />} />
        <Stat title="Matches" value={matchesCount} icon={<Sparkles className="h-4 w-4" />} />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-primary" />
            Notifications
          </CardTitle>
          <form action={markNotificationsRead}>
            <SubmitButton variant="outline" size="sm">
              Mark read
            </SubmitButton>
          </form>
        </CardHeader>
        <CardContent className="grid gap-3">
          {notifications.length ? (
            notifications.map((item) => (
              <Link key={item.id} href={item.href ?? "/dashboard"} className="rounded-lg border p-4 transition hover:bg-secondary/50">
                <div className="flex items-center justify-between gap-4">
                  <p className="font-medium">{item.title}</p>
                  {!item.readAt ? <span className="h-2 w-2 rounded-full bg-primary" /> : null}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{item.body}</p>
              </Link>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No notifications yet.</p>
          )}
        </CardContent>
      </Card>
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
