# Required Assets for Expo

You need to create these asset files for Expo configuration:

## Required Assets

### 1. `assets/icon.png`
- **Size**: 1024x1024 pixels
- **Format**: PNG
- **Purpose**: App icon
- **Location**: `./assets/icon.png`

### 2. `assets/splash.png`
- **Size**: 1242x2436 pixels (or similar)
- **Format**: PNG
- **Purpose**: Splash screen
- **Background**: #6200ee (purple)
- **Location**: `./assets/splash.png`

### 3. `assets/adaptive-icon.png`
- **Size**: 1024x1024 pixels
- **Format**: PNG
- **Purpose**: Android adaptive icon foreground
- **Location**: `./assets/adaptive-icon.png`

### 4. `assets/favicon.png` (optional)
- **Size**: 48x48 pixels
- **Format**: PNG
- **Purpose**: Web favicon
- **Location**: `./assets/favicon.png`

## Quick Solution

You can use placeholder images for now:

```bash
# Create assets directory
mkdir -p assets

# Use any 1024x1024 PNG as icon (or create one)
# Use any splash screen image
```

Or use Expo's asset generation:

```bash
npx expo install @expo/vector-icons
```

## Temporary Workaround

If you don't have assets yet, you can temporarily comment out the asset references in `app.json`:

```json
{
  "expo": {
    "icon": "./assets/icon.png",  // Comment this if missing
    "splash": { ... },            // Comment this if missing
    "adaptiveIcon": { ... }       // Comment this if missing
  }
}
```

But Expo will warn you. It's better to create placeholder images.

## Generate Assets Online

You can use online tools to generate these:
- https://www.appicon.co/
- https://www.favicon-generator.org/
- Or create simple colored squares as placeholders

