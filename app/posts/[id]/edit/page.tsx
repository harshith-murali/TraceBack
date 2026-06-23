import { notFound } from "next/navigation";
import { updatePost } from "@/actions/posts";
import { PostForm } from "@/components/forms/post-form";
import { requirePostOwner } from "@/lib/auth/guards";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Edit Post"
};

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requirePostOwner(id);

  const post = await prisma.post.findUnique({
    where: { id },
    include: { images: { orderBy: { position: "asc" } } }
  });

  if (!post) notFound();

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold tracking-normal">Edit post</h1>
        <p className="mt-1 text-sm text-muted-foreground">Changes refresh match suggestions for this listing.</p>
      </div>
      <PostForm action={updatePost.bind(null, id)} post={post} />
    </div>
  );
}
