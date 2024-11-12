import React from "react";
import "./loader.css";

const Loader = ({ message = "Loading...", isVisible = false }) => {
  if (!isVisible) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="loading-spinner"></div>
        <p className="loading-message">{message}</p>
      </div>
    </div>
  );
};

export default Loader;
