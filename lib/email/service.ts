import nodemailer from "nodemailer";

type EmailPayload = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

export async function sendEmail(payload: EmailPayload) {
  const from = process.env.EMAIL_FROM || process.env.SMTP_FROM || "Campus Lost & Found <no-reply@example.com>";

  if (process.env.RESEND_API_KEY) {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ from, ...payload })
    });

    if (!response.ok) {
      throw new Error(`Resend email failed: ${response.statusText}`);
    }

    return;
  }

  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    await transporter.sendMail({ from, ...payload });
  }
}

export function simpleEmail(title: string, body: string, href?: string) {
  const cta = href ? `<p><a href="${href}">Open in Campus Lost & Found</a></p>` : "";
  return {
    subject: title,
    text: href ? `${body}\n\nOpen: ${href}` : body,
    html: `<main style="font-family:Arial,sans-serif;line-height:1.5"><h2>${title}</h2><p>${body}</p>${cta}</main>`
  };
}
