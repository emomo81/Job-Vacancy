'use client'

import React, { useState } from 'react'
import { Poppins } from 'next/font/google'
import { Sparkles, Eye, EyeOff, CheckCircle, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'motion/react'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-poppins',
})

type Role = 'company' | 'candidate'
type Tab = 'signin' | 'create'

const FEATURES = [
  'Screen hundreds of CVs in seconds',
  'AI-generated match scores and reasoning',
  'Works with Umurava profiles and external uploads',
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
      {label && <label className="text-xs font-semibold text-[#5a6a7a] tracking-wide uppercase">{label}</label>}
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full border border-[#e2eaf2] rounded-xl px-4 py-3 text-sm text-[#070707] placeholder-[#b0bac6] focus:outline-none focus:border-[#2a85ff] focus:ring-2 focus:ring-[#2a85ff]/10 transition-all bg-white pr-10"
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
    <div className={`${poppins.className} min-h-screen flex`}>

      {/* ── LEFT COLUMN ── */}
      <div className="hidden lg:flex flex-col w-1/2 bg-[#070707] relative overflow-hidden">

        {/* Ambient glows */}
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-[#2a85ff]/6 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/3 left-0 w-64 h-64 rounded-full bg-[#2a85ff]/4 blur-[80px] pointer-events-none" />

        {/* Wordmark */}
        <div className="px-10 pt-10 flex-shrink-0">
          <Link href="/" className="inline-flex items-center gap-2.5 select-none">
            <div className="w-9 h-9 rounded-xl bg-[#2a85ff] flex items-center justify-center flex-shrink-0 shadow-[0_4px_16px_rgba(42,133,255,0.4)]">
              <Sparkles size={18} color="white" strokeWidth={2.2} />
            </div>
            <span className="text-white text-2xl font-bold tracking-tight">Rankr</span>
          </Link>
        </div>

        {/* Center content */}
        <div className="flex-1 flex flex-col justify-center px-10 py-10 relative z-10">

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
          >
            <h1 className="text-white font-extrabold text-4xl xl:text-5xl leading-[1.1] tracking-tight mb-4">
              The smarter way<br />to hire.
            </h1>
            <p className="text-white/45 text-sm xl:text-base leading-relaxed mb-10 max-w-[380px]">
              AI screening that ranks every candidate and explains every decision.
            </p>

            <div className="flex flex-col gap-5">
              {FEATURES.map((feat, i) => (
                <motion.div
                  key={feat}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.45, delay: 0.15 + i * 0.1 }}
                  className="flex items-start gap-3.5"
                >
                  <div className="w-5 h-5 rounded-full bg-[#2a85ff]/15 border border-[#2a85ff]/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle size={11} color="#2a85ff" strokeWidth={2.5} />
                  </div>
                  <span className="text-white/70 text-sm leading-relaxed">{feat}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Decorative grayscale image at bottom */}
        <div className="flex-shrink-0 h-56 relative overflow-hidden">
          <img
            src="https://uxcanvas.ai/api/generated-images/a41dbe01-2ec5-4de6-bde6-a96289ed1c5f/9bf07167-e189-46c3-9b0b-84e832c5a707"
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover object-top grayscale-[100%] brightness-[0.55] contrast-[1.1]"
            style={{
              maskImage: 'linear-gradient(to bottom, transparent 0%, black 30%, black 70%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 30%, black 70%, transparent 100%)',
            }}
          />
        </div>
      </div>

      {/* ── RIGHT COLUMN ── */}
      <div className="flex-1 lg:w-1/2 bg-white flex flex-col items-center justify-center min-h-screen px-6 py-12">

        {/* Mobile wordmark */}
        <div className="lg:hidden mb-8">
          <Link href="/" className="inline-flex items-center gap-2 select-none">
            <div className="w-8 h-8 rounded-xl bg-[#2a85ff] flex items-center justify-center">
              <Sparkles size={16} color="white" strokeWidth={2.2} />
            </div>
            <span className="text-[#070707] text-xl font-bold tracking-tight">Rankr</span>
          </Link>
        </div>

        <div className="w-full max-w-[420px] flex flex-col gap-7">

          {/* Role selector pills */}
          <div className="flex rounded-full border border-[#e2eaf2] p-1 gap-1 bg-[#f0f5fa]">
            {(['company', 'candidate'] as Role[]).map(r => (
              <button
                key={r}
                onClick={() => setRole(r)}
                className={`flex-1 py-2.5 rounded-full text-sm font-semibold transition-all cursor-pointer ${
                  role === r
                    ? 'bg-[#2a85ff] text-white shadow-[0_4px_14px_rgba(42,133,255,0.35)]'
                    : 'text-[#8a9ab0] hover:text-[#5a6a7a]'
                }`}
              >
                {r === 'company' ? "I'm a Company" : "I'm a Candidate"}
              </button>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex border-b border-[#e2eaf2]">
            {(['signin', 'create'] as Tab[]).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 pb-3 text-sm font-semibold transition-all cursor-pointer relative ${
                  tab === t ? 'text-[#070707]' : 'text-[#8a9ab0] hover:text-[#5a6a7a]'
                }`}
              >
                {t === 'signin' ? 'Sign In' : 'Create Account'}
                {tab === t && (
                  <motion.div
                    layoutId="tab-underline"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2a85ff] rounded-full"
                  />
                )}
              </button>
            ))}
          </div>

          {/* Form content */}
          <AnimatePresence mode="wait">
            {tab === 'signin' ? (
              <motion.div
                key="signin"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="flex flex-col gap-5"
              >
                <div>
                  <h2 className="text-[#070707] text-2xl font-extrabold tracking-tight leading-tight">Welcome back</h2>
                  <p className="text-[#8a9ab0] text-sm mt-1">Sign in to your {role === 'company' ? 'company' : 'candidate'} account</p>
                </div>

                <InputField
                  placeholder="you@company.com"
                  label="Email"
                  value={signInEmail}
                  onChange={setSignInEmail}
                />

                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-[#5a6a7a] tracking-wide uppercase">Password</label>
                    <button className="text-xs text-[#2a85ff] font-semibold hover:text-[#1a75ef] transition-colors cursor-pointer">
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPw ? 'text' : 'password'}
                      value={signInPw}
                      onChange={e => setSignInPw(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full border border-[#e2eaf2] rounded-xl px-4 py-3 text-sm text-[#070707] placeholder-[#b0bac6] focus:outline-none focus:border-[#2a85ff] focus:ring-2 focus:ring-[#2a85ff]/10 transition-all bg-white pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(v => !v)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#b0bac6] hover:text-[#5a6a7a] transition-colors cursor-pointer"
                    >
                      {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <Link
                  onClick={() => {
                    localStorage.setItem('rankr_user_name', role === 'company' ? 'Acme Corp' : 'John Doe')
                    localStorage.setItem('rankr_profile_completion', '75')
                  }}
                  href={role === 'company' ? '/dashboard' : '/candidate/jobs'}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-full text-sm font-bold text-white bg-[#2a85ff] hover:bg-[#1a75ef] shadow-[0_4px_16px_rgba(42,133,255,0.35)] hover:shadow-[0_6px_24px_rgba(42,133,255,0.5)] transition-all cursor-pointer"
                >
                  Sign In
                  <ArrowRight size={16} strokeWidth={2.5} />
                </Link>

                {/* Divider */}
                <div className="flex items-center gap-4">
                  <div className="flex-1 h-px bg-[#e2eaf2]" />
                  <span className="text-[#b0bac6] text-xs font-medium">or continue with</span>
                  <div className="flex-1 h-px bg-[#e2eaf2]" />
                </div>

                {/* Google button */}
                <button className="w-full flex items-center justify-center gap-3 py-3 rounded-full border border-[#e2eaf2] bg-white text-sm font-semibold text-[#3c4a5c] hover:bg-[#f0f5fa] hover:border-[#c6d4e8] transition-all cursor-pointer">
                  <GoogleIcon />
                  Continue with Google
                </button>
              </motion.div>
            ) : (
              <motion.div
                key={`create-${role}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="flex flex-col gap-5"
              >
                <div>
                  <h2 className="text-[#070707] text-2xl font-extrabold tracking-tight leading-tight">
                    {role === 'company' ? 'Create company account' : 'Create your profile'}
                  </h2>
                  <p className="text-[#8a9ab0] text-sm mt-1">
                    {role === 'company' ? 'Start screening candidates with AI' : 'Get matched to your next role'}
                  </p>
                </div>

                {role === 'company' ? (
                  <>
                    <InputField label="Company Name" placeholder="Acme Corp" value={companyName} onChange={setCompanyName} />
                    <InputField label="Work Email" placeholder="you@company.com" value={workEmail} onChange={setWorkEmail} />
                  </>
                ) : (
                  <>
                    <InputField label="Full Name" placeholder="Amara Osei" value={fullName} onChange={setFullName} />
                    <InputField label="Email" placeholder="you@example.com" value={createEmail} onChange={setCreateEmail} />
                  </>
                )}

                {/* Password */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#5a6a7a] tracking-wide uppercase">Password</label>
                  <div className="relative">
                    <input
                      type={showPw ? 'text' : 'password'}
                      value={createPw}
                      onChange={e => setCreatePw(e.target.value)}
                      placeholder="Create a password"
                      className="w-full border border-[#e2eaf2] rounded-xl px-4 py-3 text-sm text-[#070707] placeholder-[#b0bac6] focus:outline-none focus:border-[#2a85ff] focus:ring-2 focus:ring-[#2a85ff]/10 transition-all bg-white pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(v => !v)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#b0bac6] hover:text-[#5a6a7a] transition-colors cursor-pointer"
                    >
                      {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Confirm password */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#5a6a7a] tracking-wide uppercase">Confirm Password</label>
                  <div className="relative">
                    <input
                      type={showConfirmPw ? 'text' : 'password'}
                      value={confirmPw}
                      onChange={e => setConfirmPw(e.target.value)}
                      placeholder="Repeat your password"
                      className="w-full border border-[#e2eaf2] rounded-xl px-4 py-3 text-sm text-[#070707] placeholder-[#b0bac6] focus:outline-none focus:border-[#2a85ff] focus:ring-2 focus:ring-[#2a85ff]/10 transition-all bg-white pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPw(v => !v)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#b0bac6] hover:text-[#5a6a7a] transition-colors cursor-pointer"
                    >
                      {showConfirmPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <Link
                  onClick={() => {
                    localStorage.setItem('rankr_user_name', role === 'company' ? 'Acme Corp' : 'John Doe')
                    localStorage.setItem('rankr_profile_completion', '75')
                  }}
                  href={role === 'company' ? '/dashboard' : '/profile'}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-full text-sm font-bold text-white bg-[#2a85ff] hover:bg-[#1a75ef] shadow-[0_4px_16px_rgba(42,133,255,0.35)] hover:shadow-[0_6px_24px_rgba(42,133,255,0.5)] transition-all cursor-pointer"
                >
                  {role === 'company' ? 'Create Company Account' : 'Create Candidate Account'}
                  <ArrowRight size={16} strokeWidth={2.5} />
                </Link>

                <p className="text-center text-[#b0bac6] text-xs leading-relaxed">
                  By signing up you agree to Rankr&apos;s{' '}
                  <button className="text-[#2a85ff] hover:text-[#1a75ef] font-semibold cursor-pointer transition-colors">
                    Terms of Use
                  </button>
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tab toggle footer */}
          <p className="text-center text-[#8a9ab0] text-sm">
            {tab === 'signin' ? (
              <>
                Don&apos;t have an account?{' '}
                <button
                  onClick={() => setTab('create')}
                  className="text-[#2a85ff] font-semibold hover:text-[#1a75ef] transition-colors cursor-pointer"
                >
                  Create one
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  onClick={() => setTab('signin')}
                  className="text-[#2a85ff] font-semibold hover:text-[#1a75ef] transition-colors cursor-pointer"
                >
                  Sign In
                </button>
              </>
            )}
          </p>

        </div>
      </div>
    </div>
  )
}
