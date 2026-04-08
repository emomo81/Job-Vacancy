"use client";
import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function LandingNav() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-[#0A0A0F]/80 backdrop-blur-md border-b border-white/5">
      <Link href="/" className="flex items-center gap-2">
        <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
          <span className="text-white text-xs font-bold">R</span>
        </div>
        <span className="text-white font-bold text-lg tracking-tight">Rankr</span>
      </Link>

      {/* Desktop links */}
      <div className="hidden md:flex items-center gap-8 text-sm text-gray-400">
        <Link href="#how-it-works" className="hover:text-white transition-colors">How it works</Link>
        <Link href="#companies" className="hover:text-white transition-colors">For Companies</Link>
        <Link href="#candidates" className="hover:text-white transition-colors">For Candidates</Link>
      </div>

      <div className="hidden md:flex items-center gap-3">
        <Link href="/auth" className="text-sm text-gray-300 hover:text-white px-4 py-2 transition-colors">
          Sign In
        </Link>
        <Link href="/auth" className="text-sm bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-full transition-colors">
          Get Started
        </Link>
      </div>

      {/* Mobile menu button */}
      <button className="md:hidden text-gray-400 hover:text-white" onClick={() => setOpen(!open)}>
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      {open && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-[#0A0A0F] border-b border-white/10 px-6 py-4 flex flex-col gap-4">
          <Link href="#how-it-works" className="text-gray-300 text-sm" onClick={() => setOpen(false)}>How it works</Link>
          <Link href="#companies" className="text-gray-300 text-sm" onClick={() => setOpen(false)}>For Companies</Link>
          <Link href="#candidates" className="text-gray-300 text-sm" onClick={() => setOpen(false)}>For Candidates</Link>
          <Link href="/auth" className="text-sm bg-blue-600 text-white font-semibold px-5 py-2.5 rounded-full text-center">Get Started</Link>
        </div>
      )}
    </nav>
  );
}
