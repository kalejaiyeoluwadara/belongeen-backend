const ShopsCategory = require("../models/ShopsCategory");

// Create a new category
exports.createCategory = async (req, res) => {
  try {
    const { name } = req.body;

    const newCategory = new ShopsCategory({ name });
    await newCategory.save();

    res.status(201).json({ success: true, data: newCategory });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all categories
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await ShopsCategory.find().populate("shops");
    res.status(200).json({ data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get a single category by ID
exports.getCategoryById = async (req, res) => {
  try {
    const category = await ShopsCategory.findById(req.params.id).populate(
      "shops"
    );

    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }

    res.status(200).json({ data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update a category
exports.updateCategory = async (req, res) => {
  try {
    const { name, shops } = req.body;

    const updatedCategory = await ShopsCategory.findByIdAndUpdate(
      req.params.id,
      { name, shops },
      { new: true, runValidators: true }
    );

    if (!updatedCategory) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }

    res.status(200).json({ success: true, data: updatedCategory });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete a category
exports.deleteCategory = async (req, res) => {
  try {
    const deletedCategory = await ShopsCategory.findByIdAndDelete(
      req.params.id
    );

    if (!deletedCategory) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "Category deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
