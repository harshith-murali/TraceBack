"use server";

import { revalidatePath } from "next/cache";
import { PostStatus, ReportStatus } from "@prisma/client";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/db/prisma";
import { reportDecisionSchema } from "@/lib/validators";

export async function setPostVisibility(formData: FormData) {
  const admin = await requireAdmin();
  const postId = String(formData.get("postId"));
  const hidden = formData.get("hidden") === "true";
  const reason = String(formData.get("reason") || "");

  const post = await prisma.post.update({
    where: { id: postId },
    data: {
      status: hidden ? PostStatus.HIDDEN : PostStatus.OPEN,
      hiddenReason: hidden ? reason || "Moderated by admin" : null
    }
  });

  await prisma.auditLog.create({
    data: {
      actorId: admin.id,
      action: hidden ? "POST_HIDDEN" : "POST_UNHIDDEN",
      targetType: "post",
      targetId: post.id,
      metadata: { reason }
    }
  });

  revalidatePath("/admin/posts");
  revalidatePath(`/posts/${post.id}`);
}

export async function deletePostAsAdmin(formData: FormData) {
  const admin = await requireAdmin();
  const postId = String(formData.get("postId"));

  await prisma.post.delete({ where: { id: postId } });
  await prisma.auditLog.create({
    data: {
      actorId: admin.id,
      action: "POST_DELETED",
      targetType: "post",
      targetId: postId
    }
  });

  revalidatePath("/admin/posts");
}

export async function reviewReport(formData: FormData) {
  const admin = await requireAdmin();
  const payload = reportDecisionSchema.parse({
    reportId: formData.get("reportId"),
    status: formData.get("status")
  });

  const report = await prisma.report.update({
    where: { id: payload.reportId },
    data: { status: payload.status as ReportStatus }
  });

  await prisma.auditLog.create({
    data: {
      actorId: admin.id,
      action: "REPORT_REVIEWED",
      targetType: "report",
      targetId: report.id,
      metadata: { status: payload.status }
    }
  });

  revalidatePath("/admin/reports");
}
