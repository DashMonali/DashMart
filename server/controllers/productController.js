import Product from "../models/Product.js";

// Get all products: /api/products
export const getAllProducts = async (req, res) => {
  try {
    const { category, search, page = 1, limit = 12 } = req.query;
    const skip = (page - 1) * limit;

    let query = { inStock: true };

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Search functionality
    if (search) {
      query.$text = { $search: search };
    }

    const products = await Product.find(query)
      .populate("seller", "name businessName")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Product.countDocuments(query);

    res.json({
      success: true,
      products,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single product: /api/products/:id
export const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("seller", "name businessName")
      .populate("ratings.user", "name");

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    res.json({ success: true, product });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create product: /api/products (seller only)
export const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      price,
      offerPrice,
      weight,
      image,
      cloudinaryIds,
    } = req.body;

    if (!name || !description || !category || !price || !offerPrice || !image) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    const product = await Product.create({
      name,
      description: Array.isArray(description) ? description : [description],
      category,
      price: parseFloat(price),
      offerPrice: parseFloat(offerPrice),
      weight: weight || "N/A",
      image: Array.isArray(image) ? image : [image],
      cloudinaryIds: cloudinaryIds
        ? Array.isArray(cloudinaryIds)
          ? cloudinaryIds
          : [cloudinaryIds]
        : [],
      seller: req.seller._id,
    });

    res.status(201).json({ success: true, product });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update product: /api/products/:id (seller only)
export const updateProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      price,
      offerPrice,
      weight,
      image,
      cloudinaryIds,
      inStock,
    } = req.body;

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    // Check if seller owns this product
    if (product.seller.toString() !== req.seller._id.toString()) {
      return res
        .status(403)
        .json({
          success: false,
          message: "Not authorized to update this product",
        });
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (description)
      updateData.description = Array.isArray(description)
        ? description
        : [description];
    if (category) updateData.category = category;
    if (price) updateData.price = parseFloat(price);
    if (offerPrice) updateData.offerPrice = parseFloat(offerPrice);
    if (weight) updateData.weight = weight;
    if (image) updateData.image = Array.isArray(image) ? image : [image];
    if (cloudinaryIds)
      updateData.cloudinaryIds = Array.isArray(cloudinaryIds)
        ? cloudinaryIds
        : [cloudinaryIds];
    if (typeof inStock === "boolean") updateData.inStock = inStock;

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({ success: true, product: updatedProduct });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete product: /api/products/:id (seller only)
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    // Check if seller owns this product
    if (product.seller.toString() !== req.seller._id.toString()) {
      return res
        .status(403)
        .json({
          success: false,
          message: "Not authorized to delete this product",
        });
    }

    // Note: Cloudinary images should be deleted separately using the deleteImage endpoint
    await Product.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Toggle stock status: /api/products/:id/stock (seller only)
export const toggleStock = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    // Check if seller owns this product
    if (product.seller.toString() !== req.seller._id.toString()) {
      return res
        .status(403)
        .json({
          success: false,
          message: "Not authorized to update this product",
        });
    }

    product.inStock = !product.inStock;
    await product.save();

    res.json({ success: true, product });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get seller products: /api/seller/products
export const getSellerProducts = async (req, res) => {
  try {
    const products = await Product.find({ seller: req.seller._id }).sort({
      createdAt: -1,
    });

    res.json({ success: true, products });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};
