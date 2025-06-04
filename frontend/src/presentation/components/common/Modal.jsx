import React from 'react';
import '../../../styles/Modal.css'; // Necesitaré crear este archivo CSS

const Modal = ({ show, onClose, title, children }) => {
  if (!show) {
    return null;
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content-alert" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-loginacees">
          <h2 className="modal-title-loginacees">{title}</h2>
          <button className="modal-close-button" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
