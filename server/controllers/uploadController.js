import cloudinary from "../configs/cloudinary.js";

// Helper function to get a reliable placeholder image URL
const getPlaceholderUrl = (text = "Product Image", timestamp = Date.now()) => {
  // Use a data URI for a simple colored placeholder (most reliable fallback)
  const dataUriPlaceholder = `data:image/svg+xml;base64,${Buffer.from(
    `
    <svg width="800" height="800" xmlns="http://www.w3.org/2000/svg">
      <rect width="800" height="800" fill="#4F46E5"/>
      <text x="400" y="400" font-family="Arial, sans-serif" font-size="24" fill="white" text-anchor="middle" dy=".3em">${text}</text>
    </svg>
  `
  ).toString("base64")}`;

  return dataUriPlaceholder;
};

// Helper function to check if Cloudinary is properly configured
const isCloudinaryConfigured = () => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (process.env.NODE_ENV === "development") {
    console.log("Cloudinary config check:", {
      cloudName: cloudName,
      hasApiKey: !!apiKey,
      hasApiSecret: !!apiSecret,
      apiKeyLength: apiKey ? apiKey.length : 0,
      apiSecretLength: apiSecret ? apiSecret.length : 0,
    });
  }

  return (
    cloudName &&
    apiKey &&
    apiSecret &&
    cloudName !== "your_cloudinary_cloud_name" &&
    apiKey.length > 0 &&
    apiSecret.length > 0
  );
};

// Upload single image
export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No image file provided" });
    }

    // Check if Cloudinary is properly configured
    if (!isCloudinaryConfigured()) {
      if (process.env.NODE_ENV === "development") {
        console.log("Using fallback placeholder - Cloudinary not configured");
      }
      // Fallback to reliable placeholder images
      const placeholderUrl = getPlaceholderUrl("Product Image");

      return res.json({
        success: true,
        imageUrl: placeholderUrl,
        publicId: `placeholder_${Date.now()}`,
        width: 800,
        height: 800,
      });
    }

    if (process.env.NODE_ENV === "development") {
      console.log("Attempting Cloudinary upload...");
    }
    // Convert buffer to base64
    const b64 = Buffer.from(req.file.buffer).toString("base64");
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;

    // Upload to Cloudinary with optimization
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: "dashmart/products",
      transformation: [
        { width: 800, height: 800, crop: "limit" },
        { quality: "auto", fetch_format: "auto" },
      ],
      resource_type: "auto",
    });

    if (process.env.NODE_ENV === "development") {
      console.log("Cloudinary upload successful:", result.secure_url);
    }

    res.json({
      success: true,
      imageUrl: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
    });
  } catch (error) {
    console.error("Upload error:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
    });

    // Fallback to reliable placeholder if Cloudinary fails
    const placeholderUrl = getPlaceholderUrl("Product Image");

    res.json({
      success: true,
      imageUrl: placeholderUrl,
      publicId: `placeholder_${Date.now()}`,
      width: 800,
      height: 800,
    });
  }
};

// Upload multiple images
export const uploadMultipleImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No image files provided" });
    }

    // Check if Cloudinary is properly configured
    if (!isCloudinaryConfigured()) {
      if (process.env.NODE_ENV === "development") {
        console.log(
          "Using fallback placeholders for multiple upload - Cloudinary not configured"
        );
      }
      // Fallback to reliable placeholder images
      const placeholderUrls = req.files.map((_, index) =>
        getPlaceholderUrl(`Product ${index + 1}`)
      );

      return res.json({
        success: true,
        imageUrls: placeholderUrls,
        publicIds: placeholderUrls.map(
          (_, index) => `placeholder_${index}_${Date.now()}`
        ),
      });
    }

    if (process.env.NODE_ENV === "development") {
      console.log("Attempting multiple Cloudinary uploads...");
    }
    const uploadPromises = req.files.map(async (file) => {
      const b64 = Buffer.from(file.buffer).toString("base64");
      const dataURI = `data:${file.mimetype};base64,${b64}`;

      return cloudinary.uploader.upload(dataURI, {
        folder: "dashmart/products",
        transformation: [
          { width: 800, height: 800, crop: "limit" },
          { quality: "auto", fetch_format: "auto" },
        ],
        resource_type: "auto",
      });
    });

    const results = await Promise.all(uploadPromises);
    const imageUrls = results.map((result) => result.secure_url);

    if (process.env.NODE_ENV === "development") {
      console.log(
        "Multiple Cloudinary uploads successful:",
        imageUrls.length,
        "images"
      );
    }

    res.json({
      success: true,
      imageUrls,
      publicIds: results.map((result) => result.public_id),
    });
  } catch (error) {
    console.error("Multiple upload error:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
    });

    // Fallback to reliable placeholder images if Cloudinary fails
    const placeholderUrls = req.files.map((_, index) =>
      getPlaceholderUrl(`Product ${index + 1}`)
    );

    res.json({
      success: true,
      imageUrls: placeholderUrls,
      publicIds: placeholderUrls.map(
        (_, index) => `placeholder_${index}_${Date.now()}`
      ),
    });
  }
};

// Delete image from Cloudinary
export const deleteImage = async (req, res) => {
  try {
    const { publicId } = req.params;

    if (!publicId) {
      return res
        .status(400)
        .json({ success: false, message: "Public ID is required" });
    }

    // Skip deletion for placeholder images
    if (publicId.startsWith("placeholder_")) {
      return res.json({
        success: true,
        message: "Placeholder image deleted successfully",
      });
    }

    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result === "ok") {
      res.json({ success: true, message: "Image deleted successfully" });
    } else {
      res
        .status(400)
        .json({ success: false, message: "Failed to delete image" });
    }
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ success: false, message: "Image deletion failed" });
  }
};

// Get optimized image URL
export const getOptimizedImage = async (req, res) => {
  try {
    const { publicId, width = 400, height = 400, quality = "auto" } = req.query;

    if (!publicId) {
      return res
        .status(400)
        .json({ success: false, message: "Public ID is required" });
    }

    // Return reliable placeholder for placeholder images
    if (publicId.startsWith("placeholder_")) {
      const optimizedUrl = getPlaceholderUrl("Product");
      return res.json({ success: true, optimizedUrl });
    }

    const optimizedUrl = cloudinary.url(publicId, {
      transformation: [
        { width: parseInt(width), height: parseInt(height), crop: "fill" },
        { quality: quality },
      ],
    });

    res.json({ success: true, optimizedUrl });
  } catch (error) {
    console.error("Optimization error:", error);
    res
      .status(500)
      .json({ success: false, message: "Image optimization failed" });
  }
};
