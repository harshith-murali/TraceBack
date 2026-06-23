import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { format } from "date-fns";
import { CheckCircle2, Edit, Flag, MapPin, Sparkles, Trash2 } from "lucide-react";
import { decideClaim } from "@/actions/claims";
import { deletePost, dismissMatch, markPostReturned } from "@/actions/posts";
import { ClaimForm } from "@/components/forms/claim-form";
import { ReportForm } from "@/components/forms/report-form";
import { StatusBadge } from "@/components/status-badge";
import { SubmitButton } from "@/components/submit-button";
import { TypeBadge } from "@/components/type-badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { currentDbUser } from "@/lib/auth/current-user";
import { cloudinaryImage } from "@/lib/cloudinary";
import { prisma } from "@/lib/db/prisma";
import { formatCategory } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await prisma.post.findUnique({ where: { id }, select: { title: true, description: true } });
  return {
    title: post?.title ?? "Post",
    description: post?.description
  };
}

export default async function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { userId } = await auth();
  const viewer = userId ? await currentDbUser() : null;

  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      owner: { select: { id: true, name: true, imageUrl: true, role: true } },
      images: { orderBy: { position: "asc" } },
      claims: {
        include: { claimant: { select: { id: true, name: true, email: true, imageUrl: true } } },
        orderBy: { createdAt: "desc" }
      },
      lostMatches: {
        include: { foundPost: { include: { images: { take: 1, orderBy: { position: "asc" } } } } },
        orderBy: { confidence: "desc" }
      },
      foundMatches: {
        include: { lostPost: { include: { images: { take: 1, orderBy: { position: "asc" } } } } },
        orderBy: { confidence: "desc" }
      }
    }
  });

  if (!post || (post.status === "HIDDEN" && viewer?.role !== "ADMIN" && viewer?.id !== post.ownerId)) {
    notFound();
  }

  const isOwner = viewer?.id === post.ownerId;
  const isAdmin = viewer?.role === "ADMIN";
  const canClaim = viewer && !isOwner && post.type === "FOUND" && post.status === "OPEN";
  const visibleMatches = post.type === "LOST" ? post.lostMatches : post.foundMatches;

  return (
    <div className="container grid gap-8 py-8 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="grid gap-6">
        <div className="grid gap-3">
          <div className="flex flex-wrap gap-2">
            <TypeBadge type={post.type} />
            <StatusBadge status={post.status} />
            <span className="rounded-md border px-2 py-0.5 text-xs font-medium">{formatCategory(post.category)}</span>
          </div>
          <h1 className="text-3xl font-semibold tracking-normal">{post.title}</h1>
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4" />
              {post.location}
            </span>
            <span>{format(post.eventDate, "PPp")}</span>
            <span>Posted by {post.owner.name ?? "Student"}</span>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {post.images.map((image, index) => (
            <div key={image.id} className={index === 0 ? "relative aspect-[4/3] overflow-hidden rounded-lg border sm:col-span-2" : "relative aspect-[4/3] overflow-hidden rounded-lg border"}>
              <Image src={cloudinaryImage(image.url)} alt={image.alt ?? post.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 60vw" />
            </div>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <p className="whitespace-pre-line text-sm leading-6 text-muted-foreground">{post.description}</p>
            <div className="grid gap-3 rounded-lg bg-secondary/60 p-4 text-sm md:grid-cols-2">
              <div>
                <p className="font-medium">Campus area</p>
                <p className="text-muted-foreground">{post.campusArea}</p>
              </div>
              <div>
                <p className="font-medium">Contact info</p>
                <p className="text-muted-foreground">{post.contactInfo}</p>
              </div>
              {post.reward ? (
                <div>
                  <p className="font-medium">Reward</p>
                  <p className="text-muted-foreground">{post.reward}</p>
                </div>
              ) : null}
            </div>
            {(isOwner || isAdmin) && post.identifyingDetails ? (
              <Alert>
                <AlertTitle>Private identifying details</AlertTitle>
                <AlertDescription>{post.identifyingDetails}</AlertDescription>
              </Alert>
            ) : null}
          </CardContent>
        </Card>

        {isOwner ? (
          <Card>
            <CardHeader>
              <CardTitle>Incoming claims</CardTitle>
              <CardDescription>Approve only when the proof is convincing.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              {post.claims.length ? (
                post.claims.map((claim) => (
                  <div key={claim.id} className="rounded-lg border p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="font-medium">{claim.claimant.name ?? claim.claimant.email}</p>
                        <p className="text-xs text-muted-foreground">{format(claim.createdAt, "PPp")}</p>
                      </div>
                      <StatusBadge status={claim.status} />
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground">{claim.message}</p>
                    <p className="mt-2 text-sm">
                      <span className="font-medium">Proof:</span> {claim.proofOfOwnership}
                    </p>
                    <p className="mt-2 text-sm">
                      <span className="font-medium">Contact:</span> {claim.contactPreference}
                    </p>
                    {claim.status === "PENDING" ? (
                      <form action={decideClaim} className="mt-4 grid gap-3">
                        <input type="hidden" name="claimId" value={claim.id} />
                        <Textarea name="ownerNote" placeholder="Optional note to claimant" />
                        <div className="flex gap-2">
                          <SubmitButton name="status" value="APPROVED" size="sm" pendingText="Updating...">
                            Approve
                          </SubmitButton>
                          <SubmitButton name="status" value="REJECTED" variant="outline" size="sm" pendingText="Updating...">
                            Reject
                          </SubmitButton>
                        </div>
                      </form>
                    ) : null}
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No claim requests yet.</p>
              )}
            </CardContent>
          </Card>
        ) : null}

        {(isOwner || isAdmin) && visibleMatches.length ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Likely matches
              </CardTitle>
              <CardDescription>Top suggestions from the matching engine.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              {visibleMatches.map((match) => {
                const related = "foundPost" in match ? match.foundPost : match.lostPost;
                return (
                  <div key={match.id} className="flex items-center justify-between gap-4 rounded-lg border p-4">
                    <div>
                      <p className="font-medium">{related.title}</p>
                      <p className="text-sm text-muted-foreground">{match.confidence}% confidence</p>
                    </div>
                    <div className="flex gap-2">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/posts/${related.id}`}>Open</Link>
                      </Button>
                      <form action={dismissMatch.bind(null, match.id)}>
                        <SubmitButton variant="ghost" size="sm" pendingText="Dismissing...">
                          Dismiss
                        </SubmitButton>
                      </form>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        ) : null}
      </div>

      <aside className="grid h-fit gap-4">
        {isOwner ? (
          <Card>
            <CardHeader>
              <CardTitle>Owner actions</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2">
              <Button asChild variant="outline">
                <Link href={`/posts/${post.id}/edit`}>
                  <Edit className="h-4 w-4" />
                  Edit post
                </Link>
              </Button>
              <form action={markPostReturned.bind(null, post.id)}>
                <SubmitButton className="w-full" variant="secondary" pendingText="Updating...">
                  <CheckCircle2 className="h-4 w-4" />
                  Mark returned
                </SubmitButton>
              </form>
              <form action={deletePost.bind(null, post.id)}>
                <SubmitButton className="w-full" variant="destructive" pendingText="Deleting...">
                  <Trash2 className="h-4 w-4" />
                  Delete post
                </SubmitButton>
              </form>
            </CardContent>
          </Card>
        ) : null}

        {canClaim ? <ClaimForm postId={post.id} /> : null}
        {viewer && !isOwner ? <ReportForm postId={post.id} /> : null}
        {!viewer ? (
          <Card>
            <CardContent className="p-5 text-sm text-muted-foreground">
              Sign in to submit a claim request or report suspicious content.
            </CardContent>
          </Card>
        ) : null}
        {viewer && isOwner ? (
          <Card>
            <CardContent className="flex gap-3 p-5 text-sm text-muted-foreground">
              <Flag className="h-4 w-4 shrink-0" />
              Reports and moderation history are visible to admins.
            </CardContent>
          </Card>
        ) : null}
      </aside>
    </div>
  );
}
