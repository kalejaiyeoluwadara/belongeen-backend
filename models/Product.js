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
  slug: { type: String, unique: true }, // Removed required: true since it will be auto-generated
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

// Middleware to generate/update slug before saving
productSchema.pre("save", async function (next) {
  if (!this.slug || this.isModified("productTitle")) {
    let baseSlug = this.productTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-") // Replace non-alphanumeric characters with hyphens
      .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens

    let slug = baseSlug;
    let counter = 1;

    // Check if the slug already exists in the database
    while (await this.constructor.findOne({ slug })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    this.slug = slug;
  }
  next();
});

const Product = model("Product", productSchema);

module.exports = Product;
