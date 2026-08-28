const mongoose = require("mongoose");
const Complaint = require("../models/Complaint");
const User = require("../models/User");
const Department = require("../models/Department");
const { Corporation, Zone, Ward, Locality, Street } = require("../models/Location");
const { runAIPipelineInternal, validateCivicContent } = require("./aiController");
const path = require("path");
const fs = require("fs");

// Helper to safely convert string to valid MongoDB ObjectId or null
const toValidObjectId = (val) => {
  if (!val || val === "null" || val === "undefined" || val === "") return null;
  return mongoose.Types.ObjectId.isValid(val) ? val : null;
};

// Helper to generate unique complaintId: GRV-2026-XXXXX
const generateComplaintId = () => {
  const randomNum = Math.floor(10000 + Math.random() * 90000);
  return `GRV-2026-${randomNum}`;
};

// Helper: category-specific fallback image
const getCategoryFallbackImage = (category = "") => {
  const cat = (category || "").toLowerCase();
  if (cat.includes("water") || cat.includes("leak") || cat.includes("pipe") || cat.includes("குடிநீர்") || cat.includes("தண்ணீர்")) {
    return "https://images.unsplash.com/photo-1585672840542-a89e6e8e89fe?w=800&q=80"; // Water leakage
  }
  if (cat.includes("garb") || cat.includes("waste") || cat.includes("trash") || cat.includes("dump") || cat.includes("குப்பை")) {
    return "https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=800&q=80"; // Garbage dump
  }
  if (cat.includes("drain") || cat.includes("sewer") || cat.includes("manhole") || cat.includes("சாக்கடை")) {
    return "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800&q=80"; // Drainage problem
  }
  if (cat.includes("light") || cat.includes("lamp") || cat.includes("electric") || cat.includes("மின்")) {
    return "https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=800&q=80"; // Streetlight
  }
  return "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&q=80"; // Pothole / Road damage
};

// Helper: resolve afterImage / beforeImage to a publicly accessible URL or data URI
const resolveImageUrl = (rawPath, category = "") => {
  if (!rawPath) return getCategoryFallbackImage(category);
  if (rawPath.startsWith("data:image/") || rawPath.startsWith("http://") || rawPath.startsWith("https://")) {
    return rawPath;
  }
  const filename = rawPath.replace(/\\/g, "/").split("/").pop();
  const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
  return `${baseUrl}/uploads/${filename}`;
};

// @desc    Create a new civic complaint (Citizen) with automatic AI verification & deduplication
// @route   POST /api/complaints
// @access  Private/Citizen
const createComplaint = async (req, res) => {
  try {
    const {
      title,
      description,
      citizenCategory,
      latitude,
      longitude,
      address,
      ward,
      corporationId,
      zoneId,
      wardId,
      locality,
      street,
      specificLocation,
    } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: "Please provide grievance title and description.",
      });
    }

    // ── Pre-AI Inspection: Filter Out Unwanted / Non-Civic / Irrelevant Photos & Text ──
    const originalFilename = req.file ? req.file.originalname : "";
    const civicCheck = validateCivicContent(originalFilename, `${title} ${description}`, citizenCategory || "");
    if (!civicCheck.isValid) {
      if (req.file && fs.existsSync(req.file.path)) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (e) {}
      }
      return res.status(400).json({
        success: false,
        isUnwantedImage: true,
        reason: civicCheck.reason,
        message: civicCheck.message || "AI Verification Notice: Uploaded photo does not show a recognized civic issue.",
      });
    }

    let imageUrl = "";

    // Prioritize direct Base64 data URI from client, then multer req.file buffer, then fallback
    if (req.body.imageBase64 && req.body.imageBase64.startsWith("data:image/")) {
      imageUrl = req.body.imageBase64;
    } else if (req.file && fs.existsSync(req.file.path)) {
      try {
        const fileBuffer = fs.readFileSync(req.file.path);
        const mime = req.file.mimetype || "image/jpeg";
        imageUrl = `data:${mime};base64,${fileBuffer.toString("base64")}`;
      } catch (err) {
        imageUrl = resolveImageUrl(req.file.path, citizenCategory);
      }
    } else {
      // Dynamic category-based fallback
      imageUrl = getCategoryFallbackImage(citizenCategory);
    }

    const complaintId = generateComplaintId();

    // Construct full descriptive address if hierarchy is provided
    let computedAddress = address || "";
    if (!computedAddress) {
      const parts = [specificLocation, street, locality, ward].filter(Boolean);
      computedAddress = parts.length > 0 ? parts.join(", ") : "Greater Chennai Municipal Division";
    }

    const complaint = await Complaint.create({
      complaintId,
      citizenId: req.user._id,
      title,
      description,
      originalDescription: description,
      imageUrl,
      beforeImage: imageUrl,
      corporationId: toValidObjectId(corporationId),
      zoneId: toValidObjectId(zoneId),
      wardId: toValidObjectId(wardId),
      locality: locality || "",
      street: street || "",
      specificLocation: specificLocation || "",
      location: {
        latitude: parseFloat(latitude) || 13.0827,
        longitude: parseFloat(longitude) || 80.2707,
        address: computedAddress,
        ward: ward || "",
      },
      citizenCategory: citizenCategory || "Pothole / Road Damage",
      status: "Submitted",
    });

    // ── Run AI Pipeline Immediately (Vision + NLP Dept + Deduplication) ──
    const localFilePath = req.file ? req.file.path : null;
    await runAIPipelineInternal(complaint, localFilePath);

    // Populate citizen, department, staff, and location hierarchy fields safely
    const populateFields = [
      { path: "citizenId", select: "name email phone" },
      { path: "assignedDepartment", select: "departmentName contactEmail" },
      { path: "assignedStaff", select: "name email phone" },
    ];
    if (complaint.corporationId) populateFields.push({ path: "corporationId", select: "name code district state" });
    if (complaint.zoneId) populateFields.push({ path: "zoneId", select: "name zoneNumber code" });
    if (complaint.wardId) populateFields.push({ path: "wardId", select: "wardName wardNumber" });

    await complaint.populate(populateFields);

    res.status(201).json({
      success: true,
      message: "Grievance registered, geocoded, and AI verified successfully.",
      complaint,
    });
  } catch (error) {
    console.error("Create Complaint Error Type:", error.name);
    console.error("Create Complaint Error Message:", error.message);
    console.error("Create Complaint Error Stack:", error.stack);
    // Return descriptive message including field that caused the issue
    const userMsg = error.name === "ValidationError"
      ? `Validation failed: ${Object.values(error.errors || {}).map(e => e.message).join("; ")}`
      : error.message || "Failed to submit complaint.";
    res.status(500).json({
      success: false,
      message: userMsg,
    });
  }
};

// @desc    Get all complaints lodged by the logged-in citizen
// @route   GET /api/complaints/my
// @access  Private/Citizen
const getMyComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ citizenId: req.user._id })
      .populate("citizenId", "name email phone")
      .populate("assignedDepartment", "departmentName contactEmail")
      .populate("assignedStaff", "name email phone")
      .populate("corporationId", "name code")
      .populate("zoneId", "name zoneNumber")
      .populate("wardId", "wardName wardNumber")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: complaints.length,
      complaints,
    });
  } catch (error) {
    console.error("Get My Complaints Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve complaints.",
    });
  }
};

// @desc    Get single complaint by MongoDB _id
// @route   GET /api/complaints/:id
// @access  Private
const getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate("citizenId", "name email phone")
      .populate("assignedDepartment", "departmentName contactEmail")
      .populate("assignedStaff", "name email phone")
      .populate("corporationId", "name code district state")
      .populate("zoneId", "name zoneNumber code")
      .populate("wardId", "wardName wardNumber");

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Grievance complaint not found.",
      });
    }

    // Normalize image URLs before sending
    if (complaint.beforeImage) complaint.beforeImage = resolveImageUrl(complaint.beforeImage, complaint.aiCategory || complaint.citizenCategory);
    if (complaint.afterImage) complaint.afterImage = resolveImageUrl(complaint.afterImage, complaint.aiCategory || complaint.citizenCategory);
    if (complaint.imageUrl) complaint.imageUrl = resolveImageUrl(complaint.imageUrl, complaint.aiCategory || complaint.citizenCategory);

    res.status(200).json({
      success: true,
      complaint,
    });
  } catch (error) {
    console.error("Get Complaint By ID Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve complaint details.",
    });
  }
};

// @desc    Public tracking route (No authentication required)
// @route   GET /api/complaints/track/:complaintId
// @access  Public
const getGrievanceByReferenceId = async (req, res) => {
  try {
    const complaintId = req.params.complaintId.trim();
    const complaint = await Complaint.findOne({
      complaintId: { $regex: new RegExp("^" + complaintId + "$", "i") },
    })
      .populate("citizenId", "name email phone")
      .populate("assignedDepartment", "departmentName contactEmail")
      .populate("assignedStaff", "name email phone")
      .populate("corporationId", "name code district state")
      .populate("zoneId", "name zoneNumber code")
      .populate("wardId", "wardName wardNumber");

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: `Grievance reference ID '${complaintId}' was not found.`,
      });
    }

    res.status(200).json({
      success: true,
      complaint,
    });
  } catch (error) {
    console.error("Public Tracking Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Public tracking lookup failed.",
    });
  }
};

// @desc    Get complaints assigned to a department (dept head / admin)
// @route   GET /api/complaints/department
// @access  Private/DeptHead,Admin
const getDepartmentComplaints = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === "department_head") {
      const dept = await Department.findOne({ departmentHead: req.user._id });
      if (!dept) return res.status(200).json({ success: true, complaints: [] });
      query.assignedDepartment = dept._id;
    }
    const complaints = await Complaint.find(query)
      .populate("citizenId", "name email phone")
      .populate("assignedDepartment", "departmentName contactEmail")
      .populate("assignedStaff", "name email phone")
      .populate("corporationId", "name code")
      .populate("zoneId", "name")
      .populate("wardId", "wardName wardNumber")
      .sort({ priorityScore: -1, createdAt: -1 });

    res.status(200).json({ success: true, count: complaints.length, complaints });
  } catch (error) {
    console.error("Get Department Complaints Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get complaints assigned to this field staff member
// @route   GET /api/complaints/staff
// @access  Private/Staff
const getStaffComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ assignedStaff: req.user._id })
      .populate("citizenId", "name email phone")
      .populate("assignedDepartment", "departmentName")
      .populate("corporationId", "name")
      .populate("wardId", "wardName")
      .sort({ priorityScore: -1, createdAt: -1 });

    res.status(200).json({ success: true, count: complaints.length, complaints });
  } catch (error) {
    console.error("Get Staff Complaints Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Assign a complaint to a staff member
// @route   PUT /api/complaints/:id/assign
// @access  Private/DeptHead,Admin
const assignComplaint = async (req, res) => {
  try {
    const { staffId } = req.body;
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ success: false, message: "Complaint not found." });

    complaint.assignedStaff = staffId;
    complaint.status = "Assigned";
    await complaint.save();

    await complaint.populate("assignedStaff", "name email phone");

    res.status(200).json({ success: true, message: "Complaint assigned to field staff.", complaint });
  } catch (error) {
    console.error("Assign Complaint Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update complaint status (staff, dept head, admin)
// @route   PUT /api/complaints/:id/status
// @access  Private/Staff,DeptHead,Admin
const updateComplaintStatus = async (req, res) => {
  try {
    const { status, resolutionRemarks } = req.body;

    const validStatuses = [
      "Submitted", "AI Processing", "Verified", "Assigned",
      "In Progress", "Resolution Submitted", "Verification",
      "Resolved", "Citizen Confirmed", "Closed", "Rejected", "Duplicate",
    ];

    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: `Invalid status: ${status}` });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ success: false, message: "Complaint not found." });

    if (status) complaint.status = status;
    if (resolutionRemarks) complaint.resolutionRemarks = resolutionRemarks;

    // If staff uploads afterImage
    if (req.file && fs.existsSync(req.file.path)) {
      try {
        const fileBuffer = fs.readFileSync(req.file.path);
        const mime = req.file.mimetype || "image/jpeg";
        complaint.afterImage = `data:${mime};base64,${fileBuffer.toString("base64")}`;
      } catch (err) {
        complaint.afterImage = resolveImageUrl(req.file.path, complaint.aiCategory);
      }
    }

    await complaint.save();

    res.status(200).json({ success: true, message: `Status updated to '${complaint.status}'.`, complaint });
  } catch (error) {
    console.error("Update Status Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Citizen submits feedback after complaint is Resolved
// @route   POST /api/complaints/:id/feedback
// @access  Private/Citizen
const submitFeedback = async (req, res) => {
  try {
    const { rating, feedback } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: "Please provide a valid rating between 1 and 5." });
    }

    const complaint = await Complaint.findOne({ _id: req.params.id, citizenId: req.user._id });

    if (!complaint) {
      return res.status(404).json({ success: false, message: "Complaint not found." });
    }

    const feedbackAllowedStatuses = ["Resolved", "Citizen Confirmed", "Closed"];
    if (!feedbackAllowedStatuses.includes(complaint.status)) {
      return res.status(400).json({
        success: false,
        message: "Feedback can only be submitted after the complaint is marked as Resolved.",
      });
    }

    if (complaint.citizenConfirmation.isConfirmed) {
      return res.status(400).json({ success: false, message: "Feedback already submitted for this complaint." });
    }

    complaint.citizenConfirmation = {
      isConfirmed: true,
      feedback: feedback || "",
      rating: Number(rating),
      confirmedAt: new Date(),
    };
    complaint.status = "Citizen Confirmed";

    await complaint.save();

    return res.status(200).json({
      success: true,
      message: "Thank you for your feedback! Complaint confirmed as resolved.",
      complaint,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Clear all complaints from database (Admin / Reviewer reset)
// @route   DELETE /api/complaints/all / POST /api/complaints/clear-all
// @access  Public / Reviewer
const clearAllComplaints = async (req, res) => {
  try {
    const result = await Complaint.deleteMany({});
    console.log(`[+] Cleared all complaints. Deleted count: ${result.deletedCount}`);
    return res.status(200).json({
      success: true,
      message: `Successfully cleared all ${result.deletedCount} grievance complaints.`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Clear Complaints Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createComplaint,
  getMyComplaints,
  getComplaintById,
  getGrievanceByReferenceId,
  getDepartmentComplaints,
  getStaffComplaints,
  assignComplaint,
  updateComplaintStatus,
  submitFeedback,
  clearAllComplaints,
};