import Seller from "../models/Seller.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Register Seller: /api/seller/register
export const registerSeller = async (req, res) => {
  try {
    const { name, email, password, businessName, phone, address } = req.body;

    if (!name || !email || !password || !businessName || !phone || !address) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    const existingSeller = await Seller.findOne({ email });
    if (existingSeller) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Seller already exists with this email",
        });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const seller = await Seller.create({
      name,
      email,
      password: hashedPassword,
      businessName,
      phone,
      address,
    });

    const token = jwt.sign(
      { id: seller._id, type: "seller" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("sellerToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      success: true,
      seller: {
        name: seller.name,
        email: seller.email,
        businessName: seller.businessName,
      },
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Login Seller: /api/seller/login
export const loginSeller = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Missing Details" });
    }

    const seller = await Seller.findOne({ email });
    if (!seller) {
      return res
        .status(400)
        .json({ success: false, message: "Seller not found" });
    }

    if (!seller.isActive) {
      return res
        .status(400)
        .json({ success: false, message: "Account is deactivated" });
    }

    const isPasswordValid = await bcrypt.compare(password, seller.password);
    if (!isPasswordValid) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid password" });
    }

    const token = jwt.sign(
      { id: seller._id, type: "seller" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("sellerToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      success: true,
      seller: {
        name: seller.name,
        email: seller.email,
        businessName: seller.businessName,
      },
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Logout Seller: /api/seller/logout
export const logoutSeller = async (req, res) => {
  try {
    res.cookie("sellerToken", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      expires: new Date(0),
    });
    return res.json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Seller Profile: /api/seller/profile
export const getSellerProfile = async (req, res) => {
  try {
    const seller = await Seller.findById(req.seller.id).select("-password");
    if (!seller) {
      return res
        .status(404)
        .json({ success: false, message: "Seller not found" });
    }
    return res.json({ success: true, seller });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Seller Profile: /api/seller/profile
export const updateSellerProfile = async (req, res) => {
  try {
    const { name, businessName, phone, address } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (businessName) updateData.businessName = businessName;
    if (phone) updateData.phone = phone;
    if (address) updateData.address = address;

    const seller = await Seller.findByIdAndUpdate(req.seller.id, updateData, {
      new: true,
      runValidators: true,
    }).select("-password");

    return res.json({ success: true, seller });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};
