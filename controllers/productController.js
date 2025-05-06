import Product from "../models/Product.js";
import logger from "../config/logger.js";

// CREATE
export const createProduct = async (req, res) => {
  const { name, description, price, stock, category } = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : null;

  logger.info(`Creating product: ${name}`);

  try {
    const product = new Product({
      name,
      description,
      price,
      stock,
      category,
      image,
    });

    await product.save();
    logger.info(`Product "${name}" created successfully`);
    res
      .status(201)
      .json({ success: true, message: "Product created", product });
  } catch (error) {
    logger.error(`Error creating product: ${error.message}`);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// GET ALL
export const getProducts = async (req, res) => {
  logger.info("Fetching all products");

  try {
    const products = await Product.find().populate("category");
    res.json({ success: true, products });
  } catch (error) {
    logger.error(`Error fetching products: ${error.message}`);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// GET ONE
export const getProductById = async (req, res) => {
  logger.info(`Fetching product ID: ${req.params._id}`);

  try {
    const product = await Product.findById(req.params._id).populate("category");
    if (!product) {
      logger.warn(`Product not found: ${req.params._id}`);
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }
    res.json({ success: true, product });
  } catch (error) {
    logger.error(`Error fetching product: ${error.message}`);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// UPDATE
export const updateProduct = async (req, res) => {
  const { name, description, price, stock, category } = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : null;

  logger.info(`Updating product ID: ${req.params._id}`);

  try {
    const product = await Product.findById(req.params._id);
    if (!product) {
      logger.warn(`Product not found: ${req.params._id}`);
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    product.name = name || product.name;
    product.description = description || product.description;
    product.price = price || product.price;
    product.stock = stock || product.stock;
    product.category = category || product.category;
    if (image) product.image = image;

    await product.save();
    res.json({ success: true, message: "Product updated", product });
  } catch (error) {
    logger.error(`Error updating product: ${error.message}`);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// DELETE
export const deleteProduct = async (req, res) => {
  logger.info(`Deleting product ID: ${req.params._id}`);

  try {
    const product = await Product.findByIdAndDelete(req.params._id);
    if (!product) {
      logger.warn(`Product not found: ${req.params._id}`);
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    res.json({ success: true, message: "Product deleted" });
  } catch (error) {
    logger.error(`Error deleting product: ${error.message}`);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};
