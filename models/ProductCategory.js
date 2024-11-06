const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const productCategorySchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  products: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
  ],
});
module.exports = ProductCategory = model(
  "ProductCategory",
  productCategorySchema
);
