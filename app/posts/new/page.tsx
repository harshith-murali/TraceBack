import { createPost } from "@/actions/posts";
import { PostForm } from "@/components/forms/post-form";
import { requireUser } from "@/lib/auth/guards";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Create Post"
};

export default async function NewPostPage() {
  await requireUser();

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold tracking-normal">Create a post</h1>
        <p className="mt-1 text-sm text-muted-foreground">Add details students can search, and keep proof-only details private.</p>
      </div>
      <PostForm action={createPost} />
    </div>
  );
}
