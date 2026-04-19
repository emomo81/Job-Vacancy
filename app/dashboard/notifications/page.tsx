'use client'

import React, { useEffect, useState } from 'react'
import { Bell, Sparkles, Trash2, X as CloseIcon } from 'lucide-react'
import { motion } from 'framer-motion'
import Navbar from '../../components/Navbar'
import { apiFetch } from '../../../utils/api-client'
import { useToast } from '../../components/ui/Toast'

type NotificationItem = {
  id: string
  title: string
  message: string
  createdAt?: string
}

export default function RecruiterNotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [error, setError] = useState('')
  const { showToast } = useToast()

  const fetchNotifications = async () => {
    try {
      const response = await apiFetch('/notifications')
      const mapped = Array.isArray(response.data)
        ? response.data.map((item: Record<string, unknown>, index: number) => ({
            id: String(item.id || item._id || index),
            title: typeof item.title === 'string' ? item.title : 'Notification',
            message: typeof item.message === 'string' ? item.message : '',
            createdAt: typeof item.createdAt === 'string' ? item.createdAt : undefined,
          }))
        : []
      setNotifications(mapped)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load notifications')
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [])

  const handleDelete = async (id: string) => {
    try {
      await apiFetch(`/notifications/${id}`, { method: 'DELETE' })
      setNotifications(prev => prev.filter(n => n.id !== id))
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to delete notification'
      setError(msg)
      showToast(msg, 'error')
    }
  }

  const handleClearAll = async () => {
    if (!confirm('Are you sure you want to clear all notifications?')) return
    try {
      await apiFetch('/notifications', { method: 'DELETE' })
      setNotifications([])
      showToast('All recruiter notifications cleared', 'success')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to clear notifications'
      setError(msg)
      showToast(msg, 'error')
    }
  }

  return (
    <div className="min-h-screen bg-[#f0f5fa]">
      <Navbar type="app" activeNav="Notifications" />

      <div className="bg-[#070707] pt-24 sm:pt-32 pb-12 sm:pb-16 overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-2xl bg-[#2a85ff]/20 flex items-center justify-center text-[#6eb3ff]">
                  <Bell size={18} />
                </div>
                <h1 className="text-white font-extrabold text-4xl sm:text-6xl tracking-tight">
                  Notifications <span className="text-[#2a85ff]">✦</span>
                </h1>
              </div>
              <p className="text-white/50 text-sm sm:text-base">Recruiter alerts, application updates, and screening completion messages.</p>
            </div>
            
            {notifications.length > 0 && (
              <button
                onClick={handleClearAll}
                className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-white/5 hover:bg-[#dc2626]/20 hover:text-white text-white/50 text-sm font-bold transition-all border border-white/5 hover:border-[#dc2626]/30 mb-2"
              >
                <Trash2 size={16} />
                Clear All Feed
              </button>
            )}
          </div>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[#2a85ff]/5 blur-3xl pointer-events-none" />
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        {error ? <p className="mb-6 text-sm font-bold text-[#dc2626]">{error}</p> : null}

        <div className="space-y-4">
          {notifications.length > 0 ? notifications.map((notification, index) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-3xl border border-[#e2eaf2] p-5 sm:p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)]"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-[#e8f1ff] border border-[#e2eaf2] flex items-center justify-center text-[#2a85ff] shrink-0">
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <h3 className="text-[#070707] text-base font-bold">{notification.title || 'Notification'}</h3>
                    <p className="text-[#5a6a7a] text-sm mt-1">{notification.message || ''}</p>
                  </div>
                </div>
                
                <button
                  onClick={() => handleDelete(notification.id)}
                  className="p-2 text-[#8a9ab0] hover:text-[#dc2626] hover:bg-[#fff5f5] rounded-xl transition-all"
                  aria-label="Delete notification"
                >
                  <CloseIcon size={16} />
                </button>
              </div>
            </motion.div>
          )) : (
            <div className="bg-white rounded-3xl border border-dashed border-[#d8e5f0] p-10 text-center text-[#8a9ab0]">
              No notifications available.
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
