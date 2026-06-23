import { auth, currentUser } from "@clerk/nextjs/server";
import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

export async function currentDbUser() {
  const { userId, sessionClaims } = await auth();
  if (!userId) return null;

  const clerkUser = await currentUser().catch(() => null);
  const claims = sessionClaims as
    | {
        email?: string;
        email_address?: string;
        name?: string;
        fullName?: string;
        image?: string;
        imageUrl?: string;
        publicMetadata?: { role?: string };
        metadata?: { role?: string };
      }
    | null;

  const email =
    clerkUser?.emailAddresses.find((item) => item.id === clerkUser.primaryEmailAddressId)?.emailAddress ??
    claims?.email ??
    claims?.email_address ??
    `${userId}@clerk.local`;

  const metadataRole =
    clerkUser?.publicMetadata.role === "admin" || claims?.publicMetadata?.role === "admin" || claims?.metadata?.role === "admin"
      ? UserRole.ADMIN
      : undefined;
  const name = clerkUser?.fullName ?? clerkUser?.username ?? claims?.name ?? claims?.fullName ?? email.split("@")[0];
  const imageUrl = clerkUser?.imageUrl ?? claims?.imageUrl ?? claims?.image;

  return prisma.user.upsert({
    where: { clerkId: userId },
    update: {
      email,
      name,
      imageUrl,
      ...(metadataRole ? { role: metadataRole } : {})
    },
    create: {
      clerkId: userId,
      email,
      name,
      imageUrl,
      role: metadataRole ?? UserRole.STUDENT
    }
  });
}
