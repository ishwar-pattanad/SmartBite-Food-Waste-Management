import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, X } from 'lucide-react';

const NotificationToast = ({ toast, onClose }) => {
  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 size={20} color="#15803D" />,
    warning: <AlertTriangle size={20} color="#F97316" />,
    error: <AlertCircle size={20} color="#EF4444" />,
  };

  return (
    <div className="toast-container">
      <div className={`toast toast-${toast.type || 'success'}`}>
        <div>{icons[toast.type] || icons.success}</div>
        <div style={{ flex: 1 }}>
          {toast.title && (
            <div style={{ fontWeight: '700', fontSize: '0.875rem', color: '#0F172A', marginBottom: '2px' }}>
              {toast.title}
            </div>
          )}
          <div style={{ fontSize: '0.8rem', color: '#475569' }}>{toast.message}</div>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: '#94A3B8',
            cursor: 'pointer',
            padding: '2px',
          }}
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

export default NotificationToast;
