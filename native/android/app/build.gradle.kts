plugins {
 id("com.android.application")
}
android {
 namespace = "com.goreecloud.gcui.preview"
 buildFeatures { buildConfig = true }
 compileSdk = 36
 defaultConfig {
  applicationId = "com.goreecloud.gcui.preview"
  minSdk = 26
  targetSdk = 35
  versionCode = 1
  versionName = "0.1.0-alpha"
 }
 compileOptions {
  sourceCompatibility = JavaVersion.VERSION_17
  targetCompatibility = JavaVersion.VERSION_17
 }
}
dependencies {
 implementation("androidx.webkit:webkit:1.14.0")
}
val syncWeb by tasks.registering(Exec::class) {
 workingDir = rootProject.projectDir
 commandLine("node", "scripts/sync-web-assets.mjs")
}
tasks.named("preBuild") { dependsOn(syncWeb) }
