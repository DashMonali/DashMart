import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: [String],
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        "Fruits",
        "Vegetables",
        "Dairy",
        "Bakery",
        "Beverages",
        "Snacks",
        "Grains",
        "Organic",
      ],
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    offerPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    weight: {
      type: String,
      default: "N/A",
    },
    image: {
      type: [String],
      required: true,
    },
    cloudinaryIds: {
      type: [String],
      default: [],
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Seller",
      required: true,
    },
    inStock: {
      type: Boolean,
      default: true,
    },
    ratings: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        rating: {
          type: Number,
          min: 1,
          max: 5,
        },
        review: String,
        date: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    averageRating: {
      type: Number,
      default: 0,
    },
    totalRatings: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Calculate average rating before saving
productSchema.pre("save", function (next) {
  if (this.ratings.length > 0) {
    const totalRating = this.ratings.reduce(
      (sum, item) => sum + item.rating,
      0
    );
    this.averageRating = totalRating / this.ratings.length;
    this.totalRatings = this.ratings.length;
  }
  next();
});

const Product =
  mongoose.models.Product || mongoose.model("Product", productSchema);

export default Product;
