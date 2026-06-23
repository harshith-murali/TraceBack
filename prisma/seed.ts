import { PrismaClient, Category, PostStatus, PostType, UserRole } from "@prisma/client";

const prisma = new PrismaClient();

const sampleImage = (text: string) =>
  `https://res.cloudinary.com/demo/image/upload/w_900,h_650,c_fill,f_auto,q_auto/sample.jpg#${encodeURIComponent(text)}`;

async function main() {
  const admin = await prisma.user.upsert({
    where: { email: "admin@campus.edu" },
    update: { role: UserRole.ADMIN },
    create: {
      clerkId: "seed_admin",
      email: "admin@campus.edu",
      name: "Campus Admin",
      role: UserRole.ADMIN
    }
  });

  const students = await Promise.all(
    ["Asha Rao", "Neel Kumar", "Ira Menon", "Dev Shah"].map((name, index) =>
      prisma.user.upsert({
        where: { email: `student${index + 1}@campus.edu` },
        update: {},
        create: {
          clerkId: `seed_student_${index + 1}`,
          email: `student${index + 1}@campus.edu`,
          name
        }
      })
    )
  );

  const posts = [
    {
      ownerId: students[0].id,
      type: PostType.LOST,
      title: "Black HP laptop sleeve",
      description: "Lost a black laptop sleeve with a silver HP logo after database lab.",
      category: Category.ELECTRONICS,
      location: "Lab Complex, Room 204",
      campusArea: "Lab Complex",
      reward: "Coffee at cafeteria",
      identifyingDetails: "Small blue sticker inside the sleeve"
    },
    {
      ownerId: students[1].id,
      type: PostType.FOUND,
      title: "HP laptop pouch near lab complex",
      description: "Found a black laptop pouch outside the lab complex stairwell.",
      category: Category.ELECTRONICS,
      location: "Lab Complex stairwell",
      campusArea: "Lab Complex"
    },
    {
      ownerId: students[2].id,
      type: PostType.FOUND,
      title: "Student ID card",
      description: "Found an ID card near the main gate security desk.",
      category: Category.ID_CARDS,
      location: "Main Gate",
      campusArea: "Main Gate"
    },
    {
      ownerId: students[3].id,
      type: PostType.LOST,
      title: "Brown wallet with metro card",
      description: "Brown wallet misplaced during lunch. It has a metro card and receipts.",
      category: Category.WALLETS,
      location: "Cafeteria",
      campusArea: "Cafeteria",
      reward: "Rs. 500"
    }
  ];

  for (const [index, post] of posts.entries()) {
    const created = await prisma.post.create({
      data: {
        ...post,
        status: PostStatus.OPEN,
        eventDate: new Date(Date.now() - index * 1000 * 60 * 60 * 9),
        contactInfo: "Use claim request or email student desk.",
        images: {
          create: {
            url: sampleImage(post.title),
            publicId: `seed/${index + 1}`,
            alt: post.title,
            position: 0
          }
        }
      }
    });

    await prisma.notification.create({
      data: {
        userId: created.ownerId,
        type: "POST_CREATED",
        title: "Post created",
        body: `${created.title} is now visible to campus.`,
        href: `/posts/${created.id}`
      }
    });
  }

  await prisma.auditLog.create({
    data: {
      actorId: admin.id,
      action: "MATCH_REVIEWED",
      targetType: "system",
      targetId: "seed",
      metadata: { note: "Seed data installed" }
    }
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
