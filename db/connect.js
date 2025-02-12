const mongoose = require("mongoose");
const dns = require("dns");

// Set up alternative DNS servers
dns.setServers([
  "8.8.8.8", // Google DNS
  "1.1.1.1", // Cloudflare DNS
]);

mongoose.set("strictQuery", false);

const connectDB = async (url) => {
  try {
    const conn = await mongoose.connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      retryWrites: true,
      w: "majority",
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error("MongoDB connection error:", error);
    // Retry connection after 5 seconds
    console.log("Retrying connection in 5 seconds...");
    await new Promise((resolve) => setTimeout(resolve, 5000));
    return connectDB(url);
  }
};

module.exports = connectDB;
