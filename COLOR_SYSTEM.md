# Rankr Color System Documentation

The Rankr design system utilizes a structured color palette designed for high contrast, visual hierarchy, and a modern "AI-first" aesthetic. It is built on Tailwind CSS 4 with custom theme extensions.

## Core Palettes

### Primary Brand
- **Brand Blue**: `#2a85ff` (`brand-blue`) - Primary actions, active states.
- **Brand Light**: `#6eb3ff` (`brand-light`) - Accents, gradients.
- **Background**: `#f0f5fa` (`brand-bg`) - Primary app background.
- **Dark Text**: `#070707` (`foreground`) - Headings and primary text.

### Recommendation States
These colors represent the AI's final assessment of a candidate.

| Status | BG Variable | Text Variable | Border/Dot |
| :--- | :--- | :--- | :--- |
| **Hire** | `bg-rec-hire-bg` | `text-rec-hire` | `border-rec-hire/20` |
| **Consider** | `bg-rec-consider-bg` | `text-rec-consider` | `border-rec-consider/20` |
| **Pass** | `bg-rec-pass-bg` | `text-rec-pass` | `border-rec-pass/20` |

### Candidate Sources
| Source | BG Variable | Text Variable |
| :--- | :--- | :--- |
| **Rankr** | `bg-src-rankr-bg` | `text-src-rankr` |
| **External** | `bg-src-external-bg` | `text-src-external` |

### Score Range Gradients
Dynamic colors used in `ScoreBar` and AI assessments.

| Score | Range Name | Gradient Tones |
| :--- | :--- | :--- |
| **90 - 100** | Exceptional | Emerald Green |
| **80 - 89** | Strong | Brand Blue |
| **70 - 79** | Good | Blue |
| **60 - 69** | Average | Amber |
| **< 60** | Weak | Red |

## UI Components

### Badge
The `Badge` component uses variants to automatically apply the correct styling.

```tsx
import { Badge } from '@/components/ui/Badge';

<Badge variant="recommendation" type="hire">Hire</Badge>
<Badge variant="source" type="rankr">Rankr Profile</Badge>
```

### ScoreBar
The `ScoreBar` component automatically adjusts its color and width based on the score provided.

```tsx
import { ScoreBar } from '@/components/ui/ScoreBar';

<ScoreBar score={94} showText={true} />
```

## Accessibility
- **WCAG AA Compliance**: All text/background combinations in the status badges meet or exceed the 4.5:1 contrast ratio.
- **Semantic Mapping**: Colors are mapped to intent (Hire/Pass), not just visual preference.
- **Motion**: Animation in `ScoreBar` uses a 1.2s `easeOut` transition for a smooth, premium feel without being distracting.
