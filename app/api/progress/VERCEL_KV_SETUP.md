# Vercel KV Setup for Progress Tracking

## Overview

The Progress Tracking API uses Vercel KV (Redis) to store real-time setup progress data with automatic expiration (1-hour TTL).

## Production Setup (Vercel)

### 1. Create Vercel KV Store

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project: `ai-consultant-toolkit-web`
3. Navigate to **Storage** tab
4. Click **Create Database**
5. Select **KV** (Redis)
6. Choose a name: `ai-toolkit-progress`
7. Select region closest to your deployment (usually `us-east-1`)
8. Click **Create**

### 2. Connect to Project

Vercel automatically injects these environment variables when you connect the KV store:

```bash
KV_REST_API_URL=https://...upstash.io
KV_REST_API_TOKEN=...
KV_REST_API_READ_ONLY_TOKEN=...
```

No manual configuration needed on Vercel!

### 3. Verify Connection

After deployment, test the API:

```bash
curl https://your-domain.vercel.app/api/progress/test-session
# Should return: {"error":"Session not found"}
```

## Local Development Setup

### Option 1: Use Vercel KV Development Database

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Link your local project:
   ```bash
   cd C:/Users/Jakeb/ai-consultant-toolkit-web
   vercel link
   ```

3. Pull environment variables:
   ```bash
   vercel env pull .env.local
   ```

4. Start dev server:
   ```bash
   npm run dev
   ```

### Option 2: Use Local Redis (Alternative)

If you prefer a local Redis instance:

1. Install Redis for Windows:
   - Download from: https://github.com/microsoftarchive/redis/releases
   - Or use Docker: `docker run -p 6379:6379 redis`

2. Install `@upstash/redis`:
   ```bash
   npm install @upstash/redis
   ```

3. Create `.env.local`:
   ```bash
   KV_REST_API_URL=http://localhost:6379
   KV_REST_API_TOKEN=local-dev-token
   ```

4. Update API code to use local connection (dev only)

## Testing the API

### Local Testing

```bash
# Start the dev server
npm run dev

# In another terminal, run the test script
node scripts/test-progress-api.js http://localhost:3000
```

### Production Testing

```bash
node scripts/test-progress-api.js https://your-domain.vercel.app
```

## Data Structure

### Progress Data (KV Key: `progress:{sessionId}`)

```typescript
{
  sessionId: string;
  currentStep: number;
  completedSteps: number[];
  currentAction: string;
  toolStatus: Record<string, ToolStatusInfo>;
  errors: ProgressError[];
  timestamp: string;
  phase: 'phase1' | 'phase2';
  complete: boolean;
}
```

**TTL:** 3600 seconds (1 hour)

### Error Log (KV Key: `progress:{sessionId}:log`)

```typescript
Array<{
  tool: string;
  error: string;
  suggestedFix: string;
  timestamp: string;
  step: number;
}>
```

**TTL:** 3600 seconds (1 hour)

## Migration from Vercel KV to Upstash Redis

Vercel KV is deprecated and has been migrated to Upstash Redis. If you see a deprecation warning:

1. Go to **Vercel Dashboard > Integrations**
2. Find **Upstash Redis**
3. Your existing KV store should already be migrated
4. Environment variables remain the same
5. No code changes required

Alternatively, install Upstash Redis from [Vercel Marketplace](https://vercel.com/marketplace?category=storage&search=redis).

## Troubleshooting

### Error: "Cannot connect to KV"

**Check environment variables:**
```bash
# In your terminal or PowerShell
echo $env:KV_REST_API_URL
echo $env:KV_REST_API_TOKEN
```

If empty, pull from Vercel:
```bash
vercel env pull .env.local
```

### Error: "KV connection timeout"

- Check KV store region matches your deployment region
- Verify Vercel KV store is active in dashboard
- Try recreating the KV connection

### Error: "Session not found" (but you just created it)

- Data may have expired (1-hour TTL)
- Check sessionId matches exactly
- Verify POST request succeeded before GET

### Local development not working

1. Ensure `.env.local` exists with KV credentials
2. Restart dev server after adding environment variables
3. Check Vercel KV allows connections from your IP
4. Consider using local Redis for offline development

## Rate Limits

Vercel KV (Upstash Redis) free tier limits:

- **Requests:** 10,000 per day
- **Storage:** 256 MB
- **Max connections:** 1,000

For production use with heavy traffic, upgrade to Upstash Pro.

## Security Best Practices

1. **Never commit `.env.local`** - Already in `.gitignore`
2. **Rotate tokens regularly** in Vercel dashboard
3. **Use read-only tokens** for client-side access if needed
4. **Validate all inputs** - Already implemented with Zod
5. **Monitor usage** in Upstash dashboard to avoid rate limits

## Cost Estimation

For typical AI toolkit setup automation:

- **Requests per session:** ~20 (10 progress updates + 10 error logs)
- **Sessions per day:** 100
- **Total requests per day:** 2,000
- **Free tier:** ✅ Sufficient (10,000/day limit)

Even at 500 sessions/day = 10,000 requests (at free tier limit).
