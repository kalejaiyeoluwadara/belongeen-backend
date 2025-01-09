const express = require("express");
const { Router } = express;
const router = Router();
// const authenticateAdmin = require("../middlewares/authenticateAdmin");
const upload = require("../config/multer");
const productController = require("../controllers/ProductController");

//Private Routes
router.post(
  "/create-product",
  upload.array("images", 10),
  productController.createSingleProduct
);

router.get("/all-products", productController.fetchAllProducts);

router.get("/search-products", productController.searchForProduct);
router.patch("/:id", upload.array("images", 10), productController.editProduct);
router.patch("/products/:id", productController.updateProductExtras);
router.delete("/:id", productController.deleteProduct);

//Public Routes
router.get("/category/:id", productController.viewProductsByCategory);
router.get("/related-products/:id", productController.relatedProducts);
router.get("/:id", productController.getSingleProductDetails);

module.exports = router;
