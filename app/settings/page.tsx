'use client'

import React, { useState, useEffect } from 'react'
import { 
  User, Bell, Shield, Globe, 
  CreditCard, LogOut, ChevronRight, Sparkles 
} from 'lucide-react'
import Navbar from '../components/Navbar'
import Link from 'next/link'

export default function SettingsPage() {
  const [userName, setUserName] = useState('Recruiter')
  const [email, setEmail] = useState('recruiter@acme.corp')

  useEffect(() => {
    const savedName = localStorage.getItem('rankr_user_name')
    if (savedName) setUserName(savedName)
  }, [])

  const handleLogout = () => {
    window.location.href = '/auth'
  }

  return (
    <div className="min-h-screen bg-[#f0f5fa]">
      <Navbar type="app" activeNav="Settings" />

      <main className="max-w-[1000px] mx-auto px-4 sm:px-6 pt-28 sm:pt-36 pb-20">
        
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Sidebar */}
          <aside className="w-full md:w-64 flex flex-col gap-2">
            {[
              { label: 'Profile Settings', icon: User, active: true },
              { label: 'Notifications', icon: Bell },
              { label: 'Security', icon: Shield },
              { label: 'Billing & Plan', icon: CreditCard },
              { label: 'Language', icon: Globe },
            ].map((item, i) => (
              <button
                key={item.label}
                className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl text-sm font-bold transition-all ${
                  item.active 
                    ? 'bg-[#2a85ff] text-white shadow-lg shadow-[#2a85ff]/20' 
                    : 'bg-white text-[#5a6a7a] hover:bg-[#f8fbff] border border-transparent hover:border-[#e2eaf2]'
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </button>
            ))}
            
            <button 
              onClick={handleLogout}
              className="mt-4 flex items-center gap-3 px-5 py-3.5 rounded-2xl text-sm font-bold text-[#dc2626] bg-[#fef2f2] hover:bg-[#fee2e2] transition-all"
            >
              <LogOut size={18} />
              Logout
            </button>
          </aside>

          {/* Content */}
          <div className="flex-1 space-y-8">
            
            {/* Profile Section */}
            <div className="bg-white rounded-[2rem] p-6 sm:p-10 shadow-sm border border-[#e2eaf2]/60">
              <h2 className="text-[#070707] text-2xl font-extrabold tracking-tight mb-8">Account Profile</h2>
              
              <div className="space-y-8">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#2a85ff] to-[#6eb3ff] flex items-center justify-center text-white text-2xl font-black">
                    {userName.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <button className="px-5 py-2.5 rounded-xl bg-[#2a85ff] text-white text-sm font-bold shadow-lg hover:bg-[#1a75ef] transition-all">
                      Change Photo
                    </button>
                    <p className="text-[#8a9ab0] text-xs mt-2 font-medium">JPG, PNG or GIF. Max 2MB.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-[#8a9ab0] uppercase tracking-wider px-1">Display Name</label>
                    <input 
                      value={userName}
                      onChange={e => setUserName(e.target.value)}
                      className="w-full bg-[#f8fbff] border border-[#e2eaf2] rounded-2xl px-5 py-3.5 text-sm font-semibold text-[#070707] focus:outline-none focus:border-[#2a85ff]/50 focus:ring-4 focus:ring-[#2a85ff]/5 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-[#8a9ab0] uppercase tracking-wider px-1">Email Address</label>
                    <input 
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full bg-[#f8fbff] border border-[#e2eaf2] rounded-2xl px-5 py-3.5 text-sm font-semibold text-[#070707] focus:outline-none focus:border-[#2a85ff]/50 focus:ring-4 focus:ring-[#2a85ff]/5 transition-all"
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <button className="px-8 py-3.5 rounded-2xl bg-[#070707] text-white text-sm font-bold hover:bg-[#202020] transition-all shadow-xl">
                    Save Account Info
                  </button>
                </div>
              </div>
            </div>

            {/* Plan Section */}
            <div className="bg-[#070707] rounded-[2rem] p-6 sm:p-10 shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-[#2a85ff]/10 blur-[60px] pointer-events-none" />
               <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
                 <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles size={18} className="text-[#2a85ff]" />
                      <span className="text-white text-sm font-bold uppercase tracking-widest">Rankr Pro</span>
                    </div>
                    <h3 className="text-white text-xl font-bold">Manage your subscription</h3>
                    <p className="text-white/40 text-sm mt-1">Your next billing date is May 12, 2024</p>
                 </div>
                 <button className="px-6 py-3 rounded-xl bg-white/10 text-white text-sm font-bold border border-white/10 hover:bg-white/20 transition-all">
                   Upgrade Plan
                 </button>
               </div>
            </div>

          </div>
        </div>

      </main>
    </div>
  )
}
