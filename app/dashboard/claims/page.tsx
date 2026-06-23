import Link from "next/link";
import { decideClaim } from "@/actions/claims";
import { StatusBadge } from "@/components/status-badge";
import { SubmitButton } from "@/components/submit-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { requireUser } from "@/lib/auth/guards";
import { prisma } from "@/lib/db/prisma";

export default async function DashboardClaimsPage() {
  const user = await requireUser();
  const [submitted, received] = await Promise.all([
    prisma.claimRequest.findMany({
      where: { claimantId: user.id },
      include: { post: true },
      orderBy: { createdAt: "desc" }
    }),
    prisma.claimRequest.findMany({
      where: { post: { ownerId: user.id } },
      include: { post: true, claimant: true },
      orderBy: { createdAt: "desc" }
    })
  ]);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Submitted claims</CardTitle>
          <CardDescription>Claims you sent for found items.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          {submitted.length ? (
            submitted.map((claim) => (
              <Link key={claim.id} href={`/posts/${claim.postId}`} className="rounded-lg border p-4 hover:bg-secondary/50">
                <div className="flex justify-between gap-3">
                  <p className="font-medium">{claim.post.title}</p>
                  <StatusBadge status={claim.status} />
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{claim.message}</p>
              </Link>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No submitted claims.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Received claims</CardTitle>
          <CardDescription>Claim requests on posts you own.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          {received.length ? (
            received.map((claim) => (
              <div key={claim.id} className="rounded-lg border p-4">
                <div className="flex justify-between gap-3">
                  <div>
                    <Link href={`/posts/${claim.postId}`} className="font-medium hover:underline">
                      {claim.post.title}
                    </Link>
                    <p className="text-xs text-muted-foreground">From {claim.claimant.name ?? claim.claimant.email}</p>
                  </div>
                  <StatusBadge status={claim.status} />
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{claim.proofOfOwnership}</p>
                {claim.status === "PENDING" ? (
                  <form action={decideClaim} className="mt-3 grid gap-3">
                    <input type="hidden" name="claimId" value={claim.id} />
                    <Textarea name="ownerNote" placeholder="Optional note" />
                    <div className="flex gap-2">
                      <SubmitButton name="status" value="APPROVED" size="sm">
                        Approve
                      </SubmitButton>
                      <SubmitButton name="status" value="REJECTED" variant="outline" size="sm">
                        Reject
                      </SubmitButton>
                    </div>
                  </form>
                ) : null}
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No received claims.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
