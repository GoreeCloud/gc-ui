package com.goreecloud.ui.material3

import android.os.Build
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp

enum class GoreeAccent(val id: String) {
    Iris("iris"), Lagoon("lagoon"), Ember("ember"), Moss("moss")
}

@Immutable
data class GoreeSemanticColors(
    val canvas: Color, val surface: Color, val tonalSurface: Color,
    val lensSolid: Color, val positive: Color, val onPositive: Color,
    val warning: Color, val onWarning: Color, val negative: Color,
    val onNegative: Color, val focusRing: Color
)

private val LocalGoreeColors = staticCompositionLocalOf<GoreeSemanticColors> {
    error("GoreeCloudExpressiveTheme must wrap its UI")
}
object GoreeCloudTheme {
    val colors: GoreeSemanticColors
        @Composable get() = LocalGoreeColors.current
}

private val GoreeShapes = Shapes(
    extraSmall = RoundedCornerShape(12.dp),
    small = RoundedCornerShape(12.dp),
    medium = RoundedCornerShape(18.dp),
    large = RoundedCornerShape(26.dp),
    extraLarge = RoundedCornerShape(36.dp)
)

private fun paletteScheme(t: Map<String, Long>, dark: Boolean): ColorScheme {
    fun c(role: String) = Color(t.getValue(role))
    val base = if (dark) darkColorScheme() else lightColorScheme()
    // No invented tertiary/secondary palette: GC UI only publishes brand roles.
    return base.copy(
        primary = c("brand"), onPrimary = c("on-brand"),
        primaryContainer = c("brand-container"),
        onPrimaryContainer = c("on-brand-container"),
        secondary = c("brand"), onSecondary = c("on-brand"),
        secondaryContainer = c("brand-container"),
        onSecondaryContainer = c("on-brand-container"),
        tertiary = c("brand"), onTertiary = c("on-brand"),
        background = c("canvas"), onBackground = c("text"),
        surface = c("surface"), onSurface = c("text"),
        surfaceVariant = c("surface-tonal"), onSurfaceVariant = c("text-soft"),
        outline = c("outline"), outlineVariant = c("outline-soft"),
        error = c("negative"), onError = c("on-negative"),
        surfaceTint = c("brand")
    )
}

/**
 * Android Material 3 Expressive, driven by canonical GoreeCloud UI semantic tokens.
 * Dynamic wallpaper color is opt-in; reduced motion must be sourced from user/system
 * preferences by the consuming application. No storage, network or tracking here.
 */
@Composable
fun GoreeCloudExpressiveTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    accent: GoreeAccent = GoreeAccent.Iris,
    dynamicWallpaperColors: Boolean = false,
    reduceMotion: Boolean = false,
    content: @Composable () -> Unit
) {
    val context = LocalContext.current
    val t = remember(accent, darkTheme) {
        GeneratedGoreePalettes.palettes.getValue(accent.id + "/" + if (darkTheme) "dark" else "light")
    }
    fun c(role: String) = Color(t.getValue(role))
    val colors = remember(t) {
        GoreeSemanticColors(
            c("canvas"), c("surface"), c("surface-tonal"), c("lens-solid"),
            c("positive"), c("on-positive"), c("warning"), c("on-warning"),
            c("negative"), c("on-negative"), c("focus-ring")
        )
    }
    val scheme = if (dynamicWallpaperColors && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
        if (darkTheme) dynamicDarkColorScheme(context) else dynamicLightColorScheme(context)
    } else remember(t, darkTheme) { paletteScheme(t, darkTheme) }
    CompositionLocalProvider(LocalGoreeColors provides colors) {
        MaterialTheme(
            colorScheme = scheme,
            typography = Typography(),
            shapes = GoreeShapes,
            motionScheme = if (reduceMotion) MotionScheme.standard() else MotionScheme.expressive(),
            content = content
        )
    }
}
