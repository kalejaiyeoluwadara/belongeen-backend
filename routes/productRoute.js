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
router.delete("/:id/extras/:extraId", productController.deleteSpecificExtra);
router.delete("/:id/extras", productController.deleteAllExtras);
// Delete a specific option in an extra
router.delete(
  "/:id/extras/:extraId/options/:optionId",
  productController.deleteSpecificOption
);

//Public Routes
router.get("/category/:id", productController.viewProductsByCategory);
router.get("/related-products/:id", productController.relatedProducts);
router.get("/:id", productController.getSingleProductDetails);
router.get("/slug/:slug", productController.getSingleProductDetailsBySlug);

module.exports = router;
