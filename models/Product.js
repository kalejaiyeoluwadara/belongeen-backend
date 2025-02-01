const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const productSchema = new Schema({
  productTitle: {
    type: String,
    required: true,
  },
  price: {
    type: String,
    required: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Shop",
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  images: [
    {
      type: String,
      required: true,
    },
  ],
  isProductNew: {
    type: Boolean,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  slug: { type: String, unique: true, required: true },
  extras: [
    {
      title: {
        type: String,
      },
      options: [
        {
          name: {
            type: String,
          },
          price: {
            type: Number,
          },
        },
      ],
    },
  ],
});

// Function to generate a slug
async function generateUniqueSlug(title, productId = null) {
  let baseSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  let slug = baseSlug;
  let counter = 1;

  // Check if slug exists
  while (await Product.exists({ slug, _id: { $ne: productId } })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}

// Middleware to generate/update slug before saving
productSchema.pre("save", async function (next) {
  if (!this.slug || this.isModified("productTitle")) {
    this.slug = await generateUniqueSlug(this.productTitle, this._id);
  }
  next();
});

const Product = model("Product", productSchema);
module.exports = Product;
