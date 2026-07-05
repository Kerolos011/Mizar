import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];

  if (!email) {
    console.error("Please provide an email:");
    console.error("npx tsx scripts/make-super-admin.ts admin@example.com");
    process.exit(1);
  }

  const user = await prisma.user.findUnique({
    where: {
      email,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  });

  if (!user) {
    console.error(`No user found with email: ${email}`);
    process.exit(1);
  }

  const updatedUser = await prisma.user.update({
    where: {
      email,
    },
    data: {
      role: "SUPER_ADMIN",
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  });

  console.log("User updated successfully:");
  console.log(updatedUser);
}

main()
  .catch((error) => {
    console.error("Failed to update user:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });