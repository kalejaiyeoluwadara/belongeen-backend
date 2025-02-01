require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("./models/Product"); // Your product model
// Function to convert product name to a URL-friendly slug
const generateSlug = (name) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-") // Replace spaces & special chars with "-"
    .replace(/^-+|-+$/g, ""); // Trim leading/trailing "-"
};

// Connect to database
mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(async () => {
    const products = await Product.find();

    for (let product of products) {
      if (!product.slug) {
        // Only update if slug is missing
        product.slug = generateSlug(product.productTitle);
        await product.save();
        console.log(`Updated: ${product.productTitle} -> ${product.slug}`);
      }
    }

    console.log("Slug update complete!");
    mongoose.disconnect();
  })
  .catch((err) => console.error("DB Connection Error:", err));
