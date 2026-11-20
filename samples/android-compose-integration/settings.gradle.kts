pluginManagement {
    repositories { google(); mavenCentral(); gradlePluginPortal() }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories { google(); mavenCentral() }
}
rootProject.name = "GoreeCloudUIAndroidInterop"
include(":app")

// Local source composite only. Coordinates below are substitution identifiers,
// not published Maven packages.
includeBuild("../../compose-multiplatform") {
    dependencySubstitution {
        substitute(module("com.goreecloud.ui:shared-compose")).using(project(":gc-ui-compose"))
    }
}
includeBuild("../../android/material3-expressive") {
    dependencySubstitution {
        substitute(module("com.goreecloud.ui:android-expressive")).using(project(":gc-ui-compose"))
    }
}
