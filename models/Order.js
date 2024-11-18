const mongoose = require("mongoose");
const { model, Schema } = mongoose;

const orderSchema = new Schema({
  orderId: {
    type: String,
    required: true,
    unique: true,
  },
  user: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },

  date: {
    type: Date,
    default: Date.now(),
    required: true,
  },
  status: {
    type: String,
    enum: ["Ongoing", "Delivered"],
    default: "Ongoing",
  },
  address: {
    type: String,
    required: true,
  },
  orderPrice: {
    type: Number,
    required: true,
  },
  orderItems: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      qty: {
        type: Number,
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
    },
  ],
});
module.exports = Order = model("Order", orderSchema);
