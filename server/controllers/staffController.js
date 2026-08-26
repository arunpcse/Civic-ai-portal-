const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Department = require("../models/Department");

// Create staff
const createStaff = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      employeeId,
      department,
      role,
    } = req.body;

    if (
      !name ||
      !email ||
      !password ||
      !employeeId ||
      !department
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Name, email, password, employeeId and department are required",
      });
    }

    const existingUser = await User.findOne({
      $or: [{ email }, { employeeId }],
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email or employee ID already exists",
      });
    }

    const departmentExists = await Department.findById(department);

    if (!departmentExists) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      employeeId,
      department,
      role: role || "staff",
    });

    res.status(201).json({
      success: true,
      message: "Staff account created successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        employeeId: user.employeeId,
        role: user.role,
        department: user.department,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all staff
const getStaff = async (req, res) => {
  try {
    const staff = await User.find({
      role: { $in: ["staff", "department_head"] },
    })
      .select("-password")
      .populate("department", "name");

    res.json({
      success: true,
      count: staff.length,
      staff,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// DEPARTMENT HEAD ROUTES
// ==========================================
const Complaint = require("../models/Complaint");

const getDepartmentComplaints = async (req, res) => {
  try {
    const department = await Department.findOne({ departmentHead: req.user._id });
    if (!department) {
      return res.status(404).json({ success: false, message: "No department found for this head." });
    }

    const complaints = await Complaint.find({ assignedDepartment: department._id })
      .populate("citizenId", "name email phone")
      .populate("assignedStaff", "name email phone")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: complaints.length, complaints });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const assignComplaint = async (req, res) => {
  try {
    const { staffId } = req.body;
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) return res.status(404).json({ success: false, message: "Complaint not found" });

    complaint.assignedStaff = staffId;
    complaint.status = "Assigned";
    await complaint.save();
    await complaint.populate("assignedStaff", "name email phone");

    res.status(200).json({ success: true, message: "Complaint assigned", complaint });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const verifyResolution = async (req, res) => {
  try {
    const { action, feedback } = req.body;
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) return res.status(404).json({ success: false, message: "Complaint not found" });

    if (action === "Approve") {
      complaint.status = "Resolved";
    } else {
      complaint.status = "In Progress"; 
    }
    await complaint.save();
    res.status(200).json({ success: true, message: `Resolution ${action}`, complaint });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// STAFF ROUTES
// ==========================================
const getStaffTasks = async (req, res) => {
  try {
    const tasks = await Complaint.find({ assignedStaff: req.user._id })
      .populate("citizenId", "name email phone")
      .populate("assignedDepartment", "departmentName")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: tasks.length, tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const complaint = await Complaint.findOne({ _id: req.params.id, assignedStaff: req.user._id });

    if (!complaint) return res.status(404).json({ success: false, message: "Task not found" });

    complaint.status = status;
    await complaint.save();
    res.status(200).json({ success: true, message: "Task status updated", complaint });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const submitResolution = async (req, res) => {
  try {
    const { resolutionRemarks } = req.body;
    const complaint = await Complaint.findOne({ _id: req.params.id, assignedStaff: req.user._id });

    if (!complaint) return res.status(404).json({ success: false, message: "Task not found" });

    complaint.resolutionRemarks = resolutionRemarks || complaint.resolutionRemarks;
    if (req.file) complaint.afterImage = req.file.path;
    complaint.status = "Resolution Submitted";
    await complaint.save();

    res.status(200).json({ success: true, message: "Resolution submitted", complaint });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createStaff,
  getStaff,
  getDepartmentComplaints,
  assignComplaint,
  verifyResolution,
  getStaffTasks,
  updateTaskStatus,
  submitResolution
};