const Order = require("../models/Order");
const User = require("../models/User");

const orderController = {
  createOrder: async (req, res) => {
    try {
      const { user, address, orderPrice, orderItems, phone } = req.body;

      if (!user || !address || !orderPrice || !orderItems || !phone) {
        return res.status(400).json({ error: "All fields are required" });
      }

      const orderId = Math.floor(Math.random() * 10 ** 13)
        .toString()
        .padStart(13, "0");

      const newOrder = new Order({
        orderId,
        user,
        address,
        orderPrice,
        orderItems,
        phone,
      });

      await newOrder.save();
      res.status(201).json({ message: "Order created successfully", newOrder });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getAllOrders: async (req, res) => {
    try {
      const orders = await Order.find();
      res.status(200).json(orders);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getSingleOrder: async (req, res) => {
    try {
      const id = req.params.id;
      const order = await Order.findById(id).populate({
        path: "orderItems.product", // Assuming orderItems has a field 'product' that references Product
        select: "productTitle", // Specify the fields to return from Product
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
