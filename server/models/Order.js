import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
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
        price: {
          type: Number,
          required: true,
        },
      },
    ],
    shippingAddress: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zipcode: { type: String, required: true },
      country: { type: String, required: true },
    },
    payment: {
      method: {
        type: String,
        enum: ["COD", "Online"],
        default: "COD",
      },
      status: {
        type: String,
        enum: ["Pending", "Paid", "Failed"],
        default: "Pending",
      },
      transactionId: String,
      amount: {
        type: Number,
        required: true,
      },
    },
    orderStatus: {
      type: String,
      enum: [
        "Pending",
        "Confirmed",
        "Processing",
        "Shipped",
        "Delivered",
        "Cancelled",
      ],
      default: "Pending",
    },
    tracking: {
      number: String,
      carrier: {
        type: String,
        default: "DashMart Express",
      },
      estimatedDelivery: Date,
      updates: [
        {
          status: String,
          location: String,
          timestamp: {
            type: Date,
            default: Date.now,
          },
          description: String,
        },
      ],
    },
    subtotal: {
      type: Number,
      required: true,
    },
    tax: {
      type: Number,
      default: 0,
    },
    shipping: {
      type: Number,
      default: 0,
    },
    total: {
      type: Number,
      required: true,
    },
    notes: String,
    isCancelled: {
      type: Boolean,
      default: false,
    },
    cancelledAt: Date,
    cancelledBy: {
      type: String,
      enum: ["User", "Seller", "System"],
      default: "User",
    },
    cancelledReason: String,
  },
  {
    timestamps: true,
  }
);

// Generate fake tracking number
orderSchema.pre("save", function (next) {
  if (this.isNew && !this.tracking.number) {
    this.tracking.number =
      "DM" +
      Date.now().toString().slice(-8) +
      Math.random().toString(36).substr(2, 4).toUpperCase();
  }

  // Set estimated delivery (3-7 days from now)
  if (this.isNew && !this.tracking.estimatedDelivery) {
    const deliveryDays = Math.floor(Math.random() * 5) + 3; // 3-7 days
    this.tracking.estimatedDelivery = new Date(
      Date.now() + deliveryDays * 24 * 60 * 60 * 1000
    );
  }

  next();
});

const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);

export default Order;
