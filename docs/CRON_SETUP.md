# Daily Content Generation Cron Job - Setup Instructions

## What I Created

1. **Cron API Endpoint**: [/api/cron/generate-daily](src/app/api/cron/generate-daily/route.ts)
   - Generates 2 lessons daily (1 beginner + 1 intermediate)
   - Secured with `CRON_SECRET` token
   - Returns success/failure for each lesson

2. **Vercel Cron Config**: [vercel.json](vercel.json)
   - Scheduled to run daily at 9 AM UTC (adjust as needed)
   - Schedule format: `"0 9 * * *"` (cron syntax)

3. **Environment Variable**: Added `CRON_SECRET` to `.env.local`

## Setup for Production

### Step 1: Get Supabase Service Role Key

The cron job needs your **service role key** (bypasses RLS policies):

1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/hvzjijefrxxrakxhxtqb/settings/api)
2. Find **Service Role Key** (under "Project API keys")
3. Copy the `service_role` secret key

### Step 2: Configure Vercel Environment Variables

When you deploy to Vercel:

1. Go to your Vercel project settings → Environment Variables
2. Add these:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://hvzjijefrxxrakxhxtqb.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<your anon key>
   SUPABASE_SERVICE_ROLE_KEY=<your service role key from Step 1>
   GROQ_API_KEY=<your groq key>
   CRON_SECRET=<generate a random secure token>
   ```

3. For `CRON_SECRET`, generate a random string:
   ```bash
   openssl rand -base64 32
   ```

### Step 3: Deploy to Vercel

```bash
# Install Vercel CLI (if not installed)
npm i -g vercel

# Deploy
vercel

# Follow prompts to link your project
```

Once deployed, the cron will run automatically at 9 AM UTC daily.

## Test Locally

```bash
# Add service role key to .env.local first
echo "SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>" >> .env.local

# Restart dev server
# Then test:
curl -X GET http://localhost:3000/api/cron/generate-daily \
  -H "Authorization: Bearer dev-secret-change-in-production"
```

## Customize Schedule

Edit `vercel.json` to change timing:

```json
{
  "crons": [
    {
      "path": "/api/cron/generate-daily",
      "schedule": "0 9 * * *"  // Change this
    }
  ]
}
```

**Common schedules:**
- `"0 9 * * *"` - Daily at 9 AM UTC
- `"0 0 * * *"` - Daily at midnight UTC
- `"0 */6 * * *"` - Every 6 hours
- `"0 9 * * 1"` - Every Monday at 9 AM UTC

## Customize Content

Edit [src/app/api/cron/generate-daily/route.ts](src/app/api/cron/generate-daily/route.ts):

```typescript
// Change levels array to generate different content
const levels = ['beginner', 'intermediate', 'advanced']; // Generate 3 lessons

// Or specify topics
const result = await generateCompleteLesson(level, 'Business English', supabase);
```

## Monitor Cron Jobs

After deployment:
1. Go to Vercel Dashboard → Your Project → Logs
2. Filter by `/api/cron/generate-daily`
3. View execution history and errors
