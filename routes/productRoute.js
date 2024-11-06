const express = require("express");
const { Router } = express;
const router = Router();
const productController = require("../controllers/productController");
// const authenticateAdmin = require("../middlewares/authenticateAdmin");
const upload = require("../config/multer");

//Private Routes
router.post(
  "/create-product",
  upload.array("images", 10),
  productController.createSingleProduct
);

router.get("/all-products", productController.fetchAllProducts);

router.put("/:id", upload.array("images", 10), productController.editProduct);
router.delete("/:id", productController.deleteProduct);

//Public Routes
router.get("/category/:id", productController.viewProductsByCategory);
router.get("/:id", productController.getSingleProductDetails);
// router.post("/index-products", productController.indexAllProducts);

//Test Route

module.exports = router;
