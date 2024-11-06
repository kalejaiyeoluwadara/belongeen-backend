const Product = require("../models/Product");
const ProductCategory = require("../models/ProductCategory");
const Inventory = require("../models/Inventory");
const csv = require("csv-parser");
const fs = require("fs");
const multer = require("multer");
const uploadCsv = multer({ dest: "uploads/csv" });
const cloudinary = require("../config/cloudinary");

const productController = {
  createSingleProduct: async (req, res) => {
    try {
      const { productTitle, category, description } = req.body;

      // Upload images to Cloudinary
      const uploadPromises = req.files.map((file) => {
        return cloudinary.uploader.upload(file.path, {
          folder: "product_images",
        });
      });

      const imageResults = await Promise.all(uploadPromises);
      const imageUrls = imageResults.map((result) => result.secure_url);

      const product = new Product({
        productTitle,
        category,
        description,
        images: imageUrls,
        isProductNew: true,
      });

      await product.save();

      // Check if product category exists in the database
      const productCategory = await ProductCategory.findById(category).populate(
        "products"
      );

      if (productCategory) {
        // Add the newly created product to the products array of the existing category
        productCategory.products.push(product);
        await productCategory.save();
      }

      // Set a timer to update isProductNew field after 48 hours
      setTimeout(async () => {
        await Product.findByIdAndUpdate(product._id, { isProductNew: false });
      }, 1 * 10 * 60 * 1000); // 48 hours in milliseconds
      res.json({ message: "Product Created Successfully", product });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  viewProductsByCategory: async (req, res) => {
    try {
      // Get the category id
      const categoryId = req.params.id;
      // console.log('Category ID:', categoryId);

      // Retrieve ProductCategory by ID
      const productCategory = await ProductCategory.findById(categoryId);

      // Check if the ProductCategory exists
      if (!productCategory) {
        return res.status(404).json({ error: "Product Category not found" });
      }

      // console.log('Product Category:', productCategory.name);
      // console.log('Number of products in category:', productCategory.products.length);

      // Fetch all products in the category
      const products = await Product.find({
        _id: { $in: productCategory.products },
      }).populate("category", "name");
      console.log("Number of products fetched:", products.length);

      // Reverse the order of products
      const reversedProducts = products.reverse();

      // console.log('First product after reversal:', reversedProducts[0]?.productTitle);
      // console.log('Last product after reversal:', reversedProducts[reversedProducts.length - 1]?.productTitle);

      res.json(reversedProducts);
    } catch (error) {
      console.error("Error in viewProductsByCategory:", error);
      return res
        .status(500)
        .json({ error: "Oops! An error occurred, please refresh" });
    }
  },
  fetchAllProducts: async (req, res) => {
    try {
      const totalProducts = await Product.find().populate("category", "name");
      res.json(totalProducts);
    } catch (error) {
      return res
        .status(500)
        .json({ error: "Ooops!! an error occured, please refresh" });
    }
  },
  getSingleProductDetails: async (req, res) => {
    try {
      const productId = req.params.id;
      const product = await Product.findById(productId).populate(
        "category",
        "name"
      );
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      // Convert the product to a plain JavaScript object
      // const productObject = product.toObject();

      // Add the category name to the response
      // productObject.categoryName = product.category ? product.category.name : null;

      res.json(product);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },
  searchForProduct: async (req, res) => {
    //These function will be used for searching products
    try {
      const { query } = req.query; // Get the search query from the request

      if (!query) {
        return res.status(400).json({ error: "Search query is required" });
      }

      // Create a regex pattern for case-insensitive search
      const searchPattern = new RegExp(query, "i");

      // Search for products matching the query in title, description, or brand
      const products = await Product.find({
        $or: [{ productTitle: searchPattern }, { brand: searchPattern }],
      }).populate("category"); // Populate the category field if needed

      if (products.length === 0) {
        return res
          .status(404)
          .json({ message: "No products found matching the search query" });
      }

      res.json(products);
    } catch (error) {
      return res
        .status(500)
        .json({ error: "Ooops!! an error occured, please refresh" });
    }
  },
  editProduct: async (req, res) => {
    try {
      const productId = req.params.id; // Get the product ID from the request parameters
      const { productTitle, category, description } = req.body;

      // Find the existing product by ID
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      // Handle image uploads if new files are provided
      let imageUrls = product.images; // Keep existing images by default

      if (req.files && req.files.length > 0) {
        const uploadPromises = req.files.map((file) => {
          return cloudinary.uploader.upload(file.path, {
            folder: "product_images",
          });
        });

        const imageResults = await Promise.all(uploadPromises);
        const newImageUrls = imageResults.map((result) => result.secure_url);
        imageUrls = [...imageUrls, ...newImageUrls]; // Combine existing images with new ones
      }

      // Handle keyFeatures array
      const keyFeaturesArray = Array.isArray(keyFeatures)
        ? keyFeatures
        : [keyFeatures];

      // Update product fields
      product.productTitle = productTitle || product.productTitle;
      product.price = price || product.price;
      product.category = category || product.category;
      product.description = description || product.description;
      product.images = imageUrls;
      product.brand = brand || product.brand;
      product.weight = weight || product.weight;
      product.modelNumber = modelNumber || product.modelNumber;
      product.mainMaterial = mainMaterial || product.mainMaterial;
      product.color = color || product.color;
      product.keyFeatures =
        keyFeaturesArray.length > 0 ? keyFeaturesArray : product.keyFeatures;
      product.size = size || product.size;
      product.sku = sku || product.sku;

      // Save the updated product
      await product.save();

      // Check if the product category has changed
      if (category && category !== product.category.toString()) {
        const oldCategory = await ProductCategory.findById(product.category);
        const newCategory = await ProductCategory.findById(category).populate(
          "products"
        );

        // Remove product from old category
        if (oldCategory) {
          oldCategory.products.pull(product._id);
          await oldCategory.save();
        }

        // Add the product to the new category
        if (newCategory) {
          newCategory.products.push(product);
          await newCategory.save();
        }
      }

      return res
        .status(200)
        .json({ message: "Product updated successfully", product });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },
  deleteProduct: async (req, res) => {
    try {
      const productId = req.params.id;

      //Find the Product to get it's inventory
      const product = await Product.findById(productId);

      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }

      //First delete the inventory associated with the product
      const inventoryId = product.inventory;
      await Inventory.findByIdAndDelete(inventoryId);

      //Delete the product itself
      await Product.findByIdAndDelete(productId);

      res.json({ message: "Product deleted successfully" });
    } catch (error) {
      return res
        .status(500)
        .json({ error: "Ooops!! an error occured, please refresh" });
    }
  },
};
module.exports = productController;
