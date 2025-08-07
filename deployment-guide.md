# 🚀 Free Deployment Guide for Winscreen

## Step 1: Deploy to Render.com (FREE)

### Quick Deploy
1. **Go to Render.com** and create free account
2. **Connect GitHub** (if not done already)
3. **New Web Service** → Import from GitHub
4. **Select this repository**
5. **Configure settings**:
   - **Name**: `winscreen` 
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Free
6. **Deploy** - takes 2-3 minutes

### Your Free URL
After deployment, you'll get: `https://winscreen.onrender.com`

## Step 2: Update APK Configuration

Once you have your Render URL, update the APK:

1. **Edit `capacitor.config.json`**:
   ```json
   {
     "server": {
       "url": "https://your-actual-render-url.onrender.com"
     }
   }
   ```

2. **Rebuild APK**:
   ```bash
   npm run build
   npx cap sync
   npx cap open android
   ```

## Step 3: Build APK in Android Studio

1. **Wait for Gradle sync** (2-3 minutes)
2. **Build → Generate Signed Bundle/APK**
3. **Choose APK → Next**
4. **Create new keystore**:
   - Key store path: Choose location
   - Password: Create strong password
   - Key alias: `winscreen`
   - Key password: Same as keystore
   - Validity: 25 years
5. **Build APK** (5-10 minutes)
6. **APK ready** in `android/app/build/outputs/apk/release/`

## 🆓 Completely Free Operation

### Server Costs: $0
- **750 hours/month** on Render.com
- **Automatic SSL** for HTTPS
- **WebSocket support** included
- **Auto-restart** on crashes

### APK Costs: $0
- **Build unlimited APKs** 
- **No app store fees** (direct install)
- **No licensing costs**

## 📱 User Installation Options

### Option A: APK File
- Share the APK file directly
- Users enable "Unknown Sources" 
- Install like any APK

### Option B: PWA Install (Easier)
- Share your Render.com URL
- Users visit on mobile
- Tap "Add to Home Screen"
- Installs like native app

## 🌐 Global Screen Sharing

Your app will work worldwide:
- **Real-time connections** between any devices
- **Room codes** for easy joining  
- **WebRTC technology** for direct streaming
- **Cross-platform** (Android, iOS, Desktop)

## ⚡ Quick Commands

```bash
# Build for web
npm run build

# Sync to mobile
npx cap sync

# Open Android Studio
npx cap open android

# Or use the script
./build-apk.sh
```

Your Winscreen app is ready for global, free operation!