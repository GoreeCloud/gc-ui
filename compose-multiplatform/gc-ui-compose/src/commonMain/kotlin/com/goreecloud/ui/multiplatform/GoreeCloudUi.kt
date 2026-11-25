package com.goreecloud.ui.multiplatform

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.ColorScheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.Shapes
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.Immutable
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp

/** Kotlin UI accent choices are NOT a compulsory ecosystem-wide hue. */
enum class GoreeAccent(val id: String) {
    Iris("iris"), Lagoon("lagoon"), Ember("ember"), Moss("moss")
}

/** These semantic roles come from the canonical gc-ui token manifest. */
@Immutable
data class GoreeColorRoles(
    val canvas: Color,
    val surface: Color,
    val tonalSurface: Color,
    val text: Color,
    val supportingText: Color,
    val brand: Color,
    val onBrand: Color,
    val positive: Color,
    val warning: Color,
    val negative: Color,
    val focusRing: Color,
    val lensSolid: Color,
    val lensFill: Color,
    val onPositive: Color,
    val onWarning: Color,
    val onNegative: Color,
    val brandContainer: Color,
    val onBrandContainer: Color,
    val outline: Color,
    val outlineSoft: Color,
    val scrim: Color
)

object GoreeCloudTokens {
    fun colors(accent: GoreeAccent, dark: Boolean): GoreeColorRoles {
        val palette = GeneratedGoreePalettes.palettes.getValue(accent.id + "/" + if (dark) "dark" else "light")
        fun color(key: String) = Color(palette.getValue(key))
        return GoreeColorRoles(
            canvas = color("canvas"),
            surface = color("surface"),
            tonalSurface = color("surface-tonal"),
            text = color("text"),
            supportingText = color("text-soft"),
            brand = color("brand"),
            onBrand = color("on-brand"),
            positive = color("positive"),
            warning = color("warning"),
            negative = color("negative"),
            focusRing = color("focus-ring"),
            lensSolid = color("lens-solid"),
            lensFill = color("lens-fill"),
            onPositive = color("on-positive"),
            onWarning = color("on-warning"),
            onNegative = color("on-negative"),
            brandContainer = color("brand-container"),
            onBrandContainer = color("on-brand-container"),
            outline = color("outline"),
            outlineSoft = color("outline-soft"),
            scrim = color("scrim")
        )
    }

    fun scheme(accent: GoreeAccent, dark: Boolean): ColorScheme {
        val palette = GeneratedGoreePalettes.palettes.getValue(accent.id + "/" + if (dark) "dark" else "light")
        fun color(key: String) = Color(palette.getValue(key))
        val defaults = if (dark) darkColorScheme() else lightColorScheme()
        return defaults.copy(
            primary = color("brand"),
            onPrimary = color("on-brand"),
            primaryContainer = color("brand-container"),
            onPrimaryContainer = color("on-brand-container"),
            secondary = color("brand"),
            onSecondary = color("on-brand"),
            secondaryContainer = color("brand-container"),
            onSecondaryContainer = color("on-brand-container"),
            tertiary = color("brand"),
            onTertiary = color("on-brand"),
            background = color("canvas"),
            onBackground = color("text"),
            surface = color("surface"),
            onSurface = color("text"),
            surfaceVariant = color("surface-tonal"),
            onSurfaceVariant = color("text-soft"),
            // Expressive Material 3 components read container roles by default.
            // Derive them from GC UI's existing solid semantic surfaces rather
            // than silently falling back to unrelated Material palette colors.
            surfaceContainerLowest = color("surface"),
            surfaceContainerLow = color("surface"),
            surfaceContainer = color("surface-tonal"),
            surfaceContainerHigh = color("surface-tonal"),
            surfaceContainerHighest = color("surface-tonal"),
            outline = color("outline"),
            outlineVariant = color("outline-soft"),
            error = color("negative"),
            onError = color("on-negative"),
            surfaceTint = color("brand")
        )
    }
}

private val GoreeShapes = Shapes(
    extraSmall = RoundedCornerShape(12.dp),
    small = RoundedCornerShape(12.dp),
    medium = RoundedCornerShape(18.dp),
    large = RoundedCornerShape(26.dp),
    extraLarge = RoundedCornerShape(36.dp)
)

/**
 * Shared Compose Multiplatform baseline theme for non-Android Kotlin UI consumers.
 * On Android use GoreeCloudExpressiveTheme from android/material3-expressive
 * instead, so Material 3 Expressive motion and Android wallpaper behavior remain native.
 */
@Composable
fun GoreeCloudMultiplatformTheme(
    accent: GoreeAccent = GoreeAccent.Iris,
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    val scheme = remember(accent, darkTheme) { GoreeCloudTokens.scheme(accent, darkTheme) }
    MaterialTheme(colorScheme = scheme, shapes = GoreeShapes, content = content)
}

/** Portable controls respect whichever MaterialTheme the native host supplied. */
@Composable
fun GoreeCloudPanel(modifier: Modifier = Modifier, content: @Composable () -> Unit) {
    Surface(
        modifier = modifier,
        color = MaterialTheme.colorScheme.surface,
        shape = MaterialTheme.shapes.large,
        content = content
    )
}

@Composable
fun GoreeCloudAction(
    label: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    enabled: Boolean = true
) {
    require(label.isNotBlank()) { "Action label must be nonempty" }
    Button(
        onClick = onClick,
        modifier = modifier,
        enabled = enabled,
        contentPadding = PaddingValues(horizontal = 20.dp, vertical = 12.dp),
        colors = ButtonDefaults.buttonColors()
    ) { Text(label) }
}

@Immutable
data class GoreeNavItem(
    val id: String,
    val label: String
)

/** Icon renderer is consumer-owned: no vendor artwork, implicit navigation or tracking. */
@Composable
fun GoreeCloudNavigation(
    items: List<GoreeNavItem>,
    selectedId: String,
    icon: @Composable (GoreeNavItem) -> Unit,
    onSelect: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    GoreeNavigationContract.validate(items, selectedId)
    NavigationBar(
        modifier = modifier.navigationBarsPadding().padding(horizontal = 16.dp, vertical = 8.dp)
            .clip(RoundedCornerShape(26.dp)),
        containerColor = MaterialTheme.colorScheme.surface,
        // Outer navigationBarsPadding consumes the safe area exactly once.
        // Otherwise NavigationBar applies its own default inset as well.
        windowInsets = WindowInsets(0, 0, 0, 0)
    ) {
        items.forEach { item ->
            NavigationBarItem(
                selected = item.id == selectedId,
                onClick = { if (GoreeNavigationContract.shouldNavigate(selectedId, item.id)) onSelect(item.id) },
                icon = { icon(item) },
                label = { Text(item.label) },
                alwaysShowLabel = true
            )
        }
    }
}

/**
 * Pure navigation contract for both native hosts and common tests.
 * Real navigation and authorization remain entirely consumer owned.
 */
object GoreeNavigationContract {
    fun validate(items: List<GoreeNavItem>, selectedId: String) {
        require(items.size in 3..5) { "Expected 3–5 primary destinations" }
        require(items.all { it.id.isNotBlank() && it.label.isNotBlank() }) {
            "Items need accessible labels and IDs"
        }
        require(items.map { it.id }.distinct().size == items.size) { "Duplicate destination IDs" }
        require(items.any { it.id == selectedId }) { "Selected destination is not present" }
    }

    fun shouldNavigate(selectedId: String, targetId: String): Boolean =
        selectedId != targetId
}
