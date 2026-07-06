import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.admin.findUnique({
    where: { userId: "100001" },
  });

  if (!existing) {
    // Hash the default access code with bcrypt before storing
    const plainAccessCode = "17F6413A";
    const hashedAccessCode = await bcrypt.hash(plainAccessCode, 10);
    
    await prisma.admin.create({
      data: {
        userId: "100001",
        username: "superadmin",
        accessCode: hashedAccessCode,
        allowedIPs: "*", // Allow all IPs by default
        isActive: true,
        role: "superadmin",
      },
    });
    console.log("Default admin created:");
    console.log("  User ID: 100001");
    console.log("  Username: superadmin");
    console.log("  Access Code: 17F6413A (plain text - only shown once)");
  } else {
    console.log("Default admin already exists");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
