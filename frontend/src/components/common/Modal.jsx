// components/Modal.jsx
import React, { useEffect, useRef, useCallback, useState } from 'react';
import '../../styles/Modal.css';

// Global counter for open modals
let modalStackCount = 0;

const Modal = ({
  isOpen,
  onClose = () => {},
  title,
  children,
  footer,
  className = '',
  closeOnBackdropClick = true,
  initialFocusRef = null,
}) => {
  const dialogRef = useRef(null);
  const [isMounted, setIsMounted] = useState(false);

  // Manage body scroll lock using a counter
  useEffect(() => {
    if (isOpen) {
      modalStackCount += 1;
      document.body.style.overflow = 'hidden';
    } else if (modalStackCount > 0) {
      modalStackCount -= 1;
      if (modalStackCount === 0) {
        document.body.style.overflow = '';
      }
    }

    return () => {
      // Cleanup on unmount: only if modal is still open
      if (isOpen) {
        modalStackCount -= 1;
        if (modalStackCount === 0) {
          document.body.style.overflow = '';
        }
      }
    };
  }, [isOpen]);

  // Control dialog element
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      if (!dialog.open) {
        dialog.showModal();
      }
      // Focus management: if initialFocusRef is provided, focus it
      if (initialFocusRef && initialFocusRef.current) {
        setTimeout(() => initialFocusRef.current.focus(), 50);
      } else {
        // Fallback: focus the close button or first focusable element
        const focusable = dialog.querySelector('button, input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (focusable) {
          setTimeout(() => focusable.focus(), 50);
        }
      }
    } else {
      if (dialog.open) {
        dialog.close();
      }
    }
  }, [isOpen, initialFocusRef]);

  const handleBackdropClick = useCallback(
    (e) => {
      if (closeOnBackdropClick && e.target === dialogRef.current) {
        onClose();
      }
    },
    [closeOnBackdropClick, onClose]
  );

  const handleKeyDown = useCallback(
    (e) => {
      // Escape key is handled by dialog's onClose, but we can add extra logic if needed
    },
    []
  );

  // If not open, return null to avoid rendering (but we keep the dialog hidden)
  // Using dialog's open attribute is enough, but we can conditionally render for better performance.
  if (!isOpen) return null;

  return (
    <dialog
      ref={dialogRef}
      className={`minimal-modal ${className}`}
      onClick={handleBackdropClick}
      onClose={onClose}
      onKeyDown={handleKeyDown}
      aria-labelledby={title ? 'modal-title' : undefined}
      aria-describedby="modal-description"
    >
      <div className="modal-content-wrapper">
        <div className="modal-header">
          {title && (
            <h2 id="modal-title" className="modal-title">
              {title}
            </h2>
          )}
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close modal"
            ref={initialFocusRef} // if not provided, this button will be focused
          >
            &times;
          </button>
        </div>
        <div id="modal-description" className="modal-body">
          {children}
        </div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </dialog>
  );
};

export default React.memo(Modal);