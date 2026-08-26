const connectDB = require("../config/database");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
require("dotenv").config();

(async () => {
  try {
    await connectDB();
    const hash = await bcrypt.hash("password123", 10);
    const emails = [
      "admin@civic.ai",
      "head.roads@civic.ai",
      "staff.roads@civic.ai",
      "head.sanitation@civic.ai",
      "staff.sanitation@civic.ai",
      "head.water@civic.ai",
      "staff.water@civic.ai",
      "head.drainage@civic.ai",
      "staff.drainage@civic.ai",
      "head.electrical@civic.ai",
      "staff.electrical@civic.ai",
      "head.parks@civic.ai",
      "staff.parks@civic.ai",
      "head.health@civic.ai",
      "staff.health@civic.ai",
      "citizen@civic.ai",
      "priya@civic.ai",
      "arun@gmail.com",
      "arun15.11.2006@gmail.com",
      "arunp.24cse@kongu.edu",
    ];

    for (const email of emails) {
      const u = await User.findOne({ email });
      if (u) {
        u.password = hash;
        await u.save();
        console.log(`[+] Reset password for ${u.role}: ${email}`);
      } else {
        console.log(`[-] User not found: ${email}`);
      }
    }

    console.log("All accounts password verified with password123!");
    process.exit(0);
  } catch (err) {
    console.error("Error resetting passwords:", err);
    process.exit(1);
  }
})();
