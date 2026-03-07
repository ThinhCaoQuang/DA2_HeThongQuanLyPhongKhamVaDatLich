import { createContext, useState, useCallback } from 'react'

export const ToastContext = createContext()

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = Math.random().toString(36).substr(2, 9)
    const toast = { id, message, type }

    setToasts((prev) => [...prev, toast])

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }

    return id
  }, [])

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const success = (message, duration = 3000) => addToast(message, 'success', duration)
  const error = (message, duration = 4000) => addToast(message, 'danger', duration)
  const warning = (message, duration = 3500) => addToast(message, 'warning', duration)
  const info = (message, duration = 3000) => addToast(message, 'info', duration)

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, success, error, warning, info }}>
      {children}
    </ToastContext.Provider>
  )
}
