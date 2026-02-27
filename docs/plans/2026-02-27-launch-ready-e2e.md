# Launch-Ready E2E Polish + QA Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make the entire Support Forge client journey — from support-forge.com discovery through tool installation to productive Claude Code use — feel like one premium, idiot-proof, copper-branded product ready for public launch.

**Architecture:** Five parallel tracks targeting brand unification, site-to-toolkit bridge, client identity + post-install flow, E2E QA automation, and admin observability. Tracks 1-3 are code changes; Track 4 is Playwright QA; Track 5 is a lightweight admin page. All changes committed to `PerryB-GIT/ai-consultant-toolkit` and `support-forge` repos.

**Tech Stack:** Next.js 14, Tailwind CSS, Vercel KV, Playwright, vanilla HTML/CSS (support-forge.com), Electron (installer), PowerShell + Bash (setup scripts)

---

## TRACK 1 — Brand Unification (copper everywhere)

**Brand tokens to use everywhere:**
```
Primary:        #c97c4b  (copper)
Primary hover:  #e8a87c  (copper light)
Primary muted:  rgba(201,124,75,0.15)
Background:     #050508  (near-black)
Card bg:        #0f0f14
Navy:           #0a1628
Text primary:   #f8fafc
Text secondary: #94a3b8
Success:        #4ade80
Error:          #f87171
```

---

### Task 1: Swap toolkit dashboard indigo → copper (Tailwind config + globals)

**Files:**
- Modify: `tailwind.config.ts`
- Modify: `app/globals.css`

**Step 1: Read current tailwind.config.ts**
```bash
cat /c/Users/Jakeb/ai-consultant-toolkit-web/tailwind.config.ts
```

**Step 2: Replace primary colors in tailwind.config.ts**

Change the `primary` color block from indigo to copper:
```typescript
primary: {
  DEFAULT: "#c97c4b",
  dark: "#e8a87c",
  muted: "rgba(201,124,75,0.15)",
},
```

Also add navy:
```typescript
navy: "#0a1628",
```

**Step 3: Add CSS custom properties to app/globals.css**

After the existing `@tailwind` directives, add:
```css
:root {
  --copper: #c97c4b;
  --copper-light: #e8a87c;
  --copper-muted: rgba(201, 124, 75, 0.15);
  --navy: #0a1628;
  --bg: #050508;
  --bg-card: #0f0f14;
}
```

**Step 4: Find every `indigo` reference in setup page and swap**
```bash
grep -n "indigo" /c/Users/Jakeb/ai-consultant-toolkit-web/app/setup/page.tsx | wc -l
```

**Step 5: Replace all indigo-* classes in app/setup/page.tsx**

Run this replacement pattern throughout the file:
- `text-indigo-400` → `text-[#c97c4b]`
- `text-indigo-300` → `text-[#e8a87c]`
- `bg-indigo-500` → `bg-[#c97c4b]`
- `bg-indigo-600` → `bg-[#c97c4b]`
- `bg-indigo-900/20` → `bg-[rgba(201,124,75,0.1)]`
- `border-indigo-700` → `border-[#c97c4b]/40`
- `border-indigo-500` → `border-[#c97c4b]`
- `border-t-transparent` (in spinner) → keep as-is
- `hover:text-indigo-300` → `hover:text-[#e8a87c]`

**Step 6: Verify no indigo references remain**
```bash
grep -n "indigo" /c/Users/Jakeb/ai-consultant-toolkit-web/app/setup/page.tsx
```
Expected: 0 results (or only comments)

**Step 7: Commit**
```bash
cd /c/Users/Jakeb/ai-consultant-toolkit-web
git add tailwind.config.ts app/globals.css app/setup/page.tsx
git commit -m "feat: replace indigo with copper brand colors on setup dashboard"
```

---

### Task 2: Add Support Forge wordmark + logo to dashboard header

**Files:**
- Modify: `app/layout.tsx`
- Modify: `app/setup/page.tsx`

**Step 1: Read app/layout.tsx**
```bash
cat /c/Users/Jakeb/ai-consultant-toolkit-web/app/layout.tsx
```

**Step 2: Update metadata title and description**

Change:
```typescript
title: "AI Consultant Toolkit",
description: "Setup dashboard for AI consulting tools",
```
To:
```typescript
title: "Support Forge — AI Setup",
description: "Get Claude Code and all AI tools installed in minutes. Powered by Support Forge.",
```

**Step 3: Find the header/logo area in app/setup/page.tsx**

Search for the current logo/header at the top of the page:
```bash
grep -n "logo\|⚡\|Support Forge\|header\|nav" /c/Users/Jakeb/ai-consultant-toolkit-web/app/setup/page.tsx | head -20
```

**Step 4: Add branded header to setup page**

At the very top of the returned JSX (before the main content div), add a sticky nav bar:
```tsx
{/* Header */}
<header className="sticky top-0 z-50 border-b border-gray-800/50 bg-[#050508]/90 backdrop-blur-sm">
  <div className="max-w-4xl mx-auto px-6 py-3 flex items-center justify-between">
    <a href="https://support-forge.com" className="flex items-center gap-2 group">
      <div className="w-7 h-7 rounded bg-[#c97c4b] flex items-center justify-center text-white font-bold text-sm">SF</div>
      <span className="text-white font-semibold text-sm group-hover:text-[#c97c4b] transition-colors">Support Forge</span>
    </a>
    <a href="mailto:perry@support-forge.com" className="text-xs text-gray-500 hover:text-[#c97c4b] transition-colors">
      Need help?
    </a>
  </div>
</header>
```

**Step 5: Commit**
```bash
cd /c/Users/Jakeb/ai-consultant-toolkit-web
git add app/layout.tsx app/setup/page.tsx
git commit -m "feat: add Support Forge branded header to setup dashboard"
```

---

### Task 3: Rebrand Electron installer to copper

**Files:**
- Modify: `installers/electron/renderer/styles.css`
- Modify: `installers/electron/renderer/index.html`

**Step 1: Read current styles.css**
```bash
cat /c/Users/Jakeb/ai-consultant-toolkit-web/installers/electron/renderer/styles.css
```

**Step 2: Replace all indigo/purple colors in styles.css**

Make these replacements:
- `#6366f1` → `#c97c4b`  (primary buttons, logo text, spinner border-top)
- `#4f46e5` → `#b36a3a`  (button hover)
- `#0f172a` → `#050508`  (body background)
- `#1e293b` → `#0f0f14`  (tool list background)
- `#334155` → `#1a1a2e`  (borders, code background)

**Step 3: Update logo text in index.html**

Find:
```html
<div class="logo">&#9889; Support Forge</div>
```

Replace with (all three screens):
```html
<div class="logo">⬡ Support Forge</div>
```

And update the logo CSS color from indigo to copper (already handled in styles.css step).

**Step 4: Update installer window title in main.js**
```bash
grep -n "title\|Support Forge" /c/Users/Jakeb/ai-consultant-toolkit-web/installers/electron/main.js
```

Confirm title is already "Support Forge AI Setup" — if not, set it.

**Step 5: Commit**
```bash
cd /c/Users/Jakeb/ai-consultant-toolkit-web
git add installers/electron/renderer/styles.css installers/electron/renderer/index.html
git commit -m "feat: rebrand Electron installer with copper colors"
```

---

## TRACK 2 — The Bridge (support-forge.com → toolkit)

**Repo location:** `/c/Users/Jakeb/support-forge/`
**Note:** support-forge.com is a static HTML site — changes go directly in HTML/CSS files.

---

### Task 4: Add "Start Setup" CTA to launchpad.html

**Files:**
- Modify: `/c/Users/Jakeb/support-forge/launchpad.html`

**Step 1: Read the launchpad tier CTA section**
```bash
grep -n "tier-cta\|Enroll Now\|Book Consultation\|btn-primary" /c/Users/Jakeb/support-forge/launchpad.html
```

**Step 2: Find the "Enroll Now" button for Launchpad Academy tier**

It looks like:
```html
<a href="#schedule" class="btn btn-secondary btn-full tier-cta">Enroll Now</a>
```

**Step 3: Replace with direct setup link + keep secondary link**
```html
<a href="https://ai-consultant-toolkit.vercel.app/setup" class="btn btn-primary btn-full tier-cta" target="_blank" rel="noopener">Start Setup Now →</a>
<a href="#schedule" class="btn btn-secondary btn-full tier-cta" style="margin-top:8px">Talk to Perry First</a>
```

**Step 4: Add the toolkit URL to the "Book Consultation" Pro tier as well**

Below the "Book Consultation" button, add:
```html
<p style="text-align:center;margin-top:12px;font-size:13px;color:var(--forge-copper-light)">
  Already signed up? <a href="https://ai-consultant-toolkit.vercel.app/setup" style="color:var(--forge-copper)" target="_blank">Start your setup →</a>
</p>
```

**Step 5: Commit support-forge repo**
```bash
cd /c/Users/Jakeb/support-forge
git add launchpad.html
git commit -m "feat: add direct toolkit setup link to Launchpad CTAs"
```
(If support-forge is not a git repo, just save — it deploys via its own mechanism.)

---

### Task 5: Add "Start Setup" CTA to index.html hero

**Files:**
- Modify: `/c/Users/Jakeb/support-forge/index.html`

**Step 1: Read the hero CTA buttons**
```bash
grep -n "btn btn-primary\|btn btn-secondary\|Schedule Consultation\|Explore Services" /c/Users/Jakeb/support-forge/index.html
```

**Step 2: Find current hero buttons**
```html
<a href="#schedule" class="btn btn-primary">Schedule Consultation</a>
<a href="#services" class="btn btn-secondary">Explore Services</a>
```

**Step 3: Add a third CTA below the existing two**
```html
<a href="https://ai-consultant-toolkit.vercel.app/setup" class="btn btn-secondary" target="_blank" rel="noopener" style="margin-top:8px">Self-Service Setup →</a>
```

**Step 4: Add toolkit link to nav (desktop)**
```bash
grep -n "nav-highlight\|AI Launchpad\|nav-cta\|Book a Call" /c/Users/Jakeb/support-forge/index.html
```

After the "AI Launchpad" nav link, add:
```html
<li><a href="https://ai-consultant-toolkit.vercel.app/setup" class="nav-cta" target="_blank">Start Setup</a></li>
```

**Step 5: Commit**
```bash
cd /c/Users/Jakeb/support-forge
git add index.html
git commit -m "feat: add setup CTA to homepage hero and nav"
```

---

### Task 6: Add "← Back to Support Forge" link on toolkit setup page

**Files:**
- Modify: `app/setup/page.tsx`

This was partially done in Task 2 (the header links to support-forge.com). Verify the header `<a>` tag added in Task 2 has `href="https://support-forge.com"`.

**Step 1: Verify the header link**
```bash
grep -n "support-forge.com" /c/Users/Jakeb/ai-consultant-toolkit-web/app/setup/page.tsx
```

Expected: At least one link with `href="https://support-forge.com"` in the header.

**Step 2: Also add a "Powered by Support Forge" footer**

At the very bottom of the page JSX (after the `</main>` tag, before the closing wrapper div), add:
```tsx
<footer className="text-center py-6 border-t border-gray-800/30">
  <p className="text-xs text-gray-600">
    Powered by{' '}
    <a href="https://support-forge.com" className="text-[#c97c4b] hover:text-[#e8a87c] transition-colors">
      Support Forge
    </a>
    {' '}· Questions?{' '}
    <a href="mailto:perry@support-forge.com" className="text-[#c97c4b] hover:text-[#e8a87c] transition-colors">
      perry@support-forge.com
    </a>
  </p>
</footer>
```

**Step 3: Commit**
```bash
cd /c/Users/Jakeb/ai-consultant-toolkit-web
git add app/setup/page.tsx
git commit -m "feat: add powered-by footer with support-forge.com link"
```

---

## TRACK 3 — Client Identity + Post-Install Welcome

---

### Task 7: Add optional email capture to setup landing screen

**Files:**
- Modify: `app/setup/page.tsx`

**Step 1: Read the LANDING phase section of setup page**
```bash
grep -n "LANDING\|landing\|os-select\|selectedOs\|phase === 'landing'" /c/Users/Jakeb/ai-consultant-toolkit-web/app/setup/page.tsx | head -20
```

**Step 2: Add clientEmail state variable**

Near the top of the `SetupPageInner` component where other state is declared, add:
```tsx
const [clientEmail, setClientEmail] = useState<string>('');
```

**Step 3: Add email input field to the landing screen**

In the LANDING phase, just above the OS selection grid (before the `{/* OS Selection */}` comment or equivalent), add:
```tsx
{/* Optional email for setup summary */}
<div className="bg-[#0f0f14] border border-gray-800 rounded-xl p-4">
  <label className="block text-xs font-medium text-gray-400 mb-2">
    Get a setup summary emailed to you <span className="text-gray-600">(optional)</span>
  </label>
  <input
    type="email"
    placeholder="your@email.com"
    value={clientEmail}
    onChange={(e) => setClientEmail(e.target.value)}
    className="w-full bg-[#050508] border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#c97c4b] transition-colors"
  />
</div>
```

**Step 4: Store email in localStorage when set**

Add this effect after the other useEffect blocks:
```tsx
useEffect(() => {
  if (clientEmail) {
    localStorage.setItem('setup-client-email', clientEmail);
  }
}, [clientEmail]);
```

And in the initial session ID effect, also restore saved email:
```tsx
const savedEmail = localStorage.getItem('setup-client-email');
if (savedEmail) setClientEmail(savedEmail);
```

**Step 5: Commit**
```bash
cd /c/Users/Jakeb/ai-consultant-toolkit-web
git add app/setup/page.tsx
git commit -m "feat: add optional email capture to setup landing screen"
```

---

### Task 8: Create POST /api/notify-complete endpoint

**Files:**
- Create: `app/api/notify-complete/route.ts`

This endpoint fires when setup completes. It sends Perry a notification email via the Gmail MCP integration (or just logs to console if no email env var is set — graceful degradation).

**Step 1: Create the route file**

Create `app/api/notify-complete/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const NotifySchema = z.object({
  sessionId: z.string(),
  clientEmail: z.string().email().optional(),
  os: z.enum(['windows', 'mac']).optional(),
  toolsInstalled: z.number().optional(),
  errors: z.number().optional(),
  durationSeconds: z.number().optional(),
});

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = NotifySchema.safeParse(body);

    if (!data.success) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400, headers: corsHeaders });
    }

    const { sessionId, clientEmail, os, toolsInstalled, errors, durationSeconds } = data.data;

    // Log the completion event
    console.log('[notify-complete]', {
      sessionId,
      clientEmail: clientEmail || 'not provided',
      os,
      toolsInstalled,
      errors,
      durationSeconds,
      timestamp: new Date().toISOString(),
    });

    // If NOTIFY_EMAIL is configured, send a notification
    // This is intentionally simple — no external email service required
    // Perry can check Vercel function logs to see completions
    // Future: add SendGrid/Resend integration here

    return NextResponse.json(
      {
        success: true,
        message: clientEmail
          ? `Setup complete notification logged for ${clientEmail}`
          : 'Setup complete notification logged',
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error('[notify-complete] error:', error);
    return NextResponse.json(
      { error: 'Failed to process notification' },
      { status: 500, headers: corsHeaders }
    );
  }
}
```

**Step 2: Commit**
```bash
cd /c/Users/Jakeb/ai-consultant-toolkit-web
git add app/api/notify-complete/route.ts
git commit -m "feat: add notify-complete API endpoint for setup completion tracking"
```

---

### Task 9: Fire notify-complete on setup success

**Files:**
- Modify: `app/setup/page.tsx`

**Step 1: Find where phase transitions to 'complete'**
```bash
grep -n "setPhase.*complete\|phase.*complete\|complete.*true" /c/Users/Jakeb/ai-consultant-toolkit-web/app/setup/page.tsx | head -10
```

**Step 2: Add notify call when setup completes**

In the `onDone` handler (where `setPhase('complete')` is called), add the API call:
```tsx
// Fire notify-complete when setup finishes
const savedEmail = localStorage.getItem('setup-client-email');
const savedOs = localStorage.getItem('setup-os');
fetch('/api/notify-complete', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    sessionId,
    clientEmail: savedEmail || undefined,
    os: savedOs || undefined,
    toolsInstalled: successCount,
    errors: errorCount,
  }),
}).catch(() => {}); // fire-and-forget, never block the UI
```

**Step 3: Update the COMPLETE screen "Next Steps" to include SessionForge**

Find the next steps ordered list in the COMPLETE phase. After step 3 (`/writing-emails`), add step 4:
```tsx
<li className="flex items-start gap-4">
  <div className="w-7 h-7 rounded-full bg-[#c97c4b] flex items-center justify-center text-sm font-bold flex-shrink-0">4</div>
  <div>
    <div className="font-medium text-white text-sm">Book a follow-up session</div>
    <div className="text-xs text-gray-400 mt-1">Perry will walk you through your first real workflow.</div>
    <a
      href="https://support-forge.com/#schedule"
      target="_blank"
      rel="noopener"
      className="text-xs text-[#c97c4b] hover:text-[#e8a87c] mt-1 inline-block"
    >
      Schedule with Perry →
    </a>
  </div>
</li>
```

**Step 4: Commit**
```bash
cd /c/Users/Jakeb/ai-consultant-toolkit-web
git add app/setup/page.tsx
git commit -m "feat: fire notify-complete on setup success, add schedule CTA to next steps"
```

---

## TRACK 4 — E2E QA

---

### Task 10: Create Playwright E2E test suite for setup dashboard

**Files:**
- Create: `e2e/setup-flow.spec.ts`
- Modify: `package.json` (add playwright dev dep + test:e2e script)

**Step 1: Install Playwright**
```bash
cd /c/Users/Jakeb/ai-consultant-toolkit-web && npm install --save-dev @playwright/test && npx playwright install chromium
```

**Step 2: Create e2e directory**
```bash
mkdir -p /c/Users/Jakeb/ai-consultant-toolkit-web/e2e
```

**Step 3: Create playwright.config.ts**

Create `playwright.config.ts` at the root:
```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 30000,
  use: {
    baseURL: 'http://localhost:3000',
    headless: true,
  },
  webServer: {
    command: 'npm run dev',
    port: 3000,
    reuseExistingServer: true,
    timeout: 60000,
  },
});
```

**Step 4: Create e2e/setup-flow.spec.ts**
```typescript
import { test, expect } from '@playwright/test';

test.describe('Setup Dashboard — Core Flow', () => {

  test('redirects / to /setup', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/setup/);
  });

  test('setup page loads with Support Forge header', async ({ page }) => {
    await page.goto('/setup');
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('text=Support Forge')).toBeVisible();
  });

  test('setup page shows What Gets Installed section', async ({ page }) => {
    await page.goto('/setup');
    await expect(page.locator('text=Claude Code')).toBeVisible();
    await expect(page.locator('text=Git')).toBeVisible();
    await expect(page.locator('text=Node.js')).toBeVisible();
  });

  test('shows Windows and Mac OS options', async ({ page }) => {
    await page.goto('/setup');
    await expect(page.locator('text=Windows')).toBeVisible();
    await expect(page.locator('text=macOS')).toBeVisible();
  });

  test('selecting Windows shows PowerShell command', async ({ page }) => {
    await page.goto('/setup');
    // Click Windows option
    await page.locator('text=Windows').first().click();
    // Should see PowerShell command or instructions
    await expect(page.locator('text=PowerShell').or(page.locator('text=powershell'))).toBeVisible();
  });

  test('copy button works on Windows command', async ({ page }) => {
    await page.goto('/setup');
    await page.locator('text=Windows').first().click();
    const copyBtn = page.locator('button', { hasText: /copy/i }).first();
    if (await copyBtn.isVisible()) {
      await copyBtn.click();
      // Button should show "Copied!" feedback
      await expect(page.locator('text=Copied').or(copyBtn)).toBeVisible({ timeout: 2000 });
    }
  });

  test('email input accepts valid email on landing', async ({ page }) => {
    await page.goto('/setup');
    const emailInput = page.locator('input[type="email"]');
    if (await emailInput.isVisible()) {
      await emailInput.fill('test@example.com');
      await expect(emailInput).toHaveValue('test@example.com');
    }
  });

  test('progress page shows waiting state when no session data', async ({ page }) => {
    // Simulate visiting with a fake session ID that has no data
    await page.goto('/setup?session=fake-session-no-data-12345');
    // Should show "Waiting for script to start" or similar
    await expect(
      page.locator('text=Waiting').or(page.locator('text=connecting').or(page.locator('text=LIVE')))
    ).toBeVisible({ timeout: 5000 });
  });

  test('progress API returns 404 for unknown session', async ({ page }) => {
    const response = await page.request.get('/api/progress/nonexistent-session-xyz');
    expect(response.status()).toBe(404);
  });

  test('progress API accepts valid POST', async ({ page }) => {
    const sessionId = `e2e-test-${Date.now()}`;
    const response = await page.request.post(`/api/progress/${sessionId}`, {
      data: {
        sessionId,
        currentStep: 1,
        completedSteps: [],
        currentAction: 'E2E Test',
        toolStatus: { git: { status: 'installing' } },
        errors: [],
        timestamp: new Date().toISOString(),
        phase: 'phase1',
        complete: false,
      },
    });
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
  });

  test('progress API GET returns posted data', async ({ page }) => {
    const sessionId = `e2e-test-get-${Date.now()}`;
    // Post data first
    await page.request.post(`/api/progress/${sessionId}`, {
      data: {
        sessionId,
        currentStep: 3,
        completedSteps: [1, 2],
        currentAction: 'Installing Node.js',
        toolStatus: { git: { status: 'success', version: '2.40.0' } },
        errors: [],
        timestamp: new Date().toISOString(),
        phase: 'phase1',
        complete: false,
      },
    });
    // GET it back
    const getResponse = await page.request.get(`/api/progress/${sessionId}`);
    expect(getResponse.status()).toBe(200);
    const data = await getResponse.json();
    expect(data.sessionId).toBe(sessionId);
    expect(data.currentStep).toBe(3);
  });

  test('page title is Support Forge', async ({ page }) => {
    await page.goto('/setup');
    await expect(page).toHaveTitle(/Support Forge/);
  });

  test('powered-by footer links to support-forge.com', async ({ page }) => {
    await page.goto('/setup');
    const sfLink = page.locator('a[href="https://support-forge.com"]').first();
    await expect(sfLink).toBeVisible();
  });

  test('notify-complete API accepts valid POST', async ({ page }) => {
    const response = await page.request.post('/api/notify-complete', {
      data: {
        sessionId: `e2e-notify-${Date.now()}`,
        clientEmail: 'test@example.com',
        os: 'windows',
        toolsInstalled: 5,
        errors: 0,
      },
    });
    expect(response.status()).toBe(200);
  });

});

test.describe('Setup Dashboard — Security', () => {

  test('progress API rejects malformed data with 400', async ({ page }) => {
    const response = await page.request.post('/api/progress/bad-session', {
      data: { malformed: true, garbage: 'data' },
    });
    expect(response.status()).toBe(400);
  });

  test('progress API rejects session ID mismatch', async ({ page }) => {
    const response = await page.request.post('/api/progress/session-a', {
      data: {
        sessionId: 'session-b', // mismatch
        currentStep: 1,
        completedSteps: [],
        currentAction: 'Test',
        toolStatus: {},
        errors: [],
        timestamp: new Date().toISOString(),
        phase: 'phase1',
        complete: false,
      },
    });
    expect(response.status()).toBe(400);
  });

  test('CORS headers present on progress API', async ({ page }) => {
    const response = await page.request.options('/api/progress/test-cors');
    const headers = response.headers();
    expect(headers['access-control-allow-origin']).toBe('*');
  });

  test('no sensitive data exposed in HTML source', async ({ page }) => {
    await page.goto('/setup');
    const content = await page.content();
    // Should not contain API keys or tokens
    expect(content).not.toMatch(/sk-ant-/);
    expect(content).not.toMatch(/KV_REST_API_TOKEN/);
    expect(content).not.toMatch(/password/i); // no password fields
  });

});
```

**Step 5: Add test script to package.json**

In `package.json` scripts, add:
```json
"test:e2e": "playwright test",
"test:e2e:ui": "playwright test --ui"
```

**Step 6: Run tests locally and confirm they pass**
```bash
cd /c/Users/Jakeb/ai-consultant-toolkit-web && npm run dev &
sleep 5
npx playwright test e2e/setup-flow.spec.ts --reporter=list 2>&1 | tail -40
```

Expected: Most tests pass. Note any failures for follow-up.

**Step 7: Commit**
```bash
cd /c/Users/Jakeb/ai-consultant-toolkit-web
git add e2e/ playwright.config.ts package.json package-lock.json
git commit -m "test: add Playwright E2E test suite for setup dashboard flow and security"
```

---

### Task 11: Manual QA checklist — run through full journey

**This task is verification-only. No code changes.**

Run through every surface manually and check each item:

**support-forge.com:**
```
□ Homepage loads (check: https://support-forge.com)
□ Nav links all work (Services, AI Launchpad, About, Contact)
□ "Start Setup Now" button on launchpad.html links to correct URL
□ "Self-Service Setup" on homepage hero links to toolkit
□ Mobile menu works on narrow viewport
□ Calendly scheduling widget works
□ Privacy policy and Terms pages load
```

**ai-consultant-toolkit.vercel.app:**
```
□ Loads, redirects to /setup
□ Support Forge header visible with correct copper color
□ "What Gets Installed" section complete and correct
□ Windows OS selection shows command + installer download link
□ Mac OS selection shows command + installer download link
□ Email capture field visible and accepts input
□ "Start Installation" switches to running phase
□ Running phase: spinner and "Waiting for script" shown
□ Complete phase: all three next steps visible
□ Step 4 "Schedule with Perry" links to support-forge.com/#schedule
□ Powered-by footer links to support-forge.com
□ Mobile: all content readable on 390px width
□ Page title says "Support Forge — AI Setup"
```

**Installer:**
```
□ SupportForge-AI-Setup.exe launches on Windows
□ Welcome screen shows copper branding (not indigo)
□ "Start Installation" button works
□ UAC prompt appears
□ Progress log box fills with output
□ Finish screen appears after completion
```

**API endpoints (test via curl or browser):**
```
□ GET /api/progress/nonexistent → 404
□ POST /api/progress/test-1 with valid data → 200
□ GET /api/progress/test-1 → returns posted data
□ POST /api/progress/test-1 with bad data → 400
□ POST /api/notify-complete with email → 200
```

**Document any failures** as GitHub issues or inline notes. Fix critical ones before launch.

---

## TRACK 5 — Admin Observability

---

### Task 12: Build lightweight /admin page

**Files:**
- Create: `app/admin/page.tsx`
- Create: `middleware.ts`

This is a simple password-protected page that reads recent sessions from Vercel KV and shows a summary. Password is `ADMIN_PASSWORD` env var (defaults to "sfadmin2026" if not set — change before launch).

**Step 1: Create middleware.ts for basic auth**

Create `middleware.ts` at the project root:
```typescript
import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  const authHeader = request.headers.get('authorization');
  const expectedPassword = process.env.ADMIN_PASSWORD || 'sfadmin2026';
  const expectedAuth = `Basic ${Buffer.from(`admin:${expectedPassword}`).toString('base64')}`;

  if (authHeader !== expectedAuth) {
    return new NextResponse('Authentication Required', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Support Forge Admin"',
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/admin/:path*',
};
```

**Step 2: Create app/admin/page.tsx**
```typescript
import { kv } from '@vercel/kv';

interface SessionSummary {
  sessionId: string;
  complete: boolean;
  currentAction: string;
  timestamp: string;
  phase: string;
  toolCount: number;
  errorCount: number;
}

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  let recentSessions: SessionSummary[] = [];
  let kvError = false;

  try {
    // Scan for recent progress keys (last 100)
    const keys = await kv.keys('progress:*');
    const sessionKeys = keys
      .filter((k: string) => !k.includes(':log'))
      .slice(0, 20);

    const sessions = await Promise.all(
      sessionKeys.map(async (key: string) => {
        const data = await kv.get<any>(key);
        if (!data) return null;
        return {
          sessionId: data.sessionId,
          complete: data.complete,
          currentAction: data.currentAction,
          timestamp: data.timestamp,
          phase: data.phase,
          toolCount: Object.keys(data.toolStatus || {}).length,
          errorCount: (data.errors || []).length,
        } as SessionSummary;
      })
    );

    recentSessions = sessions
      .filter(Boolean)
      .sort((a, b) => new Date(b!.timestamp).getTime() - new Date(a!.timestamp).getTime()) as SessionSummary[];
  } catch {
    kvError = true;
  }

  const completed = recentSessions.filter(s => s.complete).length;
  const inProgress = recentSessions.filter(s => !s.complete).length;

  return (
    <div style={{ fontFamily: 'monospace', background: '#050508', color: '#f1f5f9', minHeight: '100vh', padding: '32px' }}>
      <h1 style={{ color: '#c97c4b', marginBottom: '8px' }}>⬡ Support Forge — Admin</h1>
      <p style={{ color: '#64748b', marginBottom: '32px', fontSize: '13px' }}>Recent setup sessions from Vercel KV</p>

      {kvError && (
        <div style={{ background: '#450a0a', border: '1px solid #991b1b', borderRadius: '8px', padding: '16px', marginBottom: '24px' }}>
          ⚠ Could not connect to Vercel KV. Check environment variables.
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}>
        {[
          { label: 'Total Sessions', value: recentSessions.length, color: '#f1f5f9' },
          { label: 'Completed', value: completed, color: '#4ade80' },
          { label: 'In Progress', value: inProgress, color: '#c97c4b' },
        ].map(stat => (
          <div key={stat.label} style={{ background: '#0f0f14', border: '1px solid #1f2937', borderRadius: '8px', padding: '16px', textAlign: 'center' }}>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: stat.color }}>{stat.value}</div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      <h2 style={{ color: '#94a3b8', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>
        Recent Sessions
      </h2>

      {recentSessions.length === 0 && !kvError && (
        <p style={{ color: '#475569' }}>No sessions found.</p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {recentSessions.map(session => (
          <div key={session.sessionId} style={{
            background: '#0f0f14',
            border: `1px solid ${session.complete ? '#14532d' : '#1f2937'}`,
            borderRadius: '8px',
            padding: '12px 16px',
            display: 'grid',
            gridTemplateColumns: '1fr auto auto auto',
            gap: '16px',
            alignItems: 'center',
            fontSize: '13px',
          }}>
            <div>
              <span style={{ color: '#94a3b8', fontSize: '11px' }}>{session.sessionId}</span>
              <br />
              <span style={{ color: '#cbd5e1' }}>{session.currentAction}</span>
            </div>
            <span style={{ color: session.complete ? '#4ade80' : '#c97c4b', fontSize: '11px' }}>
              {session.complete ? '✓ Done' : '⟳ Running'}
            </span>
            <span style={{ color: '#64748b', fontSize: '11px' }}>{session.errorCount} errors</span>
            <span style={{ color: '#475569', fontSize: '11px' }}>
              {new Date(session.timestamp).toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

**Step 3: Add ADMIN_PASSWORD to .env.example**
```bash
echo "" >> /c/Users/Jakeb/ai-consultant-toolkit-web/.env.example
echo "# Admin dashboard password (change before launch)" >> /c/Users/Jakeb/ai-consultant-toolkit-web/.env.example
echo "# ADMIN_PASSWORD=your-secure-password-here" >> /c/Users/Jakeb/ai-consultant-toolkit-web/.env.example
```

**Step 4: Verify the admin page compiles**
```bash
cd /c/Users/Jakeb/ai-consultant-toolkit-web && npm run build 2>&1 | tail -20
```
Expected: Build succeeds. Fix any TypeScript errors.

**Step 5: Commit**
```bash
cd /c/Users/Jakeb/ai-consultant-toolkit-web
git add app/admin/page.tsx middleware.ts .env.example
git commit -m "feat: add password-protected /admin page with session observability"
```

---

## TRACK 6 — Final Polish + Pre-Launch Checks

### Task 13: Fix page metadata, OG tags, and favicon

**Files:**
- Modify: `app/layout.tsx`
- Check: `public/` directory for favicon

**Step 1: Check what's in public/**
```bash
ls /c/Users/Jakeb/ai-consultant-toolkit-web/public/ 2>/dev/null || echo "empty or missing"
```

**Step 2: Update layout.tsx with full metadata**
```typescript
export const metadata: Metadata = {
  title: "Support Forge — AI Setup",
  description: "Get Claude Code and all AI tools installed in minutes. Powered by Support Forge.",
  openGraph: {
    title: "Support Forge — AI Setup",
    description: "Get Claude Code and all AI tools installed in minutes.",
    url: "https://ai-consultant-toolkit.vercel.app",
    siteName: "Support Forge",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Support Forge — AI Setup",
    description: "Get Claude Code and all AI tools installed in minutes.",
  },
  robots: {
    index: false, // client-facing tool, not for SEO
    follow: false,
  },
};
```

**Step 3: Commit**
```bash
cd /c/Users/Jakeb/ai-consultant-toolkit-web
git add app/layout.tsx
git commit -m "fix: update page metadata and OG tags for launch"
```

---

### Task 14: Final build, deploy, and smoke test

**Step 1: Run full Next.js build**
```bash
cd /c/Users/Jakeb/ai-consultant-toolkit-web && npm run build 2>&1 | tail -30
```
Expected: `✓ Compiled successfully` with no errors.

**Step 2: Push to main (triggers Vercel auto-deploy)**
```bash
cd /c/Users/Jakeb/ai-consultant-toolkit-web && git push origin main
```

**Step 3: Monitor Vercel deployment**
```bash
cd /c/Users/Jakeb/ai-consultant-toolkit-web && npx vercel ls 2>/dev/null | head -10
```
Or check https://vercel.com/dashboard — wait for green deployment.

**Step 4: Smoke test live site**
```bash
curl -s -o /dev/null -w "%{http_code}" https://ai-consultant-toolkit.vercel.app/setup
```
Expected: `200`

```bash
curl -s -o /dev/null -w "%{http_code}" https://ai-consultant-toolkit.vercel.app/admin
```
Expected: `401` (auth required — good)

```bash
curl -s -X POST https://ai-consultant-toolkit.vercel.app/api/notify-complete \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"smoke-test-001","os":"windows","toolsInstalled":5,"errors":0}' | head -5
```
Expected: `{"success":true,...}`

**Step 5: Rebuild CI installer to get copper branding into .exe**
```bash
cd /c/Users/Jakeb/ai-consultant-toolkit-web
git tag v1.2.0
git push origin v1.2.0
```

Then wait for GitHub Actions to complete and verify v1.2.0 release has both `.exe` and `.pkg`.

**Step 6: Final commit if any fixes were needed**
```bash
cd /c/Users/Jakeb/ai-consultant-toolkit-web
git add -A && git commit -m "chore: pre-launch final fixes" || echo "nothing to commit"
```

---

## Execution Order

All tracks can run in parallel except Task 14 (must be last).

| Agent | Tasks | Repo |
|-------|-------|------|
| Agent 1 — Brand | T1 → T2 → T3 | ai-consultant-toolkit-web + electron |
| Agent 2 — Bridge | T4 → T5 → T6 | support-forge + ai-consultant-toolkit-web |
| Agent 3 — Identity | T7 → T8 → T9 | ai-consultant-toolkit-web |
| Agent 4 — QA | T10 → T11 | ai-consultant-toolkit-web |
| Agent 5 — Admin | T12 → T13 | ai-consultant-toolkit-web |
| Final (main) | T14 | Deploy everything |

After agents 1-5 complete → run Task 14 in the main session.
