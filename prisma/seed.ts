import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import bcrypt from "bcryptjs";

// Create adapter with connection string
const adapter = new PrismaMariaDb(process.env.DATABASE_URL!);

// Create Prisma client with adapter
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  // Create admin
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
  const adminUsername = process.env.ADMIN_USERNAME || "admin";

  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  await prisma.admin.upsert({
    where: { username: adminUsername },
    update: { password: hashedPassword },
    create: {
      username: adminUsername,
      password: hashedPassword,
    },
  });
  console.log(`✅ Admin created (username: ${adminUsername})`);

  // Create categories
  const categories = [
    "Paket Buka Puasa",
    "Makanan Utama",
    "Minuman",
    "Dessert",
    "Snack",
  ];
  for (const name of categories) {
    await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
  console.log("✅ Categories created");

  // Get category IDs
  const paketCategory = await prisma.category.findUnique({
    where: { name: "Paket Buka Puasa" },
  });
  const makananCategory = await prisma.category.findUnique({
    where: { name: "Makanan Utama" },
  });
  const minumanCategory = await prisma.category.findUnique({
    where: { name: "Minuman" },
  });
  const dessertCategory = await prisma.category.findUnique({
    where: { name: "Dessert" },
  });

  if (
    !paketCategory ||
    !makananCategory ||
    !minumanCategory ||
    !dessertCategory
  ) {
    throw new Error("Categories not found");
  }

  // Delete existing menus to re-seed with prices
  await prisma.orderItem.deleteMany({});
  await prisma.variantOption.deleteMany({});
  await prisma.menuVariant.deleteMany({});
  await prisma.menu.deleteMany({});

  // Create sample menus - Paket Buka Puasa with variants and prices
  await prisma.menu.create({
    data: {
      name: "Paket Ayam Penyet Spesial",
      price: 45000,
      description:
        "Ayam penyet dengan sambal pilihan, nasi, lalapan, es teh/jeruk",
      image: "/menu/paket-ayam.jpg",
      categoryId: paketCategory.id,
      variants: {
        create: [
          {
            name: "Pilihan Bagian Ayam",
            options: {
              create: [
                { name: "Paha", price: 0 },
                { name: "Dada", price: 5000 },
                { name: "Sayap", price: 0 },
              ],
            },
          },
          {
            name: "Pilihan Sambal",
            options: {
              create: [
                { name: "Sambal Terasi", price: 0 },
                { name: "Sambal Ijo", price: 2000 },
                { name: "Sambal Matah", price: 3000 },
              ],
            },
          },
        ],
      },
    },
  });

  await prisma.menu.create({
    data: {
      name: "Paket Ikan Bakar",
      price: 55000,
      description:
        "Ikan bakar segar dengan bumbu rempah, nasi, sambal, lalapan, es teh",
      image: "/menu/paket-ikan.jpg",
      categoryId: paketCategory.id,
      variants: {
        create: [
          {
            name: "Pilihan Ikan",
            options: {
              create: [
                { name: "Gurame", price: 0 },
                { name: "Nila", price: 0 },
                { name: "Lele", price: -5000 },
              ],
            },
          },
          {
            name: "Ukuran",
            options: {
              create: [
                { name: "Regular", price: 0 },
                { name: "Large (+200gr)", price: 15000 },
              ],
            },
          },
        ],
      },
    },
  });

  await prisma.menu.create({
    data: {
      name: "Paket Nasi Campur",
      price: 40000,
      description: "Nasi dengan lauk pilihan, sayur, sambal, dan kerupuk",
      image: "/menu/paket-campur.jpg",
      categoryId: paketCategory.id,
      variants: {
        create: [
          {
            name: "Pilihan Lauk",
            options: {
              create: [
                { name: "Ayam Goreng", price: 0 },
                { name: "Empal Daging", price: 8000 },
                { name: "Telur Balado", price: 0 },
                { name: "Ikan Asin", price: 3000 },
              ],
            },
          },
          {
            name: "Tambahan",
            options: {
              create: [
                { name: "Tanpa Tambahan", price: 0 },
                { name: "Tambah Nasi", price: 5000 },
                { name: "Tambah Kerupuk", price: 3000 },
              ],
            },
          },
        ],
      },
    },
  });

  // Makanan Utama
  await prisma.menu.createMany({
    data: [
      {
        name: "Nasi Goreng Spesial",
        price: 35000,
        description: "Nasi goreng dengan telur, ayam, sayuran, dan kerupuk",
        image: "/menu/nasi-goreng.jpg",
        categoryId: makananCategory.id,
      },
      {
        name: "Mie Goreng Jawa",
        price: 30000,
        description: "Mie goreng bumbu Jawa dengan sayuran dan telur",
        image: "/menu/mie-goreng.jpg",
        categoryId: makananCategory.id,
      },
      {
        name: "Sop Iga Sapi",
        price: 50000,
        description: "Sop iga sapi dengan kuah bening dan sayuran segar",
        image: "/menu/sop-iga.jpg",
        categoryId: makananCategory.id,
      },
    ],
  });

  // Minuman
  await prisma.menu.createMany({
    data: [
      {
        name: "Es Teh Manis",
        price: 8000,
        description: "Teh manis segar dengan es batu",
        image: "/menu/es-teh.jpg",
        categoryId: minumanCategory.id,
      },
      {
        name: "Es Jeruk",
        price: 10000,
        description: "Jeruk peras segar dengan es",
        image: "/menu/es-jeruk.jpg",
        categoryId: minumanCategory.id,
      },
      {
        name: "Es Kelapa Muda",
        price: 15000,
        description: "Kelapa muda segar dengan daging kelapa",
        image: "/menu/es-kelapa.jpg",
        categoryId: minumanCategory.id,
      },
      {
        name: "Jus Alpukat",
        price: 18000,
        description: "Jus alpukat creamy dengan susu",
        image: "/menu/jus-alpukat.jpg",
        categoryId: minumanCategory.id,
      },
    ],
  });

  // Dessert
  await prisma.menu.createMany({
    data: [
      {
        name: "Kolak Pisang",
        price: 12000,
        description: "Kolak pisang dengan kuah santan dan gula merah",
        image: "/menu/kolak.jpg",
        categoryId: dessertCategory.id,
      },
      {
        name: "Es Campur",
        price: 15000,
        description: "Es campur dengan buah-buahan dan sirup",
        image: "/menu/es-campur.jpg",
        categoryId: dessertCategory.id,
      },
      {
        name: "Kurma",
        price: 10000,
        description: "Kurma pilihan untuk berbuka",
        image: "/menu/kurma.jpg",
        categoryId: dessertCategory.id,
      },
    ],
  });

  console.log("✅ Menus created with variant prices");
  console.log("🎉 Seeding completed!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
