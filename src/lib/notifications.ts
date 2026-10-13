import { prisma } from "./prisma";

export type NotificationType =
  | "NEW_SOLUTION"
  | "NEW_PARTNERSHIP"
  | "PARTNERSHIP_APPROVED"
  | "PARTNERSHIP_REJECTED"
  | "PROBLEM_APPROVED"
  | "PROBLEM_UNDER_REVIEW"
  | "PROBLEM_REJECTED";

export async function createNotification(
  userId: string,
  type: NotificationType,
  message: string,
  linkUrl: string
) {
  return prisma.notification.create({
    data: { userId, type, message, linkUrl },
  });
}
