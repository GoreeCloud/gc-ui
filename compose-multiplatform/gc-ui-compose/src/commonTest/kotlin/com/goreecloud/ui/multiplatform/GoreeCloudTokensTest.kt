package com.goreecloud.ui.multiplatform

import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertNotEquals

class GoreeCloudTokensTest {
    @Test
    fun allCanonicalPalettesHaveDistinctDarkAndLightRoles() {
        for (accent in GoreeAccent.entries) {
            val light = GoreeCloudTokens.colors(accent, dark = false)
            val dark = GoreeCloudTokens.colors(accent, dark = true)
            assertNotEquals(light.canvas, dark.canvas)
            assertNotEquals(light.text, dark.text)
            assertEquals(light.brand, GoreeCloudTokens.scheme(accent, dark = false).primary)
        }
    }
}
