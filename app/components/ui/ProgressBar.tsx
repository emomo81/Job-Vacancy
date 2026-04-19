import React from 'react'

type ProgressBarProps = {
  value: number
  className?: string
  trackClassName?: string
  barClassName?: string
}

export default function ProgressBar({
  value,
  className = '',
  trackClassName = 'h-3 bg-[#f0f5fa] rounded-full overflow-hidden',
  barClassName = 'h-full bg-[#2a85ff] transition-all duration-300',
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, Number.isFinite(value) ? value : 0))

  return (
    <div className={className}>
      <div className={trackClassName}>
        <div className={barClassName} style={{ width: `${clamped}%` }} />
      </div>
    </div>
  )
}
