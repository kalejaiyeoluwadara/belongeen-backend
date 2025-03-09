// routes/paystackRoutes.js

const express = require("express");
const router = express.Router();
const paymentVerificationController = require("../controllers/paymentVerificationController");
const paystackController = require("../controllers/paymentVerificationController");
// const { authenticateUser } = require("../middleware/auth");

// Initialize payment
// router.post(
//   "/initialize",
//   authenticateUser,
//   paystackController.initializePayment
// );

// Verify payment
router.post("/verify", paystackController.verifyPayment);

module.exports = router;
