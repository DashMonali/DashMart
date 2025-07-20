import cloudinary from "./configs/cloudinary.js";
import "dotenv/config";

console.log("Testing Cloudinary Configuration...");
console.log("Cloud Name:", process.env.CLOUDINARY_CLOUD_NAME);
console.log("API Key:", process.env.CLOUDINARY_API_KEY ? "Set" : "Not Set");
console.log(
  "API Secret:",
  process.env.CLOUDINARY_API_SECRET ? "Set" : "Not Set"
);

// Test basic configuration
try {
  const result = await cloudinary.api.ping();
  console.log("✅ Cloudinary connection successful!");
  console.log("Response:", result);
} catch (error) {
  console.log("❌ Cloudinary connection failed!");
  console.log("Error:", error.message);
  console.log("Please check your credentials in .env file");
}
