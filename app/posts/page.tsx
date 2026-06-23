import Link from "next/link";
import { Plus, SearchX } from "lucide-react";
import { Prisma, PostStatus } from "@prisma/client";
import { PostCard } from "@/components/post-card";
import { SearchFilters } from "@/components/search-filters";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { prisma } from "@/lib/db/prisma";
import { postSearchSchema } from "@/lib/validators";

const pageSize = 12;

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Browse Posts"
};

export default async function PostsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const rawParams = await searchParams;
  const parsed = postSearchSchema.parse(rawParams);

  const where: Prisma.PostWhereInput = {
    status: parsed.status ?? { not: PostStatus.HIDDEN },
    ...(parsed.type ? { type: parsed.type } : {}),
    ...(parsed.category ? { category: parsed.category } : {}),
    ...(parsed.campusArea ? { campusArea: parsed.campusArea } : {}),
    ...(parsed.from || parsed.to
      ? {
          eventDate: {
            ...(parsed.from ? { gte: parsed.from } : {}),
            ...(parsed.to ? { lte: parsed.to } : {})
          }
        }
      : {}),
    ...(parsed.q
      ? {
          OR: [
            { title: { contains: parsed.q, mode: "insensitive" } },
            { description: { contains: parsed.q, mode: "insensitive" } },
            { location: { contains: parsed.q, mode: "insensitive" } },
            { campusArea: { contains: parsed.q, mode: "insensitive" } }
          ]
        }
      : {})
  };

  const orderBy: Prisma.PostOrderByWithRelationInput =
    parsed.sort === "oldest" ? { createdAt: "asc" } : parsed.sort === "updated" ? { updatedAt: "desc" } : { createdAt: "desc" };

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      include: { images: { orderBy: { position: "asc" } }, owner: { select: { name: true, imageUrl: true } } },
      orderBy,
      skip: (parsed.page - 1) * pageSize,
      take: pageSize
    }),
    prisma.post.count({ where })
  ]);

  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="container py-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-normal">Browse posts</h1>
          <p className="mt-1 text-sm text-muted-foreground">Search open campus listings by item, category, date, and area.</p>
        </div>
        <Button asChild>
          <Link href="/posts/new">
            <Plus className="h-4 w-4" />
            New post
          </Link>
        </Button>
      </div>
      <SearchFilters searchParams={rawParams} />
      {posts.length ? (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
          <div className="mt-8 flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Page {parsed.page} of {pageCount}
            </span>
            <div className="flex gap-2">
              <Button asChild variant="outline" size="sm" disabled={parsed.page <= 1}>
                <Link href={`/posts?page=${Math.max(1, parsed.page - 1)}`}>Previous</Link>
              </Button>
              <Button asChild variant="outline" size="sm" disabled={parsed.page >= pageCount}>
                <Link href={`/posts?page=${Math.min(pageCount, parsed.page + 1)}`}>Next</Link>
              </Button>
            </div>
          </div>
        </>
      ) : (
        <div className="mt-6">
          <EmptyState
            icon={<SearchX className="h-5 w-5" />}
            title="No posts match those filters"
            description="Try a broader search, or create a post if your item is missing."
            action={
              <Button asChild>
                <Link href="/posts/new">Create post</Link>
              </Button>
            }
          />
        </div>
      )}
    </div>
  );
}
