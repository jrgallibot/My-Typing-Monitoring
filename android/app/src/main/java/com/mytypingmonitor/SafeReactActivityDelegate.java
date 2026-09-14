package com.mytypingmonitor;

import android.app.Activity;
import android.os.Bundle;
import com.facebook.react.ReactActivity;
import com.facebook.react.ReactActivityDelegate;
import com.facebook.react.ReactRootView;
import com.facebook.react.defaults.DefaultReactActivityDelegate;

/**
 * Custom ReactActivityDelegate that prevents loading native libraries
 * when new architecture is disabled, avoiding UnsatisfiedLinkError.
 * 
 * CRITICAL: DefaultReactActivityDelegate.onCreate() triggers a static initializer
 * that tries to load libreact_featureflagsjni.so. We avoid this by not using
 * DefaultReactActivityDelegate when new architecture is disabled.
 */
public class SafeReactActivityDelegate extends ReactActivityDelegate {
    private final Activity activity;
    private DefaultReactActivityDelegate delegate;
    private final boolean fabricEnabled;

    public SafeReactActivityDelegate(Activity activity, String mainComponentName, boolean fabricEnabled) {
        super(activity, mainComponentName);
        this.activity = activity;
        this.fabricEnabled = fabricEnabled && com.mytypingmonitor.BuildConfig.IS_NEW_ARCHITECTURE_ENABLED;
        
        // Only create DefaultReactActivityDelegate if new arch is enabled AND native lib loaded.
        // If libreact_featureflagsjni.so failed to load (e.g. Honor/device ABI), skip delegate
        // to avoid NoClassDefFoundError/UnsatisfiedLinkError when opening the app.
        if (com.mytypingmonitor.BuildConfig.IS_NEW_ARCHITECTURE_ENABLED
            && !MainApplication.sNewArchNativeLoadFailed
            && activity instanceof ReactActivity) {
            this.delegate = new DefaultReactActivityDelegate((ReactActivity) activity, mainComponentName, this.fabricEnabled);
        }
    }

    @Override
    public void onCreate(Bundle savedInstanceState) {
        if (delegate != null) {
            // New architecture enabled: try default delegate. On Honor/some devices
            // libreact_featureflagsjni.so is missing -> NoClassDefFoundError. Catch and fallback.
            try {
                delegate.onCreate(savedInstanceState);
            } catch (NoClassDefFoundError | UnsatisfiedLinkError e) {
                String msg = e.getMessage() != null ? e.getMessage() : "";
                Throwable cause = e.getCause();
                if (cause != null && cause.getMessage() != null) msg += cause.getMessage();
                if (msg.contains("libreact_featureflagsjni") || msg.contains("ReactNativeFeatureFlagsCxxInterop")) {
                    MainApplication.sNewArchNativeLoadFailed = true;
                    this.delegate = null; // use manual path from now on
                    android.util.Log.w("SafeReactActivityDelegate",
                        "New arch native lib missing on device, using fallback init: " + e.getMessage());
                    runManualReactInit(savedInstanceState);
                } else {
                    throw e;
                }
            }
        } else {
            runManualReactInit(savedInstanceState);
        }
    }

    /** Manual React init when new-arch native lib is missing (e.g. Honor X9c). Do NOT call super.onCreate(). */
    private void runManualReactInit(Bundle savedInstanceState) {
        try {
            com.facebook.react.ReactInstanceManager instanceManager =
                getReactNativeHost().getReactInstanceManager();
            ReactRootView rootView = createRootView();
            if (rootView != null && instanceManager != null) {
                rootView.startReactApplication(instanceManager, getMainComponentName(), null);
                if (activity != null) {
                    activity.setContentView(rootView);
                }
            } else {
                android.util.Log.e("SafeReactActivityDelegate",
                    "Failed to initialize: rootView=" + rootView + ", instanceManager=" + instanceManager);
            }
        } catch (Exception e) {
            android.util.Log.e("SafeReactActivityDelegate",
                "Failed to initialize React Native manually: " + e.getMessage(), e);
        }
    }

    @Override
    protected ReactRootView createRootView() {
        if (delegate != null) {
            // Use reflection to access protected method
            try {
                java.lang.reflect.Method method = DefaultReactActivityDelegate.class.getDeclaredMethod("createRootView");
                method.setAccessible(true);
                return (ReactRootView) method.invoke(delegate);
            } catch (Exception e) {
                // Fallback to parent implementation
                return super.createRootView();
            }
        }
        return super.createRootView();
    }

    @Override
    protected boolean isFabricEnabled() {
        return fabricEnabled;
    }

    @Override
    public void onPause() {
        if (delegate != null) {
            delegate.onPause();
        } else {
            super.onPause();
        }
    }

    @Override
    public void onResume() {
        if (delegate != null) {
            delegate.onResume();
        } else {
            super.onResume();
        }
    }

    @Override
    public void onDestroy() {
        if (delegate != null) {
            delegate.onDestroy();
        } else {
            super.onDestroy();
        }
    }
}
