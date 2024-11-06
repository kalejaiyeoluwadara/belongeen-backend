const ProductCategory = require("../models/ProductCategory");
const cloudinary = require("cloudinary").v2;
const Product = require("../models/Product");
const Shop = require("../models/Shop");

const shopController = {
  createShop: async (req, res) => {
    try {
      const { name } = req.body;

      // Check if a category already exists with the same name
      const existingShop = await Shop.findOne({ name });
      if (existingShop) {
        return res
          .status(400)
          .json({ error: "A shop with this name already exists" });
      }

      let imageUrl = null;

      // Check if a file was uploaded
      if (req.file) {
        try {
          // Upload the single image to Cloudinary
          const result = await cloudinary.uploader.upload(req.file.path, {
            folder: "shop_images",
          });
          imageUrl = result.secure_url;
        } catch (uploadError) {
          console.error("Error uploading image to Cloudinary:", uploadError);
          return res
            .status(500)
            .json({ error: "Error uploading image to Cloudinary" });
        }
      }

      // If the category doesn't already exist, create a new one
      const newShop = new Shop({
        name,
        shop_image: imageUrl,
      });
      await newShop.save();
      res.json({ message: "Shop successfully created" });
    } catch (error) {
      console.error("Error creating shop:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  },

  getShops: async (req, res) => {
    try {
      const shops = await Shop.find();
      if (!shops) {
        return res.status(404).json({ error: "No Product Category found" });
      }
      res.json(shops);
    } catch (error) {
      return res
        .status(500)
        .json({ error: "Ooops!! an error occured, please refresh" });
    }
  },

  editShop: async (req, res) => {
    try {
      const shopId = req.params.id;
      const { name } = req.body;

      const existingShop = await Shop.findOne({ name });

      if (existingShop && existingShop._id.toString() !== shopId) {
        return res
          .status(400)
          .json({ error: "A product category with this name already exists." });
      }

      let imageUrl = null;

      //Check if a file was uploaded
      if (req.file) {
        //Upload the single image to Cloudinary
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: "shop_images",
        });
        imageUrl = result.secure_url;
      }

      const updatedShop = await ProductCategory.findByIdAndUpdate(
        shopId,
        {
          name,
          shop_image: imageUrl,
        },
        { new: true }
      );
      if (!updatedShop) {
        return res.status(404).json({ error: "Product Category not found" });
      }
      res.json({ message: "Shop updated" });
    } catch (error) {
      res
        .status(500)
        .json({ error: "Ooops!! an error occured, please refresh" });
    }
  },
  deleteShop: async (req, res) => {
    try {
      const shopId = req.params.id;

      //Find the Shop to get the products appended to it
      const shop = await Shop.findById(shopId);

      //Get the list of products associated with this category
      const productIds = shop.products;

      //Loop through the product and delete it alongside it's inventory
      for (const productId of productIds) {
        const product = await Product.findById(productId);

        if (product) {
          //Then delete the Product itself
          await Product.findByIdAndDelete(productId);
        }
      }

      //Delete the Product Category itself
      await ProductCategory.findByIdAndDelete(shopId);

      res.json({
        message: "Shops and all associated products deleted",
      });
    } catch (error) {
      return res
        .status(500)
        .json({ error: "Ooops!! an error occured, please refresh" });
    }
  },
};
module.exports = shopController;
