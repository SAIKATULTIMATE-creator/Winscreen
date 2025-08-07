#!/bin/bash

echo "🚀 Building Winscreen APK..."
echo ""

# Step 1: Build the web app
echo "📦 Building web application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

echo "✅ Web app built successfully!"
echo ""

# Step 2: Sync with Capacitor
echo "🔄 Syncing with Capacitor..."
npx cap sync

if [ $? -ne 0 ]; then
    echo "❌ Capacitor sync failed!"
    exit 1
fi

echo "✅ Capacitor sync completed!"
echo ""

# Step 3: Open Android Studio
echo "📱 Opening Android Studio for APK build..."
echo ""
echo "Next steps in Android Studio:"
echo "1. Wait for Gradle sync to complete"
echo "2. Go to: Build → Generate Signed Bundle/APK"
echo "3. Choose: APK"
echo "4. Create a new keystore (or use existing)"
echo "5. Build APK"
echo ""

npx cap open android

echo "🎉 APK build process initiated!"
echo "Your APK will be ready in Android Studio in a few minutes."