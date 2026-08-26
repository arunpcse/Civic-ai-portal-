import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import API from "../../services/api";
import DashboardLayout from "../../layouts/DashboardLayout";
import { Link } from "react-router-dom";
import {
  FileText,
  PlusCircle,
  CheckCircle,
  Clock,
  AlertTriangle,
  ArrowRight,
  MapPin,
  Eye,
} from "lucide-react";

export default function CitizenDashboard() {
  const { currentUser } = useContext(AuthContext);
  const { lang, t } = useLanguage();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = async () => {
    try {
      const res = await API.get("/complaints/my");
      if (res.data.success) {
        setComplaints(res.data.complaints || []);
      }
    } catch (err) {
      console.error("Failed to load dashboard complaints:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Compute stat counts
  const totalCount = complaints.length;
  const pendingCount = complaints.filter((c) =>
    ["Submitted", "AI Processing", "Verified"].includes(c.status)
  ).length;
  const inProgressCount = complaints.filter((c) =>
    ["Assigned", "In Progress", "Resolution Submitted", "Verification"].includes(c.status)
  ).length;
  const resolvedCount = complaints.filter((c) =>
    ["Resolved", "Citizen Confirmed", "Closed"].includes(c.status)
  ).length;

  return (
    <DashboardLayout>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        
        {/* ── Welcome Banner (Clean Black & White) ── */}
        <div
          className="gov-card"
          style={{
            padding: "24px 28px",
            marginBottom: "24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <div>
            <div style={{ fontSize: "0.74rem", fontWeight: "600", color: "#71717a", marginBottom: "4px" }}>
              {t("role_citizen")} • {currentUser?.ward || "Greater Chennai Division"}
            </div>
            <h1 style={{ fontSize: "1.45rem", fontWeight: "800", color: "#09090b", letterSpacing: "-0.02em" }}>
              {lang === "ta" ? `வணக்கம், ${currentUser?.name}` : `Welcome, ${currentUser?.name}`}
            </h1>
            <p style={{ fontSize: "0.85rem", color: "#71717a", marginTop: "2px" }}>
              {lang === "ta"
                ? "மாநகராட்சி குறைகளை கண்காணிக்கவும், புதிய புகார்களை பதிவு செய்யவும்."
                : "Track municipal grievances, monitor real-time AI classification, and confirm issue resolutions."}
            </p>
          </div>

          <Link to="/citizen/report" className="gov-btn gov-btn-primary" style={{ padding: "10px 18px", fontSize: "0.88rem" }}>
            <PlusCircle size={15} />
            <span>{t("lodge_grievance")}</span>
          </Link>
        </div>

        {/* ── KPI Stat Tiles ── */}
        <div className="stat-kpi-grid">
          <div className="stat-kpi-card">
            <div className="stat-icon-wrapper">
              <FileText size={20} />
            </div>
            <div>
              <div className="stat-val">{totalCount}</div>
              <div className="stat-lbl">{lang === "ta" ? "மொத்த புகார்கள்" : "Total Logged"}</div>
            </div>
          </div>

          <div className="stat-kpi-card">
            <div className="stat-icon-wrapper">
              <Clock size={20} />
            </div>
            <div>
              <div className="stat-val">{pendingCount}</div>
              <div className="stat-lbl">{lang === "ta" ? "சரிபார்ப்பில் உள்ளவை" : "AI Verification"}</div>
            </div>
          </div>

          <div className="stat-kpi-card">
            <div className="stat-icon-wrapper">
              <AlertTriangle size={20} />
            </div>
            <div>
              <div className="stat-val">{inProgressCount}</div>
              <div className="stat-lbl">{lang === "ta" ? "செயலில் உள்ள பணிகள்" : "Work in Progress"}</div>
            </div>
          </div>

          <div className="stat-kpi-card">
            <div className="stat-icon-wrapper">
              <CheckCircle size={20} />
            </div>
            <div>
              <div className="stat-val">{resolvedCount}</div>
              <div className="stat-lbl">{lang === "ta" ? "தீர்வு காணப்பட்டவை" : "Resolved / Closed"}</div>
            </div>
          </div>
        </div>

        {/* ── Recent Grievances Card ── */}
        <div className="gov-card" style={{ padding: "0", overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h3 style={{ fontSize: "0.95rem", fontWeight: "700", color: "#09090b" }}>
                {lang === "ta" ? "சமீபத்திய புகார்கள்" : "Recent Grievance Submissions"}
              </h3>
            </div>
            <Link to="/citizen/complaints" style={{ fontSize: "0.8rem", fontWeight: "600", color: "#09090b", textDecoration: "none" }}>
              {lang === "ta" ? "அனைத்தையும் காண்க →" : "View All →"}
            </Link>
          </div>

          {loading ? (
            <div style={{ padding: "30px", textAlign: "center", color: "#71717a", fontSize: "0.85rem" }}>
              Loading recent records...
            </div>
          ) : complaints.length === 0 ? (
            <div style={{ padding: "40px 20px", textAlign: "center", color: "#71717a" }}>
              <p style={{ fontWeight: "600", color: "#09090b", fontSize: "0.9rem" }}>{t("no_records")}</p>
              <Link to="/citizen/report" className="gov-btn gov-btn-secondary gov-btn-sm" style={{ marginTop: "12px" }}>
                {t("lodge_grievance")}
              </Link>
            </div>
          ) : (
            <div className="gov-table-container" style={{ border: "none" }}>
              <table className="gov-table">
                <thead>
                  <tr>
                    <th>Reference ID</th>
                    <th>Issue Title</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th>Filed On</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {complaints.slice(0, 5).map((item) => (
                    <tr key={item._id}>
                      <td style={{ fontWeight: "700", color: "#09090b" }}>
                        {item.complaintId}
                      </td>
                      <td>
                        <div style={{ fontWeight: "600", color: "#09090b", marginBottom: "2px" }}>
                          {item.title}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.74rem", color: "#71717a" }}>
                          <MapPin size={11} />
                          <span>{item.location?.ward || "Ward 102"}, {item.locality || "Area"}</span>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontSize: "0.82rem", color: "#09090b", fontWeight: "600" }}>
                          {item.aiCategory || item.citizenCategory}
                        </span>
                        {item.duplicateCount > 0 && (
                          <div style={{ marginTop: "3px", fontSize: "0.68rem", fontWeight: "700", color: "#b45309", background: "#fef3c7", border: "1px solid #fde68a", padding: "1px 6px", borderRadius: "4px", display: "inline-flex", alignItems: "center", gap: "3px" }}>
                            🔥 +{item.duplicateCount} Reports (Score: {item.priorityScore})
                          </div>
                        )}
                      </td>
                      <td>
                        <span className={`gov-badge gov-badge-${(item.status || "submitted").toLowerCase().replace(" ", "_")}`}>
                          {item.status}
                        </span>
                      </td>
                      <td style={{ fontSize: "0.78rem", color: "#71717a", whiteSpace: "nowrap" }}>
                        {new Date(item.createdAt).toLocaleDateString(lang === "ta" ? "ta-IN" : "en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                      <td>
                        <Link
                          to={`/citizen/complaint/${item._id}`}
                          className="gov-btn gov-btn-secondary gov-btn-sm"
                          style={{ gap: "3px" }}
                        >
                          <Eye size={12} />
                          <span>View</span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </DashboardLayout>
  );
}
