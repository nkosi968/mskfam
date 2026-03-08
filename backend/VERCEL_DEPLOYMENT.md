# Backend Deployment to Vercel

This guide will help you deploy your backend server to Vercel.

## Prerequisites

1. **Vercel Account**
   - Create a free account at https://vercel.com
   - Sign in with GitHub

2. **Git Repository**
   - Push your project to GitHub (if not already done)
   - Command: `git push origin main`

## Step-by-Step Deployment

### 1. Connect GitHub to Vercel

1. Go to https://vercel.com/dashboard
2. Click "Add New" → "Project"
3. Click "Import Git Repository"
4. Select your GitHub repository (shop-go-main)
5. Click "Import"

### 2. Configure Environment Variables

After importing, you'll see a configuration screen. Add these environment variables:

**Required Variables:**
- **YOCO_SECRET_KEY** - Your Yoco API secret key
  - Get this from your Yoco dashboard: https://portal.yoco.com
  - Should look like: `sk_live_...` or `sk_test_...`

**Optional Variables:**
- **FIREBASE_PROJECT_ID** - Your Firebase project ID (optional, already in code)
  - Value: `mskweb-1db5c`

### 3. Set Build Settings

The deployment should auto-detect the build settings:
- **Root Directory**: Leave as root or set to `backend/` if only deploying backend
- **Build Command**: Leave blank (we're not building, just deploying Node.js)
- **Output Directory**: Leave blank

### 4. Deploy

1. Click "Deploy"
2. Vercel will build and deploy your backend
3. Wait for the deployment to complete
4. You'll get a URL like: `https://shop-go-backend.vercel.app`

## Testing Your Deployment

### Check Health Endpoint
```bash
curl https://your-backend-url.vercel.app/health
```

Response should be:
```json
{
  "status": "OK",
  "timestamp": "2024-03-08T...",
  "yocoConfigured": true
}
```

### Check Root Endpoint
```bash
curl https://your-backend-url.vercel.app/
```

## Updating Your Frontend

Once deployed, update your Frontend to use the new backend URL:

1. Open `src/services/yocoService.ts`
2. Change `API_BASE_URL` from `http://localhost:3001` to your Vercel URL:
   ```typescript
   const API_BASE_URL = "https://your-backend-url.vercel.app";
   ```
3. Rebuild and deploy your frontend

## Webhook Configuration

For Yoco payment webhooks to work:

1. Go to Yoco Dashboard: https://portal.yoco.com
2. Navigate to **Settings** → **Webhooks** → **Add Webhook**
3. Set the webhook URL to: `https://your-backend-url.vercel.app/api/webhooks/yoco`
4. Select events:
   - ✅ checkout.succeeded
   - ✅ checkout.failed
   - ✅ checkout.cancelled
   - ✅ payment.succeeded
5. Save

## Important Notes

- **Firebase Admin SDK**: Uses Application Default Credentials (ADC)
  - Vercel automatically handles this for Firebase integration
  - Make sure your Vercel project is linked to Firebase

- **CORS Settings**: Already configured for:
  - localhost (development)
  - *.vercel.app (your Vercel deployments)
  - *.netlify.app (alternative deployments)

- **Logs**: View deployment logs in Vercel dashboard
  - Click on your project
  - Go to "Deployments"
  - Click on the latest deployment
  - See real-time logs

## Environment Variable Reference

All variables are stored as Vercel secrets and are prefixed with `@`:

In `vercel.json`:
```json
"env": {
  "YOCO_SECRET_KEY": "@yoco_secret_key",
  "FIREBASE_PROJECT_ID": "@firebase_project_id"
}
```

To add more variables:
1. Go to Project Settings → Environment Variables
2. Add new variable
3. Reference in `vercel.json` with `@` prefix

## Troubleshooting

### "YOCO_SECRET_KEY not set" warning
- Add the environment variable in Vercel Project Settings
- Redeploy after adding

### Webhooks not working
- Check webhook URL in Yoco Portal
- Verify endpoint: `POST /api/webhooks/yoco`
- Check Vercel deployment logs for errors

### CORS errors from frontend
- Update CORS origins in `api/index.js`
- Add your frontend URL to the `origin` array
- Redeploy

### Firebase connection issues
- Verify Firebase credentials are correct in `api/index.js`
- Check Vercel logs for Firebase initialization errors
- Ensure Firebase rules allow access

## Next Steps

1. ✅ Deploy backend to Vercel
2. ⬜ Update frontend API_BASE_URL
3. ⬜ Configure Yoco webhooks
4. ⬜ Test payment flow end-to-end
5. ⬜ Monitor logs and performance

## Support

For Vercel issues: https://vercel.com/docs
For Yoco issues: https://developer.yoco.com
For Firebase issues: https://firebase.google.com/docs
