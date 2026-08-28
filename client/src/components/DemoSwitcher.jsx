import React, { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { Shield, Sparkles, RefreshCw, CheckCircle, ChevronDown, ChevronUp } from "lucide-react";

export default function DemoSwitcher() {
  const { currentUser, login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [message, setMessage] = useState("");

  const demoUsers = [
    {
      role: "citizen",
      title: "Citizen (Resident)",
      email: "citizen@civic.ai",
      desc: "Lodge complaints, GPS pin, track timeline, rate resolution",
      badge: "Citizen",
      color: "#059669",
      path: "/citizen/dashboard",
    },
    {
      role: "staff",
      title: "Field Officer (Roads)",
      email: "staff.roads@civic.ai",
      desc: "Receive work orders, accept task, upload After-repair photo",
      badge: "Staff",
      color: "#2563eb",
      path: "/staff/dashboard",
    },
    {
      role: "department_head",
      title: "Executive Engr (Roads Head)",
      email: "head.roads@civic.ai",
      desc: "Review AI analysis, assign field staff, verify Before/After photos",
      badge: "Dept Head",
      color: "#d97706",
      path: "/department/dashboard",
    },
    {
      role: "admin",
      title: "Municipal Commissioner",
      email: "admin@civic.ai",
      desc: "City-wide analytics, heat map, department KPIs, SLA metrics",
      badge: "Commissioner",
      color: "#7c3aed",
      path: "/admin/dashboard",
    },
  ];

  const handleRoleSwitch = async (email, path) => {
    setMessage("Switching role...");
    const res = await login(email, "password123");
    if (res.success) {
      setMessage(`Logged in as ${res.user.name}`);
      setTimeout(() => {
        setMessage("");
        setExpanded(false);
        navigate(path);
      }, 500);
    } else {
      setMessage("Login failed: " + res.message);
    }
  };

  const handleSeedDatabase = async () => {
    setSeeding(true);
    setMessage("Seeding database with demo records...");
    try {
      const res = await API.post("/seed");
      if (res.data.success) {
        setMessage("Database seeded successfully with official grievances!");
        setTimeout(() => {
          setMessage("");
          window.location.reload();
        }, 1200);
      }
    } catch (err) {
      setMessage("Seeding failed: " + (err.response?.data?.message || err.message));
    } finally {
      setSeeding(false);
    }
  };

  const handleClearComplaints = async () => {
    if (!window.confirm("Are you sure you want to clear all complaints?")) return;
    setSeeding(true);
    setMessage("Clearing all grievance records...");
    try {
      const res = await API.post("/complaints/clear-all");
      if (res.data.success) {
        setMessage("All complaints cleared successfully!");
        setTimeout(() => {
          setMessage("");
          window.location.reload();
        }, 1200);
      }
    } catch (err) {
      setMessage("Clear failed: " + (err.response?.data?.message || err.message));
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        zIndex: 9999,
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      {/* Floating Toggle Button */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          background: "linear-gradient(135deg, #0b2545, #133a6b)",
          color: "#ffffff",
          padding: "8px 16px",
          borderRadius: "9999px",
          boxShadow: "0 10px 25px -5px rgba(11, 37, 69, 0.4)",
          cursor: "pointer",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          fontSize: "0.85rem",
          fontWeight: "700",
          userSelect: "none",
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <Sparkles size={16} color="#fbbf24" />
        <span>Reviewer Demo Switcher</span>
        {expanded ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
      </div>

      {/* Expanded Modal / Card */}
      {expanded && (
        <div
          style={{
            position: "absolute",
            bottom: "48px",
            right: "0",
            width: "370px",
            background: "#ffffff",
            borderRadius: "12px",
            boxShadow: "0 20px 25px -5px rgba(15, 23, 42, 0.2), 0 8px 10px -6px rgba(15, 23, 42, 0.1)",
            border: "1px solid #cbd5e1",
            padding: "16px",
            animation: "modalPop 0.15s ease-out",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", paddingBottom: "8px", borderBottom: "1px solid #e2e8f0" }}>
            <div>
              <h4 style={{ fontSize: "0.92rem", fontWeight: "800", color: "#0b2545" }}>
                1-Click Role Switcher
              </h4>
              <p style={{ fontSize: "0.72rem", color: "#64748b" }}>
                Switch instantly during presentation review
              </p>
            </div>
            <div style={{ display: "flex", gap: "6px" }}>
              <button
                onClick={handleClearComplaints}
                disabled={seeding}
                className="gov-btn gov-btn-secondary gov-btn-sm"
                title="Clear all grievance records"
                style={{ fontSize: "0.70rem", padding: "4px 7px", color: "#dc2626", borderColor: "#fca5a5" }}
              >
                Clear (0)
              </button>
              <button
                onClick={handleSeedDatabase}
                disabled={seeding}
                className="gov-btn gov-btn-secondary gov-btn-sm"
                title="Reset & populate demo data"
                style={{ fontSize: "0.70rem", padding: "4px 7px" }}
              >
                <RefreshCw size={11} className={seeding ? "spin-indicator" : ""} />
                {seeding ? "..." : "Reset"}
              </button>
            </div>
          </div>

          {message && (
            <div
              style={{
                padding: "8px 10px",
                background: "#ecfdf5",
                border: "1px solid #a7f3d0",
                color: "#065f46",
                borderRadius: "6px",
                fontSize: "0.76rem",
                fontWeight: "600",
                marginBottom: "10px",
              }}
            >
              {message}
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {demoUsers.map((u) => {
              const isCurrent = currentUser?.email === u.email;
              return (
                <div
                  key={u.role}
                  onClick={() => handleRoleSwitch(u.email, u.path)}
                  style={{
                    padding: "10px",
                    borderRadius: "8px",
                    border: isCurrent ? `2px solid ${u.color}` : "1px solid #e2e8f0",
                    background: isCurrent ? "#f8fafc" : "#ffffff",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                  onMouseEnter={(e) => {
                    if (!isCurrent) e.currentTarget.style.borderColor = "#94a3b8";
                  }}
                  onMouseLeave={(e) => {
                    if (!isCurrent) e.currentTarget.style.borderColor = "#e2e8f0";
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "2px" }}>
                      <span style={{ fontSize: "0.85rem", fontWeight: "700", color: "#0f172a" }}>
                        {u.title}
                      </span>
                      <span
                        style={{
                          fontSize: "0.68rem",
                          fontWeight: "700",
                          padding: "1px 6px",
                          borderRadius: "4px",
                          background: u.color,
                          color: "#fff",
                        }}
                      >
                        {u.badge}
                      </span>
                    </div>
                    <p style={{ fontSize: "0.72rem", color: "#64748b", lineHeight: "1.2" }}>
                      {u.desc}
                    </p>
                  </div>
                  {isCurrent && <CheckCircle size={18} color={u.color} style={{ flexShrink: 0 }} />}
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: "12px", paddingTop: "8px", borderTop: "1px solid #e2e8f0", fontSize: "0.7rem", color: "#94a3b8", textAlign: "center" }}>
            Default Password: <strong>password123</strong>
          </div>
        </div>
      )}
    </div>
  );
}
