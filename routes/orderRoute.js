const express = require("express");
const orderController = require("../controllers/OrderController");
const { Router } = express;
const router = Router();
//Private Routes
router.post("/create-order", orderController.createOrder);
router.patch("/update-status", orderController.updateOrderStatusToCompleted);

//public Routes
router.get("/", orderController.getAllOrders);
router.get("/:id", orderController.getSingleOrder);
router.delete("/:id", orderController.deleteOrder);

module.exports = router;
