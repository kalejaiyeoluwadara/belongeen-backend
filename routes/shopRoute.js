const express = require("express");
const { Router } = express;
const router = Router();
const shopController = require("../controllers/shopController");
// const authenticateAdmin = require("../middlewares/authenticateAdmin");
const upload = require("../config/multer");

//Private Routes
router.post(
  "/create-shop",
  upload.array("images", 10),
  shopController.createShop
);

router.get("/all-shops", shopController.getShops);

router.put("/:id", upload.array("images", 10), shopController.editShop);
router.delete("/:id", shopController.deleteProduct);

//Public Routes
// router.post("/index-products", shopController.indexAllProducts);

//Test Route

module.exports = router;
