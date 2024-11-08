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
    default: Date.now, // Removed parentheses to set function as default
  },
  updatedAt: {
    type: Date,
    default: Date.now, // Removed parentheses to set function as default
  },
});

const Product = model("Product", productSchema);

module.exports = Product;
