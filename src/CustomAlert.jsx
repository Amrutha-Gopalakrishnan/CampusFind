import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, X, Info, AlertTriangle } from 'lucide-react';

// Custom Alert Component
export const CustomAlert = ({ 
  type = 'info', 
  title, 
  message, 
  onClose, 
  duration = 5000,
  show = false 
}) => {
  const [isVisible, setIsVisible] = useState(show);

  useEffect(() => {
    setIsVisible(show);
    if (show && duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => onClose?.(), 300); // Wait for animation to complete
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);

  const getAlertStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-gradient-to-r from-green-50 to-emerald-50',
          border: 'border-green-200',
          icon: <CheckCircle className="w-6 h-6 text-green-600" />,
          titleColor: 'text-green-900',
          messageColor: 'text-green-700'
        };
      case 'error':
        return {
          bg: 'bg-gradient-to-r from-red-50 to-rose-50',
          border: 'border-red-200',
          icon: <AlertCircle className="w-6 h-6 text-red-600" />,
          titleColor: 'text-red-900',
          messageColor: 'text-red-700'
        };
      case 'warning':
        return {
          bg: 'bg-gradient-to-r from-yellow-50 to-orange-50',
          border: 'border-yellow-200',
          icon: <AlertTriangle className="w-6 h-6 text-yellow-600" />,
          titleColor: 'text-yellow-900',
          messageColor: 'text-yellow-700'
        };
      default:
        return {
          bg: 'bg-gradient-to-r from-blue-50 to-indigo-50',
          border: 'border-blue-200',
          icon: <Info className="w-6 h-6 text-blue-600" />,
          titleColor: 'text-blue-900',
          messageColor: 'text-blue-700'
        };
    }
  };

  const styles = getAlertStyles();

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md w-full mx-4">
      <div className={`${styles.bg} ${styles.border} border rounded-2xl shadow-2xl backdrop-blur-sm p-4 transform transition-all duration-300 ${
        isVisible ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-full opacity-0 scale-95'
      }`}>
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            {styles.icon}
          </div>
          <div className="flex-1 min-w-0">
            {title && (
              <h4 className={`text-sm font-bold ${styles.titleColor} mb-1`}>
                {title}
              </h4>
            )}
            <p className={`text-sm ${styles.messageColor} leading-relaxed`}>
              {message}
            </p>
          </div>
          <button
            onClick={() => {
              setIsVisible(false);
              setTimeout(() => onClose?.(), 300);
            }}
            className="flex-shrink-0 p-1 rounded-lg hover:bg-white/50 transition-colors duration-200"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Custom Alert Hook
export const useAlert = () => {
  const [alert, setAlert] = useState({
    show: false,
    type: 'info',
    title: '',
    message: '',
    duration: 5000
  });

  const showAlert = (type, title, message, duration = 5000) => {
    setAlert({
      show: true,
      type,
      title,
      message,
      duration
    });
  };

  const hideAlert = () => {
    setAlert(prev => ({ ...prev, show: false }));
  };

  const success = (message, title = 'Success', duration = 5000) => {
    showAlert('success', title, message, duration);
  };

  const error = (message, title = 'Error', duration = 7000) => {
    showAlert('error', title, message, duration);
  };

  const warning = (message, title = 'Warning', duration = 6000) => {
    showAlert('warning', title, message, duration);
  };

  const info = (message, title = 'Info', duration = 5000) => {
    showAlert('info', title, message, duration);
  };

  return {
    alert,
    showAlert,
    hideAlert,
    success,
    error,
    warning,
    info
  };
};

// Custom Confirm Dialog Component
export const CustomConfirm = ({ 
  title = 'Confirm Action', 
  message, 
  onConfirm, 
  onCancel, 
  confirmText = 'Confirm', 
  cancelText = 'Cancel',
  type = 'warning',
  show = false 
}) => {
  const [isVisible, setIsVisible] = useState(show);

  useEffect(() => {
    setIsVisible(show);
  }, [show]);

  const getConfirmStyles = () => {
    switch (type) {
      case 'danger':
        return {
          bg: 'bg-gradient-to-r from-red-50 to-rose-50',
          border: 'border-red-200',
          icon: <AlertCircle className="w-8 h-8 text-red-600" />,
          titleColor: 'text-red-900',
          messageColor: 'text-red-700',
          confirmBtn: 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800'
        };
      case 'warning':
        return {
          bg: 'bg-gradient-to-r from-yellow-50 to-orange-50',
          border: 'border-yellow-200',
          icon: <AlertTriangle className="w-8 h-8 text-yellow-600" />,
          titleColor: 'text-yellow-900',
          messageColor: 'text-yellow-700',
          confirmBtn: 'bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700'
        };
      default:
        return {
          bg: 'bg-gradient-to-r from-blue-50 to-indigo-50',
          border: 'border-blue-200',
          icon: <Info className="w-8 h-8 text-blue-600" />,
          titleColor: 'text-blue-900',
          messageColor: 'text-blue-700',
          confirmBtn: 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
        };
    }
  };

  const styles = getConfirmStyles();

  if (!isVisible) return null;

  const handleConfirm = () => {
    setIsVisible(false);
    setTimeout(() => onConfirm?.(), 300);
  };

  const handleCancel = () => {
    setIsVisible(false);
    setTimeout(() => onCancel?.(), 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className={`${styles.bg} ${styles.border} border rounded-2xl shadow-2xl backdrop-blur-sm p-6 max-w-md w-full transform transition-all duration-300 ${
        isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
      }`}>
        <div className="text-center">
          <div className="flex justify-center mb-4">
            {styles.icon}
          </div>
          <h3 className={`text-lg font-bold ${styles.titleColor} mb-2`}>
            {title}
          </h3>
          <p className={`text-sm ${styles.messageColor} mb-6 leading-relaxed`}>
            {message}
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={handleCancel}
              className="px-6 py-2 bg-white/80 text-gray-700 rounded-xl font-semibold border border-gray-200 hover:bg-gray-50 transition-all duration-300 hover:scale-105"
            >
              {cancelText}
            </button>
            <button
              onClick={handleConfirm}
              className={`px-6 py-2 ${styles.confirmBtn} text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Custom Confirm Hook
export const useConfirm = () => {
  const [confirm, setConfirm] = useState({
    show: false,
    title: 'Confirm Action',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    type: 'warning',
    onConfirm: null,
    onCancel: null
  });

  const showConfirm = (message, options = {}) => {
    return new Promise((resolve) => {
      setConfirm({
        show: true,
        title: options.title || 'Confirm Action',
        message,
        confirmText: options.confirmText || 'Confirm',
        cancelText: options.cancelText || 'Cancel',
        type: options.type || 'warning',
        onConfirm: () => resolve(true),
        onCancel: () => resolve(false)
      });
    });
  };

  const hideConfirm = () => {
    setConfirm(prev => ({ ...prev, show: false }));
  };

  return {
    confirm,
    showConfirm,
    hideConfirm
  };
};

export default CustomAlert;
