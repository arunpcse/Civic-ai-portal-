const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error(
        "[-] ERROR: MONGO_URI environment variable is missing! Please configure MONGO_URI in your Render / hosting environment variables dashboard."
      );
      return;
    }
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`[+] MongoDB Atlas Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[-] MongoDB Connection Failure: ${error.message}`);
  }
};

module.exports = connectDB;