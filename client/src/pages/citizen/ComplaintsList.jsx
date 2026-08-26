import React, { useState, useEffect } from "react";
import API from "../../services/api";
import DashboardLayout from "../../layouts/DashboardLayout";
import { useLanguage } from "../../context/LanguageContext";
import { Link } from "react-router-dom";
import { Search, MapPin, Eye, Filter, PlusCircle, FileText } from "lucide-react";

export default function ComplaintsList() {
  const { lang, t } = useLanguage();
  const [complaints, setComplaints] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  const fetchList = async () => {
    try {
      const res = await API.get("/complaints/my");
      if (res.data.success) {
        setComplaints(res.data.complaints || []);
      }
    } catch (err) {
      console.error("Failed to load grievances:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  const filteredComplaints = complaints.filter((c) => {
    const matchesSearch =
      (c.complaintId || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.location?.address || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || (c.status || "").toLowerCase() === statusFilter.toLowerCase();
    const matchesCategory =
      categoryFilter === "all" ||
      (c.aiCategory || c.citizenCategory || "").toLowerCase().includes(categoryFilter.toLowerCase());
    return matchesSearch && matchesStatus && matchesCategory;
  });

  return (
    <DashboardLayout>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        
        {/* ── Page Header ── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "10px" }}>
          <div>
            <h1 style={{ fontSize: "1.45rem", fontWeight: "800", color: "#09090b", letterSpacing: "-0.02em" }}>
              {t("my_grievances")}
            </h1>
            <p style={{ fontSize: "0.84rem", color: "#71717a", marginTop: "2px" }}>
              Comprehensive catalog of all submitted civic issues, work orders, and resolution audit records.
            </p>
          </div>
          <Link to="/citizen/report" className="gov-btn gov-btn-primary gov-btn-sm">
            <PlusCircle size={14} />
            <span>{t("lodge_grievance")}</span>
          </Link>
        </div>

        {/* ── Filter Toolbar ── */}
        <div
          className="gov-card"
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "12px",
            alignItems: "center",
            padding: "14px 18px",
            marginBottom: "20px",
          }}
        >
          {/* Search Box */}
          <div style={{ position: "relative", flex: 1, minWidth: "240px" }}>
            <Search
              size={15}
              style={{
                position: "absolute",
                left: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#a1a1aa",
              }}
            />
            <input
              type="text"
              className="gov-input"
              style={{ paddingLeft: "32px", fontSize: "0.84rem" }}
              placeholder={t("search_placeholder")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Status Filter */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "0.78rem", fontWeight: "600", color: "#71717a", whiteSpace: "nowrap" }}>
              {t("filter_status")}:
            </span>
            <select
              className="gov-select"
              style={{ width: "150px", fontSize: "0.82rem" }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">{t("all_statuses")}</option>
              <option value="submitted">Submitted</option>
              <option value="verified">Verified</option>
              <option value="assigned">Assigned</option>
              <option value="in progress">In Progress</option>
              <option value="resolution submitted">Pending Verification</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          {/* Category Filter */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "0.78rem", fontWeight: "600", color: "#71717a", whiteSpace: "nowrap" }}>
              {t("filter_category")}:
            </span>
            <select
              className="gov-select"
              style={{ width: "150px", fontSize: "0.82rem" }}
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">{t("all_categories")}</option>
              <option value="pothole">Roads & Potholes</option>
              <option value="garbage">Solid Waste</option>
              <option value="water">Water Supply</option>
              <option value="drainage">Drainage</option>
              <option value="streetlight">Streetlights</option>
            </select>
          </div>
        </div>

        {/* ── Table Records View ── */}
        <div className="gov-card" style={{ padding: "0", overflow: "hidden" }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "36px", color: "#71717a", fontSize: "0.85rem" }}>
              Loading registry records...
            </div>
          ) : filteredComplaints.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 20px", color: "#71717a" }}>
              <FileText size={32} style={{ opacity: 0.3, marginBottom: "8px" }} />
              <p style={{ fontWeight: "700", color: "#09090b", fontSize: "0.9rem" }}>{t("no_records")}</p>
              <p style={{ fontSize: "0.78rem", marginTop: "3px" }}>Try adjusting your search query or filter.</p>
            </div>
          ) : (
            <div className="gov-table-container" style={{ border: "none" }}>
              <table className="gov-table">
                <thead>
                  <tr>
                    <th>Reference ID</th>
                    <th>Issue Title & Location</th>
                    <th>Category & Dept</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Filed On</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredComplaints.map((item) => (
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
                          <span>{item.location?.address || "Address"} ({item.location?.ward || "Ward"})</span>
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: "0.82rem", fontWeight: "600", color: "#09090b" }}>
                          {item.aiCategory || item.citizenCategory}
                        </div>
                        <div style={{ fontSize: "0.7rem", color: "#71717a" }}>
                          {item.aiDepartment || item.assignedDepartment?.departmentName || "Assigned Dept"}
                        </div>
                        {item.duplicateCount > 0 && (
                          <div style={{ marginTop: "3px", fontSize: "0.68rem", fontWeight: "700", color: "#b45309", background: "#fef3c7", border: "1px solid #fde68a", padding: "1px 6px", borderRadius: "4px", display: "inline-flex", alignItems: "center", gap: "3px" }}>
                            🔥 +{item.duplicateCount} Citizen Reports
                          </div>
                        )}
                      </td>
                      <td>
                        <span className={`priority-pill priority-${(item.severity || "medium").toLowerCase()}`}>
                          {item.severity || "Medium"} ({item.priorityScore || 65})
                        </span>
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
                          <span>Track</span>
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
