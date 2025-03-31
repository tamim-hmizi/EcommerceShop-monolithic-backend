import Product from "../models/Product.js";


export const createProduct = async (req, res) => {
  try {
    const { name, description, price, stock, category } = req.body;
    const images = req.files?.map((file) => `/uploads/${file.filename}`);

    const product = new Product({
      name,
      description,
      price,
      stock,
      category,
      images,
      createdBy: req.user.id,
    });

    await product.save();
    res.status(201).json({ message: "Product created successfully", product });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


export const getProducts = async (req, res) => {
  try {
    const products = await Product.find().populate("createdBy", "name email");
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


export const updateProduct = async (req, res) => {
  try {
    const { name, description, price, stock, category } = req.body;
    const images = req.files?.map((file) => `/uploads/${file.filename}`);

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    product.name = name || product.name;
    product.description = description || product.description;
    product.price = price || product.price;
    product.stock = stock || product.stock;
    product.category = category || product.category;
    if (images.length > 0) product.images = images;

    await product.save();
    res.json({ message: "Product updated successfully", product });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
