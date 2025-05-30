import React, { useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';

const Modal = ({
  title,
  children,
  onClose,
  size = 'medium',
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  className = '',
  headerActions = null,
  footer = null,
  isOpen = true
}) => {
  const modalRef = useRef(null);
  const overlayRef = useRef(null);
  const focusedElementBeforeModal = useRef(null);

  // Handle escape key press
  const handleEscapeKey = useCallback((e) => {
    if (e.key === 'Escape' && closeOnEscape) {
      onClose();
    }
  }, [onClose, closeOnEscape]);

  // Handle overlay click
  const handleOverlayClick = useCallback((e) => {
    if (closeOnOverlayClick && e.target === overlayRef.current) {
      onClose();
    }
  }, [onClose, closeOnOverlayClick]);

  // Focus management
  useEffect(() => {
    if (isOpen) {
      // Store the currently focused element
      focusedElementBeforeModal.current = document.activeElement;

      // Focus the modal
      if (modalRef.current) {
        modalRef.current.focus();
      }

      // Add event listeners
      document.addEventListener('keydown', handleEscapeKey);

      // Prevent body scroll
      document.body.style.overflow = 'hidden';

      return () => {
        // Cleanup
        document.removeEventListener('keydown', handleEscapeKey);
        document.body.style.overflow = 'unset';

        // Restore focus to the previously focused element
        if (focusedElementBeforeModal.current) {
          focusedElementBeforeModal.current.focus();
        }
      };
    }
  }, [isOpen, handleEscapeKey]);

  // Trap focus within modal
  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      const focusableElements = modalRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      if (!focusableElements || focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        // Shift + Tab: move to previous element
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab: move to next element
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    }
  };

  // Get size classes
  const getSizeClass = () => {
    switch (size) {
      case 'small':
        return 'modal-small';
      case 'large':
        return 'modal-large';
      case 'fullscreen':
        return 'modal-fullscreen';
      default:
        return 'modal-medium';
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <div
      ref={overlayRef}
      className="modal-overlay"
      onClick={handleOverlayClick}
    >
      <div
        ref={modalRef}
        className={`modal ${getSizeClass()} ${className}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
        tabIndex={-1}
        onKeyDown={handleKeyDown}
      >
        {/* Modal Header */}
        {(title || showCloseButton || headerActions) && (
          <div className="modal-header">
            <div className="modal-title-section">
              {title && (
                <h2 id="modal-title" className="modal-title">
                  {title}
                </h2>
              )}
            </div>
            
            <div className="modal-header-actions">
              {headerActions}
              {showCloseButton && (
                <button
                  type="button"
                  className="modal-close-button"
                  onClick={onClose}
                  aria-label="Close modal"
                >
                  <span className="close-icon">×</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Modal Body */}
        <div className="modal-body">
          {children}
        </div>

        {/* Modal Footer */}
        {footer && (
          <div className="modal-footer">
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  // Render modal using portal to body
  return createPortal(modalContent, document.body);
};

// Confirmation Modal - A specialized modal for confirmations
export const ConfirmationModal = ({
  title = "Confirm Action",
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  isDestructive = false,
  isLoading = false,
  ...modalProps
}) => {
  const handleConfirm = () => {
    if (!isLoading) {
      onConfirm();
    }
  };

  const handleCancel = () => {
    if (!isLoading) {
      onCancel();
    }
  };

  const footer = (
    <div className="confirmation-actions">
      <button
        type="button"
        onClick={handleCancel}
        className="btn btn-outline"
        disabled={isLoading}
      >
        {cancelText}
      </button>
      <button
        type="button"
        onClick={handleConfirm}
        className={`btn ${isDestructive ? 'btn-danger' : 'btn-primary'}`}
        disabled={isLoading}
      >
        {isLoading ? (
          <span className="loading-content">
            <span className="loading-spinner"></span>
            Loading...
          </span>
        ) : (
          confirmText
        )}
      </button>
    </div>
  );

  return (
    <Modal
      title={title}
      footer={footer}
      size="small"
      onClose={handleCancel}
      {...modalProps}
    >
      <div className="confirmation-message">
        {typeof message === 'string' ? <p>{message}</p> : message}
      </div>
    </Modal>
  );
};

// Alert Modal - A specialized modal for alerts/notifications
export const AlertModal = ({
  title = "Alert",
  message,
  buttonText = "OK",
  onClose,
  type = "info", // info, warning, error, success
  ...modalProps
}) => {
  const getAlertIcon = () => {
    switch (type) {
      case 'warning':
        return '⚠️';
      case 'error':
        return '❌';
      case 'success':
        return '✅';
      default:
        return 'ℹ️';
    }
  };

  const footer = (
    <div className="alert-actions">
      <button
        type="button"
        onClick={onClose}
        className="btn btn-primary"
      >
        {buttonText}
      </button>
    </div>
  );

  return (
    <Modal
      title={title}
      footer={footer}
      size="small"
      onClose={onClose}
      {...modalProps}
    >
      <div className={`alert-message alert-${type}`}>
        <div className="alert-icon">{getAlertIcon()}</div>
        <div className="alert-content">
          {typeof message === 'string' ? <p>{message}</p> : message}
        </div>
      </div>
    </Modal>
  );
};

export default Modal;