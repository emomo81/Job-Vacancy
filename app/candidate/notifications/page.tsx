'use client'

import React, { useEffect, useState } from 'react'
import { Bell, Sparkles, Trash2, X as CloseIcon } from 'lucide-react'
import { motion } from 'framer-motion'
import { apiFetch } from '../../../utils/api-client'
import { useToast } from '../../components/ui/Toast'

export default function CandidateNotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [error, setError] = useState('')
  const { showToast } = useToast()

  const fetchNotifications = async () => {
    try {
      const response = await apiFetch('/notifications')
      setNotifications(Array.isArray(response.data) ? response.data : [])
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
      setNotifications(prev => prev.filter(n => (n.id || n._id) !== id))
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
      showToast('All notifications cleared', 'success')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to clear notifications'
      setError(msg)
      showToast(msg, 'error')
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl border border-[#e2eaf2] p-6 sm:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#e8f1ff] flex items-center justify-center text-[#2a85ff]">
            <Bell size={18} />
          </div>
          <div>
            <h1 className="text-[#070707] text-2xl font-extrabold">Notifications</h1>
            <p className="text-[#8a9ab0] text-sm">Recruiter updates and application activity.</p>
          </div>
        </div>
        
        {notifications.length > 0 && (
          <button
            onClick={handleClearAll}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-[#f0f5fa] hover:bg-[#ffebee] hover:text-[#dc2626] text-[#5a6a7a] text-sm font-bold transition-all"
          >
            <Trash2 size={16} />
            Clear All
          </button>
        )}
      </div>

      {error ? <p className="text-sm font-bold text-[#dc2626]">{error}</p> : null}

      <div className="space-y-4">
        {notifications.length > 0 ? notifications.map((notification, index) => (
          <motion.div
            key={String(notification.id || notification._id || index)}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white rounded-3xl border border-[#e2eaf2] p-5 sm:p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)]"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-2xl bg-[#f8fbff] border border-[#e2eaf2] flex items-center justify-center text-[#2a85ff] shrink-0">
                  <Sparkles size={18} />
                </div>
                <div>
                  <h3 className="text-[#070707] text-base font-bold">{notification.title || 'Notification'}</h3>
                  <p className="text-[#5a6a7a] text-sm mt-1">{notification.message || ''}</p>
                </div>
              </div>
              
              <button
                onClick={() => handleDelete(notification.id || notification._id)}
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
    </div>
  )
}
