import { useContext } from 'react'
import { ToastContext } from '../context/ToastContext'
import '../styles/toast.css'

export default function Toast() {
  const { toasts, removeToast } = useContext(ToastContext)

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`toast toast-${toast.type}`}
          onClick={() => removeToast(toast.id)}
        >
          <div className="toast-content">
            <span className={`toast-icon toast-icon-${toast.type}`}>
              {toast.type === 'success' && '✓'}
              {toast.type === 'danger' && '✕'}
              {toast.type === 'warning' && '!'}
              {toast.type === 'info' && 'ℹ'}
            </span>
            <span className="toast-message">{toast.message}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
