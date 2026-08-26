const express = require("express");
const router = express.Router();

const {
  getCorporations,
  getZones,
  getWards,
  getLocalities,
  getStreets,
  reverseGeocodeLocation,
} = require("../controllers/locationController");

// Public endpoints for location hierarchy cascading dropdowns
router.get("/corporations", getCorporations);
router.get("/zones", getZones);
router.get("/wards", getWards);
router.get("/localities", getLocalities);
router.get("/streets", getStreets);
router.get("/reverse-geocode", reverseGeocodeLocation);

module.exports = router;
