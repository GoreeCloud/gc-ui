import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
const root=new URL('../',import.meta.url);
const read=path=>readFileSync(new URL(path,root),'utf8');
test('Android app has locked-down local-only WebView message transport',()=>{
 const java=read('native/android/app/src/main/java/com/goreecloud/gcui/preview/GCNativeActivity.java');
 const manifest=read('native/android/app/src/main/AndroidManifest.xml');
 assert.match(java,/WebViewAssetLoader/);
 assert.match(java,/WebViewCompat\.addWebMessageListener/);
 assert.match(java,/Collections\.singleton\(ORIGIN\)/);
 assert.match(java,/!isMainFrame/);
 assert.match(java,/isFeatureSupported\(WebViewFeature\.WEB_MESSAGE_LISTENER\)/);
 assert.match(java,/setAllowFileAccess\(false\)/);
 assert.match(java,/WindowInsets\.Type\.systemBars/);
 assert.match(java,/getPreferences\(MODE_PRIVATE\)\.edit\(\)\.putString\("appearance",mode\)/);
 assert.match(java,/setMixedContentMode\(WebSettings\.MIXED_CONTENT_NEVER_ALLOW\)/);
 assert.doesNotMatch(java,/\.addJavascriptInterface\s*\(|loadUrl\("http:|loadUrl\("https:\/\/[^"]*\.com/);
 assert.match(manifest,/usesCleartextTraffic="false"/);
 assert.doesNotMatch(manifest,/android\.permission\.INTERNET/);
 assert.ok(existsSync(new URL('native/android/scripts/sync-web-assets.mjs',root)));
});
test('Android and Electron hosts package only opt-in runnable previews',()=>{
 const pkg=JSON.parse(read('package.json'));
 const desktop=JSON.parse(read('native/desktop/package.json'));
 assert.equal(pkg.private,true);
 assert.equal(desktop.private,true);
 assert.equal(pkg.exports['./native/host-client'],'./src/gc-native-host.mjs');
 assert.ok(!Object.keys(pkg.dependencies||{}).some(n=>n==='electron'||n==='androidx.webkit'));
 const main=read('native/desktop/main.mjs'),preload=read('native/desktop/preload.cjs');
 for(const rule of ['nodeIntegration:false','contextIsolation:true','sandbox:true','webSecurity:true','setWindowOpenHandler','setPermissionRequestHandler'])
  assert.ok(main.includes(rule),rule);
 assert.match(preload,/contextBridge\.exposeInMainWorld/);
 assert.doesNotMatch(preload,/exec\(|shell\.openExternal|readFileSync\(/);
 assert.ok(existsSync(new URL('native/android/gradle/wrapper/gradle-wrapper.jar',root)));
});
