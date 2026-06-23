import { auth, currentUser } from "@clerk/nextjs/server";
import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

export async function currentDbUser() {
  const { userId } = await auth();
  if (!userId) return null;

  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  const email = clerkUser.emailAddresses.find((item) => item.id === clerkUser.primaryEmailAddressId)?.emailAddress;
  if (!email) return null;

  const metadataRole = clerkUser.publicMetadata.role === "admin" ? UserRole.ADMIN : undefined;

  return prisma.user.upsert({
    where: { clerkId: userId },
    update: {
      email,
      name: clerkUser.fullName ?? clerkUser.username ?? email.split("@")[0],
      imageUrl: clerkUser.imageUrl,
      ...(metadataRole ? { role: metadataRole } : {})
    },
    create: {
      clerkId: userId,
      email,
      name: clerkUser.fullName ?? clerkUser.username ?? email.split("@")[0],
      imageUrl: clerkUser.imageUrl,
      role: metadataRole ?? UserRole.STUDENT
    }
  });
}
