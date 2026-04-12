import mongoose from "mongoose";
import dns from "dns";

// Local/router DNS often can't resolve MongoDB Atlas SRV records.
// This forces Node.js to use Google DNS just for this process.
dns.setServers(["8.8.8.8", "8.8.4.4"]);

// Function to establish connection with MongoDB
const connectDB = async () => {
  try {
    // mongoose.connect() returns a connection object

    const conn = await mongoose.connect(process.env.MONGO_URI as string);

    // If connection is successful, log the host (cluster URL)
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error: any) {
    console.error("MongoDB connection failed");
    console.error(error.message);
    process.exit(1);
  }
};

export default connectDB;
