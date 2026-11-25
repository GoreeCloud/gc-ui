package com.goreecloud.ui.material3

import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test
import kotlin.math.max
import kotlin.math.min

/**
 * Runs on a plain JVM; checks native export completeness and basic opaque on-color
 * contrast. This is NOT a replacement for Compose screenshot or device testing.
 */
class GeneratedGoreePalettesTest {
    private val accents = listOf("iris", "lagoon", "ember", "moss")
    private val appearances = listOf("light", "dark")
    private val required = setOf(
        "canvas", "surface", "surface-tonal", "text", "text-soft",
        "outline", "outline-soft", "positive", "on-positive",
        "warning", "on-warning", "negative", "on-negative",
        "lens-fill", "lens-solid", "scrim", "focus-ring",
        "brand", "on-brand", "brand-container", "on-brand-container"
    )

    @Test fun allEightPalettesHaveTheSameCanonicalRoles() {
        val palettes = GeneratedGoreePalettes.palettes
        val expected = accents.flatMap { a -> appearances.map { m -> "$a/$m" } }.toSet()
        assertEquals(expected, palettes.keys)
        palettes.forEach { (name, colors) ->
            assertEquals("Missing or extra semantic roles: $name", required, colors.keys)
            for (role in required - setOf("lens-fill", "scrim")) {
                val argb = colors.getValue(role)
                assertEquals("Opaque semantic role required: $name/$role", 0xFFL, (argb ushr 24) and 0xFFL)
            }
            assertEquals("Solid Lens fallback must be opaque: $name", 0xFFL,
                (colors.getValue("lens-solid") ushr 24) and 0xFFL)
        }
    }

    private fun luminance(color: Long): Double {
        fun channel(shift: Int): Double {
            val s = ((color ushr shift) and 0xFFL).toDouble() / 255.0
            return if (s <= 0.04045) s / 12.92 else Math.pow((s + 0.055) / 1.055, 2.4)
        }
        return 0.2126 * channel(16) + 0.7152 * channel(8) + 0.0722 * channel(0)
    }

    private fun ratio(foreground: Long, background: Long): Double {
        val a = luminance(foreground)
        val b = luminance(background)
        return (max(a, b) + 0.05) / (min(a, b) + 0.05)
    }

    @Test fun filledPrimaryAndStatusLabelsMeetOpaqueTextContrast() {
        for ((variant, colors) in GeneratedGoreePalettes.palettes) {
            for ((fg, bg) in listOf(
                "on-brand" to "brand",
                "on-brand-container" to "brand-container",
                "on-positive" to "positive",
                "on-warning" to "warning",
                "on-negative" to "negative",
                "text" to "canvas",
                "text" to "surface"
            )) {
                assertTrue("$variant: $fg on $bg should meet 4.5:1 text contrast",
                    ratio(colors.getValue(fg), colors.getValue(bg)) >= 4.5)
            }
        }
    }
}
