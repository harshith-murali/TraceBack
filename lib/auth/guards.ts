import { notFound, redirect } from "next/navigation";
import { UserRole } from "@prisma/client";
import { currentDbUser } from "@/lib/auth/current-user";
import { prisma } from "@/lib/db/prisma";

export async function requireUser() {
  const user = await currentDbUser();
  if (!user) redirect("/sign-in");
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== UserRole.ADMIN) notFound();
  return user;
}

export async function requirePostOwner(postId: string) {
  const user = await requireUser();
  const post = await prisma.post.findUnique({ where: { id: postId }, select: { ownerId: true } });
  if (!post || post.ownerId !== user.id) notFound();
  return user;
}
