plugins {
    id("com.android.library")
    id("org.jetbrains.kotlin.plugin.compose")
}
android {
    namespace = "com.goreecloud.ui.material3"
    compileSdk {
        version = release(37) { minorApiLevel = 1 }
    }
    defaultConfig { minSdk = 26 }
    buildFeatures { compose = true }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
}
dependencies {
    implementation("androidx.compose.ui:ui:1.13.0")
    implementation("androidx.compose.foundation:foundation:1.13.0")
    implementation("androidx.compose.material3:material3:1.5.0")
}
