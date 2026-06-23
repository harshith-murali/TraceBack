import Link from "next/link";
import { ArrowRight, Search, ShieldCheck, Sparkles } from "lucide-react";
import { PostStatus } from "@prisma/client";
import { PostCard } from "@/components/post-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const recentPosts = await prisma.post.findMany({
    where: { status: { not: PostStatus.HIDDEN } },
    include: { images: { orderBy: { position: "asc" } }, owner: { select: { name: true, imageUrl: true } } },
    orderBy: { createdAt: "desc" },
    take: 6
  });
  const features = [
    {
      title: "Smart matching",
      body: "Weighted scoring connects likely lost/found pairs without exposing private details.",
      icon: Sparkles
    },
    {
      title: "Claim workflow",
      body: "Owners approve or reject claims with proof, notes, and notification history.",
      icon: ShieldCheck
    },
    {
      title: "Moderation",
      body: "Reports, hidden posts, audit logs, and admin analytics keep the feed clean.",
      icon: Search
    }
  ];

  return (
    <div>
      <section className="campus-grid border-b">
        <div className="container grid gap-10 py-12 lg:grid-cols-[1.1fr_0.9fr] lg:py-16">
          <div className="flex flex-col justify-center">
            <div className="mb-4 inline-flex w-fit items-center gap-2 rounded-md border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5 text-primary" />
              Verified campus claims and moderation
            </div>
            <h1 className="max-w-3xl text-4xl font-semibold tracking-normal md:text-5xl">Campus Lost & Found Platform</h1>
            <p className="mt-4 max-w-2xl text-base text-muted-foreground md:text-lg">
              Create lost or found posts, upload photos, discover strong matches, and handle claims through one secure campus workflow.
            </p>
            <form action="/posts" className="mt-7 flex max-w-xl gap-2">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input name="q" placeholder="Search wallet, ID card, library..." className="h-11 pl-9" />
              </div>
              <Button type="submit" size="lg">
                Search
              </Button>
            </form>
            <div className="mt-5 flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/posts/new">
                  Report item
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/posts">Browse listings</Link>
              </Button>
            </div>
          </div>
          <div className="grid content-end gap-3">
            {[
              ["1", "Post clear details and images"],
              ["2", "Matching engine compares category, text, place, and time"],
              ["3", "Claims and approvals stay visible to the right people"]
            ].map(([step, label]) => (
              <Card key={step}>
                <CardContent className="flex items-center gap-4 p-4">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-primary text-sm font-semibold text-primary-foreground">
                    {step}
                  </span>
                  <p className="text-sm font-medium">{label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="container py-10">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-normal">Recent campus posts</h2>
            <p className="mt-1 text-sm text-muted-foreground">Newest lost and found reports across campus areas.</p>
          </div>
          <Button asChild variant="ghost">
            <Link href="/posts">
              View all
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {recentPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </section>

      <section className="border-t bg-card/40">
        <div className="container grid gap-4 py-10 md:grid-cols-3">
          {features.map(({ title, body, icon: Icon }) => (
            <Card key={title}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-primary" />
                  {title}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">{body}</CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
