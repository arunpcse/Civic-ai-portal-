import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { Link, useNavigate } from "react-router-dom";
import {
  Shield,
  User,
  Wrench,
  Building,
  Crown,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Phone,
} from "lucide-react";
import FullscreenButton from "../components/FullscreenButton";

export default function Login() {
  const { login } = useContext(AuthContext);
  const { lang, toggleLanguage, t } = useLanguage();
  const [selectedRole, setSelectedRole] = useState("citizen");
  const [email, setEmail] = useState("citizen@civic.ai");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const rolePortals = [
    {
      id: "citizen",
      title: t("role_citizen"),
      desc: lang === "ta" ? "பொதுமக்கள் குறைகளை பதிவு செய்தல், நிலை அறிதல் மற்றும் பணி மதிப்பீடு செய்தல்." : "Lodge grievances, track real-time resolution timeline, GPS defect mapping & rate municipal work.",
      icon: <User size={20} />,
      defaultEmail: "citizen@civic.ai",
      path: "/citizen/dashboard",
      badge: lang === "ta" ? "குடிமகன்" : "Resident",
      accentColor: "#2563eb",
      bgColor: "#eff6ff",
    },
    {
      id: "staff",
      title: t("role_staff"),
      desc: lang === "ta" ? "ஒதுக்கப்பட்ட களப் பணிகளை ஏற்றுக்கொண்டு பழுது நீக்கி புகைப்படங்களை பதிவேற்றுதல்." : "Receive assigned work orders, update repair progress, and upload After-work verification photos.",
      icon: <Wrench size={20} />,
      defaultEmail: "staff.roads@civic.ai",
      path: "/staff/dashboard",
      badge: lang === "ta" ? "களப்பணியாளர்" : "Field Staff",
      accentColor: "#059669",
      bgColor: "#ecfdf5",
    },
    {
      id: "department_head",
      title: t("role_head"),
      desc: lang === "ta" ? "AI பகுப்பாய்வை சரிபார்த்து கள ஆய்வாளர்களுக்கு பணிகளை ஒதுக்குதல் மற்றும் மேற்பார்வை செய்தல்." : "Review AI defect classification, dispatch work orders to field inspectors, and verify repairs.",
      icon: <Building size={20} />,
      defaultEmail: "head.roads@civic.ai",
      path: "/department/dashboard",
      badge: lang === "ta" ? "துறைத் தலைவர்" : "Dept Head",
      accentColor: "#d97706",
      bgColor: "#fffbeb",
    },
    {
      id: "admin",
      title: t("role_admin"),
      desc: lang === "ta" ? "நகரம் தழுவிய குறைதீர்ப்பு பகுப்பாய்வு, வரைபட நுண்ணறிவு மற்றும் செயல்திறன் கண்காணிப்பு." : "City-wide civic intelligence, heat map analytics, departmental performance SLAs & escalation.",
      icon: <Crown size={20} />,
      defaultEmail: "admin@civic.ai",
      path: "/admin/dashboard",
      badge: lang === "ta" ? "ஆணையர்" : "Commissioner",
      accentColor: "#7c3aed",
      bgColor: "#f5f3ff",
    },
  ];

  const currentPortal = rolePortals.find((r) => r.id === selectedRole) || rolePortals[0];

  const handleRoleSelect = (roleId) => {
    setSelectedRole(roleId);
    setError("");
    const roleObj = rolePortals.find((r) => r.id === roleId);
    if (roleObj) {
      setEmail(roleObj.defaultEmail);
      setPassword("password123");
    }
  };

  const handleRoleRedirect = (role) => {
    if (role === "citizen") navigate("/citizen/dashboard");
    else if (role === "staff") navigate("/staff/dashboard");
    else if (role === "department_head") navigate("/department/dashboard");
    else if (role === "admin") navigate("/admin/dashboard");
    else navigate("/citizen/dashboard");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      handleRoleRedirect(result.user.role);
    } else {
      setError(result.message || "Invalid credentials. Please verify your email and password.");
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#f8fafc" }}>
      
      {/* ── Top Official Government Strip ── */}
      <div className="gov-top-ticker">
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontWeight: "700", color: "#f59e0b" }}>
            {t("gov_tn")}
          </span>
          <span style={{ opacity: 0.3 }}>•</span>
          <span>{t("gov_dept")}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <span style={{ color: "#38bdf8", fontWeight: "600" }}>{t("helpline")}</span>
          <span style={{ opacity: 0.3 }}>|</span>
          
          {/* Language Switcher */}
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

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <FullscreenButton />
          <Link
            to="/register"
            className="gov-btn gov-btn-secondary gov-btn-sm"
            style={{ fontWeight: "600", borderColor: "#cbd5e1" }}
          >
            {t("register_btn")}
          </Link>
        </div>
      </header>

      {/* ── Main Login Layout ── */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 16px" }}>
        <div style={{ width: "100%", maxWidth: "920px" }}>

          {/* Heading */}
          <div style={{ textAlign: "center", marginBottom: "26px" }}>
            <h2 style={{ fontSize: "1.55rem", fontWeight: "800", color: "#0f172a", letterSpacing: "-0.02em" }}>
              {t("select_role_title")}
            </h2>
            <p style={{ fontSize: "0.88rem", color: "#64748b", marginTop: "4px" }}>
              {t("select_role_desc")}
            </p>
          </div>

          {/* 4 Dedicated Role Selection Cards with Distinct Colors */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: "12px", marginBottom: "20px" }}>
            {rolePortals.map((portal) => {
              const isSelected = selectedRole === portal.id;
              return (
                <div
                  key={portal.id}
                  onClick={() => handleRoleSelect(portal.id)}
                  style={{
                    padding: "16px",
                    borderRadius: "10px",
                    border: isSelected ? `2px solid ${portal.accentColor}` : "1px solid #e2e8f0",
                    background: isSelected ? portal.bgColor : "#ffffff",
                    cursor: "pointer",
                    transition: "all 0.18s ease",
                    boxShadow: isSelected ? `0 4px 12px ${portal.accentColor}25` : "0 1px 3px rgba(0,0,0,0.04)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                    <div
                      style={{
                        width: "38px",
                        height: "38px",
                        borderRadius: "8px",
                        background: isSelected ? portal.accentColor : "#f1f5f9",
                        color: isSelected ? "#ffffff" : portal.accentColor,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {portal.icon}
                    </div>
                    {isSelected && (
                      <span
                        style={{
                          fontSize: "0.68rem",
                          fontWeight: "800",
                          background: portal.accentColor,
                          color: "#ffffff",
                          padding: "2px 8px",
                          borderRadius: "4px",
                          letterSpacing: "0.04em",
                        }}
                      >
                        SELECTED
                      </span>
                    )}
                  </div>

                  <div style={{ fontSize: "0.92rem", fontWeight: "700", color: "#0f172a" }}>
                    {portal.title}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active Role Login Box */}
          <div
            className="gov-card"
            style={{
              padding: "34px",
              borderRadius: "12px",
              borderTop: `4px solid ${currentPortal.accentColor}`,
              boxShadow: "0 10px 25px -5px rgba(15, 23, 42, 0.08)",
            }}
          >
            <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: "34px", alignItems: "center" }}>
              
              {/* Left Column: Role Overview */}
              <div>
                <span
                  style={{
                    display: "inline-block",
                    padding: "3px 10px",
                    background: currentPortal.bgColor,
                    border: `1px solid ${currentPortal.accentColor}40`,
                    borderRadius: "6px",
                    fontSize: "0.75rem",
                    fontWeight: "700",
                    color: currentPortal.accentColor,
                    marginBottom: "10px",
                  }}
                >
                  {currentPortal.badge}
                </span>

                <h3 style={{ fontSize: "1.3rem", fontWeight: "800", color: "#0f172a", marginBottom: "8px" }}>
                  {currentPortal.title}
                </h3>
                <p style={{ fontSize: "0.86rem", color: "#64748b", lineHeight: "1.55", marginBottom: "20px" }}>
                  {currentPortal.desc}
                </p>

                {/* Demo Credentials Box */}
                <div style={{ background: "#f8fafc", padding: "14px 16px", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "0.82rem" }}>
                  <div style={{ fontWeight: "700", color: "#0f172a", marginBottom: "6px", display: "flex", alignItems: "center", gap: "6px" }}>
                    <CheckCircle2 size={15} color={currentPortal.accentColor} />
                    <span>{t("demo_credentials_title")}</span>
                  </div>
                  <div style={{ color: "#475569", fontSize: "0.8rem", display: "flex", flexDirection: "column", gap: "2px" }}>
                    <div>Official Email: <strong style={{ color: "#0f172a" }}>{currentPortal.defaultEmail}</strong></div>
                    <div>Default Password: <strong style={{ color: "#0f172a" }}>password123</strong></div>
                  </div>
                </div>

                {selectedRole === "citizen" && (
                  <div style={{ marginTop: "16px", fontSize: "0.84rem", color: "#64748b" }}>
                    {t("new_citizen_prompt")}{" "}
                    <Link to="/register" style={{ color: "#2563eb", fontWeight: "700", textDecoration: "underline" }}>
                      {t("register_account_link")}
                    </Link>
                  </div>
                )}
              </div>

              {/* Right Column: Form Inputs */}
              <div style={{ borderLeft: "1px solid #e2e8f0", paddingLeft: "30px" }}>
                {error && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "10px 14px",
                      background: "#fef2f2",
                      border: "1px solid #fecaca",
                      color: "#b91c1c",
                      borderRadius: "6px",
                      fontSize: "0.82rem",
                      fontWeight: "600",
                      marginBottom: "18px",
                    }}
                  >
                    <AlertCircle size={16} style={{ flexShrink: 0 }} />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="gov-form-group">
                    <label className="gov-label">{t("email_label")} *</label>
                    <input
                      type="email"
                      className="gov-input"
                      placeholder="e.g. staff.roads@civic.ai"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="gov-form-group" style={{ marginBottom: "22px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                      <label className="gov-label" style={{ marginBottom: 0 }}>{t("password_label")} *</label>
                      <span style={{ fontSize: "0.74rem", color: "#64748b" }}>{t("default_pass_note")}</span>
                    </div>
                    <input
                      type="password"
                      className="gov-input"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="gov-btn gov-btn-primary"
                    style={{
                      width: "100%",
                      padding: "11px",
                      fontSize: "0.92rem",
                      background: currentPortal.accentColor,
                      borderColor: currentPortal.accentColor,
                    }}
                    disabled={loading}
                  >
                    {loading ? t("authenticating") : t("sign_in_btn")}
                    <ArrowRight size={16} />
                  </button>
                </form>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* Footer */}
      <footer style={{ background: "#07192f", color: "#94a3b8", padding: "16px 28px", fontSize: "0.76rem", textAlign: "center", borderTop: "1px solid #1e293b" }}>
        <div>© 2026 {t("gov_tn")} • CivicAI Public Grievance Redressal System. {t("helpline")}</div>
      </footer>

    </div>
  );
}
