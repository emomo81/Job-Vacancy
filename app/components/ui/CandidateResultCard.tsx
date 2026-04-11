// app/components/ui/CandidateResultCard.tsx
'use client';

import React, { useState } from 'react';
import { Heart } from 'lucide-react';
import { motion } from 'framer-motion'; // Using framer-motion for subtle animations
import { getBadgeClasses } from '../../../utils/colorUtils'; // Import badge styling utility
import { getScoreRangeColorClass } from '../../../utils/colorUtils'; // Import score range color utility
import { Candidate, Recommendation, Source } from '../../../utils/candidate-types'; // Import base Candidate type

// Helper to derive initials from name
const getInitials = (name: string): string => {
  const parts = name.split(' ');
  // Take the first letter of the first two parts if available, otherwise first letter of the first part
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return parts[0][0].toUpperCase();
};

// Define the extended candidate type for this card, including fields used in the UI
// This should align with the structure of the data you'll pass from your data source.
interface CandidateResultCardData extends Candidate {
  initials: string;
  rank: number;
  expLevel: string;
  // Ensure recommendation and source types match those used in getBadgeClasses and filtering logic
  recommendation: Recommendation;
  source: Source;
}

interface CandidateResultCardProps {
  candidate: CandidateResultCardData;
  isSelected?: boolean;
  onSelect: (id: string) => void;
  onLikeToggle: (id: string, isLiked: boolean) => void;
  initialLikedState?: boolean;
}

export default function CandidateResultCard({
  candidate,
  isSelected = false,
  onSelect,
  onLikeToggle,
  initialLikedState = false,
}: CandidateResultCardProps) {
  const [isLiked, setIsLiked] = useState<boolean>(initialLikedState);

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card selection when clicking like
    const newState = !isLiked;
    setIsLiked(newState);
    onLikeToggle(candidate.id, newState);
  };

  // Map recommendation string to the BadgeType for styling
  const badgeType: Recommendation = candidate.recommendation; // Directly use the type-safe recommendation

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      onClick={() => onSelect(candidate.id)}
      className={`bg-white rounded-[2rem] p-6 shadow-sm hover:shadow-xl transition-all cursor-pointer border-2
        ${isSelected ? 'border-[#2a85ff]' : 'border-transparent'}
        flex flex-col justify-between h-full`}
    >
      {/* Header: Rank and Like Button */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-[#2a85ff] font-black text-xl">#{candidate.rank}</span>
        <button aria-label="Toggle favorite" onClick={handleLikeClick} className="p-2">
          <Heart
            size={20}
            fill={isLiked ? '#ff4757' : 'none'}
            color={isLiked ? '#ff4757' : '#c8d6e5'}
            strokeWidth={isLiked ? 2 : 1.5}
          />
        </button>
      </div>

      {/* Candidate Info Row */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#2a85ff] to-[#6eb3ff] flex items-center justify-center text-white font-bold text-lg">
          {candidate.initials}
        </div>
        <div>
          <h3 className="text-[#070707] font-bold text-sm leading-none mb-1">{candidate.name}</h3>
          <p className="text-[#8a9ab0] text-xs">{candidate.role}</p>
        </div>
      </div>

      {/* Score Row */}
      <div className="flex items-end gap-3 mb-6">
        <span className="text-[#2a85ff] text-3xl font-black leading-none">{candidate.score}</span>
        <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden mb-1">
          {/* Using inline style for the score bar width and color class from util */}
          <div
            className={`h-full ${getScoreRangeColorClass(candidate.score)} rounded-full`}
            style={{ width: `${candidate.score}%` }}
          ></div>
        </div>
      </div>

      {/* Skills Row */}
      <div className="flex flex-wrap gap-1.5">
        {candidate.skills.slice(0, 3).map((skill) => ( // Displaying first 3 skills for brevity
          <span key={skill} className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#f0f5fa] text-[#5a6a7a]">
            {skill}
          </span>
        ))}
        {candidate.skills.length > 3 && (
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#f0f5fa] text-[#5a6a7a]">
            +{candidate.skills.length - 3} more
          </span>
        )}
      </div>

      {/* Additional Info Row (Experience Level and Recommendation Badge) */}
      <div className="mt-4 flex items-center justify-between">
        {/* Recommendation Badge */}
        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${getBadgeClasses(badgeType.toUpperCase() as any).replace('bg-gray-100 text-gray-800 border border-gray-400', '') /* Remove base if overridden */}`}>
            {candidate.recommendation}
        </span>
        {/* Experience Level */}
        <span className="text-[#8a9ab0] text-xs font-medium">{candidate.expLevel}</span>
      </div>
    </motion.div>
  );
}
