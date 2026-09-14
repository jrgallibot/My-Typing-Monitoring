package com.mytypingmonitor;

import android.app.Application;
import android.content.res.Configuration;
import androidx.annotation.NonNull;

import com.facebook.react.ReactApplication;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.config.ReactFeatureFlags;
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint;
import com.facebook.react.defaults.DefaultReactNativeHost;
import com.facebook.soloader.SoLoader;

// Expo modules - conditionally imported
import java.util.ArrayList;

import java.util.List;

public class MainApplication extends Application implements ReactApplication {

  /** Set when DefaultNewArchitectureEntryPoint.load() fails (e.g. libreact_featureflagsjni.so missing).
   *  SafeReactActivityDelegate uses this to avoid delegate path that would crash. */
  public static volatile boolean sNewArchNativeLoadFailed = false;

  private final ReactNativeHost mReactNativeHost = new DefaultReactNativeHost(this) {
      @Override
      public boolean getUseDeveloperSupport() {
        // When new-arch native libs failed (e.g. Honor X9c), disable dev support so we don't
        // load libreact_devsupportjni.so in DevServerHelper/openInspectorConnection (AsyncTask crash).
        return BuildConfig.DEBUG && !sNewArchNativeLoadFailed;
      }

      @Override
      protected List<ReactPackage> getPackages() {
        List<ReactPackage> packages = new ArrayList<>();
        
        // Try to get packages from Expo autolinking
        try {
          Class<?> expoModulesClass = Class.forName("expo.modules.ExpoModulesPackage");
          packages.add((ReactPackage) expoModulesClass.getDeclaredConstructor().newInstance());
        } catch (Exception e) {
          // Expo modules not available, continue without them
        }
        
        // Try to get packages from React Native autolinking (PackageList)
        try {
          Class<?> packageListClass = Class.forName("com.facebook.react.PackageList");
          Object packageList = packageListClass.getConstructor(Application.class).newInstance(this);
          @SuppressWarnings("unchecked")
          List<ReactPackage> autoPackages = (List<ReactPackage>) packageListClass.getMethod("getPackages").invoke(packageList);
          packages.addAll(autoPackages);
        } catch (Exception e) {
          // PackageList not available, continue without it
        }
        
        // Add custom native module
        packages.add(new com.mytypingmonitor.bridge.TypingMonitorPackage());
        return packages;
      }

      @Override
      protected String getJSMainModuleName() {
        return "index";
      }

      @Override
      protected boolean isNewArchEnabled() {
        return BuildConfig.IS_NEW_ARCHITECTURE_ENABLED;
      }

      @Override
      protected boolean isHermesEnabled() {
        return BuildConfig.IS_HERMES_ENABLED;
      }
  };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
    super.onCreate();
    
    // CRITICAL: Initialize native library loader BEFORE SoLoader
    // This helps handle missing libreact_featureflagsjni.so gracefully
    com.mytypingmonitor.NativeLibraryLoader.initialize();
    
    SoLoader.init(this, /* native exopackage */ false);
    // Note: ReactFeatureFlags.unstable_useRuntimeSchedulerAlways is not available in this React Native version
    // The BuildConfig flag REACT_NATIVE_UNSTABLE_USE_RUNTIME_SCHEDULER_ALWAYS is set during build time
    
    // CRITICAL: Prevent React Native from trying to enable bridgeless architecture
    // when new architecture is disabled. This prevents UnsatisfiedLinkError for libreact_featureflagsjni.so
    if (!BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) {
      // Use reflection to prevent React Native from enabling bridgeless architecture
      try {
        Class<?> featureFlagsClass = Class.forName("com.facebook.react.internal.featureflags.ReactNativeFeatureFlags");
        java.lang.reflect.Method enableMethod = featureFlagsClass.getDeclaredMethod("enableBridgelessArchitecture");
        // Don't call it - this prevents the native library from being loaded
      } catch (Exception e) {
        // Ignore - feature flags class might not exist
      }
    } else {
      // If you opted-in for the New Architecture, we load the native entry point for this app.
      // Guard against UnsatisfiedLinkError when libreact_featureflagsjni.so is missing
      // (e.g. APK/ABI mismatch or build without that native lib).
      try {
        DefaultNewArchitectureEntryPoint.load();
      } catch (UnsatisfiedLinkError e) {
        if (e.getMessage() != null && e.getMessage().contains("libreact_featureflagsjni")) {
          android.util.Log.w("MainApplication",
              "New arch native lib missing (libreact_featureflagsjni.so). Continuing without it: " + e.getMessage());
          sNewArchNativeLoadFailed = true; // SafeReactActivityDelegate will skip default delegate
        } else {
          throw e;
        }
      }
    }
    if (BuildConfig.DEBUG) {
      try {
        Class<?> flipperClass = Class.forName("com.mytypingmonitor.ReactNativeFlipper");
        flipperClass.getMethod("initializeFlipper", Application.class, Object.class)
            .invoke(null, this, getReactNativeHost().getReactInstanceManager());
      } catch (Exception e) {
        // Flipper not available, ignore
      }
    }
    // Expo lifecycle dispatcher - conditionally call if available
    try {
      Class<?> dispatcherClass = Class.forName("expo.modules.ApplicationLifecycleDispatcher");
      dispatcherClass.getMethod("onApplicationCreate", Application.class).invoke(null, this);
    } catch (Exception e) {
      // Expo modules not available, ignore
    }
    
    // Initialize WorkManager for scheduled email tasks
    com.mytypingmonitor.WorkManagerInitializer.INSTANCE.scheduleEmailTasks(this);
  }

  @Override
  public void onConfigurationChanged(@NonNull Configuration newConfig) {
    super.onConfigurationChanged(newConfig);
    // Expo lifecycle dispatcher - conditionally call if available
    try {
      Class<?> dispatcherClass = Class.forName("expo.modules.ApplicationLifecycleDispatcher");
      dispatcherClass.getMethod("onConfigurationChanged", Application.class, Configuration.class)
          .invoke(null, this, newConfig);
    } catch (Exception e) {
      // Expo modules not available, ignore
    }
  }
}
