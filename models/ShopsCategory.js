const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const shopsCategorySchema = new Schema({
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

module.exports = model("ShopsCategory", shopsCategorySchema);
