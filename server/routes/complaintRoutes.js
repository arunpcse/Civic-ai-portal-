const express = require("express");

const router = express.Router();

const {
  createComplaint,
  getGrievanceByReferenceId,
  getMyComplaints,
  getDepartmentComplaints,
  getStaffComplaints,
  getComplaintById,
  assignComplaint,
  updateComplaintStatus,
  submitFeedback,
  clearAllComplaints,
} = require("../controllers/complaintController");

const { protect, authorize } = require("../middleware/auth");
const upload = require("../middleware/upload");

// Public Grievance Tracking (No authentication required)
router.get("/track/:grievanceId", getGrievanceByReferenceId);

// Database Clear All Complaints (Reviewer / Admin)
router.post("/clear-all", clearAllComplaints);
router.delete("/all", clearAllComplaints);

// Citizen routes
router.post("/", protect, authorize("citizen"), upload.single("image"), createComplaint);
router.get("/my", protect, authorize("citizen"), getMyComplaints);

// Staff assigned routes
router.get("/staff", protect, authorize("staff"), getStaffComplaints);

// Department Head & Admin routes
router.get(
  "/department",
  protect,
  authorize("department_head", "admin"),
  getDepartmentComplaints
);

router.put(
  "/:id/assign",
  protect,
  authorize("department_head", "admin"),
  assignComplaint
);

// General & Status routes
router.get("/:id", protect, getComplaintById);

router.put(
  "/:id/status",
  protect,
  authorize("staff", "department_head", "admin"),
  updateComplaintStatus
);

// Citizen submits feedback after resolution
router.post("/:id/feedback", protect, authorize("citizen"), submitFeedback);

module.exports = router;