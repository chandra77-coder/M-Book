# 📱 Mbook APK Build Instructions

Your Mbook app is ready! Here are the easiest ways to build and install the APK on your Android phone.

---

## **Option 1: Using PhoneGap Build (Easiest & Fastest) ⭐ RECOMMENDED**

### Steps:

1. **Go to**: https://build.phonegap.com/
2. **Sign up** (free account)
3. **Upload your code**:
   - Download this repository as ZIP
   - Upload the ZIP file to PhoneGap Build
4. **Build APK**:
   - Select Android platform
   - Click "Build"
   - Wait 2-3 minutes
5. **Download APK**:
   - Download the generated APK
   - Transfer to your phone
   - Install!

---

## **Option 2: Using Cordova CLI (Local Build)**

### Prerequisites:
- Node.js installed
- Java JDK 11+
- Android SDK installed

### Steps:

```bash
# 1. Install Cordova globally
npm install -g cordova

# 2. Create Cordova project
cordova create mbook-app com.mbook.app Mbook
cd mbook-app

# 3. Add Android platform
cordova platform add android

# 4. Copy the web app
rm -rf www/*
# Copy the dist/public folder contents here

# 5. Build APK
cordova build android --release

# 6. Find APK
# APK will be at: platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk
```

---

## **Option 3: Using Expo (React Native)**

### Steps:

1. **Install Expo CLI**:
   ```bash
   npm install -g expo-cli
   ```

2. **Create Expo project**:
   ```bash
   expo init mbook-app
   cd mbook-app
   ```

3. **Build APK**:
   ```bash
   eas build --platform android
   ```

4. **Download and install**

---

## **Installation on Android Phone**

Once you have the APK file:

1. **Transfer APK to phone** (USB cable or cloud storage)
2. **Enable Unknown Sources**:
   - Go to: Settings → Security → Unknown Sources
   - Toggle: **ON**
3. **Install**:
   - Open file manager
   - Find `mbook-app.apk`
   - Tap to install
4. **Launch**:
   - Open Mbook app
   - Start tracking! 🎉

---

## **📦 Project Structure**

```
M-Book/
├── client/                 # React frontend
│   ├── src/
│   │   ├── pages/         # App pages (Home, History, Summary, QR, Settings)
│   │   ├── components/    # UI components
│   │   └── App.tsx        # Main app component
│   └── public/            # Static files
├── dist/                   # Built web app (generated)
├── package.json           # Dependencies
└── app.json              # Cordova/Expo config
```

---

## **🚀 Features**

✅ Work entry tracking  
✅ Payment status management (Paid/Unpaid/Undecided)  
✅ QR code upload and display  
✅ Income analytics & reports  
✅ Local data storage (no cloud sync)  
✅ Dark theme with amber accents  
✅ Fast & lightweight  
✅ Complete privacy  

---

## **🔒 Privacy & Security**

- ✅ No cloud synchronization
- ✅ Works completely offline
- ✅ No ads or tracking
- ✅ All data stored locally on your device

---

## **📞 Support**

If you have issues building the APK:

1. Check the official Cordova docs: https://cordova.apache.org/
2. Try PhoneGap Build (easiest option)
3. Check Android SDK installation

---

**Enjoy using Mbook!** 🎉
