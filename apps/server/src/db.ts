import mongoose from 'mongoose';

export async function connectDB() {
  try {
    const mongoURI = process.env.MONGODB_URI;
    if (!mongoURI) {
      throw new Error("MONGODB_URI is missing");
    }
    await mongoose.connect(mongoURI);
    console.log("MONGODB connecte successfully");
  } catch (err: any) {
    console.error("MONGODB connection failed", err.message);
    process.exit(1);
  }
}