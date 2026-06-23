"use server";

import { revalidatePath } from "next/cache";
import { ClaimStatus, PostStatus, PostType } from "@prisma/client";
import { requireUser } from "@/lib/auth/guards";
import { uploadImage } from "@/lib/cloudinary";
import { prisma } from "@/lib/db/prisma";
import { notifyUser } from "@/lib/notifications";
import { assertRateLimit } from "@/lib/rate-limit";
import { claimDecisionSchema, claimSchema } from "@/lib/validators";

function supportImages(formData: FormData) {
  return formData
    .getAll("supportingImages")
    .filter((item): item is File => item instanceof File && item.size > 0);
}

export async function createClaimRequest(formData: FormData) {
  const user = await requireUser();
  assertRateLimit(`claim:${user.id}`, 5, 60_000);

  const payload = claimSchema.parse({
    postId: formData.get("postId"),
    message: formData.get("message"),
    proofOfOwnership: formData.get("proofOfOwnership"),
    contactPreference: formData.get("contactPreference")
  });

  const post = await prisma.post.findUnique({
    where: { id: payload.postId },
    include: { owner: true }
  });

  if (!post || post.status !== PostStatus.OPEN || post.type !== PostType.FOUND) {
    throw new Error("Claims are available only for open found-item posts.");
  }

  if (post.ownerId === user.id) {
    throw new Error("You cannot claim your own post.");
  }

  const activeClaim = await prisma.claimRequest.findFirst({
    where: {
      postId: post.id,
      claimantId: user.id,
      status: { in: [ClaimStatus.PENDING, ClaimStatus.APPROVED] }
    }
  });

  if (activeClaim) {
    throw new Error("You already have an active claim for this post.");
  }

  const uploaded = await Promise.all(supportImages(formData).map((image) => uploadImage(image, `campus-lost-found/claims/${user.id}`)));

  const claim = await prisma.claimRequest.create({
    data: {
      postId: post.id,
      claimantId: user.id,
      message: payload.message,
      proofOfOwnership: payload.proofOfOwnership,
      contactPreference: payload.contactPreference,
      supportingImageUrls: uploaded.map((image) => image.secureUrl),
      supportingImagePublicIds: uploaded.map((image) => image.publicId)
    }
  });

  await notifyUser({
    userId: post.ownerId,
    type: "CLAIM_RECEIVED",
    title: "Claim request received",
    body: `${user.name ?? "A student"} sent a claim request for "${post.title}".`,
    href: `/dashboard/claims`,
    email: true
  });

  revalidatePath(`/posts/${post.id}`);
  revalidatePath("/dashboard/claims");
}

export async function decideClaim(formData: FormData) {
  const user = await requireUser();
  const payload = claimDecisionSchema.parse({
    claimId: formData.get("claimId"),
    status: formData.get("status"),
    ownerNote: formData.get("ownerNote") || ""
  });

  const claim = await prisma.claimRequest.findUnique({
    where: { id: payload.claimId },
    include: { post: true, claimant: true }
  });

  if (!claim || claim.post.ownerId !== user.id) {
    throw new Error("Claim not found.");
  }

  const updated = await prisma.$transaction(async (tx) => {
    const next = await tx.claimRequest.update({
      where: { id: claim.id },
      data: {
        status: payload.status,
        ownerNote: payload.ownerNote || null
      }
    });

    if (payload.status === ClaimStatus.APPROVED) {
      await tx.post.update({ where: { id: claim.postId }, data: { status: PostStatus.MATCHED } });
      await tx.claimRequest.updateMany({
        where: { postId: claim.postId, id: { not: claim.id }, status: ClaimStatus.PENDING },
        data: { status: ClaimStatus.REJECTED, ownerNote: "Another claim was approved." }
      });
    }

    return next;
  });

  await notifyUser({
    userId: claim.claimantId,
    type: payload.status === ClaimStatus.APPROVED ? "CLAIM_APPROVED" : "CLAIM_REJECTED",
    title: payload.status === ClaimStatus.APPROVED ? "Claim approved" : "Claim rejected",
    body: `Your claim for "${claim.post.title}" was ${payload.status.toLowerCase()}.`,
    href: `/posts/${claim.postId}`,
    email: true
  });

  revalidatePath("/dashboard/claims");
  revalidatePath(`/posts/${claim.postId}`);
}
