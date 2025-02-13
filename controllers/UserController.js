require("dotenv").config();
const User = require("../models/User");
const ProductCategory = require("../models/ProductCategory");
const Product = require("../models/Product");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Order = require("../models/Order");
const crypto = require("crypto");
const mongoose = require("mongoose");
const { STATUS_CODES } = require("http");
const { StatusCodes } = require("http-status-codes");
const sendVerificationEmail = require("../utils/sendVerificationEmail");
const sendPasswordResetEmail = require("../utils/sendResetEmail");
const axios = require("axios");
const TERMII_API_KEY = process.env.TERMII_API_KEY;
const TERMII_SENDER_ID = "Belongeen"; // Ensure this sender ID is approved

// function to send otp via whatsapp
console.log("Termii API Key:", process.env.TERMII_API_KEY);
const sendOTPViaSMS = async (phone_number, otp) => {
  try {
    const response = await axios.post(
      "https://v3.api.termii.com/api/sms/send",
      {
        to: phone_number,
        from: "Belongeen",
        sms: `Your OTP is: ${otp}. It expires in 10 minutes.`,
        api_key: process.env.TERMII_API_KEY,
        channel: "generic",
        type: "plain",
        media: null,
      }
    );

    // Check for successful response
    return (
      response.data.message === "Successfully Sent" ||
      response.data.code === "ok"
    );
  } catch (error) {
    console.error("Termii API Error:", error.response?.data || error.message);
    return false;
  }
};
// Function to send OTP using Termii's Send Token API
const sendOTPViaTermii = async (phone_number) => {
  try {
    const response = await axios.post(
      "https://api.ng.termii.com/api/sms/otp/send",
      {
        api_key: TERMII_API_KEY,
        message_type: "NUMERIC",
        to: phone_number,
        from: TERMII_SENDER_ID,
        channel: "generic",
        pin_attempts: 10,
        pin_time_to_live: 5, // OTP expires in 5 minutes
        pin_length: 6,
        pin_placeholder: "< 123456 >",
        message_text: "Your OTP is < 123456 >. It expires in 5 minutes.",
        pin_type: "NUMERIC",
      }
    );

    return response.data?.code === "ok"; // Check for successful response
  } catch (error) {
    console.error("Termii OTP Error:", error.response?.data || error.message);
    return false;
  }
};

const userController = {
  signIn: async (req, res) => {
    try {
      const { phone_number, password } = req.body;

      // Check if the user exists
      const user = await User.findOne({ phone_number });
      if (!user) {
        return res
          .status(422)
          .json({ error: "Invalid phone number or password, please retry" });
      }

      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res
          .status(422)
          .json({ error: "Invalid phone number or password, please retry" });
      }

      const token = jwt.sign(
        {
          id: user._id,
          fullName: user.fullName,
          phone_number: user.phone_number,
          address: user.address,
          hall: user.hall,
        },
        process.env.JWT_SECRET || "belongeen",
        { expiresIn: "50d" }
      );

      const userProfile = {
        id: user._id,
        phone_number: user.phone_number,
        firstname: user.firstname,
        lastname: user.lastname,
        phone_number: user.phone_number,
      };

      res.json({ token, userProfile });
    } catch (error) {
      return res
        .status(500)
        .json({ error: "Ooops!! An error occurred, please refresh" });
    }
  },
  signUp: async (req, res) => {
    //SignUp is done with email and password
    try {
      const { password, fullName, hall, phone_number } = req.body;

      //Check if user already exists in the database with the email
      const existingUser = await User.findOne({ phone_number });

      if (existingUser) {
        return res
          .status(400)
          .json({ error: "An account with this phone number already exists" });
      }

      //Generate 5 digit otp
      const otp = crypto.randomInt(10000, 100000);
      const otpExpiry = Date.now() + 10 * 60 * 1000;

      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      const user = new User({
        hall,
        phone_number,
        fullName,
        password: hashedPassword,
        otp,
        otpExpiry,
      });

      // send Email OTP
      //   await sendVerificationEmail(email, otp, firstname);

      // user.isVerified = false;
      await user.save();
      res.status(StatusCodes.CREATED).json({ msg: "Created user", user });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  verifyOtp: async (req, res) => {
    try {
      const { email, otp } = req.body;

      //Find user by email
      const user = await User.findOne({ email });

      if (!user) {
        return res.status(400).json({ error: "User not found" });
      }
      if (user.otp !== parseInt(otp)) {
        return res.status(400).json({ error: "Invalid OTP" });
      }
      if (Date.now() > user.otpExpiry) {
        return res.status(400).json({ error: "OTP expired" });
      }

      //If OTP is valid, clear OTP and OTP EXPIRY
      user.otp = null;
      user.otpExpiry = null;
      user.isVerified = true;
      await user.save();

      res.json({ message: "OTP verifed successfully" });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },
  // Forgot Password Function
  forgotPassword: async (req, res) => {
    try {
      let { phone_number } = req.body;

      // Validate phone number format
      if (
        !phone_number ||
        phone_number.length !== 11 ||
        !phone_number.startsWith("0")
      ) {
        return res.status(400).json({ error: "Invalid phone number format" });
      }

      // Convert to international format
      const formattedPhoneNumber = `234${phone_number.slice(1)}`;

      const user = await User.findOne({ phone_number });

      if (!user) {
        return res.status(404).json({ error: "User does not exist" });
      }

      // Send OTP via Termii
      const sent = await sendOTPViaTermii(formattedPhoneNumber);

      if (!sent) {
        return res.status(500).json({ error: "Failed to send OTP via TERMII" });
      }

      res.json({ message: `OTP has been sent to ${formattedPhoneNumber}` });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Function to reset password
  resetPassword: async (req, res) => {
    try {
      const { phone_number, otp, password } = req.body;

      // Convert phone number to international format
      const formattedPhoneNumber = `234${phone_number.slice(1)}`;

      // Verify OTP with Termii
      const isValidOTP = await verifyOTPWithTermii(formattedPhoneNumber, otp);

      if (!isValidOTP) {
        return res.status(400).json({ error: "Invalid or expired OTP" });
      }

      // Find user and update password
      const user = await User.findOne({ phone_number });
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const hashNewPassword = await bcrypt.hash(password, 12);
      user.password = hashNewPassword;

      await user.save();

      res.json({ message: "Password updated successfully" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Resend OTP Function
  resendOtp: async (req, res) => {
    try {
      let { phone_number } = req.body;

      // Validate phone number
      if (
        !phone_number ||
        phone_number.length !== 11 ||
        !phone_number.startsWith("0")
      ) {
        return res.status(400).json({ error: "Invalid phone number format" });
      }

      // Convert to international format
      const formattedPhoneNumber = `234${phone_number.slice(1)}`;

      // Check if user exists
      const user = await User.findOne({ phone_number });

      if (!user) {
        return res.status(404).json({ error: "User does not exist" });
      }

      // Send OTP via Termii
      const sent = await sendOTPViaTermii(formattedPhoneNumber);

      if (!sent) {
        return res.status(500).json({ error: "Failed to resend OTP via SMS" });
      }

      res.json({ message: `New OTP sent to ${formattedPhoneNumber}` });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  addSavedItem: async (req, res) => {
    try {
      const userId = req.user._id;
      const productId = req.params.id;

      // Find the user by ID
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      //Check if product exists
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ error: "Product Not found" });
      }

      // Initialize savedItems if it's undefined
      if (!user.savedItems) {
        user.savedItems = [];
      }

      //Add Saved items if not already added
      if (!user.savedItems.includes(productId)) {
        user.savedItems.push(productId);
        await user.save();
      }

      res.status(200).json({
        message: "Product added to savedItems",
        savedItems: user.savedItems,
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },
  removeSavedItem: async (req, res) => {
    try {
      const userId = req.user._id;
      const { productId } = req.body;

      //Find user
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      //Remove product from saved items
      user.savedItems = user.savedItems.filter(
        (item) => item.toString() !== productId
      );

      await user.save();

      res.status(200).json({
        message: "Product removed from savedItems",
        savedItems: user.savedItems,
      });
    } catch (error) {
      return res
        .status(500)
        .json({ error: "Ooops!! an error occured, please retry" });
    }
  },
  getSavedItems: async (req, res) => {
    try {
      const userId = req.user._id;

      //Find user by id and populate savedItems
      const user = await User.findById(userId).populate(
        "savedItems",
        "productTitle price images brand"
      );
      if (!user) {
        return res.status(404).json({
          error: "User not found, therefore savedItems can't not be retrieved",
        });
      }

      res.status(200).json({ savedItems: user.savedItems });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },
  addItemToCart: async (req, res) => {
    try {
      const userId = req.user._id;
      const productId = req.params.id;
      const { condiments } = req.body;

      // Find the user
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Find the product
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }

      // Calculate total condiment price
      const condimentPrice =
        condiments?.reduce((total, item) => total + item.price, 0) || 0;

      // Calculate total price (product + condiments)
      const totalPrice = product.price + condimentPrice;

      // Check if the product is already in the cart
      const cartItem = user.cart.find(
        (item) => item.product.toString() === productId
      );

      if (cartItem) {
        // Increment quantity and update condiments
        cartItem.qty += 1;
        cartItem.condiments = condiments || [];
        cartItem.totalPrice = totalPrice * cartItem.qty;
      } else {
        // Add new item to cart
        user.cart.push({
          product: productId,
          qty: 1,
          condiments: condiments || [],
          totalPrice,
        });
      }

      await user.save();
      res
        .status(200)
        .json({ message: "Product added to cart", cart: user.cart });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  decrementCartItem: async (req, res) => {
    try {
      const userId = req.user._id;
      const { productId } = req.body;

      // Find user
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Find the cart item
      const cartItem = user.cart.find(
        (item) => item.product.toString() === productId
      );
      if (cartItem) {
        // Decrement the quantity
        cartItem.qty -= 1;

        // If quantity is zero, remove the item from the cart
        if (cartItem.qty <= 0) {
          user.cart = user.cart.filter(
            (item) => item.product.toString() !== productId
          );
        }

        await user.save();
        res
          .status(200)
          .json({ message: "Product quantity updated", cart: user.cart });
      } else {
        return res.status(404).json({ error: "Product not found in cart" });
      }
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },
  removeItemFromCart: async (req, res) => {
    try {
      const userId = req.user._id;
      const { productId } = req.body;

      // Find user
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Check if productId is a valid ObjectId
      if (!mongoose.Types.ObjectId.isValid(productId)) {
        return res.status(400).json({ error: "Invalid product ID" });
      }

      // Remove product from cart
      user.cart = user.cart.filter(
        (item) => item.product.toString() !== productId
      );

      // Save the updated user document
      await user.save();

      res
        .status(200)
        .json({ message: "Product removed from cart", cart: user.cart });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },
  clearCart: async (req, res) => {
    try {
      const userId = req.user._id;
      // Find the user
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      // Clear the cart
      user.cart = [];
      // Save the updated user document
      await user.save();
      res
        .status(200)
        .json({ message: "All items removed from cart", cart: user.cart });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  getItemsInCart: async (req, res) => {
    try {
      const userId = req.user._id;

      const user = await User.findById(userId).populate(
        "cart.product",
        "productTitle price images"
      );

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Calculate the total amount in the cart
      let totalCartAmount = 0;

      const cart = user.cart.map((item) => {
        const productPrice = parseFloat(item.product.price); // Ensure it's a number
        const condimentPrice = item.condiments.reduce(
          (total, condiment) => total + parseFloat(condiment.price), // Ensure each condiment price is a number
          0
        );
        const totalPrice = (productPrice + condimentPrice) * item.qty;
        totalCartAmount += totalPrice;

        return {
          ...item.toObject(),
          totalPrice,
        };
      });

      res.status(200).json({
        cart,
        totalAmount: totalCartAmount.toLocaleString("en-NG", {
          style: "currency",
          currency: "NGN",
        }),
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  viewAccountProfile: async (req, res) => {
    try {
      const userId = req.user._id;
      const profile = await User.findById(userId);

      if (!profile) {
        return res.status(404).json({ error: "Not Found" });
      }
      res.json(profile);
    } catch (error) {
      return res
        .status(500)
        .json({ error: "Ooops!! an error occured, please refresh" });
    }
  },

  editAccountProfile: async (req, res) => {
    try {
      const userId = req.user._id;
      const updates = req.body;

      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ error: "No fields provided for update" });
      }

      const updatedProfile = await User.findByIdAndUpdate(userId, updates, {
        new: true,
        runValidators: true,
      });

      if (!updatedProfile) {
        return res.status(404).json({ error: "Profile not found" });
      }

      res.status(200).json({
        message: "Your profile has been successfully updated",
        profile: updatedProfile,
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ error: "An internal server error occurred" });
    }
  },
  // change phone number
  addPhoneNumber: async (req, res) => {
    try {
      const userId = req.user._id;
      const { phone_number } = req.body;

      if (!phone_number) {
        return res.status(400).json({ error: "Phone number is required" });
      }

      const phoneRegex = /^0\d{10}$/;
      if (!phoneRegex.test(phone_number)) {
        return res.status(400).json({
          error:
            "Invalid phone number format. It should be 11 digits starting with 0.",
        });
      }

      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { phone_number },
        { new: true, runValidators: true }
      );

      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }

      res.status(200).json({
        message: "Phone number added/updated successfully",
        user: updatedUser,
      });
    } catch (error) {
      console.error("Error adding phone number:", error);
      res.status(500).json({ error: "An internal server error occurred" });
    }
  },
  //  change email
  changeEmail: async (req, res) => {
    try {
      const userId = req.user._id;
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "Invalid email format" });
      }

      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { email },
        { new: true, runValidators: true }
      );

      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }

      res.status(200).json({
        message: "Email updated successfully",
        user: updatedUser,
      });
    } catch (error) {
      res.status(500).json({ error: "An internal server error occurred" });
    }
  },
  // change password
  changePassword: async (req, res) => {
    try {
      const userId = req.user._id;
      const { oldPassword, newPassword } = req.body;

      if (!oldPassword || !newPassword) {
        return res
          .status(400)
          .json({ error: "Both old and new passwords are required" });
      }

      // Relaxed validation: Password must be at least 6 characters long
      if (newPassword.length < 6) {
        return res.status(400).json({
          error: "New password must be at least 6 characters long",
        });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ error: "Old password is incorrect" });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 12);
      user.password = hashedPassword;
      await user.save();

      res.status(200).json({
        message: "Password updated successfully",
      });
    } catch (error) {
      console.error("Error changing password:", error);
      res.status(500).json({ error: "An internal server error occurred" });
    }
  },

  deleteAccount: async (req, res) => {
    try {
      const { password } = req.body;
      const userId = req.user._id;

      const profile = await User.findById(userId);

      if (!profile) {
        return res.status(404).json({ error: "Not Found" });
      }
      // Compare the provided password with the hashed password
      const isMatch = await bcrypt.compare(password, profile.password);
      if (!isMatch) {
        return res.status(400).json({ error: "Invalid password" });
      }

      await User.findByIdAndDelete(userId);
      res.json({ message: "Account Deleted Successfully" });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  fetchAllUsers: async (req, res) => {
    try {
      const users = await User.find();
      if (!users) {
        return res.status(404).json({ error: "No users found" });
      }
      res.json(users);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },
};
module.exports = userController;
