import Order from "../models/Order.js";
import logger from "../config/logger.js";

// CREATE ORDER
export const createOrder = async (req, res) => {
  const { _id } = req.user; 
  const { orderItems, shippingAddress, totalPrice } = req.body;

  logger.info(`Creating order for user: ${_id}`);

  try {
    const order = await Order.create({
      user: _id,
      orderItems,
      shippingAddress,
      totalPrice,
    });

    logger.info(`Order created: ${order._id}`);
    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      data: order,
    });
  } catch (error) {
    logger.error(`Error creating order: ${error.message}`);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET USER ORDERS
export const getUserOrders = async (req, res) => {
  const { _id } = req.user;

  logger.info(`Fetching orders for user: ${_id}`);

  try {
    const orders = await Order.find({ user: _id }).populate("orderItems.product");
    res.json({
      success: true,
      message: "User orders fetched successfully",
      data: orders,
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
      data: orders,
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
        message: "Order not found",
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
      data: updatedOrder,
    });
  } catch (error) {
    logger.error(`Error updating order ${_id}: ${error.message}`);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
