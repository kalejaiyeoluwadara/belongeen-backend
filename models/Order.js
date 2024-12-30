const mongoose = require("mongoose");
const { model, Schema } = mongoose;

const orderSchema = new Schema({
  orderId: {
    type: String,
    required: true,
    unique: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
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
  orderPrice: {
    type: String,
    required: true,
  },
  orderItems: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      condiments: [
        {
          name: { type: String },
          price: { type: Number },
        },
      ],
      qty: {
        type: Number,
        required: true,
      },
    },
  ],
});
module.exports = Order = model("Order", orderSchema);
