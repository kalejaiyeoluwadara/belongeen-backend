const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const productCategorySchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  shops: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
    },
  ],
});

// Use mongoose.model to avoid potential OverwriteModelError by checking if the model exists
const ProductCategory =
  mongoose.models.ProductCategory ||
  model("ProductCategory", productCategorySchema);

module.exports = ProductCategory;
