import Order from "../models/Order.js";
import Product from "../models/Product.js";
import mongoose from "mongoose";
import logger from "../config/logger.js";

// CREATE ORDER
export const createOrder = async (req, res) => {
  const { _id } = req.user;
  const { orderItems, shippingAddress, totalPrice } = req.body;

  logger.info(`Creating order for user: ${_id}`);
  logger.info(
    `Order data received:`,
    JSON.stringify({ orderItems, shippingAddress, totalPrice }, null, 2)
  );

  try {
    // First, validate that all products have sufficient stock
    for (const item of orderItems) {
      const product = await Product.findById(item.product);

      if (!product) {
        throw new Error(`Product with ID ${item.product} not found`);
      }

      if (product.stock < item.quantity) {
        throw new Error(
          `Insufficient stock for product: ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`
        );
      }
    }

    // Create the order
    const order = await Order.create({
      user: _id,
      orderItems,
      shippingAddress,
      totalPrice
    });

    // Update product stock for each item in the order
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { stock: -item.quantity } }, // Decrease stock by the ordered quantity
        { new: true }
      );
      logger.info(
        `Updated stock for product ${item.product}, reduced by ${item.quantity}`
      );
    }

    logger.info(`Order created: ${order._id}`);
    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      data: order
    });
  } catch (error) {
    logger.error(`Error creating order: ${error.message}`);
    logger.error(`Error stack: ${error.stack}`);

    // Send appropriate error message based on the type of error
    if (error.message.includes("Insufficient stock")) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    if (error.message.includes("not found")) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to place order. Please try again."
    });
  }
};

// GET USER ORDERS
export const getUserOrders = async (req, res) => {
  const { _id } = req.user;

  logger.info(`Fetching orders for user: ${_id}`);

  try {
    const orders = await Order.find({ user: _id }).populate(
      "orderItems.product"
    );
    res.json({
      success: true,
      message: "User orders fetched successfully",
      data: orders
    });
  } catch (error) {
    logger.error(`Error fetching user orders: ${error.message}`);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET ALL ORDERS (ADMIN)
export const getAllOrders = async (req, res) => {
  logger.info(`Admin fetching all orders`);

  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .populate("orderItems.product")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      message: "All orders fetched successfully",
      data: orders
    });
  } catch (error) {
    logger.error(`Error fetching all orders: ${error.message}`);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// UPDATE ORDER STATUS AND PAYMENT (ADMIN)
export const updateOrderStatusAndPayment = async (req, res) => {
  const { _id } = req.params;
  const { isPaid, status } = req.body;

  logger.info(`Updating order: ${_id}`);

  try {
    const order = await Order.findById(_id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    if (typeof isPaid === "boolean" && isPaid) {
      order.isPaid = true;
      order.paidAt = new Date();
    }

    if (status) {
      order.status = status;
    }

    const updatedOrder = await order.save();

    logger.info(`Order updated: ${_id}`);
    res.json({
      success: true,
      message: "Order updated successfully",
      data: updatedOrder
    });
  } catch (error) {
    logger.error(`Error updating order ${_id}: ${error.message}`);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
