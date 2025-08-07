# 📱 APK Build Instructions for Winscreen

## 🚀 Quick Setup (2 Steps)

### Step 1: Deploy Your Free Server
1. **Create Render.com account** (free): https://render.com
2. **Connect your GitHub**: Go to Render dashboard → New → Web Service
3. **Deploy from this repository**: Select this project
4. **Configure settings**:
   - **Environment**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Auto-Deploy**: Yes
5. **Get your free URL**: `https://your-app-name.onrender.com`

### Step 2: Build APK with Your Server URL
1. **Update server URL** in `capacitor.config.json`:
   ```json
   "server": {
     "url": "https://your-actual-render-url.onrender.com"
   }
   ```
2. **Build APK**:
   ```bash
   npm run build
   npx cap sync
   npx cap open android
   ```
3. **In Android Studio**: Build → Generate Signed Bundle/APK
4. **Install APK** on your phone

## 🆓 Why This is Completely Free

### Free Server (Render.com)
- **750 hours/month** compute time (enough for personal use)
- **Automatic SSL** (required for WebRTC)
- **WebSocket support** (essential for screen sharing)
- **No credit card required**

### APK Cost
- **$0** - Build unlimited APKs once Android Studio is set up
- **No app store fees** - Direct APK installation
- **No licensing costs** - All open source

## 📋 Complete Free Stack

| Component | Service | Cost |
|-----------|---------|------|
| **Web Hosting** | Render.com | Free (750hrs/month) |
| **Database** | Built-in memory storage | Free |
| **WebRTC** | Browser native | Free |
| **APK Building** | Android Studio | Free |
| **Domain** | Render subdomain | Free |
| **SSL Certificate** | Automatic | Free |

## 🔧 APK Features

Your APK will have:
- ✅ **Native app icon** on home screen
- ✅ **Full screen mode** (no browser UI)
- ✅ **Offline capability** (basic functions)
- ✅ **Auto-updates** when server changes
- ✅ **Real-time screen sharing** anywhere in the world
- ✅ **Room codes** for easy sharing
- ✅ **Connection status** indicators

## 📱 Alternative: PWA Installation (Even Easier!)

Don't want to build APK? Use the Progressive Web App:

1. **Open your Render.com URL** on any phone
2. **Tap "Add to Home Screen"** in browser menu
3. **Instant native-like app** without APK building

Both options work identically - choose what's easier for you!

## 🌍 How Users Get Your App

### Option A: APK Distribution
1. **Share APK file** via messaging apps
2. **Users install directly** (enable "Unknown Sources")
3. **Works offline** after installation

### Option B: PWA Distribution  
1. **Share your Render.com URL**
2. **Users visit + install via browser**
3. **Automatic updates** without redistribution

## 🚀 Next Steps

1. **Deploy to Render.com first** (get your free server running)
2. **Test the web app** (make sure screen sharing works)
3. **Build APK** with your server URL
4. **Share with friends** and enjoy free screen sharing!

Your app will work globally, connecting devices anywhere in the world, completely free of charge.