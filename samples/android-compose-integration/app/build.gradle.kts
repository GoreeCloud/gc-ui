import org.gradle.api.JavaVersion

plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.plugin.compose")
}
android {
    namespace = "com.goreecloud.ui.samples.interop"
    compileSdk { version = release(37) { minorApiLevel = 1 } }
    defaultConfig {
        applicationId = "com.goreecloud.ui.samples.interop"
        minSdk = 26
        targetSdk = 36
        versionCode = 1
        versionName = "0.0.0-dev"
    }
    buildFeatures { compose = true }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
}
dependencies {
    // Explicit composite substitutions resolve to the two reviewed source projects.
    implementation("com.goreecloud.ui:shared-compose:0.0.0")
    implementation("com.goreecloud.ui:android-expressive:0.0.0")
    implementation("androidx.activity:activity-compose:1.13.0")
    implementation("androidx.compose.ui:ui:1.13.0")
    implementation("androidx.compose.foundation:foundation:1.13.0")
    implementation("androidx.compose.material3:material3:1.5.0")
}
