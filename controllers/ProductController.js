const Product = require("../models/Product");
const ProductCategory = require("../models/ProductCategory");
const multer = require("multer");
const cloudinary = require("../config/cloudinary");
const Shop = require("../models/Shop");
const { StatusCodes } = require("http-status-codes");
const productController = {
  createSingleProduct: async (req, res) => {
    try {
      const { productTitle, category, description, price } = req.body;

      // Ensure images are uploaded
      if (!req.files || req.files.length === 0) {
        return res
          .status(400)
          .json({ error: "At least one image file is required" });
      }

      const imageUrls = req.files.map((file) => file.path);
      const product = new Product({
        productTitle,
        category,
        description,
        price,
        images: imageUrls,
        isProductNew: true,
      });

      await product.save();

      // Check if the product category (shop) exists in the database
      const shop = await Shop.findById(category).populate("products");

      if (shop) {
        // Add the newly created product to the products array of the existing category
        shop.products.push(product);
        await shop.save();
      }

      // Set a timer to update `isProductNew` field after 48 hours (in milliseconds)
      setTimeout(async () => {
        await Product.findByIdAndUpdate(product._id, { isProductNew: false });
      }, 48 * 60 * 60 * 1000);

      res
        .status(201)
        .json({ message: "Product Created Successfully", product });
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  viewProductsByCategory: async (req, res) => {
    try {
      // Get the category id
      const categoryId = req.params.id;
      // console.log('Category ID:', categoryId);

      // Retrieve Shop by ID
      const shop = await Shop.findById(categoryId);

      // Check if the Shop exists
      if (!shop) {
        return res.status(404).json({ error: "Shop not found" });
      }

      // console.log('Product Category:', productCategory.name);
      // console.log('Number of products in category:', productCategory.products.length);

      // Fetch all products in the category
      const products = await Product.find({
        _id: { $in: shop.products },
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
  relatedProducts: async (req, res) => {
    try {
      const productId = req.params.id;

      // Fetch the current product
      const currentProduct = await Product.findById(productId);
      if (!currentProduct) {
        return res.status(404).json({ error: "Product not found" });
      }

      // Find related products in the same category, excluding the current product
      const related = await Product.find({
        category: currentProduct.category,
        _id: { $ne: productId }, // Exclude the current product
      })
        .limit(5) // Limit the number of related products
        .populate(); // Populate category details if needed

      // Check if there are any related products
      if (related.length === 0) {
        return res
          .status(404)
          .json({ message: "No related products found for this category" });
      }

      res.status(200).json({ relatedProducts: related });
    } catch (error) {
      console.error("Error fetching related products:", error);
      res
        .status(500)
        .json({ error: "An error occurred while fetching related products" });
    }
  },

  fetchAllProducts: async (req, res) => {
    try {
      const totalProducts = await Product.find().populate("category");
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
    try {
      // Extract search term from query string
      const { name } = req.query;

      if (!name) {
        return res
          .status(400)
          .json({ error: "Search term 'name' is required" });
      }

      // Build the search query object
      const queryObject = {
        productTitle: { $regex: name, $options: "i" },
      };

      // Perform the search using Product.find
      const products = await Product.find(queryObject);

      // Handle successful search
      if (products.length > 0) {
        return res.status(200).json({ products, nbHits: products.length });
      } else {
        // Handle no products found
        return res.status(404).json({ message: "No products found" });
      }
    } catch (error) {
      // Handle any errors during search
      console.error("Error searching for products:", error);
      return res.status(500).json({ error: "An error occurred" });
    }
  },

  editProduct: async (req, res) => {
    try {
      const productId = req.params.id; // Get the product ID from the request parameters
      const { productTitle, category, description, price } = req.body;

      // Find the existing product by ID
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }

      // Retain existing images unless new ones are uploaded
      let imageUrls = product.images;

      // Check if new images are uploaded
      if (req.files && req.files.length > 0) {
        const uploadPromises = req.files.map((file) => {
          return cloudinary.uploader.upload(file.path, {
            folder: "product_images", // Cloudinary folder where images will be stored
          });
        });

        // Wait for all images to be uploaded to Cloudinary
        const imageResults = await Promise.all(uploadPromises);

        // Extract URLs of uploaded images
        const newImageUrls = imageResults.map((result) => result.secure_url);

        // Combine existing images with new ones
        imageUrls = [...imageUrls, ...newImageUrls];
      }

      // Update product fields with provided data or keep existing values
      product.productTitle = productTitle || product.productTitle;
      product.price = price || product.price;
      product.category = category || product.category;
      product.description = description || product.description;
      product.images = imageUrls; // Save the updated images

      // Save the updated product
      await product.save();

      // Check if the product category has changed
      if (category && category !== product.category.toString()) {
        const oldCategory = await Shop.findById(product.category);
        const newCategory = await Shop.findById(category).populate("products");

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

      const product = await Product.findById(productId);

      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }

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
