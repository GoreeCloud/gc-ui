package com.goreecloud.ui.material3

import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.unit.dp

data class GoreeDestination(
    val id: String,
    val label: String,
    val icon: @Composable () -> Unit
)

/**
 * Scaffold bottomBar companion. Apply Scaffold contentPadding to scroll content.
 * Avoid duplicate nav bars; this control reserves gesture insets.
 */
@Composable
fun GoreeFloatingNavigationBar(
    destinations: List<GoreeDestination>,
    selectedId: String,
    onDestinationSelected: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    require(destinations.size in 3..5) { "Use 3–5 compact primary destinations" }
    require(destinations.all { it.id.isNotBlank() && it.label.isNotBlank() }) {
        "Destination identifiers and accessible labels must be nonempty"
    }
    require(destinations.map { it.id }.distinct().size == destinations.size) {
        "Destination identifiers must be unique"
    }
    require(destinations.any { it.id == selectedId }) {
        "Selected destination must be present"
    }
    NavigationBar(
        modifier = modifier.navigationBarsPadding()
            .padding(horizontal = 16.dp, vertical = 8.dp)
            .clip(RoundedCornerShape(26.dp)),
        containerColor = GoreeCloudTheme.colors.lensSolid,
        contentColor = MaterialTheme.colorScheme.onSurface,
        tonalElevation = 3.dp,
        windowInsets = WindowInsets(0, 0, 0, 0)
    ) {
        destinations.forEach { destination ->
            NavigationBarItem(
                selected = destination.id == selectedId,
                onClick = {
                    // A repeated tap on the selected route must not trigger a
                    // second navigation or duplicate side effect.
                    if (destination.id != selectedId) onDestinationSelected(destination.id)
                },
                icon = destination.icon,
                label = { Text(destination.label) },
                alwaysShowLabel = true
            )
        }
    }
}
