'use client';

import ProgressBar from './ProgressBar';

/**
 * ProgressBar Component Examples
 *
 * These stories demonstrate different states of the onboarding flow.
 */

export default function ProgressBarStories() {
  return (
    <div className="min-h-screen bg-background p-8 space-y-8">
      <h1 className="text-3xl font-bold text-white mb-8">
        ProgressBar Component Examples
      </h1>

      {/* Example 1: Just Started */}
      <div>
        <h2 className="text-xl text-gray-400 mb-4">1. Just Started (Step 1)</h2>
        <ProgressBar currentStep={1} completedSteps={[]} />
      </div>

      {/* Example 2: Mid-Progress */}
      <div>
        <h2 className="text-xl text-gray-400 mb-4">
          2. Mid-Progress (Step 3, with 2 completed)
        </h2>
        <ProgressBar currentStep={3} completedSteps={[1, 2]} />
      </div>

      {/* Example 3: Almost Done */}
      <div>
        <h2 className="text-xl text-gray-400 mb-4">
          3. Almost Done (Step 10, with 9 completed)
        </h2>
        <ProgressBar currentStep={10} completedSteps={[1, 2, 3, 4, 5, 6, 7, 8, 9]} />
      </div>

      {/* Example 4: Completed */}
      <div>
        <h2 className="text-xl text-gray-400 mb-4">
          4. Completed (Step 11, all steps done)
        </h2>
        <ProgressBar
          currentStep={11}
          completedSteps={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]}
        />
      </div>

      {/* Example 5: Custom Labels */}
      <div>
        <h2 className="text-xl text-gray-400 mb-4">
          5. Custom Step Labels (5 steps)
        </h2>
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
      </div>

      {/* Example 6: Skipped Steps */}
      <div>
        <h2 className="text-xl text-gray-400 mb-4">
          6. Skipped Steps (Step 6, but only steps 1, 2, 5 marked complete)
        </h2>
        <ProgressBar currentStep={6} completedSteps={[1, 2, 5]} />
      </div>
    </div>
  );
}
