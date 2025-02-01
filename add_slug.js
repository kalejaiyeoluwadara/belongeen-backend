require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("./models/Product");
const connectDB = require("./db/connect");

// Function to generate a unique slug
async function generateUniqueSlug(title, productId = null) {
  let baseSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  let slug = baseSlug;
  let counter = 1;

  while (await Product.exists({ slug, _id: { $ne: productId } })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}

// Function to update all products
async function updateProductSlugs() {
  try {
    await connectDB(process.env.MONGO_URL);

    const products = await Product.find({ slug: { $exists: false } });

    for (let product of products) {
      product.slug = await generateUniqueSlug(
        product.productTitle,
        product._id
      );
      await product.save();
      console.log(
        `Updated slug for: ${product.productTitle} -> ${product.slug}`
      );
    }

    console.log("✅ All products updated!");
    mongoose.disconnect();
  } catch (error) {
    console.error("❌ Error updating slugs:", error);
    mongoose.disconnect();
  }
}

// Run the script
updateProductSlugs();
