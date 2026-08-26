require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("./models/User");
const Department = require("./models/Department");
const Complaint = require("./models/Complaint");
const Notification = require("./models/Notification");
const Feedback = require("./models/Feedback");

async function testPhase1() {
  console.log("==========================================");
  console.log("       CivicAI Phase 1 Verification       ");
  console.log("==========================================");

  try {
    // 1. Database connection check
    console.log("[*] Connecting to database using MONGO_URI...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("[+] Connected to database successfully.");

    // 2. Clean up test records
    console.log("[*] Cleaning up existing test records...");
    await User.deleteMany({ email: /@test-phase1\.ai$/ });
    await Department.deleteMany({ departmentName: /^Test Department/ });
    await Complaint.deleteMany({ title: /^Test Complaint/ });

    // 3. User validation test
    console.log("[*] Creating a test Citizen user...");
    const citizenPassword = await bcrypt.hash("password123", 10);
    const testCitizen = await User.create({
      name: "Alice Tester",
      email: "alice@test-phase1.ai",
      password: citizenPassword,
      phone: "+1-800-555-9999",
      role: "citizen",
      address: "123 Testing Lane",
      ward: "Ward 12"
    });
    console.log(`[+] Citizen user created: ${testCitizen.name} (${testCitizen.email})`);

    // 4. Department validation test
    console.log("[*] Creating a test Department...");
    const testDept = await Department.create({
      departmentName: "Test Department of Infrastructure",
      description: "Handles infrastructure verification tests.",
      issueCategories: ["Pothole / Road Damage", "Streetlight Problem"],
      contactEmail: "infra-test@test-phase1.ai"
    });
    console.log(`[+] Department created: ${testDept.departmentName}`);

    // 5. Complaint validation test
    console.log("[*] Creating a test Complaint...");
    const testComplaint = await Complaint.create({
      complaintId: "GRV-2026-TEST9",
      citizenId: testCitizen._id,
      title: "Test Complaint: Pothole at Gate 4",
      description: "A minor pothole detected near the main gate.",
      location: {
        latitude: 12.97,
        longitude: 77.59,
        address: "Gate 4, Test University campus",
        ward: "Ward 12"
      },
      citizenCategory: "Pothole / Road Damage",
      status: "Submitted"
    });
    console.log(`[+] Complaint created with ID: ${testComplaint.complaintId}`);

    // 6. JWT token generation check
    console.log("[*] Verifying JWT token generation...");
    const token = jwt.sign(
      { id: testCitizen._id, role: testCitizen.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    console.log(`[+] JWT Token generated: ${token.substring(0, 30)}...`);

    // 7. JWT token decoding check
    console.log("[*] Verifying JWT token decoding...");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.id === testCitizen._id.toString() && decoded.role === "citizen") {
      console.log("[+] JWT token successfully decoded and verified.");
    } else {
      throw new Error("JWT token mismatch on decoding.");
    }

    console.log("\n==========================================");
    console.log("      [OK] Phase 1 Verification Success   ");
    console.log("==========================================");
  } catch (error) {
    console.error("\n[-] Phase 1 Verification Failure:");
    console.error(error);
  } finally {
    await mongoose.connection.close();
    console.log("[*] Database connection closed.");
  }
}

testPhase1();
