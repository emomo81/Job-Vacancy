// app/components/ui/Badge.tsx
'use client';

import React from 'react';
import { getBadgeClasses, BadgeType } from '../../../utils/colorUtils';

interface BadgeProps {
  type: BadgeType;
  label: string;
}

export default function Badge({ type, label }: BadgeProps) {
  const badgeClasses = getBadgeClasses(type);

  return (
    <span className={badgeClasses}>
      {label}
    </span>
  );
}
