import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcryptjs from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const users = await prisma.user.findMany();
  console.log("Users found:", users.length);
  for (const u of users) {
    console.log(`  email=${u.email} name=${u.name} pwHash=${u.password.substring(0, 20)}...`);
    const valid = await bcryptjs.compare("demo123", u.password);
    console.log(`  bcrypt.compare("demo123") = ${valid}`);
  }
  await prisma.$disconnect();
}

main();
