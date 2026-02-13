# ProgressBar Component

A reusable, accessible progress tracking component for multi-step onboarding flows.

## Features

- **Visual Progress**: Animated progress bar with percentage display
- **Step Tracking**: Shows completed (✓), current (→), and pending (○) steps
- **Accessible**: Built with Radix UI primitives for ARIA compliance
- **Responsive**: Stacks vertically on mobile, horizontal on desktop
- **Support Forge Branding**: Purple gradient (#6366f1) with dark theme
- **Customizable**: Support for custom step labels and total steps

## Installation

```bash
npm install @radix-ui/react-progress clsx
```

## Basic Usage

```tsx
import ProgressBar from '@/components/ProgressBar';

export default function OnboardingFlow() {
  return (
    <ProgressBar
      currentStep={3}
      completedSteps={[1, 2]}
    />
  );
}
```

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `currentStep` | `number` | Yes | - | Current active step (1-based index) |
| `completedSteps` | `number[]` | Yes | - | Array of completed step numbers |
| `stepLabels` | `string[]` | No | Default 11-step flow | Custom labels for each step |
| `totalSteps` | `number` | No | `11` | Total number of steps in flow |

## Default Step Labels

```typescript
[
  'Prerequisites',
  'OS Detection',
  'Installing Tools',
  'CLI Authentication',
  'Security Setup',
  'MCP Configuration',
  'Google Services',
  'Voice Assistant',
  'Testing Setup',
  'Documentation',
  'Complete',
]
```

## Examples

### Just Started
```tsx
<ProgressBar
  currentStep={1}
  completedSteps={[]}
/>
```

### Mid-Progress
```tsx
<ProgressBar
  currentStep={5}
  completedSteps={[1, 2, 3, 4]}
/>
```

### Custom Labels (5-step flow)
```tsx
<ProgressBar
  currentStep={3}
  completedSteps={[1, 2]}
  stepLabels={[
    'Create Account',
    'Verify Email',
    'Setup Profile',
    'Add Payment',
    'Launch Dashboard',
  ]}
  totalSteps={5}
/>
```

### Nearly Complete
```tsx
<ProgressBar
  currentStep={10}
  completedSteps={[1, 2, 3, 4, 5, 6, 7, 8, 9]}
/>
```

## Styling

The component uses Tailwind CSS classes and can be customized via `tailwind.config.ts`:

```typescript
theme: {
  extend: {
    colors: {
      primary: "#6366f1",        // Main purple
      accent: "#8B5CF6",         // Lighter purple
      background: "#050508",     // Dark background
      "background-light": "#0f0f14", // Card background
    },
  },
}
```

## Visual States

### Step Icons
- **Completed**: Green checkmark (✓)
- **Current**: Purple arrow (→) with "(current)" label and pulse animation
- **Pending**: Gray circle (○)

### Step Styling
- **Completed**: Gray text with strikethrough, green background tint, "Done" badge
- **Current**: White text, purple border, highlighted background
- **Pending**: Gray text, no special styling

## Accessibility

- Built with `@radix-ui/react-progress` for ARIA compliance
- Semantic HTML structure
- Keyboard navigation support
- Screen reader friendly

## Demo

Run the development server to see all component states:

```bash
npm run dev
```

Navigate to `http://localhost:3000` to view the interactive examples.

## Component Structure

```
┌─────────────────────────────────────────┐
│  AI Consultant Setup                    │  ← Header
│  Step 3/11 - 27%                       │  ← Progress text
│  ━━━━━━━━━━━━━━━━━━━━━━━━ 27%         │  ← Radix Progress bar
├─────────────────────────────────────────┤
│  ✓ Prerequisites          Done         │  ← Completed step
│  ✓ OS Detection           Done         │
│  → Installing Tools...    (current)    │  ← Current step
│  ○ CLI Authentication                  │  ← Pending steps
│  ○ Security Setup                      │
│  ... (scrollable)                      │
├─────────────────────────────────────────┤
│  2 completed    8 remaining            │  ← Footer summary
└─────────────────────────────────────────┘
```

## Performance

- Smooth CSS transitions (500ms easing)
- Optimized re-renders with memoization
- Virtualized scrolling for long step lists
- Client-side only ('use client' directive)

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- All modern browsers with CSS Grid and Flexbox support
