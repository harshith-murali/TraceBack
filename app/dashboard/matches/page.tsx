import Link from "next/link";
import { dismissMatch } from "@/actions/posts";
import { StatusBadge } from "@/components/status-badge";
import { SubmitButton } from "@/components/submit-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { requireUser } from "@/lib/auth/guards";
import { prisma } from "@/lib/db/prisma";

export default async function DashboardMatchesPage() {
  const user = await requireUser();
  const matches = await prisma.matchSuggestion.findMany({
    where: {
      dismissed: false,
      OR: [{ lostPost: { ownerId: user.id } }, { foundPost: { ownerId: user.id } }]
    },
    include: { lostPost: true, foundPost: true },
    orderBy: { confidence: "desc" }
  });

  if (!matches.length) {
    return <EmptyState title="No matches yet" description="Strong suggestions will appear here as students add lost and found posts." />;
  }

  return (
    <div className="grid gap-4">
      {matches.map((match) => (
        <Card key={match.id}>
          <CardHeader>
            <CardTitle>{match.confidence}% confidence</CardTitle>
            <CardDescription>Lost and found posts with overlapping details.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-center">
            <MatchSide label="Lost" title={match.lostPost.title} status={match.lostPost.status} href={`/posts/${match.lostPostId}`} />
            <MatchSide label="Found" title={match.foundPost.title} status={match.foundPost.status} href={`/posts/${match.foundPostId}`} />
            <div className="flex gap-2">
              <Button asChild variant="outline" size="sm">
                <Link href={`/posts/${match.foundPostId}`}>Open</Link>
              </Button>
              <form action={dismissMatch.bind(null, match.id)}>
                <SubmitButton variant="ghost" size="sm" pendingText="Dismissing...">
                  Dismiss
                </SubmitButton>
              </form>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function MatchSide({ label, title, status, href }: { label: string; title: string; status: string; href: string }) {
  return (
    <Link href={href} className="rounded-lg border p-4 hover:bg-secondary/50">
      <p className="text-xs font-medium uppercase text-muted-foreground">{label}</p>
      <p className="mt-1 font-medium">{title}</p>
      <div className="mt-2">
        <StatusBadge status={status} />
      </div>
    </Link>
  );
}
