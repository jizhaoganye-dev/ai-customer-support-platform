# 🚀 Deployment Guide

Complete guide for deploying the AI Customer Support Platform to production.

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Frontend Deployment (Vercel)](#frontend-deployment-vercel)
- [Backend Deployment (Railway)](#backend-deployment-railway)
- [Database Setup (Supabase)](#database-setup-supabase)
- [Environment Variables](#environment-variables)
- [Domain Configuration](#domain-configuration)
- [Monitoring Setup](#monitoring-setup)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before deploying, ensure you have:

- [ ] GitHub account
- [ ] Vercel account
- [ ] Railway account (or alternative: Render, Fly.io)
- [ ] Supabase account
- [ ] OpenAI API key
- [ ] (Optional) Custom domain

---

## Frontend Deployment (Vercel)

### Option 1: Automatic Deployment (Recommended)

1. **Connect GitHub Repository**
   ```bash
   # Push your code to GitHub
   git remote add origin https://github.com/yourusername/ai-customer-support-platform.git
   git push -u origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Next.js configuration

3. **Configure Environment Variables**
   Add these in Vercel dashboard (Settings → Environment Variables):
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Deploy**
   - Click "Deploy"
   - Vercel will build and deploy automatically
   - Every push to `main` branch triggers new deployment

### Option 2: Manual Deployment

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

### Vercel Configuration

Your `vercel.json` is already configured with:
- ✅ Build optimization
- ✅ Security headers
- ✅ API proxy to backend
- ✅ Multi-region deployment

---

## Backend Deployment (Railway)

### Option 1: Railway CLI (Recommended)

1. **Install Railway CLI**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login**
   ```bash
   railway login
   ```

3. **Initialize Project**
   ```bash
   cd backend
   railway init
   ```

4. **Add Environment Variables**
   ```bash
   railway variables set SUPABASE_URL=your_url
   railway variables set SUPABASE_KEY=your_key
   railway variables set OPENAI_API_KEY=your_key
   # ... add all required variables
   ```

5. **Deploy**
   ```bash
   railway up
   ```

### Option 2: Railway Dashboard

1. Go to [railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Set root directory to `backend`
5. Add environment variables
6. Deploy

### Option 3: Docker Deployment

```bash
# Build Docker image
docker build -t ai-support-backend ./backend

# Push to container registry
docker tag ai-support-backend registry.railway.app/your-project
docker push registry.railway.app/your-project

# Railway will automatically deploy
```

---

## Database Setup (Supabase)

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Choose a name and region (close to your users)
4. Note down:
   - Project URL
   - Anon/Public key
   - Service role key

### 2. Run Database Schema

1. Open Supabase Dashboard → SQL Editor
2. Copy contents of `database/schema.sql`
3. Paste and execute
4. Verify tables were created:
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public';
   ```

### 3. Enable Extensions

```sql
-- Already in schema.sql, but verify:
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";
```

### 4. Configure Row Level Security

RLS policies are defined in `schema.sql`. Verify they're active:

```sql
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

All tables should have `rowsecurity = true`.

### 5. Set up Authentication

1. Go to Authentication → Settings
2. Configure email templates
3. Enable desired auth providers (Email, Google, etc.)
4. Set site URL to your frontend URL

---

## Environment Variables

### Frontend (.env.local)

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Backend API
NEXT_PUBLIC_API_URL=https://your-backend.railway.app

# Analytics (Optional)
NEXT_PUBLIC_ANALYTICS_ID=your-analytics-id
```

### Backend (backend/.env)

```env
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key

# OpenAI
OPENAI_API_KEY=sk-...

# OR Azure OpenAI
AZURE_OPENAI_API_KEY=your-azure-key
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com
AZURE_OPENAI_DEPLOYMENT=your-deployment-name

# Security
SECRET_KEY=generate-a-secure-random-string

# Environment
ENVIRONMENT=production
DEBUG=false
```

### Generate Secure Keys

```bash
# Generate SECRET_KEY
python -c "import secrets; print(secrets.token_urlsafe(32))"

# Or using PowerShell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

---

## Domain Configuration

### Frontend Custom Domain (Vercel)

1. Go to Vercel project → Settings → Domains
2. Add your domain (e.g., `support.yourdomain.com`)
3. Add DNS records as instructed by Vercel:
   ```
   Type: A
   Name: support
   Value: 76.76.21.21
   ```
4. Wait for DNS propagation (~5-60 minutes)
5. Vercel auto-configures SSL

### Backend Custom Domain (Railway)

1. Go to Railway project → Settings → Domains
2. Add custom domain (e.g., `api.yourdomain.com`)
3. Add DNS records:
   ```
   Type: CNAME
   Name: api
   Value: your-project.up.railway.app
   ```
4. Railway auto-configures SSL

### Update Environment Variables

After configuring domains, update:

```env
# Frontend
NEXT_PUBLIC_API_URL=https://api.yourdomain.com

# Supabase → Authentication → Site URL
https://support.yourdomain.com
```

---

## Monitoring Setup

### 1. Sentry (Error Tracking)

```bash
# Install Sentry
npm install @sentry/nextjs
npx @sentry/wizard -i nextjs

# Backend
pip install sentry-sdk
```

Add to environment variables:
```env
SENTRY_DSN=your-sentry-dsn
```

### 2. Vercel Analytics

Already enabled by default in Vercel. View in dashboard.

### 3. Custom Monitoring

Set up alerts for:
- ✅ API response time > 1s
- ✅ Error rate > 1%
- ✅ Database query time > 500ms
- ✅ Harassment detection accuracy < 90%

---

## GitHub Actions CI/CD

Your `.github/workflows/ci-cd.yml` is already configured.

### Required GitHub Secrets

Add these in GitHub → Settings → Secrets:

```
# Vercel
VERCEL_TOKEN=your-vercel-token
VERCEL_ORG_ID=your-org-id
VERCEL_PROJECT_ID=your-project-id

# Railway
RAILWAY_TOKEN=your-railway-token

# Supabase (for tests)
SUPABASE_URL=your-url
SUPABASE_KEY=your-key

# OpenAI (for tests)
OPENAI_API_KEY=your-key

# Optional: Slack notifications
SLACK_WEBHOOK=your-slack-webhook
```

### Workflow Triggers

- **Push to `main`**: Full CI/CD pipeline + production deploy
- **Push to `develop`**: CI checks only
- **Pull Request**: CI checks + preview deployment

---

## Post-Deployment Checklist

### Immediate Steps

- [ ] Test authentication flow
- [ ] Verify database connectivity
- [ ] Test AI chat functionality
- [ ] Verify harassment detection
- [ ] Check analytics dashboard
- [ ] Test real-time updates

### Security Checks

- [ ] SSL/HTTPS enabled
- [ ] Environment variables secured
- [ ] RLS policies active
- [ ] API rate limiting configured
- [ ] CORS properly configured

### Performance Checks

- [ ] Lighthouse score > 90
- [ ] API response time < 500ms
- [ ] Database query time < 100ms
- [ ] Vector search time < 200ms

### Monitoring Setup

- [ ] Sentry configured
- [ ] Alerts set up
- [ ] Uptime monitoring active
- [ ] Backup strategy in place

---

## Troubleshooting

### Frontend Issues

**Build fails on Vercel:**
```bash
# Check Node version
node --version  # Must be >= 18

# Clear cache and rebuild
vercel --prod --force
```

**Environment variables not working:**
- Ensure they start with `NEXT_PUBLIC_` for client-side
- Redeploy after adding new variables

### Backend Issues

**502 Bad Gateway:**
- Check Railway logs: `railway logs`
- Verify environment variables
- Check database connection

**Slow API responses:**
- Enable connection pooling
- Check database indexes
- Optimize vector search

### Database Issues

**RLS blocking queries:**
```sql
-- Temporarily disable for debugging
ALTER TABLE table_name DISABLE ROW LEVEL SECURITY;

-- Check policies
SELECT * FROM pg_policies WHERE tablename = 'your_table';
```

**Vector search not working:**
```sql
-- Verify pgvector extension
SELECT * FROM pg_extension WHERE extname = 'vector';

-- Check embedding column
SELECT embedding FROM faq_documents LIMIT 1;
```

---

## Rollback Procedure

### Frontend Rollback (Vercel)

1. Go to Vercel dashboard → Deployments
2. Find previous successful deployment
3. Click "..." → "Promote to Production"

### Backend Rollback (Railway)

```bash
# List deployments
railway status

# Rollback to previous
railway rollback
```

### Database Rollback

```bash
# Restore from backup
# In Supabase dashboard → Database → Backups
# Select backup and restore
```

---

## Cost Optimization

### Free Tier Limits

| Service | Free Tier | Recommended Plan |
|---------|-----------|------------------|
| **Vercel** | 100GB bandwidth | Pro: $20/mo |
| **Railway** | $5 credit/mo | Hobby: $5/mo |
| **Supabase** | 500MB DB, 2GB storage | Pro: $25/mo |
| **OpenAI** | Pay-per-use | $100/mo budget |

### Total Estimated Cost

- **Development**: $0/month (free tiers)
- **Production (low traffic)**: ~$50/month
- **Production (medium traffic)**: ~$150/month

---

## Support

For deployment issues:
1. Check [GitHub Issues](https://github.com/yourusername/ai-customer-support-platform/issues)
2. Review [Architecture Documentation](ARCHITECTURE.md)
3. Contact: your-email@example.com

---

**Happy Deploying! 🚀**
