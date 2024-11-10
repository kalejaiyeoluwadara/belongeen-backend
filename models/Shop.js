const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const shopSchema = new Schema({
  name: {
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
module.exports = Shop = model("Shop", shopSchema);
