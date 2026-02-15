/**
 * Test script for Progress Tracking API
 *
 * Usage: node scripts/test-progress-api.js [base-url]
 * Example: node scripts/test-progress-api.js http://localhost:3000
 */

const baseUrl = process.argv[2] || 'http://localhost:3000';
const sessionId = `test-session-${Date.now()}`;

async function testProgressAPI() {
  console.log('Testing Progress Tracking API');
  console.log('Base URL:', baseUrl);
  console.log('Session ID:', sessionId);
  console.log('---\n');

  try {
    // Test 1: Store initial progress
    console.log('Test 1: Store initial progress');
    const initialProgress = {
      sessionId,
      currentStep: 1,
      completedSteps: [],
      currentAction: 'Starting Phase 1 setup',
      toolStatus: {
        gmail: { status: 'installing' },
        calendar: { status: 'pending' },
      },
      errors: [],
      timestamp: new Date().toISOString(),
      phase: 'phase1',
      complete: false,
    };

    const storeResponse = await fetch(`${baseUrl}/api/progress/${sessionId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(initialProgress),
    });

    if (!storeResponse.ok) {
      throw new Error(`Store failed: ${storeResponse.status} ${await storeResponse.text()}`);
    }

    const storeResult = await storeResponse.json();
    console.log('✓ Stored:', storeResult);
    console.log('');

    // Test 2: Retrieve progress
    console.log('Test 2: Retrieve progress');
    const getResponse = await fetch(`${baseUrl}/api/progress/${sessionId}`);

    if (!getResponse.ok) {
      throw new Error(`Get failed: ${getResponse.status} ${await getResponse.text()}`);
    }

    const progress = await getResponse.json();
    console.log('✓ Retrieved progress:');
    console.log(JSON.stringify(progress, null, 2));
    console.log('');

    // Test 3: Update progress with error
    console.log('Test 3: Update progress with error');
    const updatedProgress = {
      ...initialProgress,
      currentStep: 2,
      completedSteps: [1],
      currentAction: 'Installing Calendar MCP',
      toolStatus: {
        gmail: { status: 'success', version: '1.0.0' },
        calendar: { status: 'error', error: 'npm install failed' },
      },
      errors: [
        {
          tool: 'calendar',
          error: 'npm install failed',
          suggestedFix: 'Run: npm cache clean --force && npm install',
        },
      ],
      timestamp: new Date().toISOString(),
    };

    const updateResponse = await fetch(`${baseUrl}/api/progress/${sessionId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedProgress),
    });

    if (!updateResponse.ok) {
      throw new Error(`Update failed: ${updateResponse.status} ${await updateResponse.text()}`);
    }

    const updateResult = await updateResponse.json();
    console.log('✓ Updated:', updateResult);
    console.log('');

    // Test 4: Log an error
    console.log('Test 4: Log an error');
    const errorEntry = {
      tool: 'calendar',
      error: 'npm install failed',
      suggestedFix: 'Run: npm cache clean --force && npm install',
      timestamp: new Date().toISOString(),
      step: 2,
    };

    const logResponse = await fetch(`${baseUrl}/api/progress/${sessionId}/log`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(errorEntry),
    });

    if (!logResponse.ok) {
      throw new Error(`Log error failed: ${logResponse.status} ${await logResponse.text()}`);
    }

    const logResult = await logResponse.json();
    console.log('✓ Logged error:', logResult);
    console.log('');

    // Test 5: Retrieve error log
    console.log('Test 5: Retrieve error log');
    const errorsResponse = await fetch(`${baseUrl}/api/progress/${sessionId}/log`);

    if (!errorsResponse.ok) {
      throw new Error(`Get errors failed: ${errorsResponse.status} ${await errorsResponse.text()}`);
    }

    const errors = await errorsResponse.json();
    console.log('✓ Retrieved errors:');
    console.log(JSON.stringify(errors, null, 2));
    console.log('');

    // Test 6: Test 404 for non-existent session
    console.log('Test 6: Test 404 for non-existent session');
    const notFoundResponse = await fetch(`${baseUrl}/api/progress/non-existent-session`);

    if (notFoundResponse.status !== 404) {
      throw new Error(`Expected 404, got ${notFoundResponse.status}`);
    }

    console.log('✓ Correctly returned 404 for non-existent session');
    console.log('');

    console.log('✅ All tests passed!');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

testProgressAPI();
