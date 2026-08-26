const express = require("express");
const {
  createStaff,
  getStaff,
  getDepartmentComplaints,
  assignComplaint,
  verifyResolution,
  getStaffTasks,
  updateTaskStatus,
  submitResolution
} = require("../controllers/staffController");

const { protect, authorize } = require("../middleware/auth");
const upload = require("../middleware/upload");

const router = express.Router();

// Admin creates staff
router.post("/", protect, authorize("admin"), createStaff);

// Admin and Department Head can view staff
router.get("/", protect, authorize("admin", "department_head"), getStaff);

// ==========================================
// Phase 6: Department Head Routes
// ==========================================
router.get("/department/complaints", protect, getDepartmentComplaints);
router.put("/department/complaint/:id/assign", protect, assignComplaint);
router.put("/department/complaint/:id/verify", protect, verifyResolution);

// ==========================================
// Phase 6: Staff Routes
// ==========================================
router.get("/tasks", protect, getStaffTasks);
router.put("/task/:id/status", protect, updateTaskStatus);
router.put("/task/:id/resolve", protect, upload.single("afterImage"), submitResolution);

module.exports = router;