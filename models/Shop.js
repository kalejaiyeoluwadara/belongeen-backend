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

shopSchema.pre("save", async function (next) {
  if (!this.slug || this.isModified("name")) {
    let baseSlug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    let slug = baseSlug;
    let counter = 1;

    while (await this.constructor.findOne({ slug })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    this.slug = slug;
  }
  next();
});

const Shop = model("Shop", shopSchema);

module.exports = Shop;
