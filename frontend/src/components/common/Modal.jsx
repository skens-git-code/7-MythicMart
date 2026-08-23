import React, { useEffect, useRef } from 'react';
import '../../styles/Modal.css';

const Modal = ({ isOpen, onClose, title, children, className = '' }) => {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialogNode = dialogRef.current;
    if (isOpen) {
      dialogNode.showModal();
    } else {
      dialogNode.close();
    }
  }, [isOpen]);

  const handleBackdropClick = (e) => {
    if (e.target === dialogRef.current) {
      onClose();
    }
  };

  return (
    <dialog
      ref={dialogRef}
      className={`minimal-modal ${className}`}
      onClick={handleBackdropClick}
      onClose={onClose}
    >
      <div className="modal-content-wrapper">
        <div className="modal-header">
          {title && <h2 className="modal-title">{title}</h2>}
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            &times;
          </button>
        </div>
        <div className="modal-body">
          {children}
        </div>
      </div>
    </dialog>
  );
};

export default Modal;
