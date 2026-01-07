# Expo Development Build

This directory is created by Expo when you run development builds.

## Important Notes

- This app uses **expo-dev-client** (development builds)
- It **cannot** run in Expo Go due to custom native code
- You must build and install a development build first
- Then you can scan QR codes to connect to the dev server

## Quick Start

1. Build development build:
   ```bash
   npx expo run:android
   ```

2. Start dev server:
   ```bash
   npx expo start --dev-client
   ```

3. Scan QR code with the development build app (not Expo Go)

