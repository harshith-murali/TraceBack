import { z } from "zod";
import { Category, ClaimStatus, PostStatus, PostType, ReportReason, ReportStatus } from "@prisma/client";

const requiredText = (label: string, max = 500) => z.string().trim().min(2, `${label} is required`).max(max);

export const postSchema = z
  .object({
    type: z.nativeEnum(PostType),
    title: requiredText("Title", 120),
    description: requiredText("Description", 1500),
    category: z.nativeEnum(Category),
    location: requiredText("Location", 160),
    campusArea: requiredText("Campus area", 80),
    eventDate: z.coerce.date(),
    contactInfo: requiredText("Contact info", 240),
    reward: z.string().trim().max(160).optional().or(z.literal("")),
    identifyingDetails: z.string().trim().max(800).optional().or(z.literal(""))
  })
  .refine((data) => data.type === PostType.LOST || !data.reward, {
    message: "Rewards are only available for lost posts.",
    path: ["reward"]
  });

export const postSearchSchema = z.object({
  q: z.string().optional(),
  type: z.nativeEnum(PostType).optional(),
  category: z.nativeEnum(Category).optional(),
  status: z.nativeEnum(PostStatus).optional(),
  campusArea: z.string().optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  sort: z.enum(["newest", "oldest", "relevant", "updated"]).default("newest"),
  page: z.coerce.number().int().min(1).default(1)
});

export const claimSchema = z.object({
  postId: z.string().cuid(),
  message: requiredText("Message", 700),
  proofOfOwnership: requiredText("Proof of ownership", 1200),
  contactPreference: requiredText("Contact preference", 120)
});

export const claimDecisionSchema = z.object({
  claimId: z.string().cuid(),
  status: z.enum([ClaimStatus.APPROVED, ClaimStatus.REJECTED]),
  ownerNote: z.string().trim().max(600).optional().or(z.literal(""))
});

export const reportSchema = z.object({
  postId: z.string().cuid(),
  reason: z.nativeEnum(ReportReason),
  details: z.string().trim().max(600).optional().or(z.literal(""))
});

export const reportDecisionSchema = z.object({
  reportId: z.string().cuid(),
  status: z.nativeEnum(ReportStatus)
});
