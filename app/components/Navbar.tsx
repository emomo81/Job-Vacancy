'use client'

import React, { useState } from 'react'
import { Sparkles, Bell, User, Menu, X } from 'lucide-react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'motion/react'

interface NavbarProps {
  type?: 'landing' | 'app'
  activeNav?: string
}

const NAV_LINKS = ['Jobs', 'Candidates', 'Shortlists', 'Settings']

export default function Navbar({ type = 'landing', activeNav }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false)

  const getHref = (link: string) => {
    if (link === 'Jobs') return '/dashboard'
    if (link === 'Shortlists') return '/results'
    return `/${link.toLowerCase()}`
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#070707]/80 backdrop-blur-md border-b border-white/5">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 flex items-center justify-between h-16 sm:h-20">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 select-none group">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#2a85ff] flex items-center justify-center shadow-[0_4px_16px_rgba(42,133,255,0.4)] transition-transform group-hover:scale-110">
            <Sparkles size={18} color="white" strokeWidth={2.2} />
          </div>
          <span className="text-white text-xl sm:text-2xl font-bold tracking-tight">Rankr</span>
        </Link>

        {/* Desktop Navigation */}
        {type === 'app' ? (
          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map(link => (
              <Link
                key={link}
                href={getHref(link)}
                className={`text-sm font-medium pb-1 transition-colors relative ${
                  activeNav === link
                    ? 'text-white'
                    : 'text-white/50 hover:text-white/80'
                }`}
              >
                {link}
                {activeNav === link && (
                  <motion.div
                    layoutId="nav-underline"
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#2a85ff] rounded-full"
                  />
                )}
              </Link>
            ))}
          </nav>
        ) : (
          <nav className="hidden md:flex items-center gap-10">
            <Link href="#solutions" className="text-white/60 hover:text-white text-sm font-medium transition-colors">Solutions</Link>
            <Link href="#pricing" className="text-white/60 hover:text-white text-sm font-medium transition-colors">Pricing</Link>
            <Link href="#resources" className="text-white/60 hover:text-white text-sm font-medium transition-colors">Resources</Link>
          </nav>
        )}

        {/* Right Actions */}
        <div className="flex items-center gap-3 sm:gap-5">
          {type === 'app' ? (
            <>
              <button className="relative text-white/60 hover:text-white transition-colors p-2" aria-label="Notifications">
                <Bell size={20} />
                <span className="absolute top-2 right-2 w-2 h-2 bg-[#2a85ff] rounded-full border border-[#070707]"></span>
              </button>
              <Link href="/settings" className="hidden sm:flex items-center gap-3 pl-2 border-l border-white/10 cursor-pointer group">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2a85ff] to-[#6eb3ff] flex items-center justify-center group-hover:ring-2 group-hover:ring-[#2a85ff]/50 transition-all">
                  <User size={15} color="white" strokeWidth={2} />
                </div>
                <div className="flex flex-col">
                  <span className="text-white text-xs font-bold leading-none group-hover:text-[#2a85ff] transition-colors">Recruiter</span>
                  <span className="text-white/40 text-[10px] mt-0.5">Acme Corp</span>
                </div>
              </Link>
            </>
          ) : (
            <div className="hidden sm:flex items-center gap-4">
              <Link href="/auth" className="text-white/70 hover:text-white text-sm font-semibold transition-colors">Log in</Link>
              <Link href="/auth" className="px-5 py-2.5 rounded-full bg-white text-[#070707] text-sm font-bold hover:bg-white/90 transition-all shadow-xl">
                Get Started
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-white/70 hover:text-white transition-colors"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[#0a0a0a] border-b border-white/5 overflow-hidden"
          >
            <div className="px-4 py-8 flex flex-col gap-6">
              {type === 'app' ? (
                NAV_LINKS.map(link => (
                  <Link
                    key={link}
                    href={getHref(link)}
                    onClick={() => setIsOpen(false)}
                    className={`text-lg font-bold ${
                      activeNav === link ? 'text-[#2a85ff]' : 'text-white/60'
                    }`}
                  >
                    {link}
                  </Link>
                ))
              ) : (
                <>
                  <Link href="#solutions" onClick={() => setIsOpen(false)} className="text-lg font-bold text-white/60">Solutions</Link>
                  <Link href="#pricing" onClick={() => setIsOpen(false)} className="text-lg font-bold text-white/60">Pricing</Link>
                  <Link href="#resources" onClick={() => setIsOpen(false)} className="text-lg font-bold text-white/60">Resources</Link>
                  <div className="h-px bg-white/5 my-2" />
                  <Link href="/auth" onClick={() => setIsOpen(false)} className="text-lg font-bold text-white/60">Log in</Link>
                  <Link href="/auth" onClick={() => setIsOpen(false)} className="w-full py-4 rounded-2xl bg-[#2a85ff] text-white text-center font-bold">
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
