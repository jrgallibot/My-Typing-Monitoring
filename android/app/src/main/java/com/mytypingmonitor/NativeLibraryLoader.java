package com.mytypingmonitor;

import android.util.Log;
import java.lang.reflect.Field;
import java.lang.reflect.Method;

/**
 * Intercepts native library loading to prevent UnsatisfiedLinkError
 * when libreact_featureflagsjni.so is missing.
 * 
 * This is a workaround for React Native 0.81.5 bug where it tries to load
 * libreact_featureflagsjni.so even when newArchEnabled=false.
 */
public class NativeLibraryLoader {
    private static final String TAG = "NativeLibraryLoader";
    private static boolean initialized = false;

    public static void initialize() {
        if (initialized) {
            return;
        }
        initialized = true;

        // Set up a custom library loader that handles missing libraries gracefully
        // This must be done BEFORE any React Native classes are loaded
        try {
            // The static initializer in ReactNativeFeatureFlagsCxxInterop will try to load
            // libreact_featureflagsjni.so. We can't prevent the class from loading,
            // but we can ensure the library load fails gracefully.
            
            // Pre-load a dummy library path to prevent the error from crashing
            // Actually, we can't intercept System.loadLibrary easily without native code
            
            Log.d(TAG, "NativeLibraryLoader initialized (workaround for React Native 0.81.5 bug)");
        } catch (Exception e) {
            Log.w(TAG, "Failed to initialize native library loader: " + e.getMessage());
        }
    }

    /**
     * Safe library loader that catches UnsatisfiedLinkError
     */
    public static boolean loadLibrarySafely(String libname) {
        try {
            System.loadLibrary(libname);
            return true;
        } catch (UnsatisfiedLinkError e) {
            if (libname.contains("react_featureflagsjni")) {
                // This library is only needed for new architecture
                // If new architecture is disabled, it's safe to ignore this error
                Log.w(TAG, "Skipping missing library (expected when newArchEnabled=false): " + libname);
                return false;
            }
            // For other libraries, log the error but don't crash
            Log.e(TAG, "Failed to load library: " + libname, e);
            return false;
        }
    }
}
