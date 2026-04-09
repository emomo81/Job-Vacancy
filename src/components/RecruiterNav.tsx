"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { Bell, ChevronDown, LogOut, LayoutDashboard, Settings, Menu, X } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

const navLinks = [
  { label: "New Job", href: "/dashboard" },
  { label: "Candidates", href: "/candidates" },
  { label: "Screening", href: "/screening" },
  { label: "Results", href: "/results" },
];

export default function RecruiterNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleLogout() {
    setDropdownOpen(false);
    setMobileOpen(false);
    router.push("/auth");
  }

  return (
    <nav className="bg-white dark:bg-[#0f1117] border-b border-gray-100 dark:border-white/5 px-4 sm:px-6 py-3 relative z-40">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center">
          <Image src="/logo.png" alt="Job RW" width={160} height={64} className="h-9 sm:h-12 w-auto object-contain" priority />
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname === link.href
                  ? "bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-1 sm:gap-3">
          <ThemeToggle />
          <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-white/10 dark:text-gray-400 dark:hover:text-white rounded-lg transition-colors">
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-blue-600 rounded-full" />
          </button>

          {/* Profile dropdown — desktop only */}
          <div className="hidden md:block relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen((o) => !o)}
              className="flex items-center gap-2 pl-3 pr-2 py-2 rounded-xl border border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 transition-colors"
            >
              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-semibold">A</span>
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Alex Morgan</span>
              <ChevronDown size={14} className={`text-gray-400 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-[#1a1d27] border border-gray-100 dark:border-white/10 rounded-xl shadow-lg py-1 z-50">
                <Link href="/dashboard" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                  <LayoutDashboard size={14} className="text-gray-400" /> Dashboard
                </Link>
                <Link href="/results" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                  <Settings size={14} className="text-gray-400" /> Results
                </Link>
                <div className="h-px bg-gray-100 dark:bg-white/10 mx-2 my-1" />
                <button onClick={handleLogout} className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
                  <LogOut size={14} /> Sign Out
                </button>
              </div>
            )}
          </div>

          {/* Hamburger — mobile only */}
          <button
            className="md:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-white/10 dark:text-gray-400 rounded-lg transition-colors"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white dark:bg-[#0f1117] border-b border-gray-100 dark:border-white/5 shadow-lg px-4 py-3 flex flex-col gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={`px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                pathname === link.href
                  ? "bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="h-px bg-gray-100 dark:bg-white/10 my-1" />
          <div className="flex items-center gap-3 px-4 py-2">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-semibold">A</span>
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Alex Morgan</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors"
          >
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      )}
    </nav>
  );
}
