# Build APK Now with EAS (No Device Needed!)

## Quick Commands

```powershell
# 1. Login to Expo (if not already)
eas login

# 2. Configure EAS (first time only - creates eas.json)
eas build:configure

# 3. Build development APK in the cloud
eas build --profile development --platform android
```

## What Happens

1. **EAS uploads your project** to Expo's servers
2. **Builds the APK** in the cloud (5-10 minutes)
3. **Provides download URL** when complete
4. **Download APK** to your computer or phone
5. **Install on device** (allow "Install from Unknown Sources")

## After Installation

1. **Start dev server**:
   ```powershell
   npx expo start --dev-client
   ```

2. **Scan QR code** with the installed app (not Expo Go!)

3. **App reloads** with your latest code

## Check Build Status

```powershell
# See all builds
eas build:list

# See specific build details
eas build:view [build-id]
```

## That's It!

No device, no emulator, no Android Studio needed. Just run the EAS build command and wait for the APK!

