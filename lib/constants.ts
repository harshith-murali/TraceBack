import { Category, ClaimStatus, PostStatus, PostType, ReportReason } from "@prisma/client";

export const categories = Object.values(Category);
export const postTypes = Object.values(PostType);
export const postStatuses = Object.values(PostStatus);
export const claimStatuses = Object.values(ClaimStatus);
export const reportReasons = Object.values(ReportReason);

export const campusAreas = [
  "Library",
  "Cafeteria",
  "Main Gate",
  "Auditorium",
  "Hostel Block",
  "Lab Complex",
  "Sports Ground",
  "Admin Block",
  "Parking Area",
  "Other"
];

export const sortOptions = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "relevant", label: "Most relevant" },
  { value: "updated", label: "Recently updated" }
];
