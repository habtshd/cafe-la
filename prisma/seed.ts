import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // 1. Business Settings
  await prisma.businessSettings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      cafe_name: "La Nouvelle Café & Restaurant",
      tagline: "Artisan Wood-Fired Pizza, Prime Steaks & Bistro Cuisine",
      about:
        "An extraordinary culinary destination blending Parisian bistro warmth with contemporary international fine dining in Bole, Addis Ababa.",
      phone: "+251 92 993 0200",
      email: "info@lanouvellecafe.com",
      address: "Bole, Behind Millennium Hall, Next to Ambassador Hotel, Addis Ababa, Ethiopia",
      opening_hours: "Mon - Sun: 7:00 AM - 11:30 PM",
      map_url: "https://maps.google.com/?q=La+Nouvelle+Cafe+Bole+Addis+Ababa",
      instagram_url: "https://www.instagram.com/explore/tags/lanouvelleaddis/",
      facebook_url: "https://www.facebook.com/people/La-Nouvelle/100063715206263/",
      tiktok_url: "https://www.tiktok.com/tag/lanouvelleaddis",
      telegram_url: "https://t.me/lanouvellecafe",
      accepting_orders: true,
      offers_pickup: true,
      offers_delivery: true,
      offers_dine_in: true,
      offers_reservations: true,
      delivery_fee: 150.0,
      prep_time_minutes: 25,
    },
  });

  // 2. Default User Role
  const existingRole = await prisma.userRole.findFirst({
    where: { user_id: "admin@lanouvellecafe.com" },
  });
  if (!existingRole) {
    await prisma.userRole.create({
      data: {
        user_id: "admin@lanouvellecafe.com",
        role: "admin",
      },
    });
  }

  // 3. Default Categories
  const categories = [
    { name: "Wood-Fired Pizza", sort_order: 1 },
    { name: "Prime Cuts & Steaks", sort_order: 2 },
    { name: "Handcrafted Pasta", sort_order: 3 },
    { name: "Fresh Seafood", sort_order: 4 },
    { name: "Bistro & Sandwiches", sort_order: 5 },
    { name: "Artisan Salads", sort_order: 6 },
    { name: "Specialty Coffee & Beverages", sort_order: 7 },
  ];

  for (const cat of categories) {
    const existing = await prisma.menuCategory.findFirst({
      where: { name: cat.name },
    });
    if (!existing) {
      await prisma.menuCategory.create({
        data: cat,
      });
    }
  }

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
