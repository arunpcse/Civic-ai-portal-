import React, { useState, useEffect, useCallback } from "react";
import API from "../../services/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from "recharts";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import DashboardLayout from "../../layouts/DashboardLayout";
import {
  BarChart2,
  CheckCircle,
  Clock,
  Layers,
  MapPin,
  RefreshCw,
  TrendingUp,
  Activity,
  AlertTriangle,
} from "lucide-react";

// ── Rich status → colour mapping ──────────────────────────────
const STATUS_COLORS = {
  Submitted:             "#3b82f6",
  "AI Processing":       "#8b5cf6",
  Verified:              "#0ea5e9",
  Assigned:              "#f59e0b",
  "In Progress":         "#f97316",
  "Resolution Submitted":"#10b981",
  Verification:          "#14b8a6",
  Resolved:              "#22c55e",
  Duplicate:             "#a78bfa",
  Rejected:              "#ef4444",
  Closed:                "#64748b",
};
const PIE_COLORS = Object.values(STATUS_COLORS);

// ── severity → map dot colour ─────────────────────────────────
const severityColour = (sev, status) => {
  if (status === "Resolved" || status === "Closed") return "#22c55e";
  if (sev === "Critical") return "#ef4444";
  if (sev === "High")     return "#f97316";
  if (sev === "Medium")   return "#f59e0b";
  return "#3b82f6";
};

// ── Custom chart tooltip ───────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#fff",
      border: "1px solid #e2e8f0",
      borderRadius: "8px",
      padding: "10px 14px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
      fontSize: "0.78rem",
    }}>
      <p style={{ fontWeight: "700", color: "#0f172a", marginBottom: "4px" }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || "#334155", margin: "2px 0" }}>
          {p.name}: <strong>{p.value}</strong>
        </p>
      ))}
    </div>
  );
};

// ── KPI tile ──────────────────────────────────────────────────
const KpiTile = ({ icon, label, value, colour, sub }) => (
  <div style={{
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: "10px",
    padding: "18px 20px",
    borderTop: `4px solid ${colour}`,
    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
  }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
      <div>
        <div style={{ fontSize: "2rem", fontWeight: "800", color: "#0f172a", lineHeight: 1.1 }}>
          {value}
        </div>
        <div style={{ fontSize: "0.8rem", fontWeight: "600", color: "#64748b", marginTop: "4px" }}>
          {label}
        </div>
        {sub && <div style={{ fontSize: "0.72rem", color: "#94a3b8", marginTop: "2px" }}>{sub}</div>}
      </div>
      <div style={{
        width: "38px", height: "38px", borderRadius: "8px",
        background: `${colour}18`,
        display: "flex", alignItems: "center", justifyContent: "center",
        color: colour, flexShrink: 0,
      }}>
        {icon}
      </div>
    </div>
  </div>
);

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [mapCenter, setMapCenter] = useState([13.0827, 80.2707]);

  const fetchAnalytics = useCallback(async (manual = false) => {
    if (manual) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await API.get("/analytics/dashboard");
      if (res.data.success) {
        setAnalytics(res.data.analytics);
        const pts = res.data.analytics.mapData || [];
        const validPt = pts.find((p) => p.location?.latitude);
        if (validPt) {
          setMapCenter([validPt.location.latitude, validPt.location.longitude]);
        }
      }
    } catch (err) {
      console.error("Analytics fetch failed:", err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Auto-refresh every 30 seconds for real-time feel
  useEffect(() => {
    fetchAnalytics();
    const interval = setInterval(() => fetchAnalytics(), 30000);
    return () => clearInterval(interval);
  }, [fetchAnalytics]);

  if (loading) {
    return (
      <DashboardLayout>
        <div style={{ textAlign: "center", padding: "80px 20px" }}>
          <RefreshCw size={32} className="spin-indicator" style={{ marginBottom: "12px", color: "#1d4ed8" }} />
          <div style={{ fontWeight: "600", color: "#334155" }}>Loading city-wide analytics...</div>
        </div>
      </DashboardLayout>
    );
  }

  const s = analytics?.summary || {};

  return (
    <DashboardLayout>
      <div style={{ maxWidth: "1340px", margin: "0 auto" }}>

        {/* ── Page Header ── */}
        <div style={{
          background: "linear-gradient(135deg, #0b2545 0%, #1e3a8a 100%)",
          borderRadius: "12px",
          padding: "22px 28px",
          marginBottom: "22px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "14px",
        }}>
          <div>
            <div style={{ fontSize: "0.72rem", fontWeight: "700", color: "#93c5fd", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "4px" }}>
              Municipal Commissioner · Intelligence Center
            </div>
            <h1 style={{ fontSize: "1.5rem", fontWeight: "800", color: "#ffffff", letterSpacing: "-0.02em", marginBottom: "4px" }}>
              City-Wide Civic Intelligence Dashboard
            </h1>
            <p style={{ fontSize: "0.83rem", color: "#94a3b8", margin: 0 }}>
              Live data refreshes every 30 seconds • Geospatial heat clusters • AI pipeline metrics
            </p>
          </div>

          <button
            onClick={() => fetchAnalytics(true)}
            disabled={refreshing}
            style={{
              display: "flex", alignItems: "center", gap: "6px",
              padding: "9px 18px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.2)",
              background: "rgba(255,255,255,0.1)", color: "#ffffff",
              fontWeight: "700", fontSize: "0.82rem", cursor: "pointer",
            }}
          >
            <RefreshCw size={14} className={refreshing ? "spin-indicator" : ""} />
            {refreshing ? "Refreshing..." : "Refresh Now"}
          </button>
        </div>

        {/* ── KPI Metric Tiles ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "14px", marginBottom: "22px" }}>
          <KpiTile
            icon={<BarChart2 size={18} />}
            label="Total Grievances"
            value={s.total ?? 0}
            colour="#3b82f6"
            sub="All time registered"
          />
          <KpiTile
            icon={<CheckCircle size={18} />}
            label="Resolved Issues"
            value={s.resolved ?? 0}
            colour="#22c55e"
            sub={`${s.resolutionRate ?? 0}% resolution rate`}
          />
          <KpiTile
            icon={<Clock size={18} />}
            label="Active in Pipeline"
            value={s.pending ?? 0}
            colour="#f59e0b"
            sub="Awaiting action"
          />
          <KpiTile
            icon={<Layers size={18} />}
            label="Duplicates Linked"
            value={s.duplicate ?? 0}
            colour="#8b5cf6"
            sub="Merged to parent"
          />
          <KpiTile
            icon={<TrendingUp size={18} />}
            label="Avg Priority Score"
            value={`${s.avgPriority ?? 0}/100`}
            colour="#f97316"
            sub="Weighted AI score"
          />
        </div>

        {/* ── Charts Row ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 0.6fr", gap: "16px", marginBottom: "16px" }}>

          {/* Dept Workload Bar Chart */}
          <div className="gov-card">
            <div className="gov-card-header" style={{ marginBottom: "16px" }}>
              <h3 className="gov-card-title">
                <BarChart2 size={16} color="#1d4ed8" />
                <span>Department Workload & Resolution Velocity</span>
              </h3>
            </div>
            {(analytics?.byDepartment || []).length === 0 ? (
              <div style={{ textAlign: "center", padding: "50px", color: "#94a3b8" }}>
                <AlertTriangle size={28} style={{ marginBottom: "8px" }} />
                <div>No department data yet. Submit and AI-process a complaint first.</div>
              </div>
            ) : (
              <div style={{ height: "260px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.byDepartment} margin={{ top: 5, right: 10, left: -20, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#64748b" }} angle={-15} textAnchor="end" />
                    <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                    <Bar dataKey="total" fill="#3b82f6" name="Total Assigned" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="resolved" fill="#22c55e" name="Resolved" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Status Pie Chart */}
          <div className="gov-card">
            <div className="gov-card-header" style={{ marginBottom: "16px" }}>
              <h3 className="gov-card-title">
                <Activity size={16} color="#1d4ed8" />
                <span>Status Distribution</span>
              </h3>
            </div>
            {(analytics?.byStatus || []).length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px", color: "#94a3b8", fontSize: "0.82rem" }}>
                No data yet
              </div>
            ) : (
              <div style={{ height: "260px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics.byStatus}
                      cx="50%"
                      cy="45%"
                      innerRadius={52}
                      outerRadius={82}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {analytics.byStatus.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={STATUS_COLORS[entry.name] || PIE_COLORS[index % PIE_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: "10px" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        {/* ── Trend Line Chart ── */}
        <div className="gov-card" style={{ marginBottom: "16px" }}>
          <div className="gov-card-header" style={{ marginBottom: "16px" }}>
            <h3 className="gov-card-title">
              <TrendingUp size={16} color="#1d4ed8" />
              <span>Complaint Inflow — Last 7 Days</span>
            </h3>
          </div>
          <div style={{ height: "200px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics?.trend || []} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#64748b" }} />
                <YAxis tick={{ fontSize: 11, fill: "#64748b" }} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="count"
                  name="New Complaints"
                  stroke="#1d4ed8"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: "#1d4ed8", strokeWidth: 2 }}
                  activeDot={{ r: 7, fill: "#1d4ed8" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── Geospatial Heat Map ── */}
        <div className="gov-card" style={{ marginBottom: "16px" }}>
          <div className="gov-card-header" style={{ marginBottom: "12px" }}>
            <h3 className="gov-card-title">
              <MapPin size={16} color="#1d4ed8" />
              <span>Municipal Geospatial Issue Heat Map</span>
            </h3>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {["Critical", "High", "Medium", "Low", "Resolved"].map((sev) => (
                <span key={sev} style={{
                  fontSize: "0.7rem", fontWeight: "700", padding: "2px 8px",
                  borderRadius: "4px", background: `${severityColour(sev, sev === "Resolved" ? "Resolved" : "")}18`,
                  color: severityColour(sev, sev === "Resolved" ? "Resolved" : ""),
                  border: `1px solid ${severityColour(sev, sev === "Resolved" ? "Resolved" : "")}40`,
                }}>
                  ● {sev}
                </span>
              ))}
            </div>
          </div>

          <div style={{ height: "360px", borderRadius: "8px", overflow: "hidden", border: "1px solid #e2e8f0" }}>
            <MapContainer center={mapCenter} zoom={12} style={{ width: "100%", height: "100%" }}>
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; OpenStreetMap contributors'
              />
              {(analytics?.mapData || []).map((pt) => {
                if (!pt.location?.latitude) return null;
                const colour = severityColour(pt.severity, pt.status);
                return (
                  <CircleMarker
                    key={pt._id}
                    center={[pt.location.latitude, pt.location.longitude]}
                    radius={pt.severity === "Critical" ? 10 : pt.severity === "High" ? 8 : 6}
                    fillColor={colour}
                    color="#fff"
                    weight={2}
                    opacity={1}
                    fillOpacity={0.85}
                  >
                    <Popup>
                      <div style={{ padding: "6px", fontSize: "0.8rem", minWidth: "180px" }}>
                        <strong style={{ color: "#0f172a" }}>{pt.complaintId}</strong>
                        <div style={{ marginTop: "4px", color: "#334155" }}>{pt.title}</div>
                        <div style={{ display: "flex", gap: "6px", marginTop: "6px", flexWrap: "wrap" }}>
                          <span style={{ background: `${colour}18`, color: colour, padding: "1px 6px", borderRadius: "4px", fontWeight: "700", fontSize: "0.7rem" }}>
                            {pt.severity || "Medium"}
                          </span>
                          <span style={{ background: "#f1f5f9", color: "#334155", padding: "1px 6px", borderRadius: "4px", fontSize: "0.7rem" }}>
                            {pt.status}
                          </span>
                        </div>
                        <div style={{ color: "#64748b", fontSize: "0.72rem", marginTop: "4px" }}>
                          Priority: {pt.priorityScore || "—"}/100
                        </div>
                      </div>
                    </Popup>
                  </CircleMarker>
                );
              })}
            </MapContainer>
          </div>

          <div style={{ marginTop: "10px", fontSize: "0.76rem", color: "#94a3b8", textAlign: "right" }}>
            Showing {(analytics?.mapData || []).filter(p => p.location?.latitude).length} geo-tagged complaints
          </div>
        </div>

        {/* ── Category Distribution Table ── */}
        <div className="gov-card">
          <div className="gov-card-header" style={{ marginBottom: "12px" }}>
            <h3 className="gov-card-title">
              <Layers size={16} color="#1d4ed8" />
              <span>AI Category Distribution</span>
            </h3>
          </div>
          {(analytics?.byCategory || []).length === 0 ? (
            <div style={{ textAlign: "center", padding: "30px", color: "#94a3b8", fontSize: "0.82rem" }}>
              No AI-processed complaints yet.
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.84rem" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid #e2e8f0" }}>
                    <th style={{ textAlign: "left", padding: "8px 12px", color: "#64748b", fontWeight: "700", fontSize: "0.74rem", textTransform: "uppercase" }}>Category</th>
                    <th style={{ textAlign: "right", padding: "8px 12px", color: "#64748b", fontWeight: "700", fontSize: "0.74rem", textTransform: "uppercase" }}>Count</th>
                    <th style={{ padding: "8px 12px", color: "#64748b", fontWeight: "700", fontSize: "0.74rem", textTransform: "uppercase" }}>Share</th>
                  </tr>
                </thead>
                <tbody>
                  {(analytics.byCategory).map((cat, i) => {
                    const pct = s.total > 0 ? Math.round((cat.value / s.total) * 100) : 0;
                    return (
                      <tr key={i} style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "10px 12px", fontWeight: "600", color: "#0f172a" }}>{cat.name}</td>
                        <td style={{ padding: "10px 12px", textAlign: "right", fontWeight: "700", color: "#1d4ed8" }}>{cat.value}</td>
                        <td style={{ padding: "10px 12px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <div style={{ flex: 1, height: "6px", background: "#f1f5f9", borderRadius: "3px", overflow: "hidden" }}>
                              <div style={{ width: `${pct}%`, height: "100%", background: "#3b82f6", borderRadius: "3px" }} />
                            </div>
                            <span style={{ fontSize: "0.76rem", color: "#64748b", minWidth: "30px" }}>{pct}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </DashboardLayout>
  );
}
