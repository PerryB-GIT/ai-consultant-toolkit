# Deployment Guide - AI Consultant Toolkit

Complete deployment documentation for the Next.js dashboard on Vercel.

---

## 🚀 Current Deployment

**Live URL:** https://ai-consultant-toolkit.vercel.app

**Status:** ✅ Active and deployed

**Last Updated:** February 13, 2026

---

## 🔄 Auto-Deployment (Recommended)

The project is configured for automatic deployment from GitHub.

### How it Works:

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Your commit message"
   git push origin main
   ```

2. **Vercel Auto-Deploys:**
   - Vercel monitors the `main` branch
   - Triggers build on every push
   - Deploys if build succeeds
   - Updates live site automatically

3. **Deployment URL:**
   - Production: `https://ai-consultant-toolkit.vercel.app`
   - Preview: `https://ai-consultant-toolkit-<hash>.vercel.app` (for PRs/branches)

### Check Auto-Deployment Status:

```bash
# Via Vercel CLI
vercel --version  # Ensure Vercel CLI is installed
vercel ls         # List deployments

# Via GitHub Actions (if configured)
gh run list

# Via Vercel Dashboard
# Visit: https://vercel.com/perryb-git/ai-consultant-toolkit
```

---

## 🛠️ Manual Deployment

If you need to deploy manually (bypassing GitHub):

### Prerequisites:

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   # Follow the prompts to authenticate
   ```

### Deploy to Production:

```bash
# Navigate to project directory
cd C:/Users/Jakeb/workspace/ai-consultant-toolkit

# Deploy to production
vercel --prod

# Expected output:
# Vercel CLI 33.0.0
# 🔍 Inspect: https://vercel.com/perryb-git/ai-consultant-toolkit/...
# ✅ Production: https://ai-consultant-toolkit.vercel.app [1s]
```

### Deploy to Preview (Staging):

```bash
# Deploy to preview environment
vercel

# This creates a preview URL for testing before production
# Example: https://ai-consultant-toolkit-abc123.vercel.app
```

---

## ⚙️ Environment Variables

Currently, **no environment variables are required** for this project.

All functionality works without secrets or API keys.

### If Needed in Future:

```bash
# Add environment variable via CLI
vercel env add VARIABLE_NAME

# Or add via Vercel Dashboard
# Settings → Environment Variables → Add New
```

**Common Variables (for reference):**
- `ANTHROPIC_API_KEY` - If adding Claude API integration
- `DATABASE_URL` - If adding database
- `NEXT_PUBLIC_*` - Public variables (exposed to browser)

---

## 🔍 Check Deployment Status

### Via Vercel CLI:

```bash
# List recent deployments
vercel ls

# Get deployment details
vercel inspect https://ai-consultant-toolkit.vercel.app

# View logs
vercel logs https://ai-consultant-toolkit.vercel.app
```

### Via Vercel Dashboard:

1. Visit: https://vercel.com/perryb-git/ai-consultant-toolkit
2. View:
   - Deployment status
   - Build logs
   - Analytics
   - Domain settings

### Via GitHub:

1. Visit: https://github.com/PerryB-GIT/ai-consultant-toolkit
2. Check:
   - Recent commits (green ✅ = deployed)
   - Actions tab (if GitHub Actions configured)
   - Deployments tab

---

## 🏗️ Build Process

Vercel automatically runs these commands:

```bash
# 1. Install dependencies
npm install

# 2. Build Next.js
npm run build
# Equivalent to: next build

# 3. Start production server
npm run start
# Equivalent to: next start
```

### Build Configuration:

**`package.json`:**
```json
{
  "scripts": {
    "dev": "next dev --turbo",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  }
}
```

**`next.config.js`:**
```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // Optimized for Vercel
}
module.exports = nextConfig
```

**`vercel.json`** (auto-generated):
```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install"
}
```

---

## 🔄 Rollback Procedure

If a deployment breaks the site, rollback to a previous version:

### Via Vercel CLI:

```bash
# List recent deployments
vercel ls

# Find the deployment URL you want to rollback to
# Example: https://ai-consultant-toolkit-abc123.vercel.app

# Promote previous deployment to production
vercel promote https://ai-consultant-toolkit-abc123.vercel.app --scope=perryb-git
```

### Via Vercel Dashboard:

1. Visit: https://vercel.com/perryb-git/ai-consultant-toolkit/deployments
2. Find the previous working deployment
3. Click "•••" → "Promote to Production"

### Via Git Revert:

```bash
# Find the commit to revert to
git log --oneline

# Revert to previous commit
git revert <commit-hash>
git push origin main

# Vercel will auto-deploy the reverted version
```

---

## 🧪 Testing Before Production

Always test in preview before deploying to production:

```bash
# 1. Create a feature branch
git checkout -b feature/new-feature

# 2. Make changes and commit
git add .
git commit -m "feat: Add new feature"

# 3. Push to GitHub
git push origin feature/new-feature

# 4. Vercel creates preview deployment
# Visit: https://ai-consultant-toolkit-<hash>.vercel.app

# 5. Test the preview URL

# 6. If good, merge to main
git checkout main
git merge feature/new-feature
git push origin main

# 7. Vercel auto-deploys to production
```

---

## 📊 Monitoring Deployments

### Vercel Analytics (Built-in):

- **URL:** https://vercel.com/perryb-git/ai-consultant-toolkit/analytics
- **Metrics:**
  - Page views
  - Response times
  - Core Web Vitals
  - Device breakdown
  - Geographic data

### Build Logs:

```bash
# View build logs for latest deployment
vercel logs --follow

# View logs for specific deployment
vercel logs <deployment-url>
```

### Runtime Logs:

```bash
# Stream runtime logs
vercel logs https://ai-consultant-toolkit.vercel.app --follow

# Filter by function
vercel logs https://ai-consultant-toolkit.vercel.app/api/validate-output
```

---

## 🔧 Custom Domain Setup

Currently using: `ai-consultant-toolkit.vercel.app`

To add a custom domain:

### Via Vercel Dashboard:

1. Visit: https://vercel.com/perryb-git/ai-consultant-toolkit/settings/domains
2. Click "Add"
3. Enter domain (e.g., `toolkit.support-forge.com`)
4. Follow DNS configuration steps

### Via Vercel CLI:

```bash
vercel domains add toolkit.support-forge.com
```

### DNS Configuration:

Add these records to your DNS provider (GoDaddy):

**A Record:**
```
Type: A
Name: toolkit (or @ for root)
Value: 76.76.21.21
```

**CNAME Record (alternative):**
```
Type: CNAME
Name: toolkit
Value: cname.vercel-dns.com
```

---

## 🚨 Troubleshooting Deployments

### Build Fails:

**Error:** `Build failed`

**Debug:**
```bash
# Check build logs
vercel logs --build

# Test build locally
npm run build

# If local build works but Vercel fails:
# - Check Node.js version (package.json "engines")
# - Check for missing dependencies
# - Check for platform-specific code (Windows vs Linux)
```

### Environment Variable Issues:

**Error:** `Missing environment variable`

**Fix:**
```bash
# Add via CLI
vercel env add VARIABLE_NAME production

# Or via Dashboard
# Settings → Environment Variables
```

### Deployment Timeout:

**Error:** `Build exceeded maximum duration`

**Fix:**
- Optimize build process (remove large dependencies)
- Use `output: 'standalone'` in next.config.js
- Contact Vercel support to increase timeout

### 404 Errors After Deployment:

**Error:** `404 Not Found` on routes

**Fix:**
- Check file naming (Next.js App Router requires specific names)
- Ensure `app/` directory structure is correct
- Clear Vercel cache: `vercel --force`

---

## 📦 Pre-Deployment Checklist

Before deploying to production:

- [ ] All tests pass locally: `npm run build`
- [ ] No console errors in browser
- [ ] All API routes tested
- [ ] File upload works correctly
- [ ] Validation logic is correct
- [ ] Mobile responsiveness verified
- [ ] No hardcoded credentials or secrets
- [ ] Git branch is clean: `git status`
- [ ] Commit message follows convention
- [ ] README.md is updated (if needed)

---

## 🎯 Deployment Workflow (Recommended)

### Development:

```bash
# 1. Create feature branch
git checkout -b feature/name

# 2. Develop locally
npm run dev

# 3. Test thoroughly
npm run build
npm run start

# 4. Commit changes
git add .
git commit -m "feat: Description"

# 5. Push to GitHub
git push origin feature/name
```

### Preview:

```bash
# 6. Create Pull Request on GitHub
gh pr create --title "Feature: Name" --body "Description"

# 7. Vercel creates preview deployment
# Test at: https://ai-consultant-toolkit-<hash>.vercel.app

# 8. If good, merge PR
gh pr merge
```

### Production:

```bash
# 9. Auto-deploys to production
# Live at: https://ai-consultant-toolkit.vercel.app

# 10. Monitor deployment
vercel logs --follow

# 11. Test production
curl https://ai-consultant-toolkit.vercel.app
```

---

## 📝 Deployment History

### Initial Deployment:
- **Date:** February 13, 2026
- **Commit:** Initial project setup
- **Status:** ✅ Success
- **URL:** https://ai-consultant-toolkit.vercel.app

### Recent Deployments:
```bash
# View deployment history
vercel ls --count 10

# Example output:
# Age     Deployment                              Status   Duration  URL
# 2m      ai-consultant-toolkit-abc123.vercel.app Ready    45s       https://...
# 1h      ai-consultant-toolkit-xyz789.vercel.app Ready    42s       https://...
```

---

## 🔐 Security Considerations

### HTTPS:
- ✅ Enabled by default on Vercel
- ✅ Free SSL certificates (Let's Encrypt)
- ✅ Auto-renewal

### CORS:
- Currently: Open to all origins
- If restricting needed, add to `next.config.js`:
```js
async headers() {
  return [
    {
      source: '/api/:path*',
      headers: [
        { key: 'Access-Control-Allow-Origin', value: 'https://yourdomain.com' },
      ],
    },
  ]
}
```

### Rate Limiting:
- Not currently implemented
- If needed, use Vercel Edge Config or Upstash Redis

---

## 📞 Support & Resources

- **Vercel Dashboard:** https://vercel.com/perryb-git/ai-consultant-toolkit
- **Vercel Docs:** https://vercel.com/docs
- **Next.js Deployment:** https://nextjs.org/docs/deployment
- **GitHub Repo:** https://github.com/PerryB-GIT/ai-consultant-toolkit

---

## 🎉 Quick Commands Reference

```bash
# Deploy to production
vercel --prod

# Deploy to preview
vercel

# List deployments
vercel ls

# View logs
vercel logs --follow

# Check deployment status
vercel inspect <url>

# Add domain
vercel domains add <domain>

# Add environment variable
vercel env add <name>

# Rollback to previous version
vercel promote <previous-deployment-url> --scope=perryb-git
```

---

**Deployment Status:** 🟢 Live and Active

**Current Version:** Production (main branch)

**Last Deployed:** Auto-deployed on push to main
