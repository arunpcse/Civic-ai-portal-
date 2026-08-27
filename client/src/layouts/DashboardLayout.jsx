import React, { useContext, useState, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { NavLink, useNavigate, Link } from "react-router-dom";
import {
  Shield,
  LayoutDashboard,
  PlusCircle,
  FileText,
  LogOut,
  BarChart2,
  ClipboardList,
  Users,
  CheckCircle2,
  Phone,
  Clock,
  Menu,
  X,
  Languages,
} from "lucide-react";
import NotificationBell from "../components/NotificationBell";
import FullscreenButton from "../components/FullscreenButton";

export default function DashboardLayout({ children }) {
  const { currentUser, logout } = useContext(AuthContext);
  const { lang, toggleLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const citizenLinks = [
    { to: "/citizen/dashboard", label: t("citizen_overview"), icon: <LayoutDashboard size={17} /> },
    { to: "/citizen/report", label: t("lodge_grievance"), icon: <PlusCircle size={17} /> },
    { to: "/citizen/complaints", label: t("my_grievances"), icon: <FileText size={17} /> },
  ];

  const staffLinks = [
    { to: "/staff/dashboard", label: t("work_orders"), icon: <ClipboardList size={17} /> },
  ];

  const deptLinks = [
    { to: "/department/dashboard", label: t("dept_operations"), icon: <Users size={17} /> },
  ];

  const adminLinks = [
    { to: "/admin/dashboard", label: t("commissioner_intel"), icon: <BarChart2 size={17} /> },
  ];

  const getLinks = () => {
    if (currentUser?.role === "citizen") return citizenLinks;
    if (currentUser?.role === "staff") return staffLinks;
    if (currentUser?.role === "department_head") return deptLinks;
    if (currentUser?.role === "admin") return adminLinks;
    return [];
  };

  const roleTitles = {
    citizen: t("role_citizen"),
    staff: t("role_staff"),
    department_head: t("role_head"),
    admin: t("role_admin"),
  };

  const roleThemeColors = {
    citizen: { bg: "#eff6ff", text: "#1d4ed8", border: "#bfdbfe" },
    staff: { bg: "#ecfdf5", text: "#047857", border: "#a7f3d0" },
    department_head: { bg: "#fffbeb", text: "#b45309", border: "#fde68a" },
    admin: { bg: "#f5f3ff", text: "#6d28d9", border: "#ddd6fe" },
  };

  const currentRoleStyle = roleThemeColors[currentUser?.role] || roleThemeColors.citizen;

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--bg-app)" }}>
      
      {/* ── Top Government Strip ── */}
      <div className="gov-top-ticker">
        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          <span style={{ fontWeight: "800", color: "#fbbf24" }}>
            {t("gov_tn")}
          </span>
          <span style={{ opacity: 0.3 }}>•</span>
          <span>{t("gov_dept")}</span>
          <span style={{ opacity: 0.3 }}>•</span>
          <span style={{ color: "#38bdf8", fontWeight: "600" }}>
            {t("helpline")}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <span style={{ fontSize: "0.74rem" }}>
            {currentTime.toLocaleDateString(lang === "ta" ? "ta-IN" : "en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" })} • {currentTime.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
          </span>
          <span style={{ opacity: 0.3 }}>|</span>
          
          {/* Language Switcher Button */}
          <div className="lang-switcher-box">
            <button
              type="button"
              className={`lang-btn ${lang === "en" ? "active" : ""}`}
              onClick={() => toggleLanguage("en")}
            >
              English
            </button>
            <button
              type="button"
              className={`lang-btn ${lang === "ta" ? "active" : ""}`}
              onClick={() => toggleLanguage("ta")}
            >
              தமிழ்
            </button>
          </div>
        </div>
      </div>

      {/* ── Header Bar ── */}
      <header className="gov-topbar">
        <div className="gov-brand-cluster">
          <img
            src="/tn_gov_logo.svg"
            alt="Tamil Nadu Government Emblem"
            style={{ width: "44px", height: "44px", objectFit: "contain", filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.12))" }}
          />

          <div>
            <h1 className="gov-portal-title">{t("portal_title")}</h1>
            <div className="gov-portal-subtitle">{t("portal_sub")}</div>
          </div>
        </div>

        {/* Right Header Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          
          {currentUser?.role === "citizen" && <NotificationBell />}

          {/* User Account Info Pill */}
          {currentUser && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "6px 14px",
                borderRadius: "8px",
                background: currentRoleStyle.bg,
                border: `1px solid ${currentRoleStyle.border}`,
              }}
            >
              <div
                style={{
                  width: "30px",
                  height: "30px",
                  borderRadius: "50%",
                  background: currentRoleStyle.text,
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "800",
                  fontSize: "0.8rem",
                }}
              >
                {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : "U"}
              </div>
              <div style={{ lineHeight: "1.2", textAlign: "left" }}>
                <div style={{ fontSize: "0.84rem", fontWeight: "800", color: "#0f172a" }}>
                  {currentUser.name}
                </div>
                <div style={{ fontSize: "0.72rem", color: currentRoleStyle.text, fontWeight: "600" }}>
                  {roleTitles[currentUser.role] || t("role_citizen")}
                </div>
              </div>
            </div>
          )}

          {/* Fullscreen Button */}
          <FullscreenButton />

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="gov-btn gov-btn-secondary gov-btn-sm"
            title="Logout"
            style={{ fontSize: "0.78rem", padding: "6px 12px", borderColor: "#cbd5e1" }}
          >
            <LogOut size={13} />
            <span>{t("logout")}</span>
          </button>
        </div>
      </header>

      {/* ── Main Layout with Modern Sidebar ── */}
      <div style={{ flex: 1, display: "flex" }}>
        
        {/* Left Sidebar */}
        <aside
          style={{
            width: "250px",
            background: "#ffffff",
            borderRight: "1px solid var(--border-subtle)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Role Status Card */}
          <div style={{ padding: "16px 18px", borderBottom: "1px solid var(--border-subtle)", background: currentRoleStyle.bg }}>
            <div style={{ fontSize: "0.7rem", fontWeight: "800", textTransform: "uppercase", color: currentRoleStyle.text, letterSpacing: "0.04em", marginBottom: "2px" }}>
              {currentUser?.role?.replace("_", " ")}
            </div>
            <div style={{ fontSize: "0.9rem", fontWeight: "800", color: "#0f172a" }}>
              {roleTitles[currentUser?.role] || t("role_citizen")}
            </div>
          </div>

          {/* Navigation Links */}
          <nav style={{ flex: 1, padding: "14px 10px", display: "flex", flexDirection: "column", gap: "4px" }}>
            <div style={{ fontSize: "0.68rem", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", padding: "0 8px 6px" }}>
              {t("nav_menu")}
            </div>

            {getLinks().map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                style={({ isActive }) => ({
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  textDecoration: "none",
                  fontSize: "0.86rem",
                  fontWeight: isActive ? "800" : "600",
                  color: isActive ? "#1d4ed8" : "#475569",
                  background: isActive ? "#eff6ff" : "transparent",
                  borderLeft: isActive ? "3px solid #2563eb" : "3px solid transparent",
                  transition: "all 0.15s ease",
                })}
              >
                {link.icon}
                <span>{link.label}</span>
              </NavLink>
            ))}
          </nav>

          {/* Footer Info */}
          <div style={{ padding: "14px 18px", borderTop: "1px solid var(--border-subtle)", background: "#fafafa", fontSize: "0.72rem", color: "#64748b" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "5px", fontWeight: "700", color: "#059669", marginBottom: "2px" }}>
              <CheckCircle2 size={13} />
              <span>{t("system_live")}</span>
            </div>
            <div>CivicAI v2.4 Enterprise</div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main style={{ flex: 1, padding: "28px 36px", overflowY: "auto", maxHeight: "calc(100vh - 100px)" }}>
          {children}
        </main>
      </div>

    </div>
  );
}
