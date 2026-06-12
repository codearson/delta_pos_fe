import React from "react";
import { useNavigate } from "react-router-dom";

const AccessDenied = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem("userRole") || "USER";

  const handleBack = () => {
    const r = role.toUpperCase();
    if (r === "USER" || r === "ROLE_USER") {
      navigate("/pos", { replace: true });
    } else {
      navigate("/dashboard", { replace: true });
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#f4f5f7",
      flexDirection: "column",
      gap: 0,
    }}>
      <div style={{
        background: "#fff",
        borderRadius: 16,
        boxShadow: "0 4px 32px rgba(0,0,0,0.10)",
        padding: "52px 48px 40px",
        textAlign: "center",
        maxWidth: 440,
        width: "90%",
      }}>
        {/* Lock icon */}
        <div style={{
          width: 80, height: 80, borderRadius: "50%",
          background: "#fff0f0", margin: "0 auto 24px",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none"
            stroke="#dc3545" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>

        <h2 style={{ fontWeight: 800, color: "#1B2950", marginBottom: 10, fontSize: 26 }}>
          Access Denied
        </h2>
        <p style={{ color: "#67748E", fontSize: 15, lineHeight: 1.6, marginBottom: 32 }}>
          You don&apos;t have permission to view this page.<br />
          Please contact your administrator if you think this is a mistake.
        </p>

        <button
          onClick={handleBack}
          style={{
            background: "#9D00FF",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "12px 32px",
            fontWeight: 700,
            fontSize: 15,
            cursor: "pointer",
            width: "100%",
          }}
        >
          Go Back
        </button>
      </div>
    </div>
  );
};

export default AccessDenied;
