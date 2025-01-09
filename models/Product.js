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

const Product = model("Product", productSchema);

module.exports = Product;
