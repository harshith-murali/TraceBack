import Link from "next/link";
import { deletePostAsAdmin, setPostVisibility } from "@/actions/admin";
import { StatusBadge } from "@/components/status-badge";
import { SubmitButton } from "@/components/submit-button";
import { TypeBadge } from "@/components/type-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/db/prisma";
import { formatCategory } from "@/lib/utils";

export default async function AdminPostsPage() {
  await requireAdmin();
  const posts = await prisma.post.findMany({
    include: { owner: true, _count: { select: { reports: true, claims: true } } },
    orderBy: { updatedAt: "desc" },
    take: 100
  });

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Post</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Owner</TableHead>
          <TableHead>Signals</TableHead>
          <TableHead>Moderation</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {posts.map((post) => (
          <TableRow key={post.id}>
            <TableCell>
              <Link href={`/posts/${post.id}`} className="font-medium hover:underline">
                {post.title}
              </Link>
              <p className="text-xs text-muted-foreground">{formatCategory(post.category)}</p>
            </TableCell>
            <TableCell>
              <TypeBadge type={post.type} />
            </TableCell>
            <TableCell>
              <StatusBadge status={post.status} />
            </TableCell>
            <TableCell>{post.owner.name ?? post.owner.email}</TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {post._count.reports} reports, {post._count.claims} claims
            </TableCell>
            <TableCell>
              <div className="flex flex-wrap gap-2">
                <form action={setPostVisibility} className="flex gap-2">
                  <input type="hidden" name="postId" value={post.id} />
                  <input type="hidden" name="hidden" value={post.status === "HIDDEN" ? "false" : "true"} />
                  <Input name="reason" placeholder="Reason" className="h-8 w-28" />
                  <SubmitButton size="sm" variant="outline" pendingText="Saving...">
                    {post.status === "HIDDEN" ? "Unhide" : "Hide"}
                  </SubmitButton>
                </form>
                <form action={deletePostAsAdmin}>
                  <input type="hidden" name="postId" value={post.id} />
                  <SubmitButton size="sm" variant="destructive" pendingText="Deleting...">
                    Delete
                  </SubmitButton>
                </form>
                <Button asChild size="sm" variant="ghost">
                  <Link href={`/posts/${post.id}`}>Open</Link>
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
