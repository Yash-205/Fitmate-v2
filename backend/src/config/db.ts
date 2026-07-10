import mongoose from "mongoose";
import dns from "dns";

// Local/router DNS often can't resolve MongoDB Atlas SRV records.
// This forces Node.js to use Google DNS just for this process.
dns.setServers(["8.8.8.8", "8.8.4.4"]);

// Function to establish connection with MongoDB
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI as string;
    const dbName = process.env.TEST_DB_NAME || (process.env.NODE_ENV === "test" ? "fitmate-test" : undefined);

    const conn = await mongoose.connect(mongoUri, { dbName });

    console.log(`MongoDB Connected: ${conn.connection.host}${dbName ? ` (Database: ${dbName})` : ""}`);
  } catch (error: any) {
    console.error("MongoDB connection failed");
    console.error(error.message);
    process.exit(1);
  }
};

export default connectDB;
