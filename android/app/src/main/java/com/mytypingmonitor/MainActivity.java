package com.mytypingmonitor;

import android.os.Build;
import android.os.Bundle;

import com.facebook.react.ReactActivity;
import com.facebook.react.ReactActivityDelegate;
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint;
import com.facebook.react.defaults.DefaultReactActivityDelegate;

public class MainActivity extends ReactActivity {
  @Override
  protected void onCreate(Bundle savedInstanceState) {
    // Set the theme to AppTheme BEFORE onCreate to support 
    // coloring the background, status bar, and navigation bar.
    // This is required for expo-splash-screen.
    setTheme(R.style.AppTheme);
    
    // CRITICAL: Initialize native library loader BEFORE calling super.onCreate()
    // This helps handle missing libreact_featureflagsjni.so gracefully
    com.mytypingmonitor.NativeLibraryLoader.initialize();
    
    // Wrap super.onCreate() in try-catch to handle UnsatisfiedLinkError
    // The error happens in a static initializer, but we can catch it here
    try {
      super.onCreate(savedInstanceState);
    } catch (UnsatisfiedLinkError e) {
      if (e.getMessage() != null && e.getMessage().contains("libreact_featureflagsjni.so")) {
        // This is the known React Native 0.81.5 bug - try to continue anyway
        android.util.Log.e("MainActivity", 
          "Caught UnsatisfiedLinkError for libreact_featureflagsjni.so (React Native 0.81.5 bug). " +
          "Attempting to continue without this library...");
        // Try to manually initialize React Native
        try {
          // Get the delegate and manually initialize
          ReactActivityDelegate delegate = createReactActivityDelegate();
          if (delegate != null) {
            delegate.onCreate(savedInstanceState);
          }
        } catch (Exception initError) {
          android.util.Log.e("MainActivity", 
            "Failed to initialize React Native manually: " + initError.getMessage());
          // Re-throw the original error
          throw e;
        }
      } else {
        // Different error, re-throw
        throw e;
      }
    }
  }

  /**
   * Returns the name of the main component registered from JavaScript.
   * This is used to schedule rendering of the component.
   */
  @Override
  protected String getMainComponentName() {
    return "main";
  }

  /**
   * Returns the instance of the {@link ReactActivityDelegate}. Here we use a util class {@link
   * DefaultReactActivityDelegate} which allows you to easily enable Fabric and Concurrent React
   * (aka React 18) with two boolean flags.
   */
  @Override
  protected ReactActivityDelegate createReactActivityDelegate() {
    // Use BuildConfig to determine if new architecture is enabled
    // This prevents loading native libraries when new architecture is disabled
    boolean fabricEnabled = BuildConfig.IS_NEW_ARCHITECTURE_ENABLED;
    
    // Use our custom SafeReactActivityDelegate to prevent native library loading errors
    // This avoids UnsatisfiedLinkError for libreact_featureflagsjni.so
    SafeReactActivityDelegate safeDelegate = new SafeReactActivityDelegate(
        this,
        getMainComponentName(),
        fabricEnabled);
    
    // Try to use Expo wrapper if available
    try {
      Class<?> wrapperClass = Class.forName("expo.modules.ReactActivityDelegateWrapper");
      return (ReactActivityDelegate) wrapperClass.getConstructor(
          ReactActivity.class, boolean.class, ReactActivityDelegate.class)
          .newInstance(this, fabricEnabled, safeDelegate);
    } catch (Exception e) {
      // Expo wrapper not available, use our safe delegate
      return safeDelegate;
    }
  }

  /**
   * Align the back button behavior with Android S
   * where moving root activities to background instead of finishing activities.
   * @see <a href="https://developer.android.com/reference/android/app/Activity#onBackPressed()">onBackPressed</a>
   */
  @Override
  public void invokeDefaultOnBackPressed() {
    if (Build.VERSION.SDK_INT <= Build.VERSION_CODES.R) {
      if (!moveTaskToBack(false)) {
        // For non-root activities, use the default implementation to finish them.
        super.invokeDefaultOnBackPressed();
      }
      return;
    }

    // Use the default back button implementation on Android S
    // because it's doing more than {@link Activity#moveTaskToBack} in fact.
    super.invokeDefaultOnBackPressed();
  }
}
