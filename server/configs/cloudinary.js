import { v2 as cloudinary } from "cloudinary";

let isConfigured = false;

// Function to configure Cloudinary with validation
const configureCloudinary = () => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (process.env.NODE_ENV === "development") {
    console.log("Cloudinary configuration check:", {
      cloudName: cloudName,
      apiKey: apiKey ? `${apiKey.substring(0, 4)}...` : "undefined",
      apiSecret: apiSecret ? `${apiSecret.substring(0, 4)}...` : "undefined",
    });
  }

  if (!cloudName || !apiKey || !apiSecret) {
    console.error("Cloudinary configuration incomplete. Missing:", {
      cloudName: !cloudName,
      apiKey: !apiKey,
      apiSecret: !apiSecret,
    });
    isConfigured = false;
    return false;
  }

  try {
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    });
    if (process.env.NODE_ENV === "development") {
      console.log("Cloudinary configured successfully");
    }
    isConfigured = true;
    return true;
  } catch (error) {
    console.error("Error configuring Cloudinary:", error);
    isConfigured = false;
    return false;
  }
};

// Export the configuration function and a getter for the configured instance
export { configureCloudinary };
export default cloudinary;
