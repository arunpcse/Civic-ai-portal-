import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { Shield, UserPlus, ArrowRight, AlertCircle, Building, Phone } from "lucide-react";
import API from "../services/api";

export default function Register() {
  const { registerUser } = useContext(AuthContext);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [ward, setWard] = useState("Ward 102 - Shanthi Colony");
  const [wardsList, setWardsList] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadWards = async () => {
      try {
        const res = await API.get("/locations/wards");
        if (res.data.success && res.data.wards?.length > 0) {
          setWardsList(res.data.wards);
          setWard(res.data.wards[0].wardName);
        }
      } catch (e) {
        console.error("Wards list fetch error:", e.message);
      }
    };
    loadWards();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await registerUser(name, email, password, phone, address, ward);
    setLoading(false);

    if (result.success) {
      navigate("/citizen/dashboard");
    } else {
      setError(result.message);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--bg-app)" }}>
      {/* ── Top Official Government Strip ── */}
      <div className="gov-top-ticker">
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <span>🏛️ தமிழ்நாடு அரசு • Government of Tamil Nadu</span>
          <span style={{ opacity: 0.4 }}>|</span>
          <span>Municipal Administration & Water Supply Dept</span>
        </div>
        <div>
          <span style={{ display: "flex", alignItems: "center", gap: "5px", color: "#6ee7b7" }}>
            <Phone size={12} /> 24x7 Citizen Helpline: <strong>1913 / 1100</strong>
          </span>
        </div>
      </div>

      <header className="gov-topbar">
        <div className="gov-brand-cluster">
          <img
            src="/tn_gov_logo.svg"
            alt="Tamil Nadu Government Emblem"
            style={{ width: "44px", height: "44px", objectFit: "contain", filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.12))" }}
          />
          <div>
            <h1 className="gov-portal-title">CivicAI • பொதுக் குறைதீர்க்கும் தளம்</h1>
            <div className="gov-portal-subtitle">
              Public Grievance Redressal & Citizen Portal • தமிழ்நாடு அரசு
            </div>
          </div>
        </div>
      </header>

      {/* ── Main Register Layout ── */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "32px 16px" }}>
        <div style={{ width: "100%", maxWidth: "560px" }}>
          
          <div className="gov-card" style={{ padding: "32px", borderRadius: "14px", borderTop: "4px solid var(--gov-green)" }}>
            
            <div style={{ textAlign: "center", marginBottom: "24px" }}>
              <div
                style={{
                  width: "52px",
                  height: "52px",
                  borderRadius: "50%",
                  background: "var(--gov-green-subtle)",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "12px",
                  border: "2px solid #a7f3d0",
                }}
              >
                <UserPlus size={26} color="var(--gov-green)" />
              </div>
              <h2 style={{ fontSize: "1.35rem", fontWeight: "800", color: "var(--gov-navy)" }}>
                புதிய குடிமக்கள் பதிவு (Citizen Registration)
              </h2>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "4px" }}>
                Create resident profile to file municipal grievances and track resolutions
              </p>
            </div>

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
                  borderRadius: "8px",
                  fontSize: "0.84rem",
                  fontWeight: "600",
                  marginBottom: "18px",
                }}
              >
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "14px" }}>
                <div>
                  <label className="gov-label">முழுப் பெயர் / Full Name *</label>
                  <input
                    type="text"
                    className="gov-input"
                    placeholder="e.g. Arun Kumar"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="gov-label">அலைபேசி எண் / Mobile Number *</label>
                  <input
                    type="tel"
                    className="gov-input"
                    placeholder="+91-9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="gov-form-group">
                <label className="gov-label">மின்னஞ்சல் / Email Address *</label>
                <input
                  type="email"
                  className="gov-input"
                  placeholder="arun@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="gov-form-group">
                <label className="gov-label">கடவுச்சொல் / Create Password (Min 6 chars) *</label>
                <input
                  type="password"
                  className="gov-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "14px", marginBottom: "22px" }}>
                <div>
                  <label className="gov-label">முகவரி / Residential Address</label>
                  <input
                    type="text"
                    className="gov-input"
                    placeholder="Door No, Street Name, Area"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>
                <div>
                  <label className="gov-label">வார்டு / Municipal Ward</label>
                  <select className="gov-select" value={ward} onChange={(e) => setWard(e.target.value)}>
                    {wardsList.length > 0 ? (
                      wardsList.map((w) => (
                        <option key={w._id} value={w.wardName}>
                          {w.wardName}
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="Ward 102 - Shanthi Colony">Ward 102 - Shanthi Colony</option>
                        <option value="Ward 99 - Anna Nagar West">Ward 99 - Anna Nagar West</option>
                        <option value="Ward 98 - Anna Nagar East">Ward 98 - Anna Nagar East</option>
                        <option value="Ward 114 - T. Nagar North">Ward 114 - T. Nagar North</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="gov-btn gov-btn-success"
                style={{ width: "100%", padding: "12px", fontSize: "0.95rem" }}
                disabled={loading}
              >
                {loading ? "பதிவு செய்கிறது (Creating Account...)" : "பதிவை முடிக்கவும் (Complete Registration)"}
                <ArrowRight size={16} />
              </button>
            </form>

            <div style={{ marginTop: "20px", textAlign: "center", fontSize: "0.85rem", color: "var(--text-muted)" }}>
              ஏற்கனவே கணக்கு உள்ளதா? (Already registered?){" "}
              <Link to="/login" style={{ color: "var(--gov-blue-accent)", fontWeight: "700", textDecoration: "none" }}>
                உள்நுழைக (Sign In)
              </Link>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
