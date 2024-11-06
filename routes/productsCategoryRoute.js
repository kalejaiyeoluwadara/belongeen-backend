const express = require("express");
const router = express.Router();
// cons= require("../middleware);
const upload = require("../config/multer");
const productCategoryController = require("../controllers/productCategoryController");

//Public Routes
router.get("/categories", productCategoryController.getProductCategories);
router.get(
  "/top-categories",
  productCategoryController.getTopProductCategories
);

//Private Routes
router.post(
  "/",
  upload.single("category-image"),
  productCategoryController.createProductCategory
);
router.put(
  "/edit-category/:id",
  upload.single("category-image"),
  productCategoryController.editProductCategory
);
router.delete(
  "/delete-category/:id",
  productCategoryController.deleteProductCategory
);

module.exports = router;
