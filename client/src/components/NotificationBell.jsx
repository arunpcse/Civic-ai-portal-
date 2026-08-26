import { useState, useEffect } from "react";
import axios from "axios";

// Derives notifications from the citizen's own complaints state changes
export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const config = {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        };
        // Derive notifications from complaint status changes
        const res = await axios.get("http://localhost:5000/api/complaints/my", config);
        if (res.data.success) {
          const complaints = res.data.complaints || [];
          const notifs = [];

          complaints.forEach((c) => {
            if (c.status === "Resolved" && !c.citizenConfirmation?.isConfirmed) {
              notifs.push({
                id: c._id,
                type: "resolved",
                message: `Your complaint "${c.title}" has been Resolved! Please rate the service.`,
                time: c.updatedAt,
                link: `/citizen/complaint/${c._id}`,
                urgent: true,
              });
            } else if (c.status === "Assigned") {
              notifs.push({
                id: c._id + "-assigned",
                type: "assigned",
                message: `Complaint "${c.title}" has been assigned to a field officer.`,
                time: c.updatedAt,
                link: `/citizen/complaint/${c._id}`,
                urgent: false,
              });
            } else if (c.status === "In Progress") {
              notifs.push({
                id: c._id + "-inprogress",
                type: "progress",
                message: `Work has started on "${c.title}".`,
                time: c.updatedAt,
                link: `/citizen/complaint/${c._id}`,
                urgent: false,
              });
            }
          });

          // Sort by time descending
          notifs.sort((a, b) => new Date(b.time) - new Date(a.time));
          setNotifications(notifs.slice(0, 10));
          setUnread(notifs.filter(n => n.urgent).length);
        }
      } catch (err) {
        // Silent fail - notifications are not critical
      }
    };

    fetchNotifications();
    // Poll every 60 seconds
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  const typeIcon = {
    resolved: "✅",
    assigned: "👤",
    progress: "🔧",
  };

  return (
    <div style={{ position: "relative" }}>
      {/* Bell Button */}
      <button
        onClick={() => { setOpen(!open); setUnread(0); }}
        style={{
          background: "none",
          border: "1px solid var(--border-light)",
          borderRadius: "6px",
          padding: "6px 12px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "6px",
          fontSize: "0.9rem",
          color: "var(--gov-primary)",
          position: "relative",
        }}
      >
        🔔
        {unread > 0 && (
          <span style={{
            position: "absolute",
            top: "-6px",
            right: "-6px",
            background: "#dc2626",
            color: "#fff",
            borderRadius: "50%",
            width: "18px",
            height: "18px",
            fontSize: "0.65rem",
            fontWeight: "800",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            {unread}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {open && (
        <div style={{
          position: "absolute",
          top: "calc(100% + 8px)",
          right: 0,
          width: "340px",
          background: "#fff",
          border: "1px solid var(--border-light)",
          borderRadius: "8px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
          zIndex: 999,
          overflow: "hidden",
        }}>
          <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border-light)", fontWeight: "700", color: "var(--gov-primary)" }}>
            Notifications
          </div>
          {notifications.length === 0 ? (
            <div style={{ padding: "20px", textAlign: "center", color: "var(--text-muted)", fontSize: "0.9rem" }}>
              No new notifications
            </div>
          ) : (
            <div style={{ maxHeight: "320px", overflowY: "auto" }}>
              {notifications.map((n) => (
                <a
                  key={n.id}
                  href={n.link}
                  style={{
                    display: "block",
                    padding: "12px 16px",
                    borderBottom: "1px solid var(--border-light)",
                    textDecoration: "none",
                    color: "var(--text-main)",
                    background: n.urgent ? "#fff7ed" : "#fff",
                    transition: "background 0.15s",
                  }}
                >
                  <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                    <span style={{ fontSize: "1.1rem" }}>{typeIcon[n.type]}</span>
                    <div>
                      <p style={{ fontSize: "0.85rem", lineHeight: "1.4", marginBottom: "3px" }}>{n.message}</p>
                      <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                        {new Date(n.time).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
