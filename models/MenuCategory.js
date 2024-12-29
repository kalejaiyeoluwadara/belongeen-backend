const mongoose = require("mongoose");

// Define the item schema
const ItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
});

// Define the category schema
const MenuCategorySchema = new mongoose.Schema({
  category: { type: String, required: true },
  items: [ItemSchema], // Array of items
});

const MenuCategory = mongoose.model("MenuCategory", MenuCategorySchema);

module.exports = MenuCategory;
