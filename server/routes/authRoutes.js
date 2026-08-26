const express = require("express");
const {
  register,
  login,
} = require("../controllers/authController");

const {
  protect,
  authorize,
} = require("../middleware/auth");

const router = express.Router();

router.post("/register", register);

router.post("/login", login);

router.get("/profile", protect, (req, res) => {
  res.json({
    success: true,
    message: "Protected profile accessed",
    user: req.user,
  });
});

module.exports = router;