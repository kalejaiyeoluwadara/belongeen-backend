const express = require("express");
const router = express.Router();
// const authenticateUser = require("../middlewares/authenticateUsers");
const userController = require("../controllers/UserController");
const authMiddleware = require("../utils/authMiddleWare");

//Public Routes
router.post("/sign-up", userController.signUp);
router.post("/sign-in", userController.signIn);
router.post("/verify-otp", userController.verifyOtp);
router.post("/resend-otp", userController.resendOtp);
router.get("/all-users", userController.fetchAllUsers);
router.post("/forgot-pass", userController.forgotPassword);
router.post("/reset-pass", userController.resetPassword);

//Private Routes
router.get("/saved-items", authMiddleware, userController.getSavedItems);
router.get("/cart", authMiddleware, userController.getItemsInCart);
router.post("/add_phone", authMiddleware, userController.addPhoneNumber);
router.post("/change_email", authMiddleware, userController.changeEmail);
router.post("/change_password", authMiddleware, userController.changePassword);

router.patch(
  "/edit-profile",
  authMiddleware,
  userController.editAccountProfile
);
// update
router.put("/cart", authMiddleware, userController.decrementCartItem);
router.delete("/saved-item", authMiddleware, userController.removeSavedItem);
router.delete("/cart", authMiddleware, userController.removeItemFromCart);
router.delete("/carts", authMiddleware, userController.clearCart);
router.delete("/delete-account", authMiddleware, userController.deleteAccount);
router.get("/profile", authMiddleware, userController.viewAccountProfile);
router.post("/save-item/:id", authMiddleware, userController.addSavedItem);
router.post("/cart/:id", authMiddleware, userController.addItemToCart);

module.exports = router;
