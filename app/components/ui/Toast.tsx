'use client'

import React, { useEffect, useState, createContext, useContext } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react'

type ToastType = 'success' | 'error' | 'info'

interface Toast {
  id: string
  message: string
  type: ToastType
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = (message: string, type: ToastType = 'success') => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts((prev) => [...prev, { id, message, type }])
  }

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className="pointer-events-auto"
            >
              <ToastItem toast={toast} onRemove={() => removeToast(toast.id)} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used within a ToastProvider')
  return context
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onRemove, 5000)
    return () => clearTimeout(timer)
  }, [onRemove])

  const icons = {
    success: <CheckCircle className="text-[#16a34a]" size={18} />,
    error: <AlertCircle className="text-[#dc2626]" size={18} />,
    info: <Info className="text-[#2a85ff]" size={18} />,
  }

  const bgColors = {
    success: 'bg-[#e6f9f0] border-[#16a34a]/20',
    error: 'bg-[#fef2f2] border-[#dc2626]/20',
    info: 'bg-[#e8f1ff] border-[#2a85ff]/20',
  }

  return (
    <div className={`flex items-center gap-3 px-5 py-4 rounded-2xl border shadow-xl backdrop-blur-md ${bgColors[toast.type]} min-w-[300px]`}>
      <div className="shrink-0">{icons[toast.type]}</div>
      <p className="text-slate-900 text-sm font-bold flex-1">{toast.message}</p>
      <button onClick={onRemove} className="text-slate-400 hover:text-slate-600 transition-colors p-1">
        <X size={14} />
      </button>
    </div>
  )
}
