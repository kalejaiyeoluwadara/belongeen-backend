const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const shopCategorySchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  products: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
    },
  ],
});
module.exports = ShopCategory = model("ShopCategory", shopCategorySchema);
