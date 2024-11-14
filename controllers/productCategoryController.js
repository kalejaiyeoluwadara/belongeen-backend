const ProductCategory = require("../models/ProductCategory");
const cloudinary = require("cloudinary").v2;
const Product = require("../models/Product");
const Shop = require("../models/Shop");

const productCategoryController = {
  createProductCategory: async (req, res) => {
    try {
      const { name } = req.body;

      // Check if a category already exists with the same name
      const existingProductCategory = await ProductCategory.findOne({ name });
      if (existingProductCategory) {
        return res
          .status(400)
          .json({ error: "A product category with this name already exists" });
      }

      // If the category doesn't already exist, create a new one
      const newProductCategory = new ProductCategory({
        name,
      });
      await newProductCategory.save();
      res.json({
        message: "Product category successfully created",
        newProductCategory,
      });
    } catch (error) {
      console.error("Error creating category:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  },
  getProductCategoryById: async (req, res) => {
    try {
      const { id } = req.params;

      // Find the category by ID
      const productCategory = await ProductCategory.findById(id).populate(
        "shops"
      );

      if (!productCategory) {
        return res.status(404).json({ error: "Product Category not found" });
      }

      res.json(productCategory);
    } catch (error) {
      console.error("Error retrieving product category:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  getProductCategories: async (req, res) => {
    try {
      const productCategories = await ProductCategory.find();

      if (!productCategories) {
        return res.status(404).json({ error: "No Product Category found" });
      }
      res.json(productCategories);
    } catch (error) {
      return res
        .status(500)
        .json({ error: "Ooops!! an error occured, please refresh" });
    }
  },
  getTopProductCategories: async (req, res) => {
    try {
      const topCategories = await ProductCategory.aggregate([
        // Unwind the products array to create a document for each product
        { $unwind: "$products" },

        // Group by _id (category id) and count the number of products
        {
          $group: {
            _id: "$_id",
            name: { $first: "$name" },
            product_category_image: { $first: "$product_category_image" },
            productCount: { $sum: 1 },
          },
        },

        // Sort by product count in descending order
        { $sort: { productCount: -1 } },

        // Limit to top 10 categories
        { $limit: 10 },
      ]);

      res.json(topCategories);
    } catch (error) {
      return res
        .status(500)
        .json({ error: "Ooops!! an error occured, please refresh" });
    }
  },

  editProductCategory: async (req, res) => {
    try {
      const productCategoryId = req.params.id;
      const { name } = req.body;

      const existingProductCategory = await ProductCategory.findOne({ name });

      if (
        existingProductCategory &&
        existingProductCategory._id.toString() !== productCategoryId
      ) {
        return res
          .status(400)
          .json({ error: "A product category with this name already exists." });
      }
      const updatedProductCategory = await ProductCategory.findByIdAndUpdate(
        productCategoryId,
        {
          name,
        },
        { new: true }
      );
      if (!updatedProductCategory) {
        return res.status(404).json({ error: "Product Category not found" });
      }
      res.json({ message: "Product category updated" });
    } catch (error) {
      res
        .status(500)
        .json({ error: "Ooops!! an error occured, please refresh" });
    }
  },
  deleteProductCategory: async (req, res) => {
    try {
      const productCategoryId = req.params.id;

      //Find the ProductCategory to get the products appended to it
      const productCategory = await ProductCategory.findById(productCategoryId);

      //Get the list of products associated with this category
      const productIds = productCategory.shops;

      //Loop through the product and delete it alongside it's inventory
      for (const productId of productIds) {
        const product = await Shop.findById(productId);

        if (product) {
          //Then delete the Product itself
          await Product.findByIdAndDelete(productId);
        }
      }

      //Delete the Product Category itself
      await ProductCategory.findByIdAndDelete(productCategoryId);

      res.json({
        message:
          "Product Category and all associated products and inventories deleted",
      });
    } catch (error) {
      return res
        .status(500)
        .json({ error: "Ooops!! an error occured, please refresh" });
    }
  },
};
module.exports = productCategoryController;
