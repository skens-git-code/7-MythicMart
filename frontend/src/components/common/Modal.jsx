import React, { useEffect, useRef } from 'react';
import '../../styles/Modal.css';

const Modal = ({ isOpen, onClose, title, children, footer, className = '' }) => {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialogNode = dialogRef.current;
    if (!dialogNode) return;
    if (isOpen) {
      if (!dialogNode.open) dialogNode.showModal();
      // Prevent body scroll while modal is open
      document.body.style.overflow = 'hidden';
    } else {
      if (dialogNode.open) dialogNode.close();
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
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
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            &times;
          </button>
        </div>
        <div className="modal-body">
          {children}
        </div>
        {footer && (
          <div className="modal-footer">
            {footer}
          </div>
        )}
      </div>
    </dialog>
  );
};

export default Modal;
