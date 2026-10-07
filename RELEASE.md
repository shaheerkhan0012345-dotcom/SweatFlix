# SweatFlix Release & EAS Build Guide

This document provides exact, copy-paste commands to build, install, and deploy SweatFlix to real devices (Android APK & iOS) using Expo Application Services (EAS).

---

## 📱 Quick Start: Build Android APK for Your Phone

The `preview` profile in [`eas.json`](./eas.json) is configured with `"buildType": "apk"`. EAS will compile a standalone `.apk` in the cloud that you can install directly on your Android phone without using Expo Go or Android Studio.

### Step 1: Install EAS CLI (if not already installed)
```bash
npm install -g eas-cli
```

### Step 2: Log in to Expo
```bash
eas login
```
*(Enter your Expo account credentials, or sign up for free at [expo.dev](https://expo.dev)).*

### Step 3: Link Project to EAS (One-time only)
```bash
eas build:configure
```
*(Select "All platforms" when prompted. It will generate or verify your project ID).*

### Step 4: Run the Android Preview Build
```bash
eas build --platform android --profile preview
```
- EAS will upload your code and run the build in the Expo cloud.
- You can watch live logs in your terminal or on your [Expo Dashboard](https://expo.dev).
- When the build finishes (usually 5–10 minutes), EAS will display a **download link** and a **QR code**.

### Step 5: Install the APK on Your Phone
1. **Via QR Code**: Scan the QR code shown in the terminal with your phone's camera.
2. **Via Download Link**: Open the `.apk` download URL on your phone's mobile browser (Chrome/Samsung Internet).
3. Tap the downloaded `.apk` file to install it.
   - If prompted: Allow *"Install unknown apps"* for your browser.
4. Open **SweatFlix**! You are now running the native standalone mobile app.

---

## 🔐 Managing Environment Variables on EAS

To keep API keys and secrets secure without hardcoding them in files:

### Setting Environment Variables with `eas env`
```bash
# Set Supabase Project URL for the preview build
eas env:create --environment preview --name EXPO_PUBLIC_SUPABASE_URL --value "https://ylkfddrtocsbnfvwewei.supabase.co"

# Set Supabase Anon Public Key for the preview build
eas env:create --environment preview --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "sb_publishable_ySHAccZKvQptbsZy0aOdDg_U2f_hJx0"

# Enable developer test buttons (test premium, reset ads) in preview
eas env:create --environment preview --name EXPO_PUBLIC_SHOW_TEST_TOOLS --value "true"
```

For production builds:
```bash
eas env:create --environment production --name EXPO_PUBLIC_SUPABASE_URL --value "https://ylkfddrtocsbnfvwewei.supabase.co"
eas env:create --environment production --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "sb_publishable_ySHAccZKvQptbsZy0aOdDg_U2f_hJx0"
eas env:create --environment production --name EXPO_PUBLIC_SHOW_TEST_TOOLS --value "false"
```

> **Important**: Never add a `service_role` key to client apps or EAS client builds. Client apps only need the public `anon` key.

---

## ⚡ Over-The-Air (OTA) Updates with `eas update`

You don't need to rebuild and reinstall an APK every time you fix a bug or change UI:

### How to ship an instant JavaScript fix:
```bash
eas update --channel preview --message "Fix profile stats and layout spacing"
```
- The next time the user opens the app, it automatically downloads and applies the latest update in the background.

### When is a new native build (`eas build`) required?
A full new build is required only when you:
1. Add or upgrade a library that contains native code (e.g. native video players, camera, haptics).
2. Change native settings in `app.json` (such as `android.package`, `ios.bundleIdentifier`, app icons, splash screen, or permissions).
3. Upgrade the Expo SDK version.

For all other changes (screens, components, translations, styles, SQL schema, Supabase queries), `eas update` is instant!

---

## 🍎 Optional: iOS TestFlight & Google Play Store Builds

### 1. Google Play Store (Production AAB)
```bash
eas build --platform android --profile production
```
- Builds an Android App Bundle (`.aab`) ready for upload to Google Play Console.
- To submit directly to Google Play:
  ```bash
  eas submit --platform android
  ```

### 2. Apple iOS (TestFlight & App Store)
```bash
eas build --platform ios --profile production
```
- Requires an active Apple Developer Program membership ($99/yr).
- Automatically manages certificates and provisioning profiles.
- To submit directly to TestFlight:
  ```bash
  eas submit --platform ios
  ```

---

## ⚙️ Manual Configuration Checklist Before Production

Before publishing to public stores (Google Play & Apple App Store):

1. **Unique Package / Bundle ID**:
   - In [`app.json`](./app.json), change `com.sweatflix.app` to your own unique domain ID (e.g. `com.yourcompany.sweatflix`).
2. **App Icons & Splash**:
   - The app currently uses the generated SweatFlix flame logo in [`assets/images/icon.png`](./assets/images/icon.png). If you have final custom vector artwork from a designer, replace `icon.png`, `splash-icon.png`, and `android-icon-foreground.png`.
3. **Google Sign-In OAuth**:
   - If you want Google login in production, create an OAuth 2.0 Client ID in Google Cloud Console, add the redirect URI `sweatflix://`, and enable Google provider in your Supabase Auth dashboard.
