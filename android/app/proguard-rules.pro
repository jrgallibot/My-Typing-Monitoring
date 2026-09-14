# Add project specific ProGuard rules here.

# React Native - Keep native library loading classes
-keep class com.facebook.react.internal.featureflags.** { *; }
-keep class com.facebook.soloader.** { *; }

# Prevent issues with native library loading
-keepclassmembers class * {
    native <methods>;
}
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# React Native
-keep,allowobfuscation @interface com.facebook.proguard.annotations.DoNotStrip
-keep,allowobfuscation @interface com.facebook.proguard.annotations.KeepGettersAndSetters
-keep @com.facebook.proguard.annotations.DoNotStrip class *
-keepclassmembers class * {
    @com.facebook.proguard.annotations.DoNotStrip *;
}
-keepclassmembers @com.facebook.proguard.annotations.KeepGettersAndSetters class * {
  void set*(***);
  *** get*();
}

# JavaMail API
-keep class javax.mail.** { *; }
-keep class javax.activation.** { *; }
-keep class com.sun.mail.** { *; }
-dontwarn javax.mail.**
-dontwarn javax.activation.**

# Room
-keep class * extends androidx.room.RoomDatabase
-keep @androidx.room.Entity class *
-dontwarn androidx.room.paging.**

# WorkManager
-keep class androidx.work.** { *; }
-dontwarn androidx.work.**

# Keep native modules
-keep class com.mytypingmonitor.** { *; }

# CRITICAL: Remove/disable the problematic React Native feature flags class
# that tries to load libreact_featureflagsjni.so when new architecture is disabled
-assumenosideeffects class com.facebook.react.internal.featureflags.ReactNativeFeatureFlagsCxxInterop {
    <clinit>();
}
# Prevent the class from being loaded
-keep class !com.facebook.react.internal.featureflags.ReactNativeFeatureFlagsCxxInterop { *; }
-dontwarn com.facebook.react.internal.featureflags.ReactNativeFeatureFlagsCxxInterop
