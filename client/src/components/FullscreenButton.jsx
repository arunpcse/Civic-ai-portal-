import React, { useState, useEffect } from "react";
import { Maximize, Minimize } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

export default function FullscreenButton({ className = "", style = {}, showLabel = true, size = 14 }) {
  const { t } = useLanguage();
  const [isFullscreen, setIsFullscreen] = useState(
    typeof document !== "undefined" ? Boolean(document.fullscreenElement) : false
  );

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(
        Boolean(
          document.fullscreenElement ||
          document.webkitFullscreenElement ||
          document.mozFullScreenElement ||
          document.msFullscreenElement
        )
      );
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("mozfullscreenchange", handleFullscreenChange);
    document.addEventListener("MSFullscreenChange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
      document.removeEventListener("mozfullscreenchange", handleFullscreenChange);
      document.removeEventListener("MSFullscreenChange", handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = () => {
    if (
      !document.fullscreenElement &&
      !document.webkitFullscreenElement &&
      !document.mozFullScreenElement &&
      !document.msFullscreenElement
    ) {
      const docElm = document.documentElement;
      if (docElm.requestFullscreen) {
        docElm.requestFullscreen().catch((err) => {
          console.warn("Fullscreen request error:", err);
        });
      } else if (docElm.webkitRequestFullscreen) {
        docElm.webkitRequestFullscreen();
      } else if (docElm.mozRequestFullScreen) {
        docElm.mozRequestFullScreen();
      } else if (docElm.msRequestFullscreen) {
        docElm.msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch((err) => {
          console.warn("Exit fullscreen error:", err);
        });
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    }
  };

  return (
    <button
      type="button"
      onClick={toggleFullscreen}
      className={`gov-btn gov-btn-secondary gov-btn-sm ${className}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        cursor: "pointer",
        borderColor: "#cbd5e1",
        fontSize: "0.78rem",
        padding: "6px 12px",
        ...style,
      }}
      title={isFullscreen ? (t("exit_fullscreen") || "Exit Full Screen") : (t("full_screen") || "Full Screen")}
    >
      {isFullscreen ? <Minimize size={size} /> : <Maximize size={size} />}
      {showLabel && (
        <span>
          {isFullscreen ? (t("exit_fullscreen") || "Exit Full Screen") : (t("full_screen") || "Full Screen")}
        </span>
      )}
    </button>
  );
}
