"use client";
import Link from "next/link";
import { Check, Pencil, Zap, ArrowLeft } from "lucide-react";
import RecruiterNav from "@/components/RecruiterNav";
import Stepper from "@/components/Stepper";

const STEPS = [
  { label: "Create Job" },
  { label: "Add Candidates" },
  { label: "AI Screening" },
];

const checklist = [
  { label: "Job requirements defined", done: true },
  { label: "19 resumes profiles loaded", done: true },
  { label: "33 external applicants loaded", done: true },
];

export default function ScreeningPage() {
  return (
    <div className="min-h-screen bg-[#F0F4F8]">
      <RecruiterNav />

      {/* Dark hero banner */}
      <div className="bg-[#0A0A0F] px-6 py-10">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-1">AI Screening</h1>
          <p className="text-gray-400 text-sm">Review your setup and run the AI screening when ready</p>
        </div>
      </div>

      {/* Stepper */}
      <div className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <Stepper steps={STEPS} current={2} />
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Job info card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-lg font-bold text-gray-900">Senior Backend Engineer</h2>
                <span className="text-xs bg-yellow-100 text-yellow-700 font-medium px-2 py-0.5 rounded-full">Expert</span>
                <span className="text-xs bg-blue-100 text-blue-700 font-medium px-2 py-0.5 rounded-full">Full-Time</span>
                <span className="text-xs bg-gray-100 text-gray-600 font-medium px-2 py-0.5 rounded-full">Remote</span>
              </div>
              <p className="text-gray-400 text-sm">• 14 Candidates • Screening Top 10</p>
            </div>
            <button className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 border border-gray-200 hover:border-gray-300 px-3 py-1.5 rounded-lg transition-colors">
              <Pencil size={12} /> Edit Job
            </button>
          </div>

          <div className="mt-5 pt-5 border-t border-gray-100">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">Ready to Screen</p>
            <div className="space-y-3">
              {checklist.map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${item.done ? "bg-green-500" : "bg-gray-200"}`}>
                    {item.done && <Check size={11} className="text-white" strokeWidth={3} />}
                  </div>
                  <span className="text-sm text-gray-700">{item.label}</span>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-4">
              <span className="font-semibold text-gray-800">14 candidates</span> will be evaluated
            </p>
          </div>
        </div>

        {/* Start screening CTA */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Zap size={24} className="text-blue-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">Start AI Screening</h3>
          <p className="text-gray-400 text-sm max-w-xs mx-auto mb-8 leading-relaxed">
            Rankr will score, rank, and explain each candidate against your requirements. This takes about{" "}
            <span className="text-gray-700 font-medium">30–60 seconds</span>.
          </p>
          <Link
            href="/results"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3.5 rounded-full text-sm transition-colors"
          >
            <Zap size={15} />
            Screen All Candidates Now
          </Link>
        </div>

        {/* Back */}
        <div className="mt-6">
          <Link
            href="/candidates"
            className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm transition-colors"
          >
            <ArrowLeft size={14} /> Back to Candidates
          </Link>
        </div>
      </div>
    </div>
  );
}
