const MenuCategory = require("../models/MenuCategory");

// Fetch all categories
exports.getMenuCategories = async (req, res) => {
  try {
    const categories = await MenuCategory.find();
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.getMenuCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await MenuCategory.findById(id);

    if (!category) {
      return res.status(404).json({ message: "Menu category not found" });
    }

    res.status(200).json(category);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// Create a new category
exports.createMenuCategory = async (req, res) => {
  try {
    const { category, items } = req.body;
    const newCategory = new MenuCategory({ category, items });
    await newCategory.save();
    res.status(201).json(newCategory);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a category
exports.updateMenuCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const updatedCategory = await MenuCategory.findByIdAndUpdate(id, updates, {
      new: true,
    });
    res.status(200).json(updatedCategory);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a category
exports.deleteMenuCategory = async (req, res) => {
  try {
    const { id } = req.params;
    await MenuCategory.findByIdAndDelete(id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
