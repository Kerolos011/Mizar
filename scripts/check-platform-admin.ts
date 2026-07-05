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

  if (!email || !password) {
    console.error(
      'Usage: npx.cmd tsx scripts/check-platform-admin.ts admin@mizar.com "Admin@123456"'
    );
    process.exit(1);
  }

  const { prisma } = await import("../src/lib/prisma");
  const { verifyPassword } = await import("../src/lib/password");

  const admin = await prisma.platformAdmin.findUnique({
    where: {
      email,
    },
  });

  console.log("Admin found:", Boolean(admin));

  if (!admin) {
    await prisma.$disconnect();
    return;
  }

  const passwordValid = await verifyPassword(password, admin.passwordHash);

  console.log("Admin id:", admin.id);
  console.log("Admin email:", admin.email);
  console.log("Admin active:", admin.isActive);
  console.log("Password hash exists:", Boolean(admin.passwordHash));
  console.log("Password valid:", passwordValid);

  await prisma.$disconnect();
}

main().catch((error) => {
  console.error("Check failed:", error);
  process.exit(1);
});