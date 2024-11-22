const express = require("express");
const router = express.Router();
// const authenticateUser = require("../middlewares/authenticateUsers");
const userController = require("../controllers/UserController");

//Public Routes
router.post("/sign-up", userController.signUp);
router.post("/sign-in", userController.signIn);
router.post("/verify-otp", userController.verifyOtp);
router.post("/resend-otp", userController.resendOtp);
router.get("/all-users", userController.fetchAllUsers);
router.post("/forgot-pass", userController.forgotPassword);
router.post("/reset-pass", userController.resetPassword);

//Private Routes
router.get("/saved-items", userController.getSavedItems);
router.get("/cart", userController.getItemsInCart);
router.put(
  "/edit-profile",

  userController.editAccountProfile
);
router.put("/cart", userController.decrementCartItem);
router.delete("/saved-item", userController.removeSavedItem);
router.delete("/cart", userController.removeItemFromCart);
router.delete(
  "/delete-account",

  userController.deleteAccount
);
router.get("/:id", userController.viewAccountProfile);
router.post("/save-item/:id", userController.addSavedItem);
router.post("/cart/:id", userController.addItemToCart);

module.exports = router;
