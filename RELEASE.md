# SweatFlix Release & EAS Build Guide

This guide gives you exact copy-paste steps to build installable versions of **SweatFlix** for your real phone (both Android and iOS) without requiring Expo Go.

---

## 📋 Prerequisites

Install the official EAS CLI:
```bash
npm install -g eas-cli
```
*(Or run commands using `npx eas-cli@latest <command>` without global installation).*

Log in to your Expo account:
```bash
eas login
```
*(Create a free account at [expo.dev](https://expo.dev) if you do not have one).*

---

## 📱 1. Build Android Standalone APK (Install Directly on Phone)

The `preview` profile in [`eas.json`](./eas.json) is configured with `"buildType": "apk"`. EAS builds a standalone `.apk` in the cloud that you can install directly on any Android phone.

### Step 1: Run the Preview APK Build
```bash
eas build --platform android --profile preview
```
- EAS will upload your project and build it in the Expo cloud.
- Live build progress is visible directly in your terminal and on your [Expo Dashboard](https://expo.dev).

### Step 2: Install the APK on Your Phone
1. When the build finishes (typically 5–10 minutes), EAS prints a **QR code** and a **download link**.
2. **Scan the QR code** with your phone's camera, or open the download link in your phone's browser (Chrome).
3. Tap the downloaded `.apk` file to install.
   - If Android asks: toggle *"Allow from this source"* (allow unknown apps for Chrome/Files).
4. Tap **Open** — SweatFlix is now running natively as a standalone app!

---

## 🛠️ 2. Build & Run the Development Client (`expo-dev-client`)

The development build includes all native modules (`expo-video`, native gesture handlers, splash screen) while still giving you live reload and the Metro debugging experience.

### Step 1: Build the Dev Client APK
```bash
eas build --platform android --profile development
```
- Download and install the resulting development build APK on your phone.

### Step 2: Start Metro in Dev Client Mode
On your computer:
```bash
npx expo start --dev-client
```

### Step 3: Connect Your Phone
- Open the installed **SweatFlix Dev Build** on your phone.
- It will automatically discover your computer on the local network, or scan the terminal QR code to connect with live code reloading.

---

## 🔐 3. Setting Environment Variables on EAS (Instead of Committing `.env`)

Never commit private credentials to git. You can set environment variables securely in your Expo project dashboard or via CLI:

```bash
# Preview build environment
eas env:create --environment preview --name EXPO_PUBLIC_SUPABASE_URL --value "https://ylkfddrtocsbnfvwewei.supabase.co"
eas env:create --environment preview --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "sb_publishable_ySHAccZKvQptbsZy0aOdDg_U2f_hJx0"
eas env:create --environment preview --name EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME --value "dkpv0eax8"
eas env:create --environment preview --name EXPO_PUBLIC_SHOW_TEST_TOOLS --value "true"

# Production build environment (test tools disabled)
eas env:create --environment production --name EXPO_PUBLIC_SUPABASE_URL --value "https://ylkfddrtocsbnfvwewei.supabase.co"
eas env:create --environment production --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "sb_publishable_ySHAccZKvQptbsZy0aOdDg_U2f_hJx0"
eas env:create --environment production --name EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME --value "dkpv0eax8"
eas env:create --environment production --name EXPO_PUBLIC_SHOW_TEST_TOOLS --value "false"
```

> ⚠️ **Security Rule**: Use only the public `anon` key in client apps. Never add `service_role` keys to client builds.

---

## 🚀 4. Google Play Store & Apple TestFlight / App Store

### Google Play Internal Testing & Store (Android App Bundle - `.aab`)
```bash
# 1. Build production AAB
eas build --platform android --profile production

# 2. Submit to Google Play Console
eas submit --platform android
```

### Apple TestFlight & App Store (iOS)
```bash
# 1. Build production IPA (requires Apple Developer Program membership)
eas build --platform ios --profile production

# 2. Submit directly to TestFlight
eas submit --platform ios
```

---

## ⚙️ 5. What You Must Change by Hand Before Publishing

1. **Package Name & Bundle Identifier**:
   - In [`app.json`](./app.json), change `com.sweatflix.app` to a globally unique reverse-domain identifier (e.g. `com.yourname.sweatflix`). Google Play and Apple App Store reject bundle IDs already claimed by someone else.
2. **App Icons & Splash**:
   - Final artwork can replace [`assets/images/icon.png`](./assets/images/icon.png), [`assets/images/android-icon-foreground.png`](./assets/images/android-icon-foreground.png), and [`assets/images/splash-icon.png`](./assets/images/splash-icon.png).
3. **EAS Project ID**:
   - If building under your own Expo account for the first time, run `eas init` to link your own Expo project ID.
4. **Google Sign-In OAuth**:
   - For Google Sign-in to complete the callback, configure your Google Cloud Console OAuth 2.0 client with redirect scheme `sweatflix://login`.
