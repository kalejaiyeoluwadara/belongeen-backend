const express = require("express");
const { Router } = express;
const router = Router();
const shopController = require("../controllers/shopController");
const upload = require("../config/multer");

//Private Routes
router.post("/create-shop", upload.single("image"), shopController.createShop);

router.get("/all-shops", shopController.getShops);

router.put("/:id", upload.single("image"), shopController.editShop);
router.delete("/:id", shopController.deleteShop);

module.exports = router;
