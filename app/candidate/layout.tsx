'use client'

import React, { useState, useEffect } from 'react'
import { Poppins } from 'next/font/google'
import { 
  Sparkles, Briefcase, FileText, User as UserIcon, 
  Bell, Search, LogOut, Menu, X
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'motion/react'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-poppins',
})

const CANDIDATE_NAV = [
  { label: 'Browse Jobs', href: '/candidate/jobs', icon: <Search size={18} /> },
  { label: 'My Applications', href: '/candidate/applications', icon: <FileText size={18} /> },
  { label: 'My Profile', href: '/candidate/profile', icon: <UserIcon size={18} /> },
]

export default function CandidateLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  
  // Mock dynamic user name
  const [userName, setUserName] = useState('New Candidate')
  const [completion, setCompletion] = useState(0)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    // In a real app, this would fetch from a database or storage
    const storedName = localStorage.getItem('rankr_user_name')
    if (storedName) setUserName(storedName)
    
    const storedCompletion = localStorage.getItem('rankr_profile_completion')
    if (storedCompletion) setCompletion(parseInt(storedCompletion))
    else setCompletion(75) // Default demo completion
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  return (
    <div className={`${poppins.className} min-h-screen bg-[#f0f5fa] flex flex-col md:flex-row`}>
      
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-[#070707]/60 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* ── SIDEBAR ── */}
      <aside className={`fixed md:sticky top-0 left-0 w-[280px] bg-[#070707] border-r border-white/5 flex flex-col h-screen z-50 transition-transform duration-300 md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        {/* Brand */}
        <div className="px-6 h-20 flex items-center justify-between border-b border-white/5">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#2a85ff] flex items-center justify-center flex-shrink-0">
              <Sparkles size={16} color="white" strokeWidth={2.2} />
            </div>
            <span className="text-white text-xl font-bold tracking-tight">Rankr</span>
          </Link>
          <button 
            className="md:hidden text-white/50 hover:text-white"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X size={24} />
          </button>
        </div>

        {/* User Card Mini */}
        <div className="px-6 py-8">
          <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2a85ff] to-[#6eb3ff] flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-bold">
                  {userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-white text-sm font-bold truncate">{userName}</p>
                <p className="text-white/40 text-[10px] uppercase font-bold tracking-wider">Candidate</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 flex flex-col gap-1.5 overflow-y-auto">
          {CANDIDATE_NAV.map(item => {
            const active = pathname === item.href
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 px-5 py-3.5 rounded-xl transition-all group ${
                  active 
                    ? 'bg-[#2a85ff] text-white shadow-[0_4px_16px_rgba(42,133,255,0.3)]' 
                    : 'text-white/45 hover:text-white/80 hover:bg-white/5'
                }`}
              >
                <span className={`${active ? 'text-white' : 'text-white/45 group-hover:text-white/80'}`}>
                  {item.icon}
                </span>
                <span className="text-sm font-semibold">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 mt-auto border-t border-white/5">
          <Link href="/auth" aria-label="Logout" className="flex items-center gap-3 px-5 py-3.5 rounded-xl text-white/45 hover:text-white/80 hover:bg-white/5 transition-all group">
            <LogOut size={18} />
            <span className="text-sm font-semibold">Logout</span>
          </Link>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 flex flex-col min-w-0 w-full">
        
        {/* Header */}
        <header className="h-20 bg-white border-b border-[#e2eaf2] flex items-center justify-between px-4 sm:px-10 sticky top-0 z-30">
          <div className="flex items-center gap-3 sm:gap-4">
            <button 
              className="md:hidden text-[#070707] hover:text-[#2a85ff] transition-colors p-1"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu size={24} />
            </button>
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-[#8a9ab0] text-sm font-medium">Candidate Dashboard</span>
              <span className="text-[#e2eaf2] text-sm">/</span>
            </div>
            <span className="text-[#070707] text-sm font-bold truncate">
              {CANDIDATE_NAV.find(n => n.href === pathname)?.label || 'Overview'}
            </span>
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            <button className="relative hidden sm:block text-[#5a6a7a] hover:text-[#2a85ff] transition-colors cursor-pointer">
              <Bell size={20} />
              <span className="absolute top-0 right-0 w-2 h-2 bg-[#f07830] rounded-full border-2 border-white" />
            </button>
            <div className="hidden sm:block h-8 w-px bg-[#e2eaf2]" />
            <Link href="/candidate/profile" className="flex items-center gap-2 sm:gap-3 group">
              <div className="text-right flex flex-col">
                <span className="hidden sm:block text-sm font-bold text-[#070707]">{userName}</span>
                <span className="hidden sm:block text-[10px] text-[#8a9ab0] font-semibold uppercase tracking-wider">{completion}% Profile Complete</span>
              </div>
              <div className="w-10 h-10 rounded-full border-2 border-[#e2eaf2] p-0.5 group-hover:border-[#2a85ff] transition-all flex-shrink-0">
                <div className="w-full h-full rounded-full bg-gradient-to-br from-[#2a85ff] to-[#6eb3ff] flex items-center justify-center">
                  <span className="text-white text-[10px] font-bold">
                    {userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                  </span>
                </div>
              </div>
            </Link>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-10 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
