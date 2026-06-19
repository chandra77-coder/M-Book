# 📱 Mbook - Work & Income Tracking App

**Mbook** is a mobile app designed to help you track your work entries, manage payments, and analyze your earnings.

## ✨ Features

- **📊 Dashboard**: Real-time overview of today's earnings, pending payments, and undecided work
- **📝 Work Tracking**: Log work entries with service type, customer name, and amount
- **💰 Payment Management**: Track payments as Paid, Unpaid, or Undecided
- **📱 QR Code**: Display your payment QR code and log payments received
- **📈 Analytics**: Weekly income charts, service breakdown, and cash vs online payment analysis
- **💾 Local Storage**: All data stored securely on your device
- **🌙 Dark Theme**: Easy on the eyes with professional dark UI

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- pnpm package manager
- Android Studio (for local Android builds)

### Installation

```bash
# Clone the repository
git clone https://github.com/chandra77-coder/M-Book.git
cd M-Book

# Install dependencies
pnpm install

# Run development server
pnpm run dev

# Build for production (also syncs assets to Android project)
pnpm run build
```

## 📦 Building APK

The APK is automatically built and released via GitHub Actions whenever you push to the `main` branch.

### Download APK
1. Go to the [Releases](https://github.com/chandra77-coder/M-Book/releases) page
2. Download the latest `mbook-app.apk` file
3. Transfer to your Android phone
4. Install the APK (enable "Unknown Sources" in Settings if needed)

### Manual Local Android Build
```bash
# 1. Build the web app and sync assets
pnpm run build

# 2. Build the Android app using Gradle
cd android
./gradlew assembleDebug
```
The APK will be located at `android/app/build/outputs/apk/debug/app-debug.apk`.

## 📱 App Structure

```
├── client/                       # React frontend source
├── android/                      # Native Android wrapper
│   └── app/src/main/assets/      # Compiled web assets (synced on build)
├── shared/                       # Shared constants and types
├── dist/                         # Compiled web app (production build)
└── package.json                  # Project dependencies and scripts
```

## 🎨 Design

- **Theme**: Dark mode with amber accents
- **Colors**: 
  - Earned: Green (#10b981)
  - Pending: Red (#ef4444)
  - Undecided: Amber (#f59e0b)
  - Cash: Teal (#14b8a6)
  - Online: Sky (#0ea5e9)

## 💾 Data Storage

All data is stored locally in your device's browser storage (localStorage). No data is sent to any server.

### Backup & Restore
- **Export**: Go to Settings → Export Backup (JSON) to download your data
- **Import**: Go to Settings → Import Backup to restore from a JSON file

## 🔧 Technologies

- **Frontend**: React 19 + TypeScript
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui
- **Icons**: Lucide React
- **Charts**: Recharts
- **Build**: Vite
- **Mobile**: Native Android WebView Wrapper

## 📄 License

MIT License - feel free to use and modify

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

## 📧 Support

For issues or questions, please open an issue on GitHub.

---

**Made with ❤️ by Mbook Team**
