package com.goreecloud.ui.samples.interop

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.goreecloud.ui.material3.GoreeAccent as AndroidAccent
import com.goreecloud.ui.material3.GoreeCloudExpressiveTheme
import com.goreecloud.ui.multiplatform.GoreeAccent as SharedAccent
import com.goreecloud.ui.multiplatform.GoreeCloudAction
import com.goreecloud.ui.multiplatform.GoreeCloudPanel
import com.goreecloud.ui.multiplatform.GoreeCloudTokens

/** Source-linkage fixture only: no account, networking, storage or invented sync. */
class IntegrationActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent { IntegrationScreen() }
    }
}

@Composable
private fun IntegrationScreen() {
    val dark = isSystemInDarkTheme()
    val sharedColors = GoreeCloudTokens.colors(SharedAccent.Iris, dark)
    var tapCount by remember { mutableIntStateOf(0) }

    // Android M3 Expressive is the OUTER theme. Shared components inherit it,
    // and must not introduce a conflicting nested MaterialTheme.
    GoreeCloudExpressiveTheme(accent = AndroidAccent.Iris, darkTheme = dark) {
        Surface(
            modifier = Modifier.fillMaxSize(),
            color = MaterialTheme.colorScheme.background
        ) {
            Column(
                modifier = Modifier.padding(24.dp),
                verticalArrangement = Arrangement.Center
            ) {
                Text(
                    text = "GoreeCloud UI integration",
                    style = MaterialTheme.typography.headlineSmall,
                    color = MaterialTheme.colorScheme.onBackground
                )
                GoreeCloudPanel(modifier = Modifier.fillMaxWidth()) {
                    Column(modifier = Modifier.padding(20.dp)) {
                        Text(
                            text = "Android Expressive + shared Kotlin UI",
                            color = sharedColors.text
                        )
                        Text(text = "Local button taps: $tapCount")
                        GoreeCloudAction(
                            label = "Count a tap",
                            onClick = { tapCount++ }
                        )
                    }
                }
                Text(
                    text = "Development-only fixture. No live data or services.",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onBackground
                )
            }
        }
    }
}
