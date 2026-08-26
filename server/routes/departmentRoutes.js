const express = require("express");

const {
  createDepartment,
  getDepartments,
} = require("../controllers/departmentController");

const {
  protect,
  authorize,
} = require("../middleware/auth");

const router = express.Router();

router.post(
  "/",
  protect,
  authorize("admin"),
  createDepartment
);

router.get(
  "/",
  protect,
  getDepartments
);

module.exports = router;