import Category from "../models/Category.js";
import logger from "../config/logger.js";

// CREATE
export const createCategory = async (req, res) => {
  const { name, description } = req.body;
  logger.info(`Attempting to create category: ${name}`);

  try {
    const existing = await Category.findOne({ name });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Category with this name already exists",
      });
    }

    const category = await Category.create({ name, description });
    logger.info(`Category created: ${category._id}`);

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: category,
    });
  } catch (error) {
    logger.error(`Error creating category: ${error.message}`);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// READ ALL
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      message: "Categories retrieved successfully",
      data: categories,
    });
  } catch (error) {
    logger.error(`Error fetching categories: ${error.message}`);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// READ ONE
export const getCategoryById = async (req, res) => {
  const { _id } = req.params;

  try {
    const category = await Category.findById(_id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    res.json({
      success: true,
      message: "Category retrieved",
      data: category,
    });
  } catch (error) {
    logger.error(`Error fetching category ${_id}: ${error.message}`);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// UPDATE
export const updateCategory = async (req, res) => {
  const { _id } = req.params;
  const { name, description } = req.body;

  try {
    const category = await Category.findById(_id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    category.name = name || category.name;
    category.description = description || category.description;

    const updated = await category.save();

    res.json({
      success: true,
      message: "Category updated",
      data: updated,
    });
  } catch (error) {
    logger.error(`Error updating category ${_id}: ${error.message}`);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// DELETE
export const deleteCategory = async (req, res) => {
  const { _id } = req.params;

  try {
    const deleted = await Category.findByIdAndDelete(_id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    res.json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    logger.error(`Error deleting category ${_id}: ${error.message}`);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
