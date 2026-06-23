"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { PostStatus } from "@prisma/client";
import { requirePostOwner, requireUser } from "@/lib/auth/guards";
import { deleteImage, uploadImage } from "@/lib/cloudinary";
import { prisma } from "@/lib/db/prisma";
import { runMatchingForPost } from "@/lib/matching/run";
import { notifyUser } from "@/lib/notifications";
import { assertRateLimit } from "@/lib/rate-limit";
import { postSchema } from "@/lib/validators";

function postPayload(formData: FormData) {
  return postSchema.parse({
    type: formData.get("type"),
    title: formData.get("title"),
    description: formData.get("description"),
    category: formData.get("category"),
    location: formData.get("location"),
    campusArea: formData.get("campusArea"),
    eventDate: formData.get("eventDate"),
    contactInfo: formData.get("contactInfo"),
    reward: formData.get("reward") || "",
    identifyingDetails: formData.get("identifyingDetails") || ""
  });
}

function imageFiles(formData: FormData, name = "images") {
  return formData
    .getAll(name)
    .filter((item): item is File => item instanceof File && item.size > 0);
}

export async function createPost(formData: FormData) {
  const user = await requireUser();
  assertRateLimit(`post:${user.id}`, 6, 60_000);

  const payload = postPayload(formData);
  const images = imageFiles(formData);
  if (images.length === 0) {
    throw new Error("Upload at least one image.");
  }

  const uploaded = await Promise.all(images.map((image) => uploadImage(image, `campus-lost-found/posts/${user.id}`)));

  const post = await prisma.post.create({
    data: {
      ownerId: user.id,
      ...payload,
      reward: payload.reward || null,
      identifyingDetails: payload.identifyingDetails || null,
      images: {
        create: uploaded.map((image, index) => ({
          url: image.secureUrl,
          publicId: image.publicId,
          alt: payload.title,
          position: index
        }))
      }
    }
  });

  await notifyUser({
    userId: user.id,
    type: "POST_CREATED",
    title: "Post created",
    body: `"${post.title}" is now live on Campus Lost & Found.`,
    href: `/posts/${post.id}`,
    email: true
  });

  await runMatchingForPost(post.id);

  revalidatePath("/");
  revalidatePath("/posts");
  redirect(`/posts/${post.id}`);
}

export async function updatePost(postId: string, formData: FormData) {
  await requirePostOwner(postId);
  const payload = postPayload(formData);
  const newImages = imageFiles(formData);
  const deleteIds = formData
    .getAll("deleteImageIds")
    .map(String)
    .filter(Boolean);

  const existingImages = await prisma.postImage.findMany({ where: { postId } });
  const remainingCount = existingImages.length - deleteIds.length + newImages.length;
  if (remainingCount <= 0) {
    throw new Error("A post must keep at least one image.");
  }

  const uploaded = await Promise.all(newImages.map((image) => uploadImage(image, `campus-lost-found/posts/${postId}`)));

  await prisma.$transaction(async (tx) => {
    await tx.post.update({
      where: { id: postId },
      data: {
        ...payload,
        reward: payload.reward || null,
        identifyingDetails: payload.identifyingDetails || null
      }
    });

    if (deleteIds.length > 0) {
      await tx.postImage.deleteMany({ where: { id: { in: deleteIds }, postId } });
    }

    if (uploaded.length > 0) {
      await tx.postImage.createMany({
        data: uploaded.map((image, index) => ({
          postId,
          url: image.secureUrl,
          publicId: image.publicId,
          alt: payload.title,
          position: existingImages.length + index
        }))
      });
    }
  });

  await Promise.all(existingImages.filter((image) => deleteIds.includes(image.id)).map((image) => deleteImage(image.publicId).catch(() => undefined)));
  await runMatchingForPost(postId);

  revalidatePath(`/posts/${postId}`);
  revalidatePath("/posts");
  redirect(`/posts/${postId}`);
}

export async function deletePost(postId: string) {
  await requirePostOwner(postId);
  const images = await prisma.postImage.findMany({ where: { postId } });

  await prisma.post.delete({ where: { id: postId } });
  await Promise.all(images.map((image) => deleteImage(image.publicId).catch(() => undefined)));

  revalidatePath("/posts");
  revalidatePath("/dashboard/posts");
  redirect("/dashboard/posts");
}

export async function markPostReturned(postId: string) {
  const user = await requirePostOwner(postId);
  const post = await prisma.post.update({
    where: { id: postId },
    data: { status: PostStatus.RETURNED },
    select: { id: true, title: true }
  });

  await notifyUser({
    userId: user.id,
    type: "POST_RETURNED",
    title: "Post marked returned",
    body: `"${post.title}" has been marked as returned.`,
    href: `/posts/${post.id}`,
    email: true
  });

  revalidatePath(`/posts/${postId}`);
  revalidatePath("/dashboard/posts");
}

export async function dismissMatch(matchId: string) {
  const user = await requireUser();
  const match = await prisma.matchSuggestion.findUnique({
    where: { id: matchId },
    include: { lostPost: true, foundPost: true }
  });

  if (!match || (match.lostPost.ownerId !== user.id && match.foundPost.ownerId !== user.id)) {
    throw new Error("Match not found.");
  }

  await prisma.matchSuggestion.update({ where: { id: matchId }, data: { dismissed: true } });
  revalidatePath("/dashboard/matches");
}
