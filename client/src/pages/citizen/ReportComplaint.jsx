import React, { useState, useEffect, useRef } from "react";
import API from "../../services/api";
import DashboardLayout from "../../layouts/DashboardLayout";
import { useLanguage } from "../../context/LanguageContext";
import { Link, useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import {
  Shield,
  Send,
  Camera,
  MapPin,
  CheckCircle,
  RefreshCw,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Layers,
  Activity,
  Trash2,
  Droplets,
  Zap,
  Hammer,
  Building,
  Navigation,
} from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Resolve default marker icon issues with Leaflet in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Map click event interceptor
function MapClickHandler({ setPosition, setMapCenter, onMapClickCoordinates }) {
  useMapEvents({
    click(e) {
      const newPos = { lat: e.latlng.lat, lng: e.latlng.lng };
      setPosition(newPos);
      setMapCenter([e.latlng.lat, e.latlng.lng]);
      if (onMapClickCoordinates) {
        onMapClickCoordinates(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
}

// Map Auto-Recenter Controller component
function MapRecenterController({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.flyTo(center, 15, { animate: true, duration: 1.0 });
    }
  }, [center, map]);
  return null;
}

export default function ReportComplaint() {
  const navigate = useNavigate();
  const { lang, t } = useLanguage();

  // Basic Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [citizenCategory, setCitizenCategory] = useState("Pothole / Road Damage");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  // ── 6-Tier Location Hierarchy State ──
  const [corporations, setCorporations] = useState([]);
  const [zones, setZones] = useState([]);
  const [wards, setWards] = useState([]);
  const [localities, setLocalities] = useState([]);
  const [streets, setStreets] = useState([]);

  const [selectedCorporationId, setSelectedCorporationId] = useState("");
  const [selectedZoneId, setSelectedZoneId] = useState("");
  const [selectedWardId, setSelectedWardId] = useState("");
  const [selectedLocality, setSelectedLocality] = useState("");
  const [selectedStreet, setSelectedStreet] = useState("");
  const [specificLocation, setSpecificLocation] = useState("");

  // Ref flag to block cascading useEffect overrides during GPS resolution
  const isGpsSettingRef = useRef(false);

  // GPS / Coordinates State
  const [pinPosition, setPinPosition] = useState({ lat: 13.0827, lng: 80.2707 });
  const [mapCenter, setMapCenter] = useState([13.0827, 80.2707]);
  const [gpsDetecting, setGpsDetecting] = useState(false);
  const [gpsStatusMessage, setGpsStatusMessage] = useState("");

  // Processing & Submission State
  const [loading, setLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);
  const [registeredComplaint, setRegisteredComplaint] = useState(null);
  const [imageValidationNotice, setImageValidationNotice] = useState(null);
  const [submissionError, setSubmissionError] = useState("");

  const categories = [
    {
      id: "Pothole / Road Damage",
      label: t("cat_roads"),
      icon: <Hammer size={20} />,
      desc: t("cat_roads_desc"),
      color: "#1d4ed8",
      bg: "#eff6ff",
    },
    {
      id: "Garbage",
      label: t("cat_garbage"),
      icon: <Trash2 size={20} />,
      desc: t("cat_garbage_desc"),
      color: "#047857",
      bg: "#ecfdf5",
    },
    {
      id: "Water Leakage",
      label: t("cat_water"),
      icon: <Droplets size={20} />,
      desc: t("cat_water_desc"),
      color: "#0284c7",
      bg: "#f0f9ff",
    },
    {
      id: "Drainage Problem",
      label: t("cat_drainage"),
      icon: <Activity size={20} />,
      desc: t("cat_drainage_desc"),
      color: "#b45309",
      bg: "#fffbeb",
    },
    {
      id: "Streetlight Problem",
      label: t("cat_lights"),
      icon: <Zap size={20} />,
      desc: t("cat_lights_desc"),
      color: "#6d28d9",
      bg: "#f5f3ff",
    },
  ];

  const processingStepsList = [
    "Analyzing Defect Photo (YOLOv8 Computer Vision)...",
    "Classifying Defect Category & Estimating Severity...",
    "Predicting Nodal Government Department (NLP Classifier)...",
    "Validating Location Hierarchy (Corporation → Zone → Ward)...",
    "Scanning Proximity Duplicates (Sentence Transformers)...",
    "Calculating Municipal Priority Index Score (0-100)...",
    "Registering Official Grievance Work Order...",
  ];

  // 1. Initial Load of Corporations
  useEffect(() => {
    const fetchCorporations = async () => {
      try {
        const res = await API.get("/locations/corporations");
        if (res.data.success && res.data.corporations.length > 0) {
          setCorporations(res.data.corporations);
          if (!selectedCorporationId) {
            const defaultCorp = res.data.corporations[0];
            setSelectedCorporationId(defaultCorp._id);
          }
        }
      } catch (err) {
        console.error("Failed to fetch corporations:", err.message);
      }
    };
    fetchCorporations();
  }, []);

  // 2. Cascading: Load Zones on selectedCorporationId change
  useEffect(() => {
    if (isGpsSettingRef.current) return;
    if (!selectedCorporationId) {
      setZones([]);
      setSelectedZoneId("");
      return;
    }
    const fetchZones = async () => {
      try {
        const res = await API.get(`/locations/zones?corporationId=${selectedCorporationId}`);
        if (res.data.success) {
          setZones(res.data.zones || []);
          if (res.data.zones?.length > 0) {
            setSelectedZoneId(res.data.zones[0]._id);
          } else {
            setSelectedZoneId("");
          }
        }
      } catch (err) {
        console.error("Failed to fetch zones:", err.message);
      }
    };
    fetchZones();
  }, [selectedCorporationId]);

  // 3. Cascading: Load Wards on selectedZoneId change
  useEffect(() => {
    if (isGpsSettingRef.current) return;
    if (!selectedZoneId) {
      setWards([]);
      setSelectedWardId("");
      return;
    }
    const fetchWards = async () => {
      try {
        const res = await API.get(`/locations/wards?zoneId=${selectedZoneId}`);
        if (res.data.success) {
          setWards(res.data.wards || []);
          if (res.data.wards?.length > 0) {
            setSelectedWardId(res.data.wards[0]._id);
          } else {
            setSelectedWardId("");
          }
        }
      } catch (err) {
        console.error("Failed to fetch wards:", err.message);
      }
    };
    fetchWards();
  }, [selectedZoneId]);

  // 4. Cascading: Load Localities on selectedWardId change
  useEffect(() => {
    if (isGpsSettingRef.current) return;
    if (!selectedWardId) {
      setLocalities([]);
      setSelectedLocality("");
      return;
    }
    const fetchLocalities = async () => {
      try {
        const res = await API.get(`/locations/localities?wardId=${selectedWardId}`);
        if (res.data.success) {
          setLocalities(res.data.localities || []);
          if (res.data.localities?.length > 0) {
            setSelectedLocality(res.data.localities[0].name);
          } else {
            setSelectedLocality("");
          }
        }
      } catch (err) {
        console.error("Failed to fetch localities:", err.message);
      }
    };
    fetchLocalities();
  }, [selectedWardId]);

  // 5. Cascading: Load Streets on selectedLocality change
  useEffect(() => {
    if (isGpsSettingRef.current) return;
    if (!selectedLocality) {
      setStreets([]);
      setSelectedStreet("");
      return;
    }
    const matchingLocalityObj = localities.find((l) => l.name === selectedLocality);
    if (!matchingLocalityObj) {
      setStreets([]);
      return;
    }
    const fetchStreets = async () => {
      try {
        const res = await API.get(`/locations/streets?localityId=${matchingLocalityObj._id}`);
        if (res.data.success) {
          setStreets(res.data.streets || []);
          if (res.data.streets?.length > 0) {
            setSelectedStreet(res.data.streets[0].name);
          } else {
            setSelectedStreet("");
          }
        }
      } catch (err) {
        console.error("Failed to fetch streets:", err.message);
      }
    };
    fetchStreets();
  }, [selectedLocality, localities]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));

      // Instant pre-validation on filename
      const fname = file.name.toLowerCase();
      const spamCues = [
        "selfie", "cat", "dog", "food", "burger", "pizza", "biryani", "party",
        "wedding", "shoes", "shirt", "dress", "meme", "screenshot", "wallpaper",
        "actor", "game", "laptop", "mobile", "qwerty"
      ];
      const hasSpamCue = spamCues.some((s) => fname.includes(s));
      const hasCivicCue = ["road", "pothole", "garbage", "leak", "drain", "light", "pipe", "waste"].some((c) => fname.includes(c));

      if (hasSpamCue && !hasCivicCue) {
        setImageValidationNotice({
          isWarning: true,
          message: "⚠️ Warning: Selected photo appears to be an unrelated subject. Please ensure you upload a clear photo of the civic defect (pothole, garbage, leak, etc.) to prevent AI rejection.",
        });
      } else {
        setImageValidationNotice({
          isWarning: false,
          message: "✓ Photo ready for AI Computer Vision verification & defect classification.",
        });
      }
    }
  };

  // ── GPS Reverse Geocoding Handler ──
  const reverseGeocodeAndSelect = async (lat, lng) => {
    setGpsDetecting(true);
    setGpsStatusMessage(t("gps_detecting"));
    isGpsSettingRef.current = true;

    try {
      const res = await API.get(`/locations/reverse-geocode?lat=${lat}&lng=${lng}`);
      if (res.data.success && res.data.data) {
        const d = res.data.data;

        // Atomically update all sibling lists from server
        if (d.corporations) setCorporations(d.corporations);
        if (d.zones) setZones(d.zones);
        if (d.wards) setWards(d.wards);
        if (d.localities) setLocalities(d.localities);
        if (d.streets) setStreets(d.streets);

        // Set selected IDs and values
        if (d.corporation?._id) setSelectedCorporationId(d.corporation._id);
        if (d.zone?._id) setSelectedZoneId(d.zone._id);
        if (d.ward?._id) setSelectedWardId(d.ward._id);
        if (d.locality?.name) setSelectedLocality(d.locality.name);
        if (d.street?.name) setSelectedStreet(d.street.name);
        if (d.specificLocation) setSpecificLocation(d.specificLocation);

        setGpsStatusMessage(`✓ Identified: ${d.locality?.name || d.ward?.wardName || ""}, ${d.corporation?.name || ""}`);
        setTimeout(() => setGpsStatusMessage(""), 5000);
      }
    } catch (err) {
      console.warn("Reverse geocoding warning:", err.message);
      setGpsStatusMessage("Coordinates pinned on map.");
      setTimeout(() => setGpsStatusMessage(""), 3000);
    } finally {
      setGpsDetecting(false);
      // Re-enable manual cascading after state settling
      setTimeout(() => {
        isGpsSettingRef.current = false;
      }, 500);
    }
  };

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      setGpsDetecting(true);
      setGpsStatusMessage(t("gps_detecting"));

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          const newPos = { lat: latitude, lng: longitude };
          setPinPosition(newPos);
          setMapCenter([latitude, longitude]);
          reverseGeocodeAndSelect(latitude, longitude);
        },
        (err) => {
          console.warn("GPS detection fallback:", err.message);
          // Fallback coordinate
          const fallbackLat = 11.2711;
          const fallbackLng = 77.6086;
          setPinPosition({ lat: fallbackLat, lng: fallbackLng });
          setMapCenter([fallbackLat, fallbackLng]);
          reverseGeocodeAndSelect(fallbackLat, fallbackLng);
        },
        { enableHighAccuracy: true, timeout: 7000 }
      );
    } else {
      alert("Geolocation is not supported by your browser. Click on the map to place a pin.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description) {
      alert("Please provide grievance title and description.");
      return;
    }

    const selectedCorpObj = corporations.find((c) => c._id === selectedCorporationId);
    const selectedZoneObj = zones.find((z) => z._id === selectedZoneId);
    const selectedWardObj = wards.find((w) => w._id === selectedWardId);

    const fullAddress = [
      specificLocation,
      selectedStreet,
      selectedLocality,
      selectedWardObj?.wardName,
      selectedZoneObj?.name,
      selectedCorpObj?.name,
    ]
      .filter(Boolean)
      .join(", ");

    setLoading(true);
    setIsProcessing(true);
    setProcessingStep(0);

    const stepInterval = setInterval(() => {
      setProcessingStep((prev) => {
        if (prev >= processingStepsList.length - 1) {
          clearInterval(stepInterval);
          return prev;
        }
        return prev + 1;
      });
    }, 800);

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("citizenCategory", citizenCategory);
      formData.append("latitude", pinPosition.lat);
      formData.append("longitude", pinPosition.lng);
      formData.append("address", fullAddress || "Tamil Nadu Municipal Area");
      formData.append("ward", selectedWardObj?.wardName || "Ward 12");
      
      if (selectedCorporationId) formData.append("corporationId", selectedCorporationId);
      if (selectedZoneId) formData.append("zoneId", selectedZoneId);
      if (selectedWardId) formData.append("wardId", selectedWardId);
      if (selectedLocality) formData.append("locality", selectedLocality);
      if (selectedStreet) formData.append("street", selectedStreet);
      if (specificLocation) formData.append("specificLocation", specificLocation);

      if (imageFile) {
        formData.append("image", imageFile);
      }

      setSubmissionError("");
      const res = await API.post("/complaints", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      clearInterval(stepInterval);
      setProcessingStep(processingStepsList.length);

      if (res.data.success) {
        setRegisteredComplaint(res.data.complaint);
      }
    } catch (err) {
      clearInterval(stepInterval);
      setIsProcessing(false);
      const errMsg =
        err.response?.data?.message ||
        err.message ||
        "Grievance submission encountered an issue. Please retry.";
      setSubmissionError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        
        {/* ── AI Processing HUD Modal Overlay ── */}
        {isProcessing && (
          <div className="gov-modal-backdrop">
            <div className="gov-modal-dialog" style={{ padding: "28px", textAlign: "center" }}>
              {!registeredComplaint ? (
                <div>
                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "50%",
                      background: "#f4f4f5",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#09090b",
                      marginBottom: "14px",
                      border: "1px solid #d4d4d8",
                    }}
                  >
                    <RefreshCw size={24} className="spin-indicator" />
                  </div>

                  <h3 style={{ fontSize: "1.15rem", fontWeight: "800", color: "#09090b", marginBottom: "4px" }}>
                    {t("submitting_ai")}
                  </h3>
                  <p style={{ fontSize: "0.82rem", color: "#71717a", marginBottom: "18px" }}>
                    Analyzing photo features, validating ward hierarchy, and checking for duplicate complaints...
                  </p>

                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", textAlign: "left", background: "#f9f9fb", padding: "14px", borderRadius: "6px", border: "1px solid var(--border-subtle)" }}>
                    {processingStepsList.map((step, idx) => {
                      const isDone = processingStep > idx;
                      const isCurrent = processingStep === idx;
                      return (
                        <div
                          key={idx}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            fontSize: "0.8rem",
                            fontWeight: isCurrent ? "700" : isDone ? "600" : "500",
                            color: isDone ? "#09090b" : isCurrent ? "#09090b" : "#a1a1aa",
                          }}
                        >
                          <div
                            style={{
                              width: "14px",
                              height: "14px",
                              borderRadius: "50%",
                              background: isDone ? "#09090b" : isCurrent ? "#09090b" : "#d4d4d8",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#ffffff",
                              fontSize: "0.6rem",
                              flexShrink: 0,
                            }}
                          >
                            {isDone ? "✓" : idx + 1}
                          </div>
                          <span>{step}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div>
                  <div
                    style={{
                      width: "56px",
                      height: "56px",
                      borderRadius: "50%",
                      background: registeredComplaint.duplicate ? "#fffbeb" : "#ecfdf5",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: registeredComplaint.duplicate ? "#d97706" : "#059669",
                      marginBottom: "14px",
                      border: `1.5px solid ${registeredComplaint.duplicate ? "#fde68a" : "#a7f3d0"}`,
                    }}
                  >
                    <CheckCircle size={32} />
                  </div>

                  <h3 style={{ fontSize: "1.3rem", fontWeight: "800", color: "#0f172a", marginBottom: "4px" }}>
                    {registeredComplaint.duplicate ? "Duplicate Linked to Active Work Order" : "Grievance Successfully Registered"}
                  </h3>
                  <p style={{ fontSize: "0.84rem", color: "#64748b", marginBottom: "18px" }}>
                    {registeredComplaint.duplicate
                      ? "A similar complaint already exists at this location. Your report has been merged to escalate priority."
                      : "Your civic issue has been classified by YOLOv8 vision and routed to the nodal department."}
                  </p>

                  <div
                    style={{
                      background: "#f8fafc",
                      border: "1px solid var(--border-subtle)",
                      borderRadius: "8px",
                      padding: "16px",
                      textAlign: "left",
                      fontSize: "0.84rem",
                      marginBottom: "20px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "#64748b" }}>Reference ID:</span>
                      <strong style={{ color: "#0f172a" }}>{registeredComplaint.complaintId}</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "#64748b" }}>Location:</span>
                      <strong style={{ color: "#0f172a" }}>{registeredComplaint.location?.ward || "Ward 12"}, {registeredComplaint.locality || "Area"}</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "#64748b" }}>AI Category:</span>
                      <strong style={{ color: "#1d4ed8" }}>{registeredComplaint.aiCategory || citizenCategory}</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "#64748b" }}>Department:</span>
                      <strong style={{ color: "#059669" }}>{registeredComplaint.aiDepartment || "Roads Department"}</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "#64748b" }}>Priority Index:</span>
                      <strong style={{ color: "#0f172a" }}>{registeredComplaint.severity || "Medium"} ({registeredComplaint.priorityScore || 65}/100)</strong>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                    <Link to="/citizen/dashboard" className="gov-btn gov-btn-secondary gov-btn-sm" onClick={() => setIsProcessing(false)}>
                      Go to Dashboard
                    </Link>
                    <Link
                      to={`/citizen/complaint/${registeredComplaint._id}`}
                      className="gov-btn gov-btn-primary gov-btn-sm"
                      onClick={() => setIsProcessing(false)}
                    >
                      Track Timeline
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Page Header ── */}
        <div style={{ marginBottom: "22px" }}>
          <h1 style={{ fontSize: "1.45rem", fontWeight: "800", color: "#09090b", letterSpacing: "-0.02em" }}>
            {t("report_title")}
          </h1>
          <p style={{ fontSize: "0.86rem", color: "#71717a", marginTop: "2px" }}>
            {t("report_sub")}
          </p>
        </div>

        {/* ── Form Card ── */}
        <form onSubmit={handleSubmit} className="gov-card">

          {/* AI Inspection Error Alert */}
          {submissionError && (
            <div
              style={{
                padding: "14px 16px",
                background: "#fef2f2",
                border: "1.5px solid #f87171",
                borderRadius: "8px",
                color: "#991b1b",
                fontSize: "0.85rem",
                marginBottom: "20px",
                display: "flex",
                alignItems: "flex-start",
                gap: "10px",
              }}
            >
              <AlertTriangle size={20} color="#dc2626" style={{ flexShrink: 0, marginTop: "2px" }} />
              <div>
                <div style={{ fontWeight: "700", marginBottom: "3px" }}>AI Municipal Inspection Notice</div>
                <div style={{ lineHeight: "1.4" }}>{submissionError}</div>
              </div>
            </div>
          )}
          
          {/* Section 1: Category Selection Grid */}
          <div style={{ marginBottom: "22px" }}>
            <label className="gov-label" style={{ fontSize: "0.86rem", marginBottom: "8px" }}>
              {t("sec1_category")} *
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "8px" }}>
              {categories.map((cat) => {
                const isSelected = citizenCategory === cat.id;
                return (
                  <div
                    key={cat.id}
                    onClick={() => setCitizenCategory(cat.id)}
                    style={{
                      padding: "14px",
                      borderRadius: "8px",
                      border: isSelected ? `2px solid ${cat.color}` : "1px solid var(--border-subtle)",
                      background: isSelected ? cat.bg : "#ffffff",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                      textAlign: "left",
                      boxShadow: isSelected ? `0 4px 10px ${cat.color}20` : "none",
                    }}
                  >
                    <div style={{ marginBottom: "6px", color: isSelected ? cat.color : "#64748b" }}>{cat.icon}</div>
                    <div style={{ fontSize: "0.86rem", fontWeight: isSelected ? "800" : "600", color: isSelected ? cat.color : "#0f172a", marginBottom: "2px" }}>
                      {cat.label}
                    </div>
                    <div style={{ fontSize: "0.72rem", color: "#64748b", lineHeight: "1.2" }}>
                      {cat.desc}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 2: Title & Description */}
          <div className="gov-form-group">
            <label className="gov-label">{t("sec2_title")} *</label>
            <input
              type="text"
              className="gov-input"
              placeholder="e.g. Deep road crater near market junction"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="gov-form-group">
            <label className="gov-label">{t("sec3_desc")} *</label>
            <textarea
              className="gov-textarea"
              rows={3}
              placeholder="Describe exact defect location, size, duration, traffic hazard level..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          {/* Section 3: Photo Upload */}
          <div style={{ marginBottom: "22px" }}>
            <label className="gov-label">{t("sec4_photo")} *</label>
            <div style={{ display: "grid", gridTemplateColumns: imagePreview ? "1fr 160px" : "1fr", gap: "12px", alignItems: "center" }}>
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: "none" }}
                  id="defect-photo-input"
                />
                <label
                  htmlFor="defect-photo-input"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                    padding: "20px",
                    border: "1.5px dashed var(--border-strong)",
                    borderRadius: "6px",
                    background: "#fbfbfb",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#09090b")}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border-strong)")}
                >
                  <Camera size={22} color="#71717a" />
                  <div style={{ fontSize: "0.82rem", fontWeight: "600", color: "#09090b" }}>
                    {imageFile ? imageFile.name : "Click to select or upload photo"}
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "#71717a" }}>
                    Supports JPG, PNG up to 10MB
                  </div>
                </label>
              </div>

              {imagePreview && (
                <div style={{ height: "95px", borderRadius: "6px", overflow: "hidden", border: "1px solid var(--border-subtle)" }}>
                  <img src={imagePreview} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              )}
            </div>

            {/* AI Image Pre-Validation Notice */}
            {imageValidationNotice && (
              <div
                style={{
                  marginTop: "10px",
                  padding: "10px 14px",
                  background: imageValidationNotice.isWarning ? "#fff7ed" : "#f0fdf4",
                  border: `1px solid ${imageValidationNotice.isWarning ? "#fdba74" : "#bbf7d0"}`,
                  borderRadius: "6px",
                  color: imageValidationNotice.isWarning ? "#9a3412" : "#166534",
                  fontSize: "0.80rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <AlertTriangle size={15} color={imageValidationNotice.isWarning ? "#ea580c" : "#16a34a"} />
                <span>{imageValidationNotice.message}</span>
              </div>
            )}
          </div>

          {/* Section 4: 6-Tier Location Hierarchy Dropdowns */}
          <div style={{ marginBottom: "22px", padding: "18px", background: "#fbfbfb", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", flexWrap: "wrap", gap: "8px" }}>
              <div>
                <label className="gov-label" style={{ marginBottom: "2px", fontSize: "0.88rem", fontWeight: "700", color: "#09090b", display: "flex", alignItems: "center", gap: "6px" }}>
                  <Building size={16} />
                  <span>{t("sec5_location")} *</span>
                </label>
                <div style={{ fontSize: "0.72rem", color: "#71717a" }}>
                  Corporation → Zone → Ward → Locality → Street → Specific Landmark
                </div>
              </div>

              <button
                type="button"
                onClick={handleGetCurrentLocation}
                disabled={gpsDetecting}
                className="gov-btn gov-btn-secondary gov-btn-sm"
                style={{ gap: "5px", fontWeight: "600" }}
              >
                <Navigation size={13} className={gpsDetecting ? "spin-indicator" : ""} />
                <span>{gpsDetecting ? t("gps_detecting") : t("gps_btn")}</span>
              </button>
            </div>

            {gpsStatusMessage && (
              <div style={{ padding: "6px 10px", background: "#f4f4f5", border: "1px solid #e4e4e7", borderRadius: "4px", color: "#09090b", fontSize: "0.76rem", fontWeight: "600", marginBottom: "12px" }}>
                {gpsStatusMessage}
              </div>
            )}

            {/* 3x2 Dropdowns Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: "12px", marginBottom: "12px" }}>
              
              {/* Tier 1: Corporation */}
              <div>
                <label className="gov-label">{t("tier1_corp")} *</label>
                <select
                  className="gov-select"
                  value={selectedCorporationId}
                  onChange={(e) => setSelectedCorporationId(e.target.value)}
                  required
                >
                  {corporations.map((c) => (
                    <option key={c._id} value={c._id}>
                      {lang === "ta" && c.tamilName ? c.tamilName : c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tier 2: Zone */}
              <div>
                <label className="gov-label">{t("tier2_zone")} *</label>
                <select
                  className="gov-select"
                  value={selectedZoneId}
                  onChange={(e) => setSelectedZoneId(e.target.value)}
                  required
                >
                  {zones.length === 0 ? (
                    <option value="">Loading Zones...</option>
                  ) : (
                    zones.map((z) => (
                      <option key={z._id} value={z._id}>
                        {lang === "ta" && z.tamilName ? z.tamilName : z.name}
                      </option>
                    ))
                  )}
                </select>
              </div>

              {/* Tier 3: Ward */}
              <div>
                <label className="gov-label">{t("tier3_ward")} *</label>
                <select
                  className="gov-select"
                  value={selectedWardId}
                  onChange={(e) => setSelectedWardId(e.target.value)}
                  required
                >
                  {wards.length === 0 ? (
                    <option value="">No Wards in Zone</option>
                  ) : (
                    wards.map((w) => (
                      <option key={w._id} value={w._id}>
                        {lang === "ta" && w.tamilName ? w.tamilName : w.wardName}
                      </option>
                    ))
                  )}
                </select>
              </div>

              {/* Tier 4: Locality */}
              <div>
                <label className="gov-label">{t("tier4_locality")} *</label>
                <select
                  className="gov-select"
                  value={selectedLocality}
                  onChange={(e) => setSelectedLocality(e.target.value)}
                  required
                >
                  {localities.length === 0 ? (
                    selectedLocality ? (
                      <option value={selectedLocality}>{selectedLocality}</option>
                    ) : (
                      <option value="">Select locality</option>
                    )
                  ) : (
                    localities.map((l) => (
                      <option key={l._id} value={l.name}>
                        {lang === "ta" && l.tamilName ? l.tamilName : l.name}
                      </option>
                    ))
                  )}
                </select>
              </div>

              {/* Tier 5: Street */}
              <div>
                <label className="gov-label">{t("tier5_street")} *</label>
                <select
                  className="gov-select"
                  value={selectedStreet}
                  onChange={(e) => setSelectedStreet(e.target.value)}
                  required
                >
                  {streets.length === 0 ? (
                    selectedStreet ? (
                      <option value={selectedStreet}>{selectedStreet}</option>
                    ) : (
                      <option value="">Select street</option>
                    )
                  ) : (
                    streets.map((s) => (
                      <option key={s._id} value={s.name}>
                        {lang === "ta" && s.tamilName ? s.tamilName : s.name}
                      </option>
                    ))
                  )}
                </select>
              </div>

              {/* Tier 6: Specific Landmark */}
              <div>
                <label className="gov-label">{t("tier6_specific")} *</label>
                <input
                  type="text"
                  className="gov-input"
                  placeholder="e.g. Near Hot Breads / Pillar 42"
                  value={specificLocation}
                  onChange={(e) => setSpecificLocation(e.target.value)}
                  required
                />
              </div>

            </div>

            {/* Map Pinning */}
            <div style={{ marginTop: "14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <span style={{ fontSize: "0.78rem", fontWeight: "600", color: "#71717a" }}>
                  {t("map_click_prompt")}
                </span>
                <span style={{ fontSize: "0.72rem", color: "#a1a1aa" }}>
                  Lat: {pinPosition.lat.toFixed(4)}, Lng: {pinPosition.lng.toFixed(4)}
                </span>
              </div>

              <div className="map-wrapper-box" style={{ height: "240px" }}>
                <MapContainer center={mapCenter} zoom={14} style={{ width: "100%", height: "100%" }}>
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
                  />
                  <Marker position={pinPosition} />
                  <MapRecenterController center={mapCenter} />
                  <MapClickHandler
                    setPosition={setPinPosition}
                    setMapCenter={setMapCenter}
                    onMapClickCoordinates={reverseGeocodeAndSelect}
                  />
                </MapContainer>
              </div>
            </div>

          </div>

          {/* Form Actions */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", paddingTop: "14px", borderTop: "1px solid var(--border-subtle)" }}>
            <Link to="/citizen/dashboard" className="gov-btn gov-btn-secondary">
              {t("cancel_btn")}
            </Link>
            <button
              type="submit"
              className="gov-btn gov-btn-primary"
              style={{ padding: "9px 24px", fontSize: "0.88rem" }}
              disabled={loading}
            >
              <Send size={14} />
              <span>{t("submit_btn")}</span>
            </button>
          </div>

        </form>

      </div>
    </DashboardLayout>
  );
}
