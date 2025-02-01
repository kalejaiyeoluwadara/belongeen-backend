const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const shopSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ProductCategory",
    required: true,
  },
  shop_image: [
    {
      type: String,
      required: true,
    },
  ],
  products: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
  ],
});

// Middleware to generate a unique slug before saving
shopSchema.pre("save", async function (next) {
  if (!this.isModified("name")) return next(); // Only generate slug if name changes

  let baseSlug = this.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  let slug = baseSlug;
  let counter = 1;

  while (await mongoose.models.Shop.exists({ slug })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  this.slug = slug;
  next();
});

module.exports = Shop = model("Shop", shopSchema);
