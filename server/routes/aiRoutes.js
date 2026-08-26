const express = require("express");
const { processComplaintAI, verifyImageLive } = require("../controllers/aiController");
const { protect, authorize } = require("../middleware/auth");
const upload = require("../middleware/upload");

const router = express.Router();

// POST /api/ai/verify-image (Public / Citizen pre-submission validation)
router.post("/verify-image", upload.single("image"), verifyImageLive);

// POST /api/ai/process/:id
// Triggers AI analysis pipeline for a specific complaint
router.post(
  "/process/:id",
  protect,
  authorize("admin", "department_head"),
  processComplaintAI
);

module.exports = router;