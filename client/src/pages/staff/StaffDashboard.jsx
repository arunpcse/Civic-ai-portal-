import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import API from "../../services/api";
import DashboardLayout from "../../layouts/DashboardLayout";
import { Link } from "react-router-dom";
import {
  ClipboardList,
  CheckCircle,
  Clock,
  AlertTriangle,
  Camera,
  MapPin,
  Send,
  Upload,
  Eye,
  Play,
  Check,
  X,
  FileText,
} from "lucide-react";

export default function StaffDashboard() {
  const { currentUser } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedTask, setSelectedTask] = useState(null);
  const [resolutionRemarks, setResolutionRemarks] = useState("");
  const [afterImage, setAfterImage] = useState(null);
  const [afterPreview, setAfterPreview] = useState("");
  const [afterBase64, setAfterBase64] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchTasks = async () => {
    try {
      const res = await API.get("/staff/tasks");
      if (res.data.success) {
        setTasks(res.data.tasks || []);
      }
    } catch (err) {
      console.error("Failed to load staff tasks:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleUpdateStatus = async (taskId, status) => {
    try {
      const res = await API.put(`/staff/task/${taskId}/status`, { status });
      if (res.data.success) {
        alert(`Work order marked as "${status}"!`);
        fetchTasks();
      }
    } catch (err) {
      alert("Error updating status: " + (err.response?.data?.message || err.message));
    }
  };



  const handleAfterImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAfterImage(file);
      setAfterPreview(URL.createObjectURL(file));
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setAfterBase64(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitResolution = async (e) => {
    e.preventDefault();
    if (!selectedTask || !resolutionRemarks) {
      alert("Please provide resolution work remarks.");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("resolutionRemarks", resolutionRemarks);
      if (afterImage) {
        formData.append("afterImage", afterImage);
      }
      if (afterBase64) {
        formData.append("afterBase64", afterBase64);
      }

      const res = await API.put(`/staff/task/${selectedTask._id}/resolve`, formData);

      if (res.data.success) {
        alert("Work order resolution submitted to Department Head for verification!");
        setSelectedTask(null);
        setResolutionRemarks("");
        setAfterImage(null);
        setAfterPreview("");
        fetchTasks();
      }
    } catch (err) {
      alert("Error submitting resolution: " + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const assignedCount = tasks.filter((t) => t.status === "Assigned").length;
  const inProgressCount = tasks.filter((t) => t.status === "In Progress").length;
  const completedCount = tasks.filter((t) =>
    ["Resolution Submitted", "Resolved", "Citizen Confirmed", "Closed"].includes(t.status)
  ).length;

  return (
    <DashboardLayout>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        
        {/* Resolution Modal */}
        {selectedTask && (
          <div className="gov-modal-backdrop">
            <div className="gov-modal-dialog" style={{ maxWidth: "580px" }}>
              <div style={{ padding: "18px 22px", borderBottom: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 style={{ fontSize: "1.05rem", fontWeight: "700", color: "#09090b" }}>
                  Submit Completed Work Order
                </h3>
                <button onClick={() => setSelectedTask(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#71717a" }}>
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmitResolution} style={{ padding: "22px" }}>
                <div style={{ marginBottom: "14px" }}>
                  <div style={{ fontSize: "0.84rem", fontWeight: "700", color: "#09090b" }}>{selectedTask.complaintId}: {selectedTask.title}</div>
                  <div style={{ fontSize: "0.78rem", color: "#71717a" }}>Location: {selectedTask.location?.address}</div>
                </div>

                <div className="gov-form-group">
                  <label className="gov-label">Field Resolution Remarks *</label>
                  <textarea
                    className="gov-textarea"
                    rows={3}
                    placeholder="Describe repair materials used, actions completed, and current condition..."
                    value={resolutionRemarks}
                    onChange={(e) => setResolutionRemarks(e.target.value)}
                    required
                  />
                </div>

                <div style={{ marginBottom: "18px" }}>
                  <label className="gov-label">Upload After-Repair Verification Photo *</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAfterImageChange}
                    style={{ display: "none" }}
                    id="after-photo-upload"
                  />
                  <label
                    htmlFor="after-photo-upload"
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                      padding: "16px",
                      border: "1.5px dashed var(--border-strong)",
                      borderRadius: "6px",
                      background: "#fbfbfb",
                      cursor: "pointer",
                    }}
                  >
                    <Camera size={20} color="#71717a" />
                    <span style={{ fontSize: "0.8rem", fontWeight: "600", color: "#09090b" }}>
                      {afterImage ? afterImage.name : "Select inspection completion photo"}
                    </span>
                  </label>

                  {afterPreview && (
                    <div style={{ marginTop: "10px", height: "100px", borderRadius: "6px", overflow: "hidden", border: "1px solid var(--border-subtle)" }}>
                      <img src={afterPreview} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                  )}
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                  <button type="button" onClick={() => setSelectedTask(null)} className="gov-btn gov-btn-secondary gov-btn-sm">
                    Cancel
                  </button>
                  <button type="submit" className="gov-btn gov-btn-primary gov-btn-sm" disabled={submitting}>
                    <Send size={13} />
                    <span>{submitting ? "Submitting..." : "Submit to Department Head"}</span>
                  </button>
                </div>
              </form>
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
              Field Staff Operations
            </div>
            <h1 style={{ fontSize: "1.45rem", fontWeight: "800", color: "#09090b", letterSpacing: "-0.02em" }}>
              {currentUser?.name} — Field Staff Workspace
            </h1>
            <p style={{ fontSize: "0.84rem", color: "#71717a", marginTop: "2px" }}>
              Inspect assigned civic grievances, update repair status, and upload photographic verification.
            </p>
          </div>

          <button onClick={fetchTasks} className="gov-btn gov-btn-secondary gov-btn-sm" style={{ gap: "5px" }}>
            <Clock size={13} /> Refresh Work Orders
          </button>
        </div>

        {/* ── KPI Stat Tiles ── */}
        <div className="stat-kpi-grid">
          <div className="stat-kpi-card">
            <div className="stat-icon-wrapper">
              <ClipboardList size={18} />
            </div>
            <div>
              <div className="stat-val">{tasks.length}</div>
              <div className="stat-lbl">Assigned Orders</div>
            </div>
          </div>

          <div className="stat-kpi-card">
            <div className="stat-icon-wrapper">
              <Clock size={18} />
            </div>
            <div>
              <div className="stat-val">{assignedCount}</div>
              <div className="stat-lbl">Pending Start</div>
            </div>
          </div>

          <div className="stat-kpi-card">
            <div className="stat-icon-wrapper">
              <Play size={18} />
            </div>
            <div>
              <div className="stat-val">{inProgressCount}</div>
              <div className="stat-lbl">In Progress</div>
            </div>
          </div>

          <div className="stat-kpi-card">
            <div className="stat-icon-wrapper">
              <CheckCircle size={18} />
            </div>
            <div>
              <div className="stat-val">{completedCount}</div>
              <div className="stat-lbl">Completed</div>
            </div>
          </div>
        </div>

        {/* ── Tasks Table ── */}
        <div className="gov-card" style={{ padding: "0", overflow: "hidden" }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "36px", color: "#71717a", fontSize: "0.85rem" }}>
              Loading assigned work orders...
            </div>
          ) : tasks.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 20px", color: "#71717a" }}>
              <CheckCircle size={32} style={{ opacity: 0.3, marginBottom: "8px" }} />
              <p style={{ fontWeight: "700", color: "#09090b" }}>No active work orders assigned</p>
            </div>
          ) : (
            <div className="gov-table-container" style={{ border: "none" }}>
              <table className="gov-table">
                <thead>
                  <tr>
                    <th>Work Order ID</th>
                    <th>Defect Description & Location</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((t) => (
                    <tr key={t._id}>
                      <td style={{ fontWeight: "700", color: "#09090b" }}>
                        {t.complaintId}
                      </td>
                      <td>
                        <div style={{ fontWeight: "600", color: "#09090b", marginBottom: "2px" }}>
                          {t.title}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.74rem", color: "#71717a" }}>
                          <MapPin size={11} />
                          <span>{t.location?.address || "Address"} ({t.location?.ward || "Ward"})</span>
                        </div>
                      </td>
                      <td>
                        <span className="priority-pill">
                          {t.severity || "Medium"}
                        </span>
                      </td>
                      <td>
                        <span className="gov-badge">
                          {t.status}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: "6px" }}>
                          {t.status === "Assigned" && (
                            <button
                              onClick={() => handleUpdateStatus(t._id, "In Progress")}
                              className="gov-btn gov-btn-secondary gov-btn-sm"
                              style={{ gap: "3px" }}
                            >
                              <Play size={12} /> Start Work
                            </button>
                          )}
                          {t.status === "In Progress" && (
                            <button
                              onClick={() => setSelectedTask(t)}
                              className="gov-btn gov-btn-primary gov-btn-sm"
                              style={{ gap: "3px" }}
                            >
                              <Check size={12} /> Complete
                            </button>
                          )}
                          <Link
                            to={`/staff/task/${t._id}`}
                            className="gov-btn gov-btn-secondary gov-btn-sm"
                            style={{ gap: "3px" }}
                          >
                            <Eye size={12} /> Details
                          </Link>
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
