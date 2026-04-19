// app/components/ui/ScoreBar.tsx
'use client';

import { getScoreRangeColorClass } from '../../../utils/colorUtils';

interface ScoreBarProps {
  score: number;
}

export default function ScoreBar({ score }: ScoreBarProps) {
  const colorClass = getScoreRangeColorClass(score);
  const widthClass = score >= 100 ? 'w-full'
    : score >= 90 ? 'w-11/12'
    : score >= 80 ? 'w-10/12'
    : score >= 70 ? 'w-9/12'
    : score >= 60 ? 'w-8/12'
    : score >= 50 ? 'w-7/12'
    : score >= 40 ? 'w-6/12'
    : score >= 30 ? 'w-5/12'
    : score >= 20 ? 'w-4/12'
    : score >= 10 ? 'w-3/12'
    : 'w-2/12';

  return (
    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
      <div
        className={`h-full ${colorClass} ${widthClass} rounded-full`}
      ></div>
    </div>
  );
}

