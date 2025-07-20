import jwt from "jsonwebtoken";
import Seller from "../models/Seller.js";

export const sellerAuth = async (req, res, next) => {
  try {
    const token = req.cookies.sellerToken;

    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "Access denied. No token provided." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if it's a seller token
    if (decoded.type !== "seller") {
      return res
        .status(401)
        .json({ success: false, message: "Invalid token type." });
    }

    const seller = await Seller.findById(decoded.id).select("-password");

    if (!seller) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid token." });
    }

    if (!seller.isActive) {
      return res
        .status(401)
        .json({ success: false, message: "Account is deactivated." });
    }

    req.seller = seller;
    next();
  } catch (error) {
    console.log(error.message);
    res.status(401).json({ success: false, message: "Invalid token." });
  }
};
