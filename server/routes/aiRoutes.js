const express = require("express");
const { processComplaintAI } = require("../controllers/aiController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

// POST /api/ai/process/:id
// Triggers AI analysis pipeline for a specific complaint
router.post(
  "/process/:id",
  protect,
  authorize("admin", "department_head"),
  processComplaintAI
);

module.exports = router;