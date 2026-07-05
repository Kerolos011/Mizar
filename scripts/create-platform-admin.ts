import fs from "node:fs";
import path from "node:path";

function loadEnvFile(fileName: string) {
  const filePath = path.join(process.cwd(), fileName);

  if (!fs.existsSync(filePath)) return;

  const content = fs.readFileSync(filePath, "utf8");

  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) continue;

    const equalIndex = trimmed.indexOf("=");

    if (equalIndex === -1) continue;

    const key = trimmed.slice(0, equalIndex).trim();
    let value = trimmed.slice(equalIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    process.env[key] = value;
  }
}

loadEnvFile(".env");
loadEnvFile(".env.local");

async function main() {
  const email = String(process.argv[2] || "").trim().toLowerCase();
  const password = String(process.argv[3] || "");
  const name = String(process.argv.slice(4).join(" ") || "Mizar Admin").trim();

  if (!email || !password) {
    console.error(
      'Usage: npx.cmd tsx scripts/create-platform-admin.ts admin@mizar.com "Admin@123456" "Mizar Admin"'
    );
    process.exit(1);
  }

  if (password.length < 8) {
    console.error("Password must be at least 8 characters.");
    process.exit(1);
  }

  const { prisma } = await import("../src/lib/prisma");
  const { hashPassword } = await import("../src/lib/password");

  const passwordHash = await hashPassword(password);

  const admin = await prisma.platformAdmin.upsert({
    where: {
      email,
    },
    update: {
      name,
      passwordHash,
      isActive: true,
    },
    create: {
      name,
      email,
      passwordHash,
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      email: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  console.log("Platform admin is ready:");
  console.log(admin);

  await prisma.$disconnect();
}

main().catch((error) => {
  console.error("Failed to create platform admin:", error);
  process.exit(1);
});