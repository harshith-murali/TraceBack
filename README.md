# Campus Lost & Found Platform

A production-ready full-stack campus lost-and-found web app built with Next.js 15 App Router, TypeScript, Tailwind CSS, shadcn-style components, Clerk, Cloudinary, Neon Postgres, Prisma, Zod, React Hook Form, and email notifications.

## Features

- Public browsing, searching, filtering, sorting, and paginated listings
- Clerk authentication with local user sync
- Lost and found post creation, editing, deletion, image uploads, and returned workflow
- Cloudinary image storage with public IDs and optimized display URLs
- Claim requests for found items with proof, contact preference, optional supporting images, approval, and rejection
- Smart lost/found matching using category, text overlap, location overlap, date proximity, and color/brand keywords
- Duplicate active claim prevention and lightweight rate limiting
- Spam/fake reporting with moderator review
- Admin dashboard for posts, reports, claim history, match quality, analytics, hiding, unhiding, and deletion
- In-app notifications and Resend or SMTP email delivery
- Light/dark mode, responsive dashboard UI, empty states, loading states, status badges, and accessible form controls

## File Structure

```txt
app/
  admin/
  dashboard/
  posts/
  sign-in/
  sign-up/
  globals.css
  layout.tsx
actions/
  admin.ts
  claims.ts
  notifications.ts
  posts.ts
  reports.ts
components/
  forms/
  ui/
  admin-nav.tsx
  app-shell.tsx
  dashboard-nav.tsx
  post-card.tsx
  search-filters.tsx
lib/
  auth/
  cloudinary/
  db/
  email/
  matching/
  constants.ts
  notifications.ts
  rate-limit.ts
  utils.ts
  validators.ts
prisma/
  schema.prisma
  seed.ts
```

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy the environment template:

```bash
cp .env.example .env
```

3. Create a Neon Postgres database and set `DATABASE_URL` in `.env`.

4. Create a Clerk application and set:

```txt
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
```

To make an admin, set Clerk public metadata for that user to:

```json
{ "role": "admin" }
```

The app mirrors that role into the local Prisma `User` row on login.

5. Create a Cloudinary project and set:

```txt
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
```

6. Configure email with either Resend:

```txt
RESEND_API_KEY
EMAIL_FROM
```

or SMTP:

```txt
SMTP_HOST
SMTP_PORT
SMTP_USER
SMTP_PASS
SMTP_FROM
```

7. Generate Prisma client and run migrations:

```bash
npm run prisma:generate
npm run prisma:migrate
```

8. Optional seed data:

```bash
npm run db:seed
```

9. Start the app:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Useful Commands

```bash
npm run dev
npm run build
npm run typecheck
npm run lint
npm run prisma:studio
```

## Matching Engine

The first version is intentionally practical and easy to improve. It normalizes text, tokenizes titles/descriptions/locations, scores category equality, title overlap, description overlap, campus location overlap, date proximity, and optional detail keywords such as colors and brands. Suggestions above `60` confidence are stored in `MatchSuggestion`.

## Environment Variables

See [.env.example](./.env.example) for the full list of required values:

- `DATABASE_URL`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL`
- `NEXT_PUBLIC_CLERK_SIGN_UP_URL`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `RESEND_API_KEY` or SMTP variables
