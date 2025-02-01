require("dotenv").config();
const mongoose = require("mongoose");
const Shop = require("./models/Shop");
const connectDB = require("./db/connect");

// Function to generate a unique slug
async function generateUniqueSlug(name, shopId = null) {
  let baseSlug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  let slug = baseSlug;
  let counter = 1;

  while (await Shop.exists({ slug, _id: { $ne: shopId } })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}

// Function to update all shops
async function updateShopSlugs() {
  try {
    await connectDB(process.env.MONGO_URL);

    const shops = await Shop.find({ slug: { $exists: false } });

    for (let shop of shops) {
      shop.slug = await generateUniqueSlug(shop.name, shop._id);
      await shop.save();
      console.log(`Updated slug for: ${shop.name} -> ${shop.slug}`);
    }

    console.log("✅ All shops updated!");
    mongoose.disconnect();
  } catch (error) {
    console.error("❌ Error updating slugs:", error);
    mongoose.disconnect();
  }
}

// Run the script
updateShopSlugs();
