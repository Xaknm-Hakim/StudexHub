import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcrypt";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const users = [
    { email: "hakim@baruashub.local", name: "Hakim", password: "TempPass123!" },
    { email: "din@baruashub.local", name: "Din", password: "TempPass123!" },
    { email: "apam@baruashub.local", name: "Apam", password: "TempPass123!" },
    { email: "paiz@baruashub.local", name: "Paiz", password: "TempPass123!" },
  ];

  for (const u of users) {
    const passwordHash = await bcrypt.hash(u.password, 12);

    await prisma.user.upsert({
      where: { email: u.email },
      update: { name: u.name, passwordHash },
      create: { email: u.email, name: u.name, passwordHash },
    });
  }

  console.log("Seed completed.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
