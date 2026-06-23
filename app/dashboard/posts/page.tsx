import Link from "next/link";
import { Plus } from "lucide-react";
import { markPostReturned } from "@/actions/posts";
import { PostCard } from "@/components/post-card";
import { StatusBadge } from "@/components/status-badge";
import { SubmitButton } from "@/components/submit-button";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { requireUser } from "@/lib/auth/guards";
import { prisma } from "@/lib/db/prisma";

export default async function DashboardPostsPage() {
  const user = await requireUser();
  const posts = await prisma.post.findMany({
    where: { ownerId: user.id },
    include: { images: { orderBy: { position: "asc" } } },
    orderBy: { updatedAt: "desc" }
  });

  if (!posts.length) {
    return (
      <EmptyState
        title="No posts yet"
        description="Create a lost or found post to start matching with campus listings."
        action={
          <Button asChild>
            <Link href="/posts/new">
              <Plus className="h-4 w-4" />
              Create post
            </Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {posts.map((post) => (
        <div key={post.id} className="grid gap-2">
          <PostCard post={post} />
          <div className="flex items-center justify-between rounded-lg border bg-card p-3">
            <StatusBadge status={post.status} />
            <form action={markPostReturned.bind(null, post.id)}>
              <SubmitButton variant="outline" size="sm">
                Mark returned
              </SubmitButton>
            </form>
          </div>
        </div>
      ))}
    </div>
  );
}
