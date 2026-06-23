import { PostType } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { scorePosts } from "@/lib/matching/scoring";
import { notifyUser } from "@/lib/notifications";

const threshold = 60;

export async function runMatchingForPost(postId: string) {
  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post || post.status !== "OPEN") return [];

  const oppositeType = post.type === PostType.LOST ? PostType.FOUND : PostType.LOST;
  const candidates = await prisma.post.findMany({
    where: {
      id: { not: post.id },
      type: oppositeType,
      status: "OPEN",
      category: post.category
    },
    take: 50,
    orderBy: { createdAt: "desc" }
  });

  const saved = [];
  for (const candidate of candidates) {
    const lostPost = post.type === PostType.LOST ? post : candidate;
    const foundPost = post.type === PostType.FOUND ? post : candidate;
    const score = scorePosts(lostPost, foundPost);

    if (score.confidence >= threshold) {
      const match = await prisma.matchSuggestion.upsert({
        where: {
          lostPostId_foundPostId: {
            lostPostId: lostPost.id,
            foundPostId: foundPost.id
          }
        },
        update: {
          confidence: score.confidence,
          signals: score.signals
        },
        create: {
          lostPostId: lostPost.id,
          foundPostId: foundPost.id,
          confidence: score.confidence,
          signals: score.signals
        }
      });
      saved.push(match);

      await notifyUser({
        userId: lostPost.ownerId,
        type: "STRONG_MATCH",
        title: "Strong match found",
        body: `A found post may match "${lostPost.title}".`,
        href: `/posts/${lostPost.id}`,
        email: score.confidence >= 75
      });
    }
  }

  return saved;
}
