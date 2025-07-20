import mongoose from "mongoose";

const cartSchema = new mongoose.Schema(
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
          default: 1,
        },
      },
    ],
    total: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Calculate total before saving
cartSchema.pre("save", async function (next) {
  if (this.items.length > 0) {
    let total = 0;
    for (let item of this.items) {
      const product = await mongoose.model("Product").findById(item.product);
      if (product && product.inStock) {
        total += product.offerPrice * item.quantity;
      }
    }
    this.total = total;
  } else {
    this.total = 0;
  }
  next();
});

const Cart = mongoose.models.Cart || mongoose.model("Cart", cartSchema);

export default Cart;
