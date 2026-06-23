import { NotificationType } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { sendEmail, simpleEmail } from "@/lib/email/service";
import { absoluteUrl } from "@/lib/utils";

export async function notifyUser({
  userId,
  type,
  title,
  body,
  href,
  email
}: {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  href?: string;
  email?: boolean;
}) {
  const notification = await prisma.notification.create({
    data: { userId, type, title, body, href }
  });

  if (email) {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true } });
    if (user?.email) {
      const message = simpleEmail(title, body, href ? absoluteUrl(href) : undefined);
      await sendEmail({ to: user.email, ...message });
    }
  }

  return notification;
}
