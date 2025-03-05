const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const userSchema = new Schema({
  fullName: {
    type: String,
    required: true,
  },

  hall: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: false,
  },
  phone_number: {
    type: String,
  },
  savedItems: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
  ],
  cart: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      qty: {
        type: Number,
        default: 1,
      },
      condiments: [
        {
          name: { type: String },
          price: { type: Number },
        },
      ],
    },
  ],
  purchaseHistory: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },
  ],
  notificatiions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Notification",
    },
  ],
  otp: {
    type: Number,
    required: false,
  },
  otpExpiry: {
    type: Date,
    required: false,
  },
  isVerified: {
    type: Boolean,
  },
});

const User = model("User", userSchema);
module.exports = User;
