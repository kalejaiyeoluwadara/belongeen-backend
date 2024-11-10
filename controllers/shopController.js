const Shop = require("../models/Shop"); // Adjust the path as necessary
const Product = require("../models/Product");
const cloudinary = require("../config/cloudinary");

const shopController = {
  // CREATE SHOP
  createShop: async (req, res) => {
    try {
      const { name, category } = req.body;

      // Check if a shop already exists with the same name
      const existingShop = await Shop.findOne({ name });
      if (existingShop) {
        return res
          .status(400)
          .json({ error: "A shop with this name already exists" });
      }

      // Check if an image file was uploaded
      if (!req.file) {
        return res.status(400).json({ error: "Image file is required" });
      }

      // Create a new shop with the uploaded image URL from Cloudinary
      const newShop = new Shop({
        name,
        category,
        shop_image: req.file.path, // Use the Cloudinary URL directly from multer's response
      });
      await newShop.save();

      res
        .status(201)
        .json({ message: "Shop successfully created", shop: newShop });
    } catch (error) {
      console.error("Error creating shop:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  // GET ALL SHOPS
  getShops: async (req, res) => {
    try {
      const shops = await Shop.find();
      if (!shops || shops.length === 0) {
        return res.status(404).json({ error: "No shops found" });
      }
      res.json(shops);
    } catch (error) {
      res
        .status(500)
        .json({ error: "An error occurred, please try again later" });
    }
  },

  // EDIT SHOP
  editShop: async (req, res) => {
    try {
      const shopId = req.params.id;
      const { name } = req.body;

      // Check if a shop with the new name already exists (excluding the current one)
      const existingShop = await Shop.findOne({ name });
      if (existingShop && existingShop._id.toString() !== shopId) {
        return res
          .status(400)
          .json({ error: "A shop with this name already exists" });
      }

      let imageUrl = null;

      // Check if a new image file was uploaded
      if (req.file) {
        // Upload the new image to Cloudinary
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: "shop_images",
        });
        imageUrl = result.secure_url;
      }

      // Update the shop's name and/or image
      const updatedShop = await Shop.findByIdAndUpdate(
        shopId,
        {
          name,
          shop_image: imageUrl || existingShop.shop_image, // Keep existing image if no new image is provided
        },
        { new: true }
      );

      if (!updatedShop) {
        return res.status(404).json({ error: "Shop not found" });
      }

      res.json({ message: "Shop updated", shop: updatedShop });
    } catch (error) {
      console.error("Error updating shop:", error);
      res
        .status(500)
        .json({ error: "An error occurred, please try again later" });
    }
  },

  // DELETE SHOP
  deleteShop: async (req, res) => {
    try {
      const shopId = req.params.id;

      // Find the shop to delete
      const shop = await Shop.findById(shopId);
      if (!shop) {
        return res.status(404).json({ error: "Shop not found" });
      }

      // Delete all associated products
      const productIds = shop.products || [];
      for (const productId of productIds) {
        await Product.findByIdAndDelete(productId);
      }

      // Delete the shop itself
      await Shop.findByIdAndDelete(shopId);

      res.json({ message: "Shop and all associated products deleted" });
    } catch (error) {
      console.error("Error deleting shop:", error);
      res
        .status(500)
        .json({ error: "An error occurred, please try again later" });
    }
  },
};

module.exports = shopController;
