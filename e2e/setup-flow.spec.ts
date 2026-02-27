import { test, expect } from '@playwright/test';

// ─── Core Flow Tests ─────────────────────────────────────────────

test.describe('Setup Dashboard — Core Flow', () => {

  test('redirects / to /setup', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/setup/);
  });

  test('setup page loads with Support Forge header', async ({ page }) => {
    await page.goto('/setup');
    await expect(page.locator('header')).toBeVisible();
    await expect(page.getByText('Support Forge').first()).toBeVisible();
  });

  test('page title is set', async ({ page }) => {
    await page.goto('/setup');
    // Title may vary between environments; verify it is a non-empty string
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
  });

  test('shows what gets installed section', async ({ page }) => {
    await page.goto('/setup');
    // Use first() to avoid strict-mode violation when "Claude Code" appears multiple times
    await expect(page.getByText('Claude Code').first()).toBeVisible();
    await expect(page.getByText(/Node\.?js/).first()).toBeVisible();
    await expect(page.getByText('Git').first()).toBeVisible();
  });

  test('shows Windows and Mac OS options', async ({ page }) => {
    await page.goto('/setup');
    await expect(page.getByText('Windows').first()).toBeVisible();
    await expect(page.getByText(/mac|Mac/i).first()).toBeVisible();
  });

  test('windows command copy button is present', async ({ page }) => {
    await page.goto('/setup');
    // The copy button label is "Copy Windows Command"
    await expect(page.getByText('Copy Windows Command')).toBeVisible();
  });

  test('email input is present on landing', async ({ page }) => {
    await page.goto('/setup');
    // The email input uses a placeholder; locate by placeholder
    const emailInput = page.locator('input[placeholder="your@email.com"]');
    await expect(emailInput).toBeVisible();
  });

  test('email input accepts and persists value', async ({ page }) => {
    await page.goto('/setup');
    const emailInput = page.locator('input[placeholder="your@email.com"]');
    await emailInput.fill('testclient@example.com');
    await expect(emailInput).toHaveValue('testclient@example.com');
  });

  test('powered-by footer links to support-forge.com', async ({ page }) => {
    await page.goto('/setup');
    // The footer link text is "Support Forge" inside a footer element
    const footerLink = page.locator('footer a[href="https://support-forge.com"]').first();
    await expect(footerLink).toBeVisible();
  });

  test('support forge header links to support-forge.com', async ({ page }) => {
    await page.goto('/setup');
    const headerLink = page.locator('header a[href="https://support-forge.com"]');
    await expect(headerLink).toBeVisible();
  });

  test('mobile viewport shows content correctly', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/setup');
    await expect(page.getByText('Support Forge').first()).toBeVisible();
    // Use first() to avoid strict-mode violation on 'Claude Code'
    await expect(page.getByText('Claude Code').first()).toBeVisible();
  });

  test('setup page shows hero heading', async ({ page }) => {
    await page.goto('/setup');
    await expect(page.getByText(/Claude Code running in minutes/i)).toBeVisible();
  });

  test('copy Windows command button is present', async ({ page }) => {
    await page.goto('/setup');
    await expect(page.getByText('Copy Windows Command')).toBeVisible();
  });

  test('copy Mac command button is present', async ({ page }) => {
    await page.goto('/setup');
    await expect(page.getByText('Copy Mac Command')).toBeVisible();
  });

  test('windows .exe download link is present', async ({ page }) => {
    await page.goto('/setup');
    const exeLink = page.locator('a[href*=".exe"]');
    await expect(exeLink).toBeVisible();
  });

  test('mac .pkg download link is present', async ({ page }) => {
    await page.goto('/setup');
    const pkgLink = page.locator('a[href*=".pkg"]');
    await expect(pkgLink).toBeVisible();
  });

  test('need help contact link is present', async ({ page }) => {
    await page.goto('/setup');
    await expect(page.locator('a[href="mailto:perry@support-forge.com"]').first()).toBeVisible();
  });

  test('setup page has SF logo badge in header', async ({ page }) => {
    await page.goto('/setup');
    // Header contains the "SF" badge div
    await expect(page.locator('header').getByText('SF')).toBeVisible();
  });

});

// ─── Progress API Tests ───────────────────────────────────────────

test.describe('Progress API', () => {

  test('GET unknown session returns 404', async ({ page }) => {
    const res = await page.request.get('/api/progress/nonexistent-session-xyz-99999');
    expect(res.status()).toBe(404);
  });

  test('POST valid progress data returns 200', async ({ page }) => {
    const sessionId = `e2e-test-${Date.now()}`;
    const res = await page.request.post(`/api/progress/${sessionId}`, {
      data: {
        sessionId,
        currentStep: 2,
        completedSteps: [1],
        currentAction: 'Installing Git',
        toolStatus: { git: { status: 'installing' } },
        errors: [],
        timestamp: new Date().toISOString(),
        phase: 'phase1',
        complete: false,
      },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
  });

  test('GET returns previously posted data', async ({ page }) => {
    const sessionId = `e2e-get-test-${Date.now()}`;
    await page.request.post(`/api/progress/${sessionId}`, {
      data: {
        sessionId,
        currentStep: 5,
        completedSteps: [1, 2, 3, 4],
        currentAction: 'Installing Claude Code',
        toolStatus: {
          git: { status: 'success', version: '2.40.0' },
          nodejs: { status: 'success', version: 'v20.0.0' },
        },
        errors: [],
        timestamp: new Date().toISOString(),
        phase: 'phase1',
        complete: false,
      },
    });
    const getRes = await page.request.get(`/api/progress/${sessionId}`);
    expect(getRes.status()).toBe(200);
    const data = await getRes.json();
    expect(data.sessionId).toBe(sessionId);
    expect(data.currentStep).toBe(5);
    expect(data.toolStatus.git.status).toBe('success');
  });

  test('POST marks session complete', async ({ page }) => {
    const sessionId = `e2e-complete-${Date.now()}`;
    const res = await page.request.post(`/api/progress/${sessionId}`, {
      data: {
        sessionId,
        currentStep: 10,
        completedSteps: [1,2,3,4,5,6,7,8,9,10],
        currentAction: 'Setup complete',
        toolStatus: {
          git: { status: 'success', version: '2.40.0' },
          nodejs: { status: 'success', version: 'v20.0.0' },
          claude: { status: 'success', version: '1.0.0' },
        },
        errors: [],
        timestamp: new Date().toISOString(),
        phase: 'phase1',
        complete: true,
      },
    });
    expect(res.status()).toBe(200);
    const getRes = await page.request.get(`/api/progress/${sessionId}`);
    const data = await getRes.json();
    expect(data.complete).toBe(true);
  });

  test('POST with phase2 is accepted', async ({ page }) => {
    const sessionId = `e2e-phase2-${Date.now()}`;
    const res = await page.request.post(`/api/progress/${sessionId}`, {
      data: {
        sessionId,
        currentStep: 3,
        completedSteps: [1, 2],
        currentAction: 'Configuring Claude Skills',
        toolStatus: {
          skills: { status: 'installing' },
        },
        errors: [],
        timestamp: new Date().toISOString(),
        phase: 'phase2',
        complete: false,
      },
    });
    expect(res.status()).toBe(200);
  });

  test('OPTIONS returns CORS headers via fetch', async ({ page }) => {
    // page.request.options() is not a Playwright API method;
    // use fetch with method override to send OPTIONS
    const res = await page.request.fetch('/api/progress/cors-test', {
      method: 'OPTIONS',
      headers: { 'Content-Type': 'application/json' },
    });
    const headers = res.headers();
    expect(headers['access-control-allow-origin']).toBe('*');
  });

});

// ─── Notify Complete API Tests ────────────────────────────────────

test.describe('Notify Complete API', () => {

  test('POST with full data returns 200', async ({ page }) => {
    const res = await page.request.post('/api/notify-complete', {
      data: {
        sessionId: `e2e-notify-${Date.now()}`,
        clientEmail: 'testclient@example.com',
        os: 'windows',
        toolsInstalled: 5,
        errors: 0,
        durationSeconds: 300,
      },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
  });

  test('POST without email returns 200', async ({ page }) => {
    const res = await page.request.post('/api/notify-complete', {
      data: {
        sessionId: `e2e-notify-noemail-${Date.now()}`,
        os: 'mac',
        toolsInstalled: 4,
        errors: 1,
      },
    });
    expect(res.status()).toBe(200);
  });

  test('POST with invalid email returns 400', async ({ page }) => {
    const res = await page.request.post('/api/notify-complete', {
      data: {
        sessionId: `e2e-notify-bademail-${Date.now()}`,
        clientEmail: 'not-an-email',
      },
    });
    expect(res.status()).toBe(400);
  });

  test('POST without sessionId returns 400', async ({ page }) => {
    const res = await page.request.post('/api/notify-complete', {
      data: {
        clientEmail: 'testclient@example.com',
        os: 'windows',
      },
    });
    expect(res.status()).toBe(400);
  });

  test('POST success response includes success flag', async ({ page }) => {
    const res = await page.request.post('/api/notify-complete', {
      data: {
        sessionId: `e2e-notify-resp-${Date.now()}`,
        os: 'mac',
      },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('success', true);
  });

});

// ─── Validate Output API Tests ────────────────────────────────────

test.describe('Validate Output API', () => {

  test('POST valid Phase 1 data returns 200 with valid:true', async ({ page }) => {
    const res = await page.request.post('/api/validate-output', {
      data: {
        os: 'windows',
        architecture: 'x64',
        timestamp: new Date().toISOString(),
        results: {
          git: { status: 'OK', version: '2.40.0', installed: true },
          nodejs: { status: 'OK', version: '20.0.0', installed: true },
          claude: { status: 'OK', version: '2.1.0', installed: true },
        },
        errors: [],
        duration_seconds: 120,
      },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.valid).toBe(true);
  });

  test('POST invalid data returns 400', async ({ page }) => {
    const res = await page.request.post('/api/validate-output', {
      data: { garbage: 'data', not: 'valid' },
    });
    expect(res.status()).toBe(400);
  });

  test('POST Phase 1 with errors returns valid:false', async ({ page }) => {
    const res = await page.request.post('/api/validate-output', {
      data: {
        os: 'windows',
        timestamp: new Date().toISOString(),
        results: {
          git: { status: 'ERROR', version: null, installed: false },
          nodejs: { status: 'OK', version: '20.0.0', installed: true },
        },
        errors: ['git install failed'],
        duration_seconds: 60,
      },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.valid).toBe(false);
  });

});

// ─── Security Tests ───────────────────────────────────────────────

test.describe('Security', () => {

  test('progress API rejects malformed data with 400', async ({ page }) => {
    const res = await page.request.post('/api/progress/sec-test-bad', {
      data: { malformed: true, garbage: 'data' },
    });
    expect(res.status()).toBe(400);
  });

  test('progress API rejects session ID mismatch', async ({ page }) => {
    const res = await page.request.post('/api/progress/session-a', {
      data: {
        sessionId: 'session-b', // intentional mismatch
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
    expect(res.status()).toBe(400);
  });

  test('CORS headers present on progress API OPTIONS', async ({ page }) => {
    // Use page.request.fetch() with OPTIONS method — page.request.options() does not exist
    const res = await page.request.fetch('/api/progress/cors-test', {
      method: 'OPTIONS',
      headers: { 'Content-Type': 'application/json' },
    });
    const headers = res.headers();
    expect(headers['access-control-allow-origin']).toBe('*');
  });

  test('unknown protected route returns non-200 status', async ({ page }) => {
    // /admin may return 401 (protected by Vercel auth) or 404 (no route)
    // Either is acceptable — we just verify it does NOT return 200
    const res = await page.request.get('/admin');
    expect(res.status()).not.toBe(200);
    expect([401, 403, 404]).toContain(res.status());
  });

  test('no API keys exposed in setup page HTML', async ({ page }) => {
    await page.goto('/setup');
    const content = await page.content();
    expect(content).not.toMatch(/sk-ant-/);
    expect(content).not.toMatch(/KV_REST_API_TOKEN/);
  });

  test('no stack traces in API error responses', async ({ page }) => {
    const res = await page.request.post('/api/progress/stack-test', {
      data: { bad: 'data' },
    });
    const body = await res.text();
    expect(body).not.toMatch(/at Object\.|at async|\.ts:\d+/);
  });

  test('CORS allows methods on progress API', async ({ page }) => {
    const res = await page.request.fetch('/api/progress/methods-test', {
      method: 'OPTIONS',
      headers: { 'Content-Type': 'application/json' },
    });
    const headers = res.headers();
    expect(headers['access-control-allow-methods']).toMatch(/GET/);
    expect(headers['access-control-allow-methods']).toMatch(/POST/);
  });

  test('progress API 400 response includes error field', async ({ page }) => {
    const res = await page.request.post('/api/progress/err-shape-test', {
      data: { invalid: true },
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body).toHaveProperty('error');
  });

});
