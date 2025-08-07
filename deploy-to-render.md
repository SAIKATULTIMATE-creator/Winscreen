# 🚀 Deploy Winscreen to Render.com (FREE)

## Step 1: Create Render Account
1. Go to **https://render.com**
2. **Sign up** with GitHub (free)
3. **Verify email** if prompted

## Step 2: Deploy Your App
1. **Dashboard** → **New** → **Web Service**
2. **Connect GitHub** → Find your repository
3. **Configure deployment**:
   ```
   Name: winscreen
   Environment: Node
   Region: Oregon (US West) 
   Branch: main
   Root Directory: (leave blank)
   Build Command: npm install && npm run build
   Start Command: npm start
   ```
4. **Advanced settings**:
   ```
   Plan: Free
   Auto-Deploy: Yes
   ```
5. **Create Web Service**

## Step 3: Your Free URL
After 2-3 minutes, you'll get: `https://winscreen.onrender.com`

## Step 4: Update APK for Production

Once deployed, update your APK to use the real server:

1. **Edit `capacitor.config.json`**:
   ```json
   {
     "server": {
       "url": "https://winscreen.onrender.com"
     }
   }
   ```

2. **Rebuild APK**:
   ```bash
   npm run build
   npx cap sync
   ```

## Step 5: Build Final APK

### Download Android Studio
1. **Download**: https://developer.android.com/studio
2. **Install** and run first-time setup
3. **Accept licenses** when prompted

### Build APK
1. **In your terminal**:
   ```bash
   npx cap open android
   ```
2. **Android Studio opens**
3. **Wait for Gradle sync** (2-3 minutes first time)
4. **Build** → **Generate Signed Bundle/APK**
5. **Choose APK** → Next
6. **Create new keystore**:
   - Keystore path: Desktop/winscreen-keystore.jks
   - Password: (create strong password)
   - Alias: winscreen-key
   - Key password: (same as keystore)
   - Validity: 25 years
7. **Build APK** (5-10 minutes)
8. **APK location**: `android/app/build/outputs/apk/release/app-release.apk`

## 🎉 Your App is Ready!

### Free Web Version
- **URL**: https://winscreen.onrender.com
- **Works on**: Any device with a browser
- **Install**: "Add to Home Screen" on mobile

### APK Version  
- **File**: `app-release.apk` 
- **Install**: Enable "Unknown Sources" → Install APK
- **Works**: Offline startup, connects to free server

## 📱 Distribution Options

### Share Web Link
Send friends: `https://winscreen.onrender.com`
- They visit and can install as PWA
- Works immediately on any device

### Share APK File
Send the `app-release.apk` file via:
- WhatsApp, Telegram, email
- Users install directly on Android
- Works even if server is down (reconnects when available)

## 🌍 Global Screen Sharing
Your app now works worldwide:
- **Host anywhere** → get room code
- **Share room code** with friends  
- **Join from any device** globally
- **Real-time streaming** via WebRTC

## 💰 Completely Free
- **Server**: 750 hours/month (Render.com)
- **APK builds**: Unlimited (Android Studio)  
- **Usage**: No limits on screen sharing
- **Users**: No registration required

Your Winscreen app is production-ready!