const express = require("express");
const router = express.Router();
const shopsCategoryController = require("../controllers/shopsCategoryController");

router.post("/", shopsCategoryController.createCategory);
router.get("/", shopsCategoryController.getAllCategories);
router.get("/:id", shopsCategoryController.getCategoryById);
router.put("/:id", shopsCategoryController.updateCategory);
router.delete("/:id", shopsCategoryController.deleteCategory);

module.exports = router;
