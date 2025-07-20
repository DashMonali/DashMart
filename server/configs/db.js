import mongoose from "mongoose";

const connectDB = async () => {
  try {
    mongoose.connection.on("connected", () =>
      console.log("✅ Database Connected Successfully")
    );
    await mongoose.connect(process.env.MONGODB_URI);
  } catch (error) {
    console.error("❌ Database Connection Failed:", error.message);
  }
};

export default connectDB;
