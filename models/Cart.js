import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    // Store product details for quick access
    name: { type: String },
    price: { type: Number },
    image: { type: String },
  },
  { _id: false }
);

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    items: [cartItemSchema],
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Update lastUpdated timestamp on save
cartSchema.pre("save", function (next) {
  this.lastUpdated = Date.now();
  next();
});

export default mongoose.model("Cart", cartSchema);
