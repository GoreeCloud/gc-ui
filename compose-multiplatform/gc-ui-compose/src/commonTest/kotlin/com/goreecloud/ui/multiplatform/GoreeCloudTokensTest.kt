package com.goreecloud.ui.multiplatform

import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertNotEquals
import kotlin.test.assertFailsWith

class GoreeCloudTokensTest {
    @Test
    fun allCanonicalPalettesHaveDistinctDarkAndLightRoles() {
        for (accent in GoreeAccent.entries) {
            val light = GoreeCloudTokens.colors(accent, dark = false)
            val dark = GoreeCloudTokens.colors(accent, dark = true)
            assertNotEquals(light.canvas, dark.canvas)
            assertNotEquals(light.text, dark.text)
            assertEquals(light.brand, GoreeCloudTokens.scheme(accent, dark = false).primary)
            for (darkMode in listOf(false, true)) {
                val roles = GoreeCloudTokens.colors(accent, dark = darkMode)
                val scheme = GoreeCloudTokens.scheme(accent, dark = darkMode)
                assertEquals(roles.surface, scheme.surfaceContainerLow)
                assertEquals(roles.surface, scheme.surfaceContainerLowest)
                assertEquals(roles.tonalSurface, scheme.surfaceContainer)
                assertEquals(roles.tonalSurface, scheme.surfaceContainerHighest)
                assertEquals(roles.brandContainer, scheme.primaryContainer)
                assertEquals(roles.onBrandContainer, scheme.onPrimaryContainer)
                assertNotEquals(roles.positive, roles.onPositive)
                assertNotEquals(roles.negative, roles.onNegative)
            }
        }
    }

    @Test
    fun navigationContractRejectsMalformedInputAndDuplicateClicks() {
        val tabs = listOf(GoreeNavItem("home", "Home"), GoreeNavItem("search", "Search"), GoreeNavItem("settings", "Settings"))
        GoreeNavigationContract.validate(tabs, "home")
        assertEquals(false, GoreeNavigationContract.shouldNavigate("home", "home"))
        assertEquals(true, GoreeNavigationContract.shouldNavigate("home", "search"))
        assertFailsWith<IllegalArgumentException> { GoreeNavigationContract.validate(tabs, "missing") }
        assertFailsWith<IllegalArgumentException> { GoreeNavigationContract.validate(tabs + GoreeNavItem("home", "Again"), "home") }
        assertFailsWith<IllegalArgumentException> { GoreeNavigationContract.validate(tabs.take(2), "home") }
        assertFailsWith<IllegalArgumentException> { GoreeNavigationContract.validate(tabs.mapIndexed { i, t -> if (i == 0) t.copy(label = " ") else t }, "home") }
    }
}
