# Build a local release APK from the project root.

param()

$ErrorActionPreference = "Stop"

$scriptDir = if ($PSScriptRoot) { $PSScriptRoot } else { Split-Path -Parent $MyInvocation.MyCommand.Path }
Set-Location $scriptDir

Write-Host "Building release APK from: $scriptDir" -ForegroundColor Green

$androidStudioJbr = "C:\Program Files\Android\Android Studio\jbr"
if (-not $env:JAVA_HOME -and (Test-Path $androidStudioJbr)) {
    $env:JAVA_HOME = $androidStudioJbr
    $env:Path = "$env:JAVA_HOME\bin;$env:Path"
    Write-Host "JAVA_HOME set to Android Studio JBR" -ForegroundColor Green
}

if (-not $env:ANDROID_HOME) {
    $defaultSdk = Join-Path $env:LOCALAPPDATA "Android\Sdk"
    if (Test-Path $defaultSdk) {
        $env:ANDROID_HOME = $defaultSdk
        $env:ANDROID_SDK_ROOT = $defaultSdk
        Write-Host "ANDROID_HOME set to $defaultSdk" -ForegroundColor Green
    }
}

if (-not $env:JAVA_HOME) {
    throw "JAVA_HOME is not set and Android Studio JBR was not found."
}

if (-not $env:ANDROID_HOME) {
    throw "ANDROID_HOME is not set and the default Android SDK folder was not found."
}

$localProperties = Join-Path $scriptDir "android\local.properties"
$escapedSdk = $env:ANDROID_HOME.Replace("\", "\\").Replace(":", "\:")
Set-Content -Path $localProperties -Value "sdk.dir=$escapedSdk" -Encoding ASCII

Push-Location (Join-Path $scriptDir "android")
try {
    & .\gradlew.bat assembleRelease
    if ($LASTEXITCODE -ne 0) {
        exit $LASTEXITCODE
    }
} finally {
    Pop-Location
}

$apkPath = Join-Path $scriptDir "android\app\build\outputs\apk\release\app-release.apk"
if (Test-Path $apkPath) {
    Write-Host "APK built successfully: $apkPath" -ForegroundColor Green
} else {
    throw "Gradle completed, but APK was not found at $apkPath"
}
