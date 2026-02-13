# ProgressBar Component - Visual Reference

## Component Structure

```
┌─────────────────────────────────────────────────────────────┐
│  AI Consultant Setup                        ← Header        │
│  Step 3/11 - 27% Complete                                   │
│                                                              │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 27%          │ ← Radix Progress
│  ╰─────────────╯                                            │
│   Animated fill (purple gradient)                           │
├──────────────────────────────────────────────────────────────┤
│  ✓ Prerequisites                             Done           │ ← Completed
│  ✓ OS Detection                              Done           │
│  → Installing Tools...                       (current)      │ ← Current (pulsing)
│  ○ CLI Authentication                                       │ ← Pending
│  ○ Security Setup                                           │
│  ○ MCP Configuration                                        │
│  ○ Google Services                                          │
│  ○ Voice Assistant                                          │
│  ○ Testing Setup                                            │
│  ○ Documentation                                            │
│  ○ Complete                                                 │
├──────────────────────────────────────────────────────────────┤
│  2 completed                    8 remaining  ← Footer stats │
└──────────────────────────────────────────────────────────────┘
```

## Color Palette

```
Background (Card):    #0f0f14 ▓▓▓▓▓▓
Background (Main):    #050508 ▓▓▓▓▓▓
Border:               #374151 ───────
Primary Purple:       #6366f1 ████████
Secondary Purple:     #8B5CF6 ████████
Green (Complete):     #4ade80 ████████
Gray (Pending):       #6b7280 ████████
White (Text):         #ffffff ████████
```

## States & Transitions

### State 1: Just Started (0% → 9%)
```
Step 1/11 - 9%
━ 9%

→ Prerequisites (current)
○ OS Detection
○ Installing Tools
...
```

### State 2: Quarter Done (18% → 27%)
```
Step 3/11 - 27%
━━━━━━ 27%

✓ Prerequisites       Done
✓ OS Detection        Done
→ Installing Tools    (current)
○ CLI Authentication
...
```

### State 3: Half Done (45% → 55%)
```
Step 6/11 - 55%
━━━━━━━━━━━━ 55%

✓ Prerequisites          Done
✓ OS Detection           Done
✓ Installing Tools       Done
✓ CLI Authentication     Done
✓ Security Setup         Done
→ MCP Configuration      (current)
○ Google Services
...
```

### State 4: Almost Complete (82% → 91%)
```
Step 10/11 - 91%
━━━━━━━━━━━━━━━━━━ 91%

✓ Prerequisites         Done
✓ OS Detection          Done
✓ Installing Tools      Done
✓ CLI Authentication    Done
✓ Security Setup        Done
✓ MCP Configuration     Done
✓ Google Services       Done
✓ Voice Assistant       Done
✓ Testing Setup         Done
→ Documentation         (current)
○ Complete
```

### State 5: Completed (100%)
```
Step 11/11 - 100%
━━━━━━━━━━━━━━━━━━━━ 100%

✓ Prerequisites         Done
✓ OS Detection          Done
✓ Installing Tools      Done
✓ CLI Authentication    Done
✓ Security Setup        Done
✓ MCP Configuration     Done
✓ Google Services       Done
✓ Voice Assistant       Done
✓ Testing Setup         Done
✓ Documentation         Done
✓ Complete              Done

11 completed    0 remaining
```

## Icon Reference

| Icon | Meaning | Color | Animation |
|------|---------|-------|-----------|
| ✓    | Completed | Green (#4ade80) | None |
| →    | Current | Purple (#6366f1) | None on icon, pulse on "(current)" badge |
| ○    | Pending | Gray (#6b7280) | None |

## Responsive Breakpoints

### Desktop (> 768px)
```
┌────────────────────────────────────────┐
│  AI Consultant Setup - Step 3/11      │
│  ━━━━━━━━━━━━━━━━━━━━━ 27%           │
│                                        │
│  ✓ Prerequisites            Done      │
│  ✓ OS Detection             Done      │
│  → Installing Tools...      (current) │
│  ○ CLI Authentication                 │
│  (scrollable list)                    │
└────────────────────────────────────────┘
```

### Mobile (< 768px)
```
┌──────────────────────┐
│  AI Consultant Setup │
│  Step 3/11 - 27%    │
│  ━━━━━━━━━━ 27%    │
│                      │
│  ✓ Prerequisites    │
│     Done            │
│  ✓ OS Detection     │
│     Done            │
│  → Installing...    │
│     (current)       │
│  ○ CLI Auth         │
│  (scrollable)       │
└──────────────────────┘
```

## Hover States

### Non-Current Step Hover
```
Before:
  ○ CLI Authentication

After (hover):
  ○ CLI Authentication  ← Slightly lighter background
```

### Current Step (No hover effect)
```
  → Installing Tools... (current)  ← Always highlighted
```

## Scrollbar Styling

```
Step list (> 8 items):

┌─────────────────────┬─┐
│  ✓ Step 1      Done │█│ ← Thumb (gray)
│  ✓ Step 2      Done │ │
│  → Step 3  (current)│ │
│  ○ Step 4           │ │
│  ○ Step 5           │░│ ← Track (darker gray)
│  ○ Step 6           │░│
│  ○ Step 7           │░│
│  ○ Step 8           │░│
└─────────────────────┴─┘
```

## Animation Timeline

```
Step completion animation:

1. User clicks "Continue" button
   ↓
2. Step validates (backend/frontend)
   ↓
3. completedSteps array updates
   ↓
4. Icon changes: → becomes ✓
   Color: Purple → Green
   ↓
5. Text gets strikethrough
   "Done" badge appears (fade in)
   ↓
6. Progress bar animates (500ms ease-out)
   Width: 27% → 36%
   ↓
7. Next step becomes current
   Icon: ○ becomes →
   Border appears (purple glow)
   "(current)" badge pulses
   ↓
8. Footer stats update
   "2 completed" → "3 completed"
   "8 remaining" → "7 remaining"
```

## Accessibility Tree

```
<div role="progressbar" aria-valuenow="27" aria-valuemin="0" aria-valuemax="100">
  <div>AI Consultant Setup</div>
  <div>Step 3/11 - 27% Complete</div>

  <div> ← Radix Progress (ARIA compliant)
    <div style="width: 27%"></div>
  </div>

  <div role="list">
    <div role="listitem" aria-label="Prerequisites - Completed">
      ✓ Prerequisites
    </div>
    <div role="listitem" aria-label="OS Detection - Completed">
      ✓ OS Detection
    </div>
    <div role="listitem" aria-label="Installing Tools - Current step" aria-current="step">
      → Installing Tools... (current)
    </div>
    <div role="listitem" aria-label="CLI Authentication - Pending">
      ○ CLI Authentication
    </div>
    ...
  </div>
</div>
```

## Print Styles (Future Enhancement)

```
@media print {
  .progress-card {
    border: 2px solid black;
    background: white;
    color: black;
  }

  .step-icon.check::before { content: "[✓] "; }
  .step-icon.arrow::before { content: "[→] "; }
  .step-icon.circle::before { content: "[ ] "; }
}
```

Result:
```
AI Consultant Setup - Step 3/11 (27%)

[✓] Prerequisites - Done
[✓] OS Detection - Done
[→] Installing Tools... (current)
[ ] CLI Authentication
[ ] Security Setup
...
```

## Dark Mode Support

Component is built for dark mode by default. Light mode variant:

```css
/* Light mode (if needed) */
.progress-card-light {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  color: #111827;
}

.progress-bar-light {
  background: #e5e7eb;
}

.step-item-light.current {
  background: rgba(99, 102, 241, 0.05);
}
```

## File Locations

```
C:\Users\Jakeb\workspace\ai-consultant-toolkit\
├── components/
│   ├── ProgressBar.tsx              ← Main component
│   ├── ProgressBar.stories.tsx      ← Example states
│   ├── README.md                    ← Component docs
│   └── USAGE.md                     ← Integration guide
├── demo.html                         ← Standalone demo
└── docs/
    └── PROGRESSBAR_VISUAL_GUIDE.md  ← This file
```

## Demo Commands

```bash
# Run Next.js dev server
npm run dev
# View at: http://localhost:3000

# Build for production
npm run build

# View standalone demo
# Open demo.html in browser
```

## Component Props Quick Reference

```typescript
interface ProgressBarProps {
  currentStep: number;      // 1-11 (current active step)
  completedSteps: number[]; // [1, 2, 5] (array of completed)
  stepLabels?: string[];    // Optional custom labels
  totalSteps?: number;      // Default: 11
}
```

## Example Usage

```tsx
<ProgressBar
  currentStep={3}
  completedSteps={[1, 2]}
/>
```

Renders:
```
Step 3/11 - 27%
━━━━━━━ 27%

✓ Prerequisites       Done
✓ OS Detection        Done
→ Installing Tools    (current)
○ CLI Authentication
...
```
