import React from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import '../../styles/Toast.css';

const ToastIcon = ({ type }) => {
  switch (type) {
    case 'success':
      return <CheckCircle size={20} className="toast-icon success-icon" />;
    case 'error':
      return <AlertCircle size={20} className="toast-icon error-icon" />;
    default:
      return <Info size={20} className="toast-icon info-icon" />;
  }
};

const Toast = ({ id, message, type }) => {
  const { removeToast } = useToast();

  return (
    <div className={`toast toast-${type}`} role="alert" aria-live="assertive">
      <div className="toast-content">
        <ToastIcon type={type} />
        <span className="toast-message">{message}</span>
      </div>
      <button 
        className="toast-close" 
        onClick={() => removeToast(id)}
        aria-label="Close notification"
      >
        <X size={16} />
      </button>
    </div>
  );
};

export const ToastContainer = () => {
  const { toasts } = useToast();

  return (
    <div className="toast-container" aria-live="polite">
      {toasts.map(toast => (
        <Toast key={toast.id} {...toast} />
      ))}
    </div>
  );
};

export default ToastContainer;
