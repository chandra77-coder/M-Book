# 🚀 Mbook APK - Quick Build Guide

The GitHub Actions automated builds are having environment issues. Here are the **FASTEST and MOST RELIABLE** ways to build your APK:

---

## ⭐ **OPTION 1: PhoneGap Build (EASIEST - 5 minutes)**

**This is the fastest way to get your APK!**

### Steps:

1. **Go to**: https://build.phonegap.com/
2. **Sign up** (free account - takes 2 minutes)
3. **Upload your code**:
   - Download this repo as ZIP: https://github.com/chandra77-coder/M-Book/archive/refs/heads/main.zip
   - Or upload directly from GitHub
4. **Select Android** and click **Build**
5. **Wait 2-3 minutes** for the APK to build
6. **Download** the APK file
7. **Transfer to phone** and install!

✅ **Pros**: Fastest, no setup needed, free  
❌ **Cons**: Requires internet

---

## ⭐ **OPTION 2: Apk.today (SUPER EASY - 3 minutes)**

**Even faster than PhoneGap!**

### Steps:

1. **Go to**: https://www.apk.today/
2. **Upload** this ZIP: https://github.com/chandra77-coder/M-Book/archive/refs/heads/main.zip
3. **Wait 2-3 minutes**
4. **Download APK**
5. **Install on phone**

✅ **Pros**: Fastest, completely free, no account needed  
❌ **Cons**: Requires internet

---

## ⭐ **OPTION 3: Local Build (If you have Android SDK)**

### Prerequisites:
- Node.js 18+
- Java JDK 11+
- Android SDK installed
- Cordova CLI

### Steps:

```bash
# 1. Clone the repo
git clone https://github.com/chandra77-coder/M-Book.git
cd M-Book

# 2. Install dependencies
npm install -g cordova
pnpm install

# 3. Build web app
pnpm run build

# 4. Create Cordova project
cordova create mbook-app com.mbook.app Mbook
cd mbook-app

# 5. Add Android
cordova platform add android

# 6. Copy web app
rm -rf www/*
cp -r ../dist/public/* www/

# 7. Build APK
cordova build android --release

# 8. Find your APK
# Location: platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk
```

✅ **Pros**: Full control, no dependencies on external services  
❌ **Cons**: Requires Android SDK setup (complex)

---

## 📱 **Installing on Your Phone**

Once you have the APK file:

### Steps:

1. **Transfer APK** to your Android phone (USB cable or cloud)

2. **Enable Unknown Sources**:
   - Go to: **Settings** → **Security** → **Unknown Sources**
   - Toggle: **ON**

3. **Install**:
   - Open **File Manager**
   - Find `mbook-app.apk` (or whatever the APK is named)
   - Tap it
   - Click **Install**

4. **Launch**:
   - Open **Mbook** app
   - Start tracking! 🎉

---

## ✨ **What's Included in the APK**

✅ Work entry tracking  
✅ Payment status (Paid/Unpaid/Undecided)  
✅ QR code upload & display  
✅ Income analytics  
✅ Local data storage  
✅ Dark theme  
✅ Complete privacy (no cloud sync)  

---

## 🆘 **Troubleshooting**

### "Installation blocked" error
- Go to Settings → Security → Unknown Sources → Toggle ON
- Try again

### "App won't open"
- Make sure you have the latest APK
- Try uninstalling and reinstalling
- Check your Android version (needs Android 6.0+)

### "Build failed"
- Use **PhoneGap Build** or **Apk.today** instead
- They handle all the complex setup

---

## 📞 **Need Help?**

1. **PhoneGap Build Docs**: https://build.phonegap.com/docs
2. **Cordova Docs**: https://cordova.apache.org/
3. **Android Docs**: https://developer.android.com/

---

## 🎯 **Recommended Path**

**For most users**: Use **Apk.today** or **PhoneGap Build** (fastest, no setup)

**For developers**: Use local Cordova build (full control)

---

**Choose your method above and get Mbook on your phone today!** 🚀
