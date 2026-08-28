import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import API, { formatImageUrl } from "../../services/api";
import DashboardLayout from "../../layouts/DashboardLayout";
import { Link } from "react-router-dom";
import {
  Users,
  CheckCircle,
  Clock,
  AlertTriangle,
  FileText,
  UserCheck,
  Search,
  Filter,
  Eye,
  Check,
  X,
  Camera,
  Layers,
  ArrowRight,
  MapPin,
} from "lucide-react";

export default function DepartmentDashboard() {
  const { currentUser } = useContext(AuthContext);
  const [complaints, setComplaints] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  const [verifyingComplaint, setVerifyingComplaint] = useState(null);
  const [verificationFeedback, setVerificationFeedback] = useState("");
  const [submittingAction, setSubmittingAction] = useState(false);

  const fetchData = async () => {
    try {
      const res = await API.get("/staff/department/complaints");
      if (res.data.success) {
        setComplaints(res.data.complaints || []);
      }

      try {
        const staffRes = await API.get("/staff");
        if (staffRes.data.success) {
          setStaffList(staffRes.data.staff || []);
        }
      } catch (staffErr) {
        console.error("Staff fetch:", staffErr.message);
      }
    } catch (err) {
      console.error("Failed to load department data:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAssign = async (complaintId, staffId) => {
    if (!staffId) return;
    try {
      const res = await API.put(`/staff/department/complaint/${complaintId}/assign`, { staffId });
      if (res.data.success) {
        alert("Work order successfully assigned to field staff officer.");
        fetchData();
      }
    } catch (err) {
      alert("Error assigning staff: " + (err.response?.data?.message || err.message));
    }
  };

  const handleVerifyResolution = async (action) => {
    if (!verifyingComplaint) return;
    setSubmittingAction(true);
    try {
      const res = await API.put(`/staff/department/complaint/${verifyingComplaint._id}/verify`, {
        action,
        feedback: verificationFeedback,
      });
      if (res.data.success) {
        alert(`Resolution ${action === "Approve" ? "Approved & Marked as Resolved" : "Rejected & Sent Back to Field Staff"}!`);
        setVerifyingComplaint(null);
        setVerificationFeedback("");
        fetchData();
      }
    } catch (err) {
      alert("Verification error: " + (err.response?.data?.message || err.message));
    } finally {
      setSubmittingAction(false);
    }
  };

  const filteredComplaints = complaints.filter((c) => {
    const matchesSearch =
      (c.complaintId || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.location?.address || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || (c.status || "").toLowerCase() === statusFilter.toLowerCase();
    const matchesPriority =
      priorityFilter === "all" || (c.severity || "").toLowerCase() === priorityFilter.toLowerCase();
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const totalCount = complaints.length;
  const pendingAssignCount = complaints.filter((c) => ["Submitted", "Verified"].includes(c.status)).length;
  const inProgressCount = complaints.filter((c) => ["Assigned", "In Progress"].includes(c.status)).length;
  const pendingVerifyCount = complaints.filter((c) => c.status === "Resolution Submitted").length;
  const resolvedCount = complaints.filter((c) => ["Resolved", "Citizen Confirmed", "Closed"].includes(c.status)).length;

  return (
    <DashboardLayout>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        
        {/* Verification Modal */}
        {verifyingComplaint && (
          <div className="gov-modal-backdrop">
            <div className="gov-modal-dialog" style={{ maxWidth: "700px" }}>
              <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "linear-gradient(135deg, #0b2545 0%, #1e3a8a 100%)", borderRadius: "12px 12px 0 0" }}>
                <div>
                  <h3 style={{ fontSize: "1.05rem", fontWeight: "700", color: "#ffffff" }}>
                    Resolution Verification Audit
                  </h3>
                  <div style={{ fontSize: "0.78rem", color: "#93c5fd", marginTop: "2px" }}>
                    {verifyingComplaint.complaintId}: {verifyingComplaint.title}
                  </div>
                </div>
                <button onClick={() => setVerifyingComplaint(null)} style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.2)", cursor: "pointer", color: "#ffffff", borderRadius: "6px", padding: "4px 8px" }}>
                  <X size={18} />
                </button>
              </div>

              <div style={{ padding: "24px" }}>
                <div style={{ background: "#f8fafc", borderRadius: "6px", padding: "10px 14px", marginBottom: "18px", fontSize: "0.8rem", color: "#64748b", display: "flex", gap: "16px", flexWrap: "wrap" }}>
                  <span><strong>Location:</strong> {verifyingComplaint.location?.address || "GPS Detected"}</span>
                  <span><strong>Ward:</strong> {verifyingComplaint.wardId?.wardName || verifyingComplaint.location?.ward || "—"}</span>
                  <span><strong>Staff:</strong> {verifyingComplaint.assignedStaff?.name || "—"}</span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "18px" }}>
                  <div>
                    <div style={{ fontSize: "0.74rem", fontWeight: "700", color: "#64748b", marginBottom: "6px", textTransform: "uppercase" }}>Before Repair</div>
                    <div style={{ height: "180px", borderRadius: "8px", overflow: "hidden", border: "1px solid #e2e8f0", background: "#f8fafc" }}>
                      <img
                        src={formatImageUrl(verifyingComplaint.beforeImage || verifyingComplaint.imageUrl, verifyingComplaint.aiCategory || verifyingComplaint.citizenCategory)}
                        alt="Before"
                        onError={(e) => { e.currentTarget.src = formatImageUrl("", verifyingComplaint.aiCategory || verifyingComplaint.citizenCategory); }}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: "0.74rem", fontWeight: "700", color: "#059669", marginBottom: "6px", textTransform: "uppercase" }}>After Repair</div>
                    <div style={{
                      height: "180px", borderRadius: "8px", overflow: "hidden",
                      border: verifyingComplaint.afterImage ? "2px solid #059669" : "2px dashed #e2e8f0",
                      background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      {verifyingComplaint.afterImage ? (
                        <img
                          src={formatImageUrl(verifyingComplaint.afterImage)}
                          alt="After Repair"
                          onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&q=80"; }}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      ) : (
                        <div style={{ textAlign: "center", color: "#94a3b8", fontSize: "0.8rem" }}>
                          <Camera size={28} style={{ marginBottom: "6px", opacity: 0.5 }} />
                          <div>No After Photo Uploaded</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {verifyingComplaint.resolutionRemarks && (
                  <div style={{ background: "#fffbeb", padding: "10px 14px", borderRadius: "8px", fontSize: "0.84rem", color: "#92400e", marginBottom: "16px", border: "1px solid #fde68a" }}>
                    <strong>Field Officer Remarks:</strong> {verifyingComplaint.resolutionRemarks}
                  </div>
                )}

                <div className="gov-form-group">
                  <label className="gov-label">Department Head Audit Feedback (Optional)</label>
                  <textarea
                    className="gov-textarea"
                    rows={2}
                    placeholder="Enter audit remarks for the resolution record..."
                    value={verificationFeedback}
                    onChange={(e) => setVerificationFeedback(e.target.value)}
                  />
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                  <button
                    onClick={() => handleVerifyResolution("Reject")}
                    className="gov-btn gov-btn-danger"
                    disabled={submittingAction}
                  >
                    <X size={15} /> Reject Resolution
                  </button>
                  <button
                    onClick={() => handleVerifyResolution("Approve")}
                    className="gov-btn gov-btn-success"
                    disabled={submittingAction}
                  >
                    <Check size={15} /> Approve & Mark Resolved
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Top Header Banner ── */}
        <div
          className="gov-card"
          style={{
            padding: "20px 24px",
            marginBottom: "20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "14px",
          }}
        >
          <div>
            <div style={{ fontSize: "0.72rem", fontWeight: "600", color: "#71717a", textTransform: "uppercase", marginBottom: "2px" }}>
              Department Nodal Head
            </div>
            <h1 style={{ fontSize: "1.45rem", fontWeight: "800", color: "#09090b", letterSpacing: "-0.02em" }}>
              {currentUser?.name} — Department Operations
            </h1>
            <p style={{ fontSize: "0.84rem", color: "#71717a", marginTop: "2px" }}>
              Review AI grievance routing, assign field staff work orders, and audit resolution evidence.
            </p>
          </div>

          <button onClick={fetchData} className="gov-btn gov-btn-secondary gov-btn-sm" style={{ gap: "5px" }}>
            <Clock size={13} /> Refresh Queue
          </button>
        </div>

        {/* ── Metric KPI Tiles ── */}
        <div className="stat-kpi-grid">
          <div className="stat-kpi-card">
            <div className="stat-icon-wrapper">
              <FileText size={18} />
            </div>
            <div>
              <div className="stat-val">{totalCount}</div>
              <div className="stat-lbl">Department Total</div>
            </div>
          </div>

          <div className="stat-kpi-card">
            <div className="stat-icon-wrapper">
              <Clock size={18} />
            </div>
            <div>
              <div className="stat-val">{pendingAssignCount}</div>
              <div className="stat-lbl">Needs Assignment</div>
            </div>
          </div>

          <div className="stat-kpi-card">
            <div className="stat-icon-wrapper">
              <Users size={18} />
            </div>
            <div>
              <div className="stat-val">{inProgressCount}</div>
              <div className="stat-lbl">Active In Field</div>
            </div>
          </div>

          <div className="stat-kpi-card">
            <div className="stat-icon-wrapper">
              <AlertTriangle size={18} />
            </div>
            <div>
              <div className="stat-val">{pendingVerifyCount}</div>
              <div className="stat-lbl">Pending Audit</div>
            </div>
          </div>

          <div className="stat-kpi-card">
            <div className="stat-icon-wrapper">
              <CheckCircle size={18} />
            </div>
            <div>
              <div className="stat-val">{resolvedCount}</div>
              <div className="stat-lbl">Resolved Issues</div>
            </div>
          </div>
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
              placeholder="Search by ID, issue description, address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "0.78rem", fontWeight: "600", color: "#71717a" }}>
              Status:
            </span>
            <select
              className="gov-select"
              style={{ width: "150px", fontSize: "0.82rem" }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="submitted">Submitted</option>
              <option value="verified">Verified</option>
              <option value="assigned">Assigned</option>
              <option value="in progress">In Progress</option>
              <option value="resolution submitted">Pending Audit</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "0.78rem", fontWeight: "600", color: "#71717a" }}>
              Priority:
            </span>
            <select
              className="gov-select"
              style={{ width: "140px", fontSize: "0.82rem" }}
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <option value="all">All Priorities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        {/* ── Department Queue Table ── */}
        <div className="gov-card" style={{ padding: "0", overflow: "hidden" }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "36px", color: "#71717a", fontSize: "0.85rem" }}>
              Loading department queue...
            </div>
          ) : filteredComplaints.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 20px", color: "#71717a" }}>
              <FileText size={32} style={{ opacity: 0.3, marginBottom: "8px" }} />
              <p style={{ fontWeight: "700", color: "#09090b" }}>No matching complaints found</p>
            </div>
          ) : (
            <div className="gov-table-container" style={{ border: "none" }}>
              <table className="gov-table">
                <thead>
                  <tr>
                    <th>Reference ID</th>
                    <th>Issue Title & Location</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Assigned Staff</th>
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
                        <span className="priority-pill">
                          {item.severity || "Medium"}
                        </span>
                      </td>
                      <td>
                        <span className="gov-badge">
                          {item.status}
                        </span>
                      </td>
                      <td>
                        {item.assignedStaff ? (
                          <div style={{ fontSize: "0.82rem", fontWeight: "600", color: "#09090b" }}>
                            {item.assignedStaff.name}
                          </div>
                        ) : (
                          <select
                            className="gov-select"
                            style={{ padding: "4px 8px", fontSize: "0.78rem", width: "160px" }}
                            defaultValue=""
                            onChange={(e) => handleAssign(item._id, e.target.value)}
                          >
                            <option value="" disabled>Assign Officer...</option>
                            {staffList.map((s) => (
                              <option key={s._id} value={s._id}>
                                {s.name}
                              </option>
                            ))}
                          </select>
                        )}
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: "6px" }}>
                          <Link
                            to={`/department/complaint/${item._id}`}
                            className="gov-btn gov-btn-secondary gov-btn-sm"
                            style={{ gap: "3px" }}
                          >
                            <Eye size={12} /> View
                          </Link>
                          {item.status === "Resolution Submitted" && (
                            <button
                              onClick={() => setVerifyingComplaint(item)}
                              className="gov-btn gov-btn-primary gov-btn-sm"
                              style={{ gap: "3px" }}
                            >
                              <Check size={12} /> Audit
                            </button>
                          )}
                        </div>
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
