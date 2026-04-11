'use client'

import React, { useState } from 'react'
import { Sparkles, Eye, EyeOff, CheckCircle, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'motion/react'

type Role = 'company' | 'candidate'
type Tab = 'signin' | 'create'

const FEATURES = [
  'Screen hundreds of CVs in seconds',
  'AI-generated match scores and reasoning',
  'Works with Rankr profiles and external uploads',
]

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.64 9.20456C17.64 8.56637 17.5827 7.95274 17.4764 7.36365H9V10.845H13.8436C13.635 11.9699 13.0009 12.9231 12.0477 13.5613V15.8194H14.9564C16.6582 14.2526 17.64 11.9453 17.64 9.20456Z" fill="#4285F4"/>
      <path d="M9 18C11.43 18 13.4673 17.1941 14.9564 15.8195L12.0477 13.5613C11.2418 14.1013 10.2109 14.4204 9 14.4204C6.65591 14.4204 4.67182 12.8372 3.96409 10.71H0.957275V13.0418C2.43818 15.9831 5.48182 18 9 18Z" fill="#34A853"/>
      <path d="M3.96409 10.71C3.78409 10.17 3.68182 9.59319 3.68182 9.00001C3.68182 8.40683 3.78409 7.83001 3.96409 7.29001V4.95819H0.957275C0.347727 6.17319 0 7.54774 0 9.00001C0 10.4523 0.347727 11.8268 0.957275 13.0418L3.96409 10.71Z" fill="#FBBC05"/>
      <path d="M9 3.57955C10.3214 3.57955 11.5077 4.03364 12.4405 4.92545L15.0218 2.34409C13.4632 0.891818 11.4259 0 9 0C5.48182 0 2.43818 2.01682 0.957275 4.95818L3.96409 7.29C4.67182 5.16273 6.65591 3.57955 9 3.57955Z" fill="#EA4335"/>
    </svg>
  )
}

function InputField({
  type = 'text',
  placeholder,
  label,
  value,
  onChange,
  rightElement,
}: {
  type?: string
  placeholder: string
  label?: string
  value: string
  onChange: (v: string) => void
  rightElement?: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-xs font-bold text-[#5a6a7a] tracking-wide uppercase">{label}</label>}
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full border border-[#e2eaf2] rounded-xl px-4 py-3 text-sm text-[#070707] placeholder-[#b0bac6] focus:outline-none focus:border-[#2a85ff] focus:ring-4 focus:ring-[#2a85ff]/5 transition-all bg-[#fcfdfe] pr-10"
        />
        {rightElement && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
            {rightElement}
          </div>
        )}
      </div>
    </div>
  )
}

export default function RankrAuth() {
  const [role, setRole] = useState<Role>('company')
  const [tab, setTab] = useState<Tab>('signin')

  const [showPw, setShowPw] = useState(false)
  const [showConfirmPw, setShowConfirmPw] = useState(false)

  const [signInEmail, setSignInEmail] = useState('')
  const [signInPw, setSignInPw] = useState('')

  const [companyName, setCompanyName] = useState('')
  const [workEmail, setWorkEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [createEmail, setCreateEmail] = useState('')
  const [createPw, setCreatePw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')

  return (
    <div className="min-h-screen flex bg-white">

      {/* ── LEFT COLUMN (HIDDEN ON MOBILE) ── */}
      <div className="hidden lg:flex flex-col w-1/2 bg-[#070707] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-[#2a85ff]/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/3 left-0 w-64 h-64 rounded-full bg-[#2a85ff]/5 blur-[100px] pointer-events-none" />

        <div className="px-12 pt-12 flex-shrink-0">
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-[#2a85ff] flex items-center justify-center transition-transform group-hover:scale-110">
              <Sparkles size={20} color="white" strokeWidth={2.2} />
            </div>
            <span className="text-white text-2xl font-bold tracking-tight">Rankr</span>
          </Link>
        </div>

        <div className="flex-1 flex flex-col justify-center px-20">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-white font-black text-5xl xl:text-7xl leading-[1] tracking-tighter mb-6">
              The smarter way<br />to hire.
            </h1>
            <p className="text-white/40 text-lg xl:text-xl leading-relaxed mb-12 max-w-[420px]">
              AI screening that ranks every candidate and explains every decision based on performance.
            </p>

            <div className="flex flex-col gap-6">
              {FEATURES.map((feat, i) => (
                <motion.div
                  key={feat}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  className="flex items-start gap-4"
                >
                  <div className="w-6 h-6 rounded-full bg-[#2a85ff]/20 border border-[#2a85ff]/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle size={13} color="#2a85ff" strokeWidth={3} />
                  </div>
                  <span className="text-white/70 text-base font-medium">{feat}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="flex-shrink-0 h-64 relative overflow-hidden">
          <img
            src="https://uxcanvas.ai/api/generated-images/a41dbe01-2ec5-4de6-bde6-a96289ed1c5f/9bf07167-e189-46c3-9b0b-84e832c5a707"
            alt=""
            className="absolute inset-0 w-full h-full object-cover object-top grayscale brightness-50"
            style={{
              maskImage: 'linear-gradient(to bottom, transparent 0%, black 40%, black 80%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 40%, black 80%, transparent 100%)',
            }}
          />
        </div>
      </div>

      {/* ── RIGHT COLUMN (FULL ON MOBILE) ── */}
      <div className="flex-1 lg:w-1/2 flex flex-col items-center justify-center p-6 sm:p-12">
        
        {/* Mobile Header */}
        <div className="lg:hidden w-full max-w-[420px] mb-12 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-[#2a85ff] flex items-center justify-center">
              <Sparkles size={18} color="white" />
            </div>
            <span className="text-[#070707] text-xl font-bold tracking-tight">Rankr</span>
          </Link>
          <Link href="/" className="text-sm font-bold text-[#8a9ab0] hover:text-[#070707]">Back</Link>
        </div>

        <div className="w-full max-w-[420px] flex flex-col gap-8">
          
          {/* Role selector */}
          <div className="flex rounded-2xl border border-[#e2eaf2] p-1.5 gap-1 bg-[#f0f5fa]">
            {(['company', 'candidate'] as Role[]).map(r => (
              <button
                key={r}
                onClick={() => setRole(r)}
                className={`flex-1 py-3.5 rounded-[0.8rem] text-sm font-black transition-all cursor-pointer ${
                  role === r
                    ? 'bg-white text-[#2a85ff] shadow-sm ring-1 ring-[#e2eaf2]'
                    : 'text-[#8a9ab0] hover:text-[#5a6a7a]'
                }`}
              >
                {r === 'company' ? "Recruiter" : "Candidate"}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-2">
            <h2 className="text-[#070707] text-3xl sm:text-4xl font-black tracking-tight leading-none">
              {tab === 'signin' ? 'Welcome back' : 'Get started'}
            </h2>
            <p className="text-[#8a9ab0] text-sm font-medium">
              Access your {role} portal instantly
            </p>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={`${tab}-${role}`}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex flex-col gap-6"
            >
              {tab === 'signin' ? (
                <>
                  <InputField placeholder="you@company.com" label="Email" value={signInEmail} onChange={setSignInEmail} />
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-[#5a6a7a] tracking-wide uppercase">Password</label>
                      <button className="text-xs text-[#2a85ff] font-bold hover:underline">Forgot?</button>
                    </div>
                    <div className="relative">
                      <input
                        type={showPw ? 'text' : 'password'}
                        value={signInPw}
                        onChange={e => setSignInPw(e.target.value)}
                        placeholder="••••••••"
                        className="w-full border border-[#e2eaf2] rounded-xl px-4 py-3 text-sm text-[#070707] bg-[#fcfdfe] focus:outline-none focus:border-[#2a85ff] focus:ring-4 focus:ring-[#2a85ff]/5 transition-all pr-12"
                      />
                      <button onClick={() => setShowPw(!showPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#b0bac6]">
                        {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {role === 'company' ? (
                    <>
                      <InputField label="Company Name" placeholder="Google" value={companyName} onChange={setCompanyName} />
                      <InputField label="Work Email" placeholder="you@google.com" value={workEmail} onChange={setWorkEmail} />
                    </>
                  ) : (
                    <>
                      <InputField label="Full Name" placeholder="Elon Musk" value={fullName} onChange={setFullName} />
                      <InputField label="Email" placeholder="elon@x.com" value={createEmail} onChange={setCreateEmail} />
                    </>
                  )}
                  <InputField type="password" label="Password" placeholder="••••••••" value={createPw} onChange={setCreatePw} />
                </>
              )}

              <Link
                href={role === 'company' ? '/dashboard' : '/candidate'}
                className="w-full flex items-center justify-center gap-3 py-4.5 rounded-full text-base font-black text-white bg-[#2a85ff] hover:bg-[#1a75ef] shadow-xl shadow-[#2a85ff]/20 transition-all hover:-translate-y-0.5"
              >
                {tab === 'signin' ? 'Sign In' : 'Create Account'}
                <ArrowRight size={20} />
              </Link>

              <button className="w-full h-14 flex items-center justify-center gap-3 rounded-full border border-[#e2eaf2] text-[#3c4a5c] font-bold text-sm hover:bg-[#f0f5fa] transition-all">
                <GoogleIcon />
                Continue with Google
              </button>
            </motion.div>
          </AnimatePresence>

          <p className="text-center text-[#8a9ab0] text-sm">
            {tab === 'signin' ? "New to Rankr?" : "Already have an account?"}{' '}
            <button
              onClick={() => setTab(tab === 'signin' ? 'create' : 'signin')}
              className="text-[#2a85ff] font-black hover:underline ml-1"
            >
              {tab === 'signin' ? 'Create account' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
