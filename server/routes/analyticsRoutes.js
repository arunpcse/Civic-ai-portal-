const express = require("express");
const router = express.Router();
const { getDashboardAnalytics } = require("../controllers/analyticsController");
const { protect, authorize } = require("../middleware/auth");

// Commissioner / Admin analytics dashboard
router.get("/dashboard", protect, authorize("admin"), getDashboardAnalytics);

module.exports = router;
