import Order from "../models/Order.js";
import stripe from "../config/stripe.js";


export const createOrder = async (req, res) => {
  try {
    const { orderItems, shippingAddress, totalPrice, paymentMethod } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: "No order items" });
    }

    const order = new Order({
      user: req.user.id,
      orderItems,
      shippingAddress,
      totalPrice,
      paymentMethod,
    });

    await order.save();
    res.status(201).json({ message: "Order placed successfully", order });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


export const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate("user", "name email").sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};



export const createPaymentIntent = async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findById(orderId);

    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.isPaid) return res.status(400).json({ message: "Order already paid" });

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(order.totalPrice * 100), // Convert to cents
      currency: "usd",
      metadata: { orderId: order._id.toString() },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      message: "Payment intent created",
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


export const handleStripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];

  try {
    const event = stripe.webhooks.constructEvent(req.rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);

    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object;
      const orderId = paymentIntent.metadata.orderId;

      const order = await Order.findById(orderId);
      if (order) {
        order.isPaid = true;
        order.paidAt = Date.now();
        order.status = "Processing";
        await order.save();
      }
    }

    res.json({ received: true });
  } catch (error) {
    res.status(400).send(`Webhook error: ${error.message}`);
  }
};
