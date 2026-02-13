# ProgressBar Component - Usage Guide

## Quick Start

```tsx
import ProgressBar from '@/components/ProgressBar';

function OnboardingDashboard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  return (
    <ProgressBar
      currentStep={currentStep}
      completedSteps={completedSteps}
    />
  );
}
```

## Real-World Integration Example

```tsx
'use client';

import { useState, useEffect } from 'react';
import ProgressBar from '@/components/ProgressBar';

export default function SetupWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const totalSteps = 11;

  const completeStep = (stepNumber: number) => {
    setCompletedSteps((prev) => [...prev, stepNumber]);
    if (stepNumber < totalSteps) {
      setCurrentStep(stepNumber + 1);
    }
  };

  const handleNext = async () => {
    // Perform step validation/action
    const success = await performStepAction(currentStep);

    if (success) {
      completeStep(currentStep);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <ProgressBar
          currentStep={currentStep}
          completedSteps={completedSteps}
        />

        <div className="mt-8">
          {/* Step content goes here */}
          <StepContent step={currentStep} />

          <button
            onClick={handleNext}
            className="mt-4 px-6 py-2 bg-primary text-white rounded-lg"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
```

## With Custom Steps (5-step flow)

```tsx
import ProgressBar from '@/components/ProgressBar';

export default function QuickSetup() {
  return (
    <ProgressBar
      currentStep={3}
      completedSteps={[1, 2]}
      stepLabels={[
        'Create Account',
        'Verify Email',
        'Setup Profile',
        'Add Payment',
        'Get Started',
      ]}
      totalSteps={5}
    />
  );
}
```

## State Management with Context

```tsx
// context/SetupContext.tsx
import { createContext, useContext, useState } from 'react';

interface SetupContextType {
  currentStep: number;
  completedSteps: number[];
  completeStep: (step: number) => void;
  goToStep: (step: number) => void;
}

const SetupContext = createContext<SetupContextType | undefined>(undefined);

export function SetupProvider({ children }: { children: React.ReactNode }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const completeStep = (step: number) => {
    setCompletedSteps((prev) => [...prev, step]);
    setCurrentStep(step + 1);
  };

  const goToStep = (step: number) => {
    // Only allow going to completed steps or next step
    if (completedSteps.includes(step - 1) || step === 1) {
      setCurrentStep(step);
    }
  };

  return (
    <SetupContext.Provider
      value={{ currentStep, completedSteps, completeStep, goToStep }}
    >
      {children}
    </SetupContext.Provider>
  );
}

export const useSetup = () => {
  const context = useContext(SetupContext);
  if (!context) throw new Error('useSetup must be used within SetupProvider');
  return context;
};

// Usage in component
import { useSetup } from '@/context/SetupContext';

export default function Dashboard() {
  const { currentStep, completedSteps, completeStep } = useSetup();

  return (
    <ProgressBar
      currentStep={currentStep}
      completedSteps={completedSteps}
    />
  );
}
```

## With Persistence (LocalStorage)

```tsx
'use client';

import { useState, useEffect } from 'react';
import ProgressBar from '@/components/ProgressBar';

export default function PersistedSetup() {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('setup-progress');
    if (saved) {
      const { current, completed } = JSON.parse(saved);
      setCurrentStep(current);
      setCompletedSteps(completed);
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem(
      'setup-progress',
      JSON.stringify({
        current: currentStep,
        completed: completedSteps,
      })
    );
  }, [currentStep, completedSteps]);

  return (
    <ProgressBar
      currentStep={currentStep}
      completedSteps={completedSteps}
    />
  );
}
```

## With API Integration

```tsx
'use client';

import { useState, useEffect } from 'react';
import ProgressBar from '@/components/ProgressBar';

export default function SyncedSetup() {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch progress from API
  useEffect(() => {
    async function fetchProgress() {
      try {
        const res = await fetch('/api/setup/progress');
        const data = await res.json();
        setCurrentStep(data.currentStep);
        setCompletedSteps(data.completedSteps);
      } catch (error) {
        console.error('Failed to load progress:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchProgress();
  }, []);

  // Save progress to API
  const saveProgress = async (step: number, completed: number[]) => {
    try {
      await fetch('/api/setup/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentStep: step,
          completedSteps: completed,
        }),
      });
    } catch (error) {
      console.error('Failed to save progress:', error);
    }
  };

  const completeStep = (step: number) => {
    const newCompleted = [...completedSteps, step];
    setCompletedSteps(newCompleted);
    setCurrentStep(step + 1);
    saveProgress(step + 1, newCompleted);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <ProgressBar
      currentStep={currentStep}
      completedSteps={completedSteps}
    />
  );
}
```

## Styling Customization

Override colors in `tailwind.config.ts`:

```typescript
theme: {
  extend: {
    colors: {
      primary: {
        DEFAULT: "#3b82f6",  // Blue instead of purple
        dark: "#2563eb",
      },
      background: {
        DEFAULT: "#000000",  // Pure black
        card: "#1a1a1a",
      },
    },
  },
}
```

## Responsive Behavior

The component automatically adapts to screen sizes:

- **Desktop**: Full width with padding
- **Tablet**: Slightly reduced spacing
- **Mobile**: Stacks vertically, smaller text, shorter step labels

## Accessibility Features

- ARIA labels from Radix UI Progress primitive
- Semantic HTML structure
- Keyboard navigation support
- Screen reader announcements for progress changes
- High contrast colors for visibility

## Performance Tips

1. **Memoize expensive calculations**:
```tsx
const percentage = useMemo(
  () => Math.round((currentStep / totalSteps) * 100),
  [currentStep, totalSteps]
);
```

2. **Virtualize long step lists** (if > 20 steps):
```tsx
import { FixedSizeList } from 'react-window';
```

3. **Debounce state updates** during rapid step changes:
```tsx
import { useDebouncedCallback } from 'use-debounce';
```

## Common Patterns

### Skip Steps
```tsx
const skipStep = (stepNumber: number) => {
  setCompletedSteps((prev) => [...prev, stepNumber]);
  setCurrentStep(stepNumber + 1);
};
```

### Go Back
```tsx
const goBack = () => {
  if (currentStep > 1) {
    setCurrentStep(currentStep - 1);
  }
};
```

### Reset Progress
```tsx
const reset = () => {
  setCurrentStep(1);
  setCompletedSteps([]);
};
```

## Troubleshooting

### Steps not updating
- Ensure `completedSteps` is a new array reference (use spread operator)
- Check React DevTools to verify state changes

### Styling not applying
- Verify Tailwind config has correct colors defined
- Run `npm run dev` to rebuild CSS
- Check browser console for CSS conflicts

### Performance issues with many steps
- Implement virtualization for > 20 steps
- Use `React.memo` for step items
- Consider pagination

## Full-Featured Example

See `components/ProgressBar.stories.tsx` for a comprehensive demo showing:
- Just started state
- Mid-progress state
- Almost complete state
- Fully completed state
- Custom labels
- Skipped steps

Run the demo:
```bash
npm run dev
# Navigate to http://localhost:3000
```
