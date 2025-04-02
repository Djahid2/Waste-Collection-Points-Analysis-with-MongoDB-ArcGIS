import dotenv from "dotenv";
import { connect } from "mongoose";

dotenv.config();

const connectDB = async () => {
  try {
    await connect(process.env.MONGODB_URI);
    console.log("MongoDB Connected...");
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

export default connectDB;