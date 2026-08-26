const { Corporation, Zone, Ward, Locality, Street } = require("../models/Location");

// Haversine distance calculation in kilometers
const getDistanceKm = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 999999;
  const R = 6371; // Earth's radius in km
  const toRad = (val) => (val * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// @desc    Get all corporations
// @route   GET /api/locations/corporations
// @access  Public
const getCorporations = async (req, res) => {
  try {
    const corporations = await Corporation.find().sort({ name: 1 });
    res.status(200).json({
      success: true,
      count: corporations.length,
      corporations,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get zones by corporationId
// @route   GET /api/locations/zones
// @access  Public
const getZones = async (req, res) => {
  try {
    const { corporationId } = req.query;
    const filter = corporationId ? { corporationId } : {};
    const zones = await Zone.find(filter).populate("corporationId", "name code").sort({ zoneNumber: 1, name: 1 });
    res.status(200).json({
      success: true,
      count: zones.length,
      zones,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get wards by zoneId or corporationId
// @route   GET /api/locations/wards
// @access  Public
const getWards = async (req, res) => {
  try {
    const { zoneId, corporationId } = req.query;
    const filter = {};
    if (zoneId) filter.zoneId = zoneId;
    if (corporationId) filter.corporationId = corporationId;

    const wards = await Ward.find(filter)
      .populate("zoneId", "name zoneNumber")
      .populate("corporationId", "name code")
      .sort({ wardNumber: 1, wardName: 1 });

    res.status(200).json({
      success: true,
      count: wards.length,
      wards,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get localities by wardId
// @route   GET /api/locations/localities
// @access  Public
const getLocalities = async (req, res) => {
  try {
    const { wardId, zoneId } = req.query;
    const filter = {};
    if (wardId) filter.wardId = wardId;
    if (zoneId) filter.zoneId = zoneId;

    const localities = await Locality.find(filter)
      .populate("wardId", "wardName wardNumber")
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: localities.length,
      localities,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get streets by localityId
// @route   GET /api/locations/streets
// @access  Public
const getStreets = async (req, res) => {
  try {
    const { localityId, wardId } = req.query;
    const filter = {};
    if (localityId) filter.localityId = localityId;
    if (wardId) filter.wardId = wardId;

    const streets = await Street.find(filter)
      .populate("localityId", "name pincode")
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: streets.length,
      streets,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Known Tamil Nadu Districts to Corporation Names
const TN_DISTRICT_CORP_MAP = {
  namakkal: { name: "Namakkal Municipal Corporation", tamilName: "நாமக்கல் மாநகராட்சி / நகராட்சி", code: "NMC", district: "Namakkal" },
  erode: { name: "Erode City Municipal Corporation", tamilName: "ஈரோடு மாநகராட்சி", code: "ECMC", district: "Erode" },
  coimbatore: { name: "Coimbatore City Municipal Corporation", tamilName: "கோயம்புத்தூர் மாநகராட்சி", code: "CCMC", district: "Coimbatore" },
  salem: { name: "Salem City Municipal Corporation", tamilName: "சேலம் மாநகராட்சி", code: "SMC", district: "Salem" },
  tiruppur: { name: "Tiruppur City Municipal Corporation", tamilName: "திருப்பூர் மாநகராட்சி", code: "TCMC", district: "Tiruppur" },
  tirupur: { name: "Tiruppur City Municipal Corporation", tamilName: "திருப்பூர் மாநகராட்சி", code: "TCMC", district: "Tiruppur" },
  chennai: { name: "Greater Chennai Corporation", tamilName: "பெருநகர சென்னை மாநகராட்சி", code: "GCC", district: "Chennai" },
  madurai: { name: "Madurai Municipal Corporation", tamilName: "மதுரை மாநகராட்சி", code: "MMC", district: "Madurai" },
  tiruchirappalli: { name: "Tiruchirappalli City Corporation", tamilName: "திருச்சிராப்பள்ளி மாநகராட்சி", code: "TCC", district: "Tiruchirappalli" },
  trichy: { name: "Tiruchirappalli City Corporation", tamilName: "திருச்சிராப்பள்ளி மாநகராட்சி", code: "TCC", district: "Tiruchirappalli" },
  tirunelveli: { name: "Tirunelveli City Municipal Corporation", tamilName: "திருநெல்வேலி மாநகராட்சி", code: "TVMC", district: "Tirunelveli" },
  vellore: { name: "Vellore City Municipal Corporation", tamilName: "வேலூர் மாநகராட்சி", code: "VMC", district: "Vellore" },
  thanjavur: { name: "Thanjavur City Municipal Corporation", tamilName: "தஞ்சாவூர் மாநகராட்சி", code: "TJMC", district: "Thanjavur" },
  dindigul: { name: "Dindigul City Municipal Corporation", tamilName: "திண்டுக்கல் மாநகராட்சி", code: "DMC", district: "Dindigul" },
  karur: { name: "Karur City Municipal Corporation", tamilName: "கரூர் மாநகராட்சி", code: "KMC", district: "Karur" },
  hosur: { name: "Hosur City Municipal Corporation", tamilName: "ஓசூர் மாநகராட்சி", code: "HMC", district: "Krishnagiri" },
  krishnagiri: { name: "Hosur - Krishnagiri Municipal Administration", tamilName: "கிருஷ்ணகிரி நகராட்சி", code: "KGI", district: "Krishnagiri" },
  kanchipuram: { name: "Kanchipuram City Municipal Corporation", tamilName: "காஞ்சிபுரம் மாநகராட்சி", code: "KPMC", district: "Kanchipuram" },
  cuddalore: { name: "Cuddalore City Municipal Corporation", tamilName: "கடலூர் மாநகராட்சி", code: "CDMC", district: "Cuddalore" },
  kumbakonam: { name: "Kumbakonam City Municipal Corporation", tamilName: "கும்பகோணம் மாநகராட்சி", code: "KBMC", district: "Thanjavur" },
  nagercoil: { name: "Nagercoil City Municipal Corporation", tamilName: "நாகர்கோவில் மாநகராட்சி", code: "NCC", district: "Kanyakumari" },
  kanyakumari: { name: "Nagercoil - Kanyakumari Corporation", tamilName: "நாகர்கோவில் - கன்னியாகுமரி மாநகராட்சி", code: "KKMC", district: "Kanyakumari" },
};

// Universal Location Hierarchy Builder for any Tamil Nadu GPS coordinates
const ensureLocationHierarchyForGeo = async (lat, lng, nominatimData) => {
  const addr = nominatimData?.address || {};
  
  // 1. Identify District / Town / City
  const rawDistrict = addr.state_district || addr.county || addr.city || addr.town || "Tamil Nadu";
  const rawTown = addr.town || addr.city || addr.suburb || addr.county || "Municipal Area";
  
  const cleanDistrict = rawDistrict.replace(/district/gi, "").trim();
  const lowerDistrict = cleanDistrict.toLowerCase();
  const lowerTown = rawTown.toLowerCase();

  let matchedCorp = null;
  for (const [key, val] of Object.entries(TN_DISTRICT_CORP_MAP)) {
    if (lowerDistrict.includes(key) || lowerTown.includes(key)) {
      matchedCorp = val;
      break;
    }
  }

  // Dynamic fallback for any other town/district
  if (!matchedCorp) {
    const titleName = cleanDistrict.charAt(0).toUpperCase() + cleanDistrict.slice(1);
    matchedCorp = {
      name: `${titleName} Municipal Corporation`,
      tamilName: `${titleName} மாநகராட்சி`,
      code: `TN-${cleanDistrict.substring(0, 3).toUpperCase()}`,
      district: titleName,
    };
  }

  // Find or create Corporation
  let corporation = await Corporation.findOne({ code: matchedCorp.code });
  if (!corporation) {
    corporation = await Corporation.create({
      name: matchedCorp.name,
      tamilName: matchedCorp.tamilName,
      code: matchedCorp.code,
      district: matchedCorp.district,
      state: "Tamil Nadu",
      centerLat: lat,
      centerLng: lng,
    });
  }

  // 2. Identify Zone
  const rawZoneName = addr.town || addr.suburb || addr.county || `${matchedCorp.district} Division`;
  const zoneName = `Zone - ${rawZoneName}`;
  const zoneCode = `${matchedCorp.code}-${rawZoneName.substring(0, 3).toUpperCase()}`;

  let zone = await Zone.findOne({ corporationId: corporation._id, name: zoneName });
  if (!zone) {
    zone = await Zone.create({
      corporationId: corporation._id,
      zoneNumber: 1,
      name: zoneName,
      tamilName: `மண்டலம் - ${rawZoneName}`,
      code: zoneCode,
      centerLat: lat,
      centerLng: lng,
    });
  }

  // 3. Identify Ward
  const rawWardName = addr.suburb || addr.neighbourhood || addr.town || `${rawZoneName} Central`;
  const wardName = `Ward - ${rawWardName}`;

  let ward = await Ward.findOne({ zoneId: zone._id, wardName });
  if (!ward) {
    ward = await Ward.create({
      corporationId: corporation._id,
      zoneId: zone._id,
      wardNumber: 12,
      wardName,
      tamilName: `வார்டு - ${rawWardName}`,
      centerLat: lat,
      centerLng: lng,
    });
  }

  // 4. Identify Locality
  const localityName = addr.suburb || addr.neighbourhood || addr.village || addr.town || rawWardName;
  const pincode = addr.postcode || "637200";

  let locality = await Locality.findOne({ wardId: ward._id, name: localityName });
  if (!locality) {
    locality = await Locality.create({
      corporationId: corporation._id,
      zoneId: zone._id,
      wardId: ward._id,
      name: localityName,
      tamilName: localityName,
      pincode,
      centerLat: lat,
      centerLng: lng,
    });
  }

  // 5. Identify Street Name
  const streetName = addr.road || addr.pedestrian || addr.footway || "Main Road";

  let street = await Street.findOne({ localityId: locality._id, name: streetName });
  if (!street) {
    street = await Street.create({
      corporationId: corporation._id,
      zoneId: zone._id,
      wardId: ward._id,
      localityId: locality._id,
      name: streetName,
      tamilName: streetName,
      pincode,
    });
  }

  // Specific Landmark (e.g. building name or amenity)
  const landmark = addr.tourism || addr.amenity || addr.building || addr.shop || "";

  return {
    corporation,
    zone,
    ward,
    locality,
    street,
    specificLocation: landmark ? `Near ${landmark}` : streetName,
    suggestedAddress: `${streetName}, ${localityName}, ${wardName}, ${corporation.name}`,
  };
};

// @desc    Live reverse-geocode GPS latitude & longitude to identify exact Tamil Nadu Corporation, Zone, Ward, Locality
// @route   GET /api/locations/reverse-geocode
// @access  Public
const reverseGeocodeLocation = async (req, res) => {
  try {
    const lat = parseFloat(req.query.lat);
    const lng = parseFloat(req.query.lng);

    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({
        success: false,
        message: "Valid latitude and longitude are required.",
      });
    }

    let geoResult = null;

    // 1. Live reverse geocode query with OpenStreetMap Nominatim
    try {
      const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;
      const response = await fetch(nominatimUrl, {
        headers: { "User-Agent": "CivicAI-TamilNadu-Gov/2.0" },
        signal: AbortSignal.timeout(4500),
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data.address) {
          geoResult = await ensureLocationHierarchyForGeo(lat, lng, data);
        }
      }
    } catch (err) {
      console.warn("Nominatim reverse geocode fetch warning:", err.message);
    }

    // 2. Fallback to closest DB ward if Nominatim was unreachable
    if (!geoResult) {
      const allWards = await Ward.find()
        .populate("zoneId", "name zoneNumber code")
        .populate("corporationId", "name code district state");

      if (allWards && allWards.length > 0) {
        let closestWard = allWards[0];
        let minDistance = Infinity;

        for (const ward of allWards) {
          const dist = getDistanceKm(lat, lng, ward.centerLat, ward.centerLng);
          if (dist < minDistance) {
            minDistance = dist;
            closestWard = ward;
          }
        }

        const localities = await Locality.find({ wardId: closestWard._id });
        const locality = localities.length > 0 ? localities[0] : null;
        let streets = [];
        if (locality) {
          streets = await Street.find({ localityId: locality._id });
        }

        geoResult = {
          corporation: closestWard.corporationId,
          zone: closestWard.zoneId,
          ward: closestWard,
          locality,
          street: streets.length > 0 ? streets[0] : null,
          specificLocation: "",
          suggestedAddress: `${closestWard.wardName}, ${closestWard.zoneId?.name || ""}, ${closestWard.corporationId?.name || ""}`,
        };
      }
    }

    if (!geoResult) {
      return res.status(404).json({
        success: false,
        message: "Could not identify municipal location boundaries.",
      });
    }

    // Load full sibling lists for the identified corporation and zone so the frontend dropdowns populate immediately
    const [allCorps, siblingZones, siblingWards, siblingLocalities, siblingStreets] = await Promise.all([
      Corporation.find().sort({ name: 1 }),
      Zone.find({ corporationId: geoResult.corporation._id }).sort({ zoneNumber: 1, name: 1 }),
      Ward.find({ zoneId: geoResult.zone._id }).sort({ wardNumber: 1, wardName: 1 }),
      Locality.find({ wardId: geoResult.ward._id }).sort({ name: 1 }),
      geoResult.locality ? Street.find({ localityId: geoResult.locality._id }).sort({ name: 1 }) : [],
    ]);

    res.status(200).json({
      success: true,
      data: {
        corporation: geoResult.corporation,
        zone: geoResult.zone,
        ward: geoResult.ward,
        locality: geoResult.locality,
        street: geoResult.street,
        specificLocation: geoResult.specificLocation || "",
        suggestedAddress: geoResult.suggestedAddress,
        corporations: allCorps,
        zones: siblingZones,
        wards: siblingWards,
        localities: siblingLocalities,
        streets: siblingStreets,
      },
    });
  } catch (error) {
    console.error("Reverse Geocode Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getCorporations,
  getZones,
  getWards,
  getLocalities,
  getStreets,
  reverseGeocodeLocation,
};
