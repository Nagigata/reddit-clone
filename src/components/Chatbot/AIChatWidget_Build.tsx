import React, { useState } from "react";
import Chatbot from "chatbot-gooup1";
import { FaRobot } from "react-icons/fa";

const AIChatWidget: React.FC = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Floating button */}
      <div
        onClick={() => setOpen(!open)}
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          width: "60px",
          height: "60px",
          background: "#4b7bec",
          borderRadius: "50%",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontSize: "26px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
          zIndex: 9999,
        }}
      >
        <FaRobot size={28} color="#fff" />
      </div>

      {/* Chat widget */}
      {open && (
          <Chatbot />
      )}
    </>
  );
};

export default AIChatWidget;
