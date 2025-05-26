import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import logger from "../config/logger.js";

// GET USER CART
export const getUserCart = async (req, res) => {
  const { _id } = req.user;
  logger.info(`Fetching cart for user: ${_id}`);

  try {
    // Find or create cart for the user
    let cart = await Cart.findOne({ user: _id }).populate("items.product");

    if (!cart) {
      cart = new Cart({ user: _id, items: [] });
      await cart.save();
    }

    res.json({
      success: true,
      message: "Cart fetched successfully",
      data: cart,
    });
  } catch (error) {
    logger.error(`Error fetching cart: ${error.message}`);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// SAVE CART
export const saveCart = async (req, res) => {
  const { _id } = req.user;
  const { items } = req.body;
  logger.info(`Saving cart for user: ${_id}`);

  try {
    // Find or create cart for the user
    let cart = await Cart.findOne({ user: _id });

    if (!cart) {
      cart = new Cart({ user: _id, items: [] });
    }

    // Validate and update cart items
    const validatedItems = [];
    for (const item of items) {
      // Verify product exists and is in stock
      const product = await Product.findById(item.product || item._id);
      if (product) {
        // Ensure quantity doesn't exceed stock
        const quantity = Math.min(item.quantity, product.stock);
        
        validatedItems.push({
          product: product._id,
          quantity,
          name: product.name,
          price: product.price,
          image: product.image,
        });
      }
    }

    cart.items = validatedItems;
    cart.lastUpdated = Date.now();
    await cart.save();

    res.json({
      success: true,
      message: "Cart saved successfully",
      data: cart,
    });
  } catch (error) {
    logger.error(`Error saving cart: ${error.message}`);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ADD ITEM TO CART
export const addItemToCart = async (req, res) => {
  const { _id } = req.user;
  const item = req.body;
  logger.info(`Adding item to cart for user: ${_id}`);

  try {
    // Find or create cart for the user
    let cart = await Cart.findOne({ user: _id });

    if (!cart) {
      cart = new Cart({ user: _id, items: [] });
    }

    // Verify product exists and is in stock
    const product = await Product.findById(item._id || item.product);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(
      (i) => i.product.toString() === product._id.toString()
    );

    if (existingItemIndex !== -1) {
      // Update quantity if item exists
      const newQuantity = cart.items[existingItemIndex].quantity + (item.quantity || 1);
      cart.items[existingItemIndex].quantity = Math.min(newQuantity, product.stock);
    } else {
      // Add new item to cart
      cart.items.push({
        product: product._id,
        quantity: Math.min(item.quantity || 1, product.stock),
        name: product.name,
        price: product.price,
        image: product.image,
      });
    }

    cart.lastUpdated = Date.now();
    await cart.save();

    res.json({
      success: true,
      message: "Item added to cart successfully",
      data: cart,
    });
  } catch (error) {
    logger.error(`Error adding item to cart: ${error.message}`);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// UPDATE CART ITEM
export const updateCartItem = async (req, res) => {
  const { _id } = req.user;
  const { itemId } = req.params;
  const updates = req.body;
  logger.info(`Updating cart item for user: ${_id}`);

  try {
    // Find cart for the user
    const cart = await Cart.findOne({ user: _id });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    // Find item in cart
    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === itemId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Item not found in cart",
      });
    }

    // Verify product exists and is in stock
    const product = await Product.findById(itemId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Update item quantity
    if (updates.quantity) {
      cart.items[itemIndex].quantity = Math.min(updates.quantity, product.stock);
    }

    cart.lastUpdated = Date.now();
    await cart.save();

    res.json({
      success: true,
      message: "Cart item updated successfully",
      data: cart,
    });
  } catch (error) {
    logger.error(`Error updating cart item: ${error.message}`);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// REMOVE CART ITEM
export const removeCartItem = async (req, res) => {
  const { _id } = req.user;
  const { itemId } = req.params;
  logger.info(`Removing item from cart for user: ${_id}`);

  try {
    // Find cart for the user
    const cart = await Cart.findOne({ user: _id });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    // Remove item from cart
    cart.items = cart.items.filter(
      (item) => item.product.toString() !== itemId
    );

    cart.lastUpdated = Date.now();
    await cart.save();

    res.json({
      success: true,
      message: "Item removed from cart successfully",
      data: cart,
    });
  } catch (error) {
    logger.error(`Error removing cart item: ${error.message}`);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// CLEAR CART
export const clearCart = async (req, res) => {
  const { _id } = req.user;
  logger.info(`Clearing cart for user: ${_id}`);

  try {
    // Find cart for the user
    const cart = await Cart.findOne({ user: _id });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    // Clear cart items
    cart.items = [];
    cart.lastUpdated = Date.now();
    await cart.save();

    res.json({
      success: true,
      message: "Cart cleared successfully",
      data: cart,
    });
  } catch (error) {
    logger.error(`Error clearing cart: ${error.message}`);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// MERGE GUEST CART
export const mergeGuestCart = async (req, res) => {
  const { _id } = req.user;
  const { items } = req.body;
  logger.info(`Merging guest cart for user: ${_id}`);

  try {
    // Find or create cart for the user
    let cart = await Cart.findOne({ user: _id });

    if (!cart) {
      cart = new Cart({ user: _id, items: [] });
    }

    // Process each item from the guest cart
    for (const item of items) {
      // Verify product exists and is in stock
      const product = await Product.findById(item._id || item.product);
      if (!product) continue;

      // Check if item already exists in cart
      const existingItemIndex = cart.items.findIndex(
        (i) => i.product.toString() === product._id.toString()
      );

      if (existingItemIndex !== -1) {
        // Update quantity if item exists
        const newQuantity = cart.items[existingItemIndex].quantity + item.quantity;
        cart.items[existingItemIndex].quantity = Math.min(newQuantity, product.stock);
      } else {
        // Add new item to cart
        cart.items.push({
          product: product._id,
          quantity: Math.min(item.quantity, product.stock),
          name: product.name,
          price: product.price,
          image: product.image,
        });
      }
    }

    cart.lastUpdated = Date.now();
    await cart.save();

    res.json({
      success: true,
      message: "Guest cart merged successfully",
      data: cart,
    });
  } catch (error) {
    logger.error(`Error merging guest cart: ${error.message}`);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
