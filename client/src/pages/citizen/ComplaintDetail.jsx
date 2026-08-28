import React, { useState, useEffect } from "react";
import API, { formatImageUrl, getCategoryFallbackImage } from "../../services/api";
import DashboardLayout from "../../layouts/DashboardLayout";
import { useLanguage } from "../../context/LanguageContext";
import { useParams, Link } from "react-router-dom";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import {
  Shield,
  Clock,
  MapPin,
  ArrowLeft,
  RefreshCw,
  Layers,
  CheckCircle,
  AlertTriangle,
  Building,
  Camera,
  Star,
  Check,
  ChevronRight,
  GitMerge,
} from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix leaflet default icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

function MapRecenterController({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.flyTo(center, 14, { animate: true });
    }
  }, [center, map]);
  return null;
}

export default function ComplaintDetail() {
  const { id } = useParams();
  const { lang, t } = useLanguage();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [feedbackError, setFeedbackError] = useState("");
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  const fetchDetail = async () => {
    try {
      const res = await API.get(`/complaints/${id}`);
      if (res.data.success) {
        setComplaint(res.data.complaint);
        if (res.data.complaint.citizenConfirmation?.isConfirmed) {
          setFeedbackSent(true);
          setFeedbackRating(res.data.complaint.citizenConfirmation.rating || 5);
          setFeedbackText(res.data.complaint.citizenConfirmation.feedback || "");
        }
      }
    } catch (err) {
      console.error("Failed to fetch complaint detail:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    setFeedbackError("");
    if (!feedbackRating) {
      setFeedbackError("Please select a star rating between 1 and 5.");
      return;
    }

    setSubmittingFeedback(true);
    try {
      const res = await API.post(`/complaints/${id}/feedback`, {
        rating: feedbackRating,
        feedback: feedbackText,
      });
      if (res.data.success) {
        setFeedbackSent(true);
        fetchDetail();
      }
    } catch (err) {
      setFeedbackError(err.response?.data?.message || "Failed to submit feedback.");
    } finally {
      setSubmittingFeedback(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  if (loading) {
    return (
      <DashboardLayout>
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <RefreshCw size={28} className="spin-indicator" />
          <p style={{ marginTop: "10px", color: "#64748b", fontSize: "0.86rem" }}>
            Loading Grievance Record...
          </p>
        </div>
      </DashboardLayout>
    );
  }

  if (!complaint) {
    return (
      <DashboardLayout>
        <div className="gov-card" style={{ textAlign: "center", padding: "40px" }}>
          <AlertTriangle size={32} style={{ marginBottom: "10px", color: "#64748b" }} />
          <h2 style={{ fontSize: "1.15rem", fontWeight: "700", color: "#0f172a" }}>
            Grievance Record Not Found
          </h2>
          <p style={{ color: "#64748b", margin: "6px 0 18px", fontSize: "0.85rem" }}>
            The requested reference number was not found in the official registry.
          </p>
          <Link to="/citizen/complaints" className="gov-btn gov-btn-primary gov-btn-sm">
            {t("back_to_list")}
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const timelineStages = [
    "Submitted",
    "AI Processing",
    "Verified",
    "Assigned",
    "In Progress",
    "Resolution Submitted",
    "Verification",
    "Resolved",
    "Citizen Confirmed",
    "Closed",
  ];

  const stageMap = {
    submitted: 0,
    "ai processing": 1,
    verified: 2,
    duplicate: 2,
    assigned: 3,
    "in progress": 4,
    "resolution submitted": 5,
    verification: 6,
    resolved: 7,
    "citizen confirmed": 8,
    closed: 9,
  };

  const statusKey = (complaint.status || "Submitted").toLowerCase();
  const currentStageIndex = stageMap[statusKey] !== undefined ? stageMap[statusKey] : 2;

  const defectCategory = complaint.aiCategory || complaint.citizenCategory || "Pothole / Road Damage";
  const defaultDefectImage = getCategoryFallbackImage(defectCategory);

  return (
    <DashboardLayout>
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        
        {/* ── Header Toolbar ── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
          <Link
            to="/citizen/complaints"
            className="gov-btn gov-btn-secondary gov-btn-sm"
            style={{ gap: "5px" }}
          >
            <ArrowLeft size={13} />
            <span>{t("back_to_list")}</span>
          </Link>

          <button onClick={fetchDetail} className="gov-btn gov-btn-secondary gov-btn-sm" style={{ gap: "5px" }}>
            <RefreshCw size={12} />
            <span>{t("refresh")}</span>
          </button>
        </div>

        {/* ── Overview Card ── */}
        <div className="gov-card" style={{ marginBottom: "20px", borderTop: "4px solid #1e3a8a" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "14px", marginBottom: "14px" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px", flexWrap: "wrap" }}>
                <span style={{ fontSize: "0.92rem", fontWeight: "800", color: "#0f172a" }}>
                  {complaint.complaintId}
                </span>
                <span className={`gov-badge gov-badge-${(complaint.status || "verified").toLowerCase().replace(" ", "_")}`}>
                  {complaint.status}
                </span>
                <span className={`priority-pill priority-${(complaint.severity || "medium").toLowerCase()}`}>
                  {complaint.severity || "Medium"} Priority ({complaint.priorityScore || 65}/100)
                </span>
                {complaint.duplicate && (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "0.72rem", background: "#f5f3ff", color: "#7c3aed", fontWeight: "800", padding: "3px 10px", borderRadius: "4px", border: "1px solid #ddd6fe" }}>
                    <GitMerge size={13} />
                    DUPLICATE LINKED
                  </span>
                )}
                {complaint.duplicateCount > 0 && (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "0.72rem", background: "#fff7ed", color: "#ea580c", fontWeight: "800", padding: "3px 10px", borderRadius: "4px", border: "1px solid #fed7aa" }}>
                    🔥 +{complaint.duplicateCount} Citizen Reports (+{complaint.duplicateCount * 10} Priority Boost)
                  </span>
                )}
              </div>
              <h1 style={{ fontSize: "1.38rem", fontWeight: "800", color: "#0f172a", letterSpacing: "-0.01em" }}>
                {complaint.title}
              </h1>
            </div>

            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "0.7rem", fontWeight: "600", color: "#64748b", textTransform: "uppercase" }}>
                {t("filed_on")}
              </div>
              <div style={{ fontSize: "0.88rem", fontWeight: "700", color: "#0f172a", marginTop: "1px" }}>
                {new Date(complaint.createdAt).toLocaleString(lang === "ta" ? "ta-IN" : "en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          </div>

          {complaint.duplicate && (
            <div style={{ background: "#f5f3ff", border: "1px solid #ddd6fe", borderRadius: "6px", padding: "10px 14px", marginBottom: "12px", color: "#5b21b6", fontSize: "0.84rem", display: "flex", alignItems: "center", gap: "8px" }}>
              <GitMerge size={16} />
              <span>
                <strong>Spatial-Semantic Duplicate Identified:</strong> This issue was also reported by another resident in this location. The work order is consolidated and the primary issue priority has been automatically escalated.
              </span>
            </div>
          )}

          <div style={{ background: "#f8fafc", padding: "14px", borderRadius: "6px", border: "1px solid var(--border-subtle)", fontSize: "0.88rem", color: "#334155", lineHeight: "1.5" }}>
            <strong>{t("incident_desc")}:</strong> {complaint.description}
          </div>
        </div>

        {/* ── 6-Tier Location Hierarchy Banner ── */}
        <div className="gov-card" style={{ marginBottom: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "10px" }}>
            <Building size={16} color="#1d4ed8" />
            <h3 style={{ fontSize: "0.88rem", fontWeight: "700", color: "#0f172a" }}>
              {t("sec5_location")}
            </h3>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "6px", fontSize: "0.82rem" }}>
            <span style={{ background: "#eff6ff", color: "#1d4ed8", padding: "3px 8px", borderRadius: "4px", fontWeight: "600", border: "1px solid #bfdbfe" }}>
              {complaint.corporationId?.name || "Municipal Corporation"}
            </span>
            <ChevronRight size={13} color="#94a3b8" />
            <span style={{ background: "#f1f5f9", color: "#334155", padding: "3px 8px", borderRadius: "4px", fontWeight: "600", border: "1px solid #e2e8f0" }}>
              {complaint.zoneId?.name || "Zone"}
            </span>
            <ChevronRight size={13} color="#94a3b8" />
            <span style={{ background: "#f1f5f9", color: "#334155", padding: "3px 8px", borderRadius: "4px", fontWeight: "600", border: "1px solid #e2e8f0" }}>
              {complaint.wardId?.wardName || complaint.location?.ward || "Ward"}
            </span>
            <ChevronRight size={13} color="#94a3b8" />
            <span style={{ background: "#f1f5f9", color: "#334155", padding: "3px 8px", borderRadius: "4px", fontWeight: "600", border: "1px solid #e2e8f0" }}>
              {complaint.locality || "Locality"}
            </span>
            {complaint.street && (
              <>
                <ChevronRight size={13} color="#94a3b8" />
                <span style={{ background: "#f1f5f9", color: "#334155", padding: "3px 8px", borderRadius: "4px", fontWeight: "600", border: "1px solid #e2e8f0" }}>
                  {complaint.street}
                </span>
              </>
            )}
            {complaint.specificLocation && (
              <>
                <ChevronRight size={13} color="#94a3b8" />
                <span style={{ background: "#ffffff", color: "#0f172a", padding: "3px 8px", borderRadius: "4px", fontWeight: "700", border: "1px solid #cbd5e1" }}>
                  {complaint.specificLocation}
                </span>
              </>
            )}
          </div>
        </div>

        {/* ── 10-Stage Workflow Timeline ── */}
        <div className="gov-card" style={{ marginBottom: "20px", overflowX: "auto" }}>
          <div className="gov-card-header" style={{ marginBottom: "10px" }}>
            <h3 className="gov-card-title">
              <Clock size={16} color="#1d4ed8" />
              <span>{t("stage_tracker")}</span>
            </h3>
            <span style={{ fontSize: "0.76rem", fontWeight: "700", color: "#1d4ed8", background: "#eff6ff", padding: "3px 8px", borderRadius: "4px", border: "1px solid #bfdbfe" }}>
              {t("current_stage")}: {complaint.status}
            </span>
          </div>

          <div className="timeline-track-container">
            <div className="timeline-connector-bar" />
            <div
              className="timeline-connector-progress"
              style={{
                width: `${Math.max(0, (currentStageIndex / (timelineStages.length - 1)) * 100)}%`,
              }}
            />

            {timelineStages.map((stage, idx) => {
              const isPassed = currentStageIndex > idx;
              const isActive = currentStageIndex === idx;
              return (
                <div
                  key={idx}
                  className={`timeline-node ${isPassed ? "passed" : ""} ${isActive ? "active" : ""}`}
                >
                  <div className="timeline-dot">
                    {isPassed ? "✓" : idx + 1}
                  </div>
                  <div className="timeline-node-text">{stage}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Photos & Map Grid ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
          
          {/* Left: Photos */}
          <div className="gov-card">
            <h3 className="gov-card-title" style={{ marginBottom: "14px" }}>
              <Camera size={16} color="#1d4ed8" />
              <span>{t("photos_heading")}</span>
            </h3>

            <div style={{ marginBottom: "14px" }}>
              <div style={{ fontSize: "0.74rem", fontWeight: "700", color: "#64748b", marginBottom: "4px", textTransform: "uppercase" }}>
                {t("before_photo")}
              </div>
              <div style={{ height: "180px", borderRadius: "6px", overflow: "hidden", border: "1px solid var(--border-subtle)" }}>
                <img
                  src={formatImageUrl(complaint.beforeImage || complaint.imageUrl, defectCategory)}
                  alt="Before Defect"
                  onError={(e) => {
                    e.currentTarget.src = defaultDefectImage;
                  }}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
            </div>

            {complaint.afterImage && (
              <div>
                <div style={{ fontSize: "0.74rem", fontWeight: "700", color: "#059669", marginBottom: "4px", textTransform: "uppercase" }}>
                  {t("after_photo")}
                </div>
                <div style={{ height: "180px", borderRadius: "6px", overflow: "hidden", border: "2px solid #059669" }}>
                  <img
                    src={formatImageUrl(complaint.afterImage)}
                    alt="After Resolution"
                    onError={(e) => {
                      e.currentTarget.src = "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&q=80";
                    }}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </div>
                {complaint.resolutionRemarks && (
                  <div style={{ marginTop: "6px", fontSize: "0.78rem", background: "#ecfdf5", padding: "8px 10px", borderRadius: "4px", color: "#065f46", border: "1px solid #a7f3d0" }}>
                    <strong>{t("work_remarks")}:</strong> {complaint.resolutionRemarks}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right: Map & Location */}
          <div className="gov-card">
            <h3 className="gov-card-title" style={{ marginBottom: "14px" }}>
              <MapPin size={16} color="#1d4ed8" />
              <span>{t("gps_coordinates")}</span>
            </h3>

            <div style={{ height: "200px", borderRadius: "6px", overflow: "hidden", border: "1px solid var(--border-strong)", marginBottom: "12px" }}>
              <MapContainer
                center={[complaint.location?.latitude || 13.0827, complaint.location?.longitude || 80.2707]}
                zoom={14}
                style={{ width: "100%", height: "100%" }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; OpenStreetMap contributors'
                />
                <Marker position={[complaint.location?.latitude || 13.0827, complaint.location?.longitude || 80.2707]} />
                <MapRecenterController center={[complaint.location?.latitude || 13.0827, complaint.location?.longitude || 80.2707]} />
              </MapContainer>
            </div>

            <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "6px", border: "1px solid var(--border-subtle)", fontSize: "0.82rem" }}>
              <div style={{ display: "flex", gap: "6px", alignItems: "flex-start", marginBottom: "4px" }}>
                <MapPin size={14} color="#1d4ed8" style={{ flexShrink: 0, marginTop: "2px" }} />
                <div>
                  <strong>{t("full_address")}:</strong> {complaint.location?.address}
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", color: "#64748b", fontSize: "0.75rem", paddingLeft: "20px" }}>
                <span>Ward: <strong>{complaint.wardId?.wardName || complaint.location?.ward || "Ward 12"}</strong></span>
                <span>Lat: {(complaint.location?.latitude || 0).toFixed(4)}, Lng: {(complaint.location?.longitude || 0).toFixed(4)}</span>
              </div>
            </div>
          </div>

        </div>

        {/* ── AI Diagnostics Metadata ── */}
        <div className="gov-card" style={{ marginBottom: "20px" }}>
          <div className="gov-card-header">
            <h3 className="gov-card-title">
              <Layers size={16} color="#1d4ed8" />
              <span>{t("ai_diagnostics")}</span>
            </h3>
            <span style={{ fontSize: "0.72rem", background: "#eff6ff", color: "#1d4ed8", padding: "2px 8px", borderRadius: "4px", fontWeight: "700", border: "1px solid #bfdbfe" }}>
              Automated Pipeline Log
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", fontSize: "0.84rem" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "6px", borderBottom: "1px solid var(--border-subtle)" }}>
                <span style={{ color: "#64748b" }}>Citizen Category:</span>
                <strong style={{ color: "#0f172a" }}>{complaint.citizenCategory}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "6px", borderBottom: "1px solid var(--border-subtle)" }}>
                <span style={{ color: "#64748b" }}>{t("ai_category")}:</span>
                <strong style={{ color: "#1d4ed8" }}>{complaint.aiCategory || complaint.citizenCategory}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#64748b" }}>{t("ai_confidence")}:</span>
                <strong style={{ color: "#059669" }}>{((complaint.aiConfidence || 0.92) * 100).toFixed(1)}%</strong>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "6px", borderBottom: "1px solid var(--border-subtle)" }}>
                <span style={{ color: "#64748b" }}>{t("assigned_dept")}:</span>
                <strong style={{ color: "#0f172a" }}>{complaint.assignedDepartment?.departmentName || complaint.aiDepartment || "Roads Department"}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "6px", borderBottom: "1px solid var(--border-subtle)" }}>
                <span style={{ color: "#64748b" }}>{t("dispatched_staff")}:</span>
                <strong style={{ color: complaint.assignedStaff ? "#0f172a" : "#d97706" }}>
                  {complaint.assignedStaff?.name || "Awaiting dispatch"}
                </strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#64748b" }}>{t("priority_score")}:</span>
                <span className={`priority-pill priority-${(complaint.severity || "medium").toLowerCase()}`}>
                  {complaint.severity || "Medium"} ({complaint.priorityScore || 65}/100)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Feedback Form Card ── */}
        {(complaint.status === "Resolved" || complaint.status === "Closed" || complaint.status === "Citizen Confirmed") && (
          <div className="gov-card" style={{ borderTop: "4px solid #059669", marginBottom: "20px" }}>
            <div className="gov-card-header">
              <h3 className="gov-card-title">
                <Star size={16} color="#059669" />
                <span>{t("rating_title")}</span>
              </h3>
            </div>

            {feedbackSent ? (
              <div style={{ background: "#ecfdf5", border: "1px solid #a7f3d0", borderRadius: "8px", padding: "16px", color: "#065f46" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: "700", marginBottom: "4px" }}>
                  <CheckCircle size={18} />
                  <span>Citizen Resolution Verified & Confirmed!</span>
                </div>
                <div style={{ display: "flex", gap: "3px", margin: "6px 0" }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={20}
                      fill={star <= feedbackRating ? "#f59e0b" : "none"}
                      color={star <= feedbackRating ? "#f59e0b" : "#cbd5e1"}
                    />
                  ))}
                </div>
                {feedbackText && <p style={{ fontSize: "0.84rem", marginTop: "4px", color: "#047857" }}>"{feedbackText}"</p>}
              </div>
            ) : (
              <form onSubmit={handleFeedbackSubmit}>
                {feedbackError && (
                  <div style={{ padding: "8px 12px", background: "#fef2f2", color: "#b91c1c", borderRadius: "6px", fontSize: "0.8rem", marginBottom: "12px" }}>
                    {feedbackError}
                  </div>
                )}
                <div style={{ marginBottom: "14px" }}>
                  <label className="gov-label">{t("rating_prompt")} *</label>
                  <div style={{ display: "flex", gap: "6px" }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setFeedbackRating(star)}
                        style={{ background: "none", border: "none", cursor: "pointer", padding: "2px" }}
                      >
                        <Star
                          size={26}
                          fill={star <= feedbackRating ? "#f59e0b" : "none"}
                          color={star <= feedbackRating ? "#f59e0b" : "#cbd5e1"}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="gov-form-group">
                  <label className="gov-label">{t("feedback_placeholder")}</label>
                  <textarea
                    className="gov-textarea"
                    rows={2}
                    placeholder="Enter feedback on speed, finish, and road condition..."
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                  />
                </div>

                <button type="submit" className="gov-btn gov-btn-success" disabled={submittingFeedback}>
                  <Check size={14} />
                  <span>{submittingFeedback ? "Submitting..." : t("submit_feedback_btn")}</span>
                </button>
              </form>
            )}
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
