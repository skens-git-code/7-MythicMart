// components/Toast.jsx
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import '../../styles/Toast.css';

const iconMap = {
  success: { Icon: CheckCircle, className: 'success-icon' },
  error: { Icon: AlertCircle, className: 'error-icon' },
  info: { Icon: Info, className: 'info-icon' },
};

const Toast = React.memo(({ id, message, type = 'info', duration = 5000 }) => {
  const { removeToast } = useToast();
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(100);
  const timerRef = useRef(null);
  const startTimeRef = useRef(Date.now());

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    const elapsed = Date.now() - startTimeRef.current;
    const remaining = Math.max(0, duration - elapsed);
    setProgress((remaining / duration) * 100);

    if (remaining <= 0) {
      removeToast(id);
      return;
    }

    timerRef.current = setTimeout(() => {
      removeToast(id);
    }, remaining);
  }, [duration, id, removeToast]);

  useEffect(() => {
    startTimeRef.current = Date.now();
    startTimer();

    return () => clearTimer();
  }, [startTimer, clearTimer]);

  // Pause timer on hover
  const handleMouseEnter = useCallback(() => {
    if (!isPaused) {
      setIsPaused(true);
      clearTimer();
    }
  }, [isPaused, clearTimer]);

  const handleMouseLeave = useCallback(() => {
    if (isPaused) {
      setIsPaused(false);
      startTimeRef.current = Date.now();
      startTimer();
    }
  }, [isPaused, startTimer]);

  const handleClose = useCallback(() => {
    clearTimer();
    removeToast(id);
  }, [clearTimer, removeToast, id]);

  const { Icon, className: iconClass } = iconMap[type] || iconMap.info;

  return (
    <div
      className={`toast toast-${type}`}
      role="alert"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="toast-content">
        <Icon size={20} className={`toast-icon ${iconClass}`} />
        <span className="toast-message">{message}</span>
      </div>
      <button className="toast-close" onClick={handleClose} aria-label="Close notification">
        <X size={16} />
      </button>
      {duration > 0 && (
        <div className="toast-progress">
          <div
            className="toast-progress-bar"
            style={{ width: `${progress}%` }}
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
      )}
    </div>
  );
});

Toast.displayName = 'Toast';

export const ToastContainer = () => {
  const { toasts } = useToast();

  return (
    <div className="toast-container" aria-live="polite" aria-atomic="true">
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} />
      ))}
    </div>
  );
};

export default ToastContainer;