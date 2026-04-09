"use client";
import { useEffect } from "react";
import { Check, X } from "lucide-react";

interface ToastProps {
  message: string;
  type?: "success" | "info" | "error";
  onDone: () => void;
}

export default function Toast({ message, type = "success", onDone }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onDone, 2800);
    return () => clearTimeout(t);
  }, [message, onDone]);

  if (!message) return null;

  const styles = {
    success: "bg-gray-900 dark:bg-white dark:text-gray-900 text-white",
    info:    "bg-blue-600 text-white",
    error:   "bg-red-600 text-white",
  };

  const Icon = type === "success" ? Check : X;

  return (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-2.5 px-5 py-3 rounded-full shadow-xl text-sm font-medium ${styles[type]}`}>
      <Icon size={14} />
      {message}
    </div>
  );
}
