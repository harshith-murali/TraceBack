"use server";

import { revalidatePath } from "next/cache";
import { actionError, type ActionState } from "@/lib/action-state";
import { requireUser } from "@/lib/auth/guards";
import { prisma } from "@/lib/db/prisma";
import { notifyUser } from "@/lib/notifications";
import { assertRateLimit } from "@/lib/rate-limit";
import { reportSchema } from "@/lib/validators";

export async function createReport(_state: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const user = await requireUser();
    assertRateLimit(`report:${user.id}`, 5, 60_000);

    const payload = reportSchema.parse({
      postId: formData.get("postId"),
      reason: formData.get("reason"),
      details: formData.get("details") || ""
    });

    const post = await prisma.post.findUnique({ where: { id: payload.postId } });
    if (!post) throw new Error("Post not found.");

    await prisma.report.upsert({
      where: {
        postId_reporterId_reason: {
          postId: payload.postId,
          reporterId: user.id,
          reason: payload.reason
        }
      },
      update: {
        details: payload.details || null,
        status: "OPEN"
      },
      create: {
        postId: payload.postId,
        reporterId: user.id,
        reason: payload.reason,
        details: payload.details || null
      }
    });

    const admins = await prisma.user.findMany({ where: { role: "ADMIN" }, select: { id: true } });
    await Promise.all(
      admins.map((admin) =>
        notifyUser({
          userId: admin.id,
          type: "REPORT_CREATED",
          title: "New report submitted",
          body: `A post was reported for ${payload.reason.toLowerCase().replace("_", " ")}.`,
          href: "/admin/reports"
        })
      )
    );

    revalidatePath(`/posts/${payload.postId}`);
    return {};
  } catch (error) {
    return actionError(error, "Could not submit the report.");
  }
}
