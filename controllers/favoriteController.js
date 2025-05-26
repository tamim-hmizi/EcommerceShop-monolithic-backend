import User from "../models/User.js";
import Product from "../models/Product.js";
import logger from "../utils/logger.js";

/**
 * @desc    Get user favorites
 * @route   GET /api/favorites
 * @access  Private
 */
export const getFavorites = async (req, res) => {
  try {
    const userId = req.user._id;
    logger.info(`Getting favorites for user: ${userId}`);

    // Find the user and populate the favorites field with product details
    const user = await User.findById(userId).populate({
      path: "favorites",
      select: "name price description image category stock rating originalPrice",
      populate: {
        path: "category",
        select: "name",
      },
    });

    if (!user) {
      logger.warn(`User not found: ${userId}`);
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    logger.info(`Retrieved ${user.favorites.length} favorites for user: ${userId}`);
    res.json({
      success: true,
      data: user.favorites,
    });
  } catch (error) {
    logger.error(`Error getting favorites: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/**
 * @desc    Add product to favorites
 * @route   POST /api/favorites/:productId
 * @access  Private
 */
export const addToFavorites = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId } = req.params;
    logger.info(`Adding product ${productId} to favorites for user: ${userId}`);

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      logger.warn(`Product not found: ${productId}`);
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Find user and update favorites
    const user = await User.findById(userId);
    if (!user) {
      logger.warn(`User not found: ${userId}`);
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if product is already in favorites
    if (user.favorites.includes(productId)) {
      logger.info(`Product ${productId} already in favorites for user: ${userId}`);
      return res.status(400).json({
        success: false,
        message: "Product already in favorites",
      });
    }

    // Add to favorites
    user.favorites.push(productId);
    await user.save();

    logger.info(`Added product ${productId} to favorites for user: ${userId}`);
    res.status(201).json({
      success: true,
      message: "Product added to favorites",
    });
  } catch (error) {
    logger.error(`Error adding to favorites: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/**
 * @desc    Remove product from favorites
 * @route   DELETE /api/favorites/:productId
 * @access  Private
 */
export const removeFromFavorites = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId } = req.params;
    logger.info(`Removing product ${productId} from favorites for user: ${userId}`);

    // Find user and update favorites
    const user = await User.findById(userId);
    if (!user) {
      logger.warn(`User not found: ${userId}`);
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if product is in favorites
    if (!user.favorites.includes(productId)) {
      logger.info(`Product ${productId} not in favorites for user: ${userId}`);
      return res.status(400).json({
        success: false,
        message: "Product not in favorites",
      });
    }

    // Remove from favorites
    user.favorites = user.favorites.filter(
      (favId) => favId.toString() !== productId
    );
    await user.save();

    logger.info(`Removed product ${productId} from favorites for user: ${userId}`);
    res.json({
      success: true,
      message: "Product removed from favorites",
    });
  } catch (error) {
    logger.error(`Error removing from favorites: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/**
 * @desc    Check if product is in favorites
 * @route   GET /api/favorites/:productId
 * @access  Private
 */
export const checkFavorite = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId } = req.params;
    logger.info(`Checking if product ${productId} is in favorites for user: ${userId}`);

    const user = await User.findById(userId);
    if (!user) {
      logger.warn(`User not found: ${userId}`);
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isFavorite = user.favorites.includes(productId);
    logger.info(`Product ${productId} is${isFavorite ? '' : ' not'} in favorites for user: ${userId}`);
    
    res.json({
      success: true,
      isFavorite,
    });
  } catch (error) {
    logger.error(`Error checking favorite: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
