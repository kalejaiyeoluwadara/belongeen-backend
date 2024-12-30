const Order = require("../models/Order");
const User = require("../models/User");

const orderController = {
  createOrder: async (req, res) => {
    try {
      const userId = req.user._id;
      const { orderPrice, orderItems } = req.body;

      // Validate the user
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Validate request body
      if (!orderPrice || !orderItems || orderItems.length === 0) {
        return res
          .status(400)
          .json({ error: "Order price and items are required" });
      }

      // Generate a unique order ID (13-digit number)
      const orderId = Math.floor(Math.random() * 10 ** 13)
        .toString()
        .padStart(13, "0");

      // Create a new order
      const newOrder = new Order({
        orderId,
        user,
        orderPrice,
        orderItems,
      });

      // Save the order to the database
      await newOrder.save();

      // Respond with the created order
      res.status(201).json({ message: "Order created successfully", newOrder });
    } catch (error) {
      console.error("Error creating order:", error);

      // Check for validation or database errors and send appropriate response
      if (error.name === "ValidationError") {
        return res.status(400).json({
          error: "Validation error",
          details: error.errors,
        });
      }

      if (error.code && error.code === 11000) {
        // Handle duplicate key error (e.g., unique constraint)
        return res.status(409).json({
          error: "Duplicate entry",
          details: error.keyValue,
        });
      }

      // Default to 500 for unexpected errors
      res.status(500).json({
        error: "An unexpected error occurred while creating the order",
        details: error.message,
      });
    }
  },

  getAllOrders: async (req, res) => {
    try {
      const orders = await Order.find()
        .populate({
          path: "user",
          select: "firstname lastname email phone_number address hall level",
        })
        .populate({
          path: "orderItems.product",
          select: "productTitle price images", // Specify product fields to return
        });
      res.status(200).json(orders);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getSingleOrder: async (req, res) => {
    try {
      const id = req.params.id;
      const order = await Order.findById(id)
        .populate({
          path: "user",
          select: "firstname lastname email phone_number address hall level",
        })
        .populate({
          path: "orderItems.product",
          select: "productTitle price images", // Specify product fields to return
        });
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      res.status(200).json(order);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  updateOrderStatusToCompleted: async (req, res) => {
    try {
      const { orderId } = req.body;

      if (!orderId) {
        return res.status(400).json({ error: "Order ID is required" });
      }

      const order = await Order.findOne({ orderId });

      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }

      order.status = "Delivered";
      await order.save();

      res
        .status(200)
        .json({ message: "Order status updated successfully", order });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  deleteOrder: async (req, res) => {
    try {
      const orderId = req.params.id;

      const order = await Order.findByIdAndDelete(orderId);

      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }

      res.status(200).json({ message: "Order deleted successfully", order });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};

module.exports = orderController;
