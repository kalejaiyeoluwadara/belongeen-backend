const express = require("express");
const {
  getMenuCategories,
  createMenuCategory,
  updateMenuCategory,
  deleteMenuCategory,
  getMenuCategoryById,
} = require("../controllers/MenuController");

const router = express.Router();

// Routes for menu categories
router.get("/", getMenuCategories);
router.post("/", createMenuCategory);
router.put("/:id", updateMenuCategory);
router.get("/:id", getMenuCategoryById);
router.delete("/:id", deleteMenuCategory);

module.exports = router;
