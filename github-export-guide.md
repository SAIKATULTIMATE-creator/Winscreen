# 📤 Export Winscreen to GitHub

## Step 1: Connect GitHub in Replit

1. **Open Git pane** (left sidebar in Replit)
2. **Click "Connect to GitHub"**
3. **Authorize Replit** to access your GitHub account
4. **Sign in to GitHub** if prompted

## Step 2: Create Repository

1. **In Git pane**, click **"Create a new repository"**
2. **Repository settings**:
   - Name: `winscreen`
   - Description: `Real-time screen sharing app with WebRTC`
   - Visibility: Public (recommended for free deployment)
3. **Click "Create repository"**

## Step 3: Commit and Push

1. **Add commit message**: `Initial Winscreen app - ready for deployment`
2. **Click "Commit & Push"**
3. **Wait for upload** (may take 1-2 minutes)
4. **Success!** Your code is now on GitHub

## Step 4: Deploy to Render.com

1. **Go to https://render.com**
2. **Sign up with GitHub** (use same GitHub account)
3. **New Web Service** → "Build and deploy from Git repository"
4. **Select your `winscreen` repository**
5. **Configure deployment**:
   ```
   Name: winscreen
   Build Command: npm install && npm run build
   Start Command: npm start
   Plan: Free
   ```
6. **Create Web Service**

## Step 5: Get Your Free URL

After 2-3 minutes: `https://winscreen.onrender.com`

## What Happens Next

Your Winscreen app will be:
- **Live globally** at your Render URL
- **Completely free** (750 hours/month)
- **Auto-updating** when you push to GitHub
- **WebSocket enabled** for real-time screen sharing

## For APK Building

Once deployed, update `capacitor.config.json`:
```json
{
  "server": {
    "url": "https://winscreen.onrender.com"
  }
}
```

Then build APK with Android Studio.

Your app will work worldwide for free!