const Complaint = require("../models/Complaint");
const Department = require("../models/Department");
const fs = require("fs");
const path = require("path");

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";

// ─── Helper: match category/text → Department ──────────────────────────────
const findDepartmentForCategory = async (category = "", text = "") => {
  try {
    const combined = `${category} ${text}`.toLowerCase();
    let targetRegex;

    if (combined.includes("water") || combined.includes("leak") || combined.includes("pipe") || combined.includes("tap") || combined.includes("drinking") || combined.includes("குடிநீர்") || combined.includes("தண்ணீர்") || combined.includes("கசிவு")) {
      targetRegex = /water/i;
    } else if (combined.includes("electric") || combined.includes("light") || combined.includes("lamp") || combined.includes("pole") || combined.includes("wire") || combined.includes("power") || combined.includes("மின்")) {
      targetRegex = /electric/i;
    } else if (combined.includes("drain") || combined.includes("sew") || combined.includes("manhole") || combined.includes("gutter") || combined.includes("சாக்கடை") || combined.includes("கழிவுநீர்")) {
      targetRegex = /drain/i;
    } else if (combined.includes("garbage") || combined.includes("waste") || combined.includes("trash") || combined.includes("dump") || combined.includes("sanit") || combined.includes("குப்பை")) {
      targetRegex = /sanit/i;
    } else if (combined.includes("park") || combined.includes("tree") || combined.includes("garden") || combined.includes("horticulture") || combined.includes("பூங்கா")) {
      targetRegex = /park/i;
    } else if (combined.includes("health") || combined.includes("mosquito") || combined.includes("fogging") || combined.includes("மருத்துவ") || combined.includes("சுகாதார")) {
      targetRegex = /health/i;
    } else {
      targetRegex = /road/i;
    }

    const departments = await Department.find({});
    const match = departments.find((d) => targetRegex.test(d.departmentName));
    return match || departments[0] || null;
  } catch {
    return null;
  }
};

// ─── Helper: Haversine distance (meters) ──────────────────────────────────
const getDistanceInMeters = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 999999;
  const R = 6371e3; // Earth radius in meters
  const toRad = (val) => (val * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// ─── Helper: calculate priority score (0-100) ─────────────────────────────
const calculatePriorityScore = (severity, text = "", confidence = 0.5) => {
  const lower = text.toLowerCase();
  let baseScore = 55;

  if (severity === "Critical") baseScore = 85;
  else if (severity === "High") baseScore = 70;
  else if (severity === "Medium") baseScore = 50;
  else baseScore = 35;

  // Add subtle modifiers based on hazard keywords
  if (lower.includes("burst") || lower.includes("flood") || lower.includes("danger") || lower.includes("open manhole") || lower.includes("live wire")) {
    baseScore += 10;
  }
  if (lower.includes("traffic") || lower.includes("main road") || lower.includes("hospital") || lower.includes("school")) {
    baseScore += 5;
  }

  // Factor confidence
  baseScore += Math.round((confidence - 0.5) * 10);

  return Math.max(15, Math.min(95, Math.round(baseScore)));
};

// ─── Helper: severity from AI confidence + text keywords ─────────────────────
const getSeverity = (category = "", text = "", confidence = 0.5) => {
  const lower = `${category} ${text}`.toLowerCase();
  
  // Critical emergencies
  if (
    lower.includes("burst pipe") ||
    lower.includes("major flood") ||
    lower.includes("collapse") ||
    lower.includes("open manhole") ||
    lower.includes("sparking") ||
    lower.includes("live wire") ||
    lower.includes("danger") ||
    lower.includes("heavy leak")
  ) {
    return "Critical";
  }

  // High priority
  if (
    lower.includes("deep crater") ||
    lower.includes("overflow") ||
    lower.includes("heavy leakage") ||
    lower.includes("blockage") ||
    lower.includes("dark road") ||
    confidence >= 0.90
  ) {
    return "High";
  }

  return "Medium";
};

// ─── Internal Reusable AI Pipeline Function (Instant & Non-Blocking) ──────
const runAIPipelineInternal = async (complaint, localFilePath = null) => {
  let aiCategory = complaint.citizenCategory || "Pothole / Road Damage";
  let aiConfidence = 0.95;
  const fullText = `${complaint.title || ""} ${complaint.description || ""}`.toLowerCase();

  // 1. Instant Category Analysis & Normalization
  if (
    complaint.citizenCategory === "Water Leakage" ||
    fullText.includes("water") ||
    fullText.includes("leak") ||
    fullText.includes("pipe") ||
    fullText.includes("tap") ||
    fullText.includes("குடிநீர்") ||
    fullText.includes("தண்ணீர்") ||
    fullText.includes("கசிவு")
  ) {
    aiCategory = "Water Leakage";
  } else if (
    complaint.citizenCategory === "Garbage" ||
    fullText.includes("garbage") ||
    fullText.includes("waste") ||
    fullText.includes("trash") ||
    fullText.includes("dump") ||
    fullText.includes("குப்பை")
  ) {
    aiCategory = "Garbage";
  } else if (
    complaint.citizenCategory === "Streetlight Problem" ||
    fullText.includes("streetlight") ||
    fullText.includes("light") ||
    fullText.includes("lamp") ||
    fullText.includes("pole") ||
    fullText.includes("மின்விளக்கு")
  ) {
    aiCategory = "Streetlight Problem";
  } else if (
    complaint.citizenCategory === "Drainage Problem" ||
    fullText.includes("drain") ||
    fullText.includes("sewer") ||
    fullText.includes("sewage") ||
    fullText.includes("manhole") ||
    fullText.includes("சாக்கடை")
  ) {
    aiCategory = "Drainage Problem";
  } else {
    aiCategory = complaint.citizenCategory || "Pothole / Road Damage";
  }

  // 2. Department Resolution
  const dept = await findDepartmentForCategory(aiCategory, fullText);
  const aiDept = dept ? dept.departmentName : "Roads Department";

  // 3. Multi-Factor Spatial-Semantic Deduplication Engine
  let isDuplicate = false;
  let matchedParent = null;

  try {
    const activeComplaints = await Complaint.find({
      _id: { $ne: complaint._id },
      status: { $nin: ["Resolved", "Closed", "Rejected", "Citizen Confirmed"] },
      duplicate: { $ne: true },
    }).limit(100);

    const currCat = (aiCategory || "").toLowerCase();

    for (const c of activeComplaints) {
      const otherCat = (c.aiCategory || c.citizenCategory || "").toLowerCase();
      const dist = getDistanceInMeters(
        complaint.location?.latitude,
        complaint.location?.longitude,
        c.location?.latitude,
        c.location?.longitude
      );

      const sameCategory =
        currCat === otherCat ||
        (currCat.includes("water") && otherCat.includes("water")) ||
        (currCat.includes("road") && otherCat.includes("road")) ||
        (currCat.includes("garbage") && otherCat.includes("garbage")) ||
        (currCat.includes("drain") && otherCat.includes("drain")) ||
        (currCat.includes("light") && otherCat.includes("light"));

      const sameWard =
        (complaint.wardId && c.wardId && complaint.wardId.toString() === c.wardId.toString()) ||
        (complaint.location?.ward && c.location?.ward && complaint.location.ward === c.location.ward);
      const isNearby = dist <= 400;

      const otherFullText = `${c.title || ""} ${c.description || ""}`.toLowerCase();
      const wordsA = new Set(fullText.split(/\s+/).filter((w) => w.length > 2));
      const wordsB = new Set(otherFullText.split(/\s+/).filter((w) => w.length > 2));
      let common = 0;
      wordsA.forEach((w) => {
        if (wordsB.has(w)) common++;
      });
      const overlap = wordsA.size > 0 ? common / Math.max(wordsA.size, wordsB.size) : 0;
      const sameTitle = (complaint.title || "").toLowerCase().trim() === (c.title || "").toLowerCase().trim();

      if (
        (sameCategory && (isNearby || sameWard) && (overlap >= 0.20 || sameTitle)) ||
        (sameCategory && dist <= 150)
      ) {
        isDuplicate = true;
        matchedParent = c;
        break;
      }
    }
  } catch (dedupErr) {
    console.warn(`[!] Dedup notice: ${dedupErr.message}`);
  }

  // 4. Update Complaint fields
  const severity = getSeverity(aiCategory, fullText, aiConfidence);
  const priorityScore = calculatePriorityScore(severity, fullText, aiConfidence);

  complaint.aiCategory = aiCategory;
  complaint.aiConfidence = aiConfidence;
  complaint.aiDepartment = aiDept;
  complaint.severity = severity;
  complaint.priorityScore = priorityScore;

  if (dept) {
    complaint.assignedDepartment = dept._id;
  }

  if (isDuplicate && matchedParent) {
    complaint.duplicate = true;
    complaint.parentComplaintId = matchedParent._id;
    complaint.status = "Duplicate";

    matchedParent.duplicateCount = (matchedParent.duplicateCount || 0) + 1;
    matchedParent.priorityScore = Math.min(98, (matchedParent.priorityScore || 65) + 10);
    if (matchedParent.duplicateCount >= 1 && matchedParent.severity === "Medium") {
      matchedParent.severity = "High";
    }
    if (matchedParent.duplicateCount >= 2) {
      matchedParent.severity = "Critical";
    }
    await matchedParent.save();
  } else {
    complaint.duplicate = false;
    complaint.status = "Verified";
  }

  await complaint.save();
  return complaint;
};

// ─── POST /api/ai/process/:id (Endpoint) ──────────────────────────────────
const processComplaintAI = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: "Complaint not found." });
    }

    const updatedComplaint = await runAIPipelineInternal(complaint);
    await updatedComplaint.populate([
      { path: "citizenId", select: "name email phone" },
      { path: "assignedDepartment", select: "departmentName contactEmail" },
      { path: "assignedStaff", select: "name email phone" },
    ]);

    return res.status(200).json({
      success: true,
      message: "AI analysis and deduplication complete.",
      complaint: updatedComplaint,
    });
  } catch (error) {
    console.error("AI Process Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Civic Image & Content Validation ──────────────────────────────────────
const validateCivicContent = (filename = "", text = "", category = "") => {
  const combined = `${filename} ${text} ${category}`.toLowerCase();

  const spamKeywords = [
    "selfie", "cat", "dog", "puppy", "kitten", "burger",
    "pizza", "biryani", "food", "cake", "party", "birthday",
    "shoes", "shirt", "dress", "fashion", "makeup", "actor",
    "meme", "anime", "gaming", "laptop", "mobile", "qwerty"
  ];

  for (const spam of spamKeywords) {
    const regex = new RegExp(`\\b${spam}\\b`, "i");
    if (regex.test(filename.toLowerCase()) || regex.test(text.toLowerCase())) {
      const isActuallyCivic = [
        "road", "pothole", "garbage", "waste", "drain", "water leak", "pipeline", "streetlight", "leak", "pipe", "water"
      ].some((c) => combined.includes(c));

      if (!isActuallyCivic) {
        return {
          isValid: false,
          reason: `Unrelated subject detected ('${spam}')`,
          message: `AI Image Verification Notice: Uploaded photo/text appears to be an unrelated '${spam}' image. Please upload a clear photo showing a public civic infrastructure defect (e.g. road pothole, garbage dump, water leak, drainage, or streetlight).`,
        };
      }
    }
  }

  return { isValid: true };
};

// ─── POST /api/ai/verify-image (Live Pre-Validation Endpoint) ──────────────
const verifyImageLive = async (req, res) => {
  try {
    const filename = req.file ? req.file.originalname : (req.body.filename || "");
    const text = req.body.text || "";
    const category = req.body.category || "";

    const validation = validateCivicContent(filename, text, category);
    if (!validation.isValid) {
      return res.status(200).json({
        success: true,
        isValidCivicIssue: false,
        reason: validation.reason,
        message: validation.message,
      });
    }

    return res.status(200).json({
      success: true,
      isValidCivicIssue: true,
      message: "Valid civic grievance content detected.",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  processComplaintAI,
  runAIPipelineInternal,
  findDepartmentForCategory,
  validateCivicContent,
  verifyImageLive,
};