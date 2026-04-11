// app/components/ui/ScoreBar.tsx
'use client';

import React from 'react';
import { getScoreRangeColorClass } from '../../../utils/colorUtils';

interface ScoreBarProps {
  score: number;
}

export default function ScoreBar({ score }: ScoreBarProps) {
  const colorClass = getScoreRangeColorClass(score);
  
  // The score bar visually represents the score percentage.
  // The color of the bar itself indicates the score range.
  return (
    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
      <div
        className={`h-full ${colorClass} rounded-full`}
        style={{ width: `${score}%` }} // Score determines the width
      ></div>
    </div>
  );
}
