package com.goreecloud.gcui.preview;

import android.animation.ValueAnimator;
import android.app.Activity;
import android.app.UiModeManager;
import android.content.Context;
import android.content.res.Configuration;
import android.graphics.Color;
import android.graphics.Insets;
import android.net.Uri;
import android.util.Log;
import android.os.Build;
import android.os.Bundle;
import android.os.PowerManager;
import android.view.HapticFeedbackConstants;
import android.widget.FrameLayout;
import android.view.View;
import android.view.WindowInsets;
import android.view.WindowInsetsController;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import androidx.webkit.JavaScriptReplyProxy;
import androidx.webkit.WebMessageCompat;
import androidx.webkit.WebViewAssetLoader;
import androidx.webkit.WebViewCompat;
import androidx.webkit.WebViewFeature;
import org.json.JSONObject;
import org.json.JSONException;
import java.io.ByteArrayInputStream;
import java.util.Collections;
import java.util.regex.Pattern;

/** First real Android WebView host for the local GC UI Experience Studio (alpha). */
public final class GCNativeActivity extends Activity {
 private static final String ORIGIN="https://appassets.androidplatform.net";
 private static final String ENTRY=ORIGIN+"/assets/lab/experience-studio.html";
 private static final Pattern ID=Pattern.compile("[A-Za-z0-9_-]{1,64}");
 private WebView browser;
 private FrameLayout viewport;

 @Override public void onCreate(Bundle state){
  super.onCreate(state);
  browser=new WebView(this);
  browser.setBackgroundColor(Color.rgb(236,240,248));
  // WebView ignores visual edge insets in its inner compositor. Inset its native parent.
  viewport=new FrameLayout(this);
  viewport.setBackgroundColor(Color.rgb(236,240,248));
  viewport.addView(browser,new FrameLayout.LayoutParams(
   FrameLayout.LayoutParams.MATCH_PARENT,FrameLayout.LayoutParams.MATCH_PARENT));
  setContentView(viewport);
  if(Build.VERSION.SDK_INT>=30){
   viewport.setOnApplyWindowInsetsListener((view,insets)->{
    Insets safe=insets.getInsets(WindowInsets.Type.systemBars()|WindowInsets.Type.displayCutout());
    view.setPadding(safe.left,safe.top,safe.right,safe.bottom);
    return insets;
   });
   viewport.requestApplyInsets();
  }
  setSystemBarAppearance(preferredLightAppearance()); // Avoid flashing the wrong bar on restart.
  WebSettings settings=browser.getSettings();
  settings.setJavaScriptEnabled(true);
  settings.setDomStorageEnabled(true);
  settings.setAllowFileAccess(false);
  settings.setAllowContentAccess(false);
  settings.setAllowFileAccessFromFileURLs(false);
  settings.setAllowUniversalAccessFromFileURLs(false);
  settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
  WebView.setWebContentsDebuggingEnabled(false);
  final WebViewAssetLoader loader=new WebViewAssetLoader.Builder()
   .addPathHandler("/assets/",new WebViewAssetLoader.AssetsPathHandler(this)).build();
  browser.setWebViewClient(new WebViewClient(){
   @Override public void onPageFinished(WebView view,String url){
    super.onPageFinished(view,url);
    // Development-only observability, not a JavaScript bridge or system-setting toggle.
    if(BuildConfig.DEBUG&&isTrustedLocalUrl(Uri.parse(url))){
     view.postDelayed(()->view.evaluateJavascript(
      "document.documentElement.dataset.gcResourceMode||'unavailable'",
      value->Log.i("GCUI.Perf","resourceMode="+value)),700);
    }
   }
   @Override public WebResourceResponse shouldInterceptRequest(WebView view,WebResourceRequest request){
    if(!isTrustedLocalUrl(request.getUrl()))return blockedResource();
    WebResourceResponse local=loader.shouldInterceptRequest(request.getUrl());
    return local!=null?local:blockedResource();
   }
   @Override public boolean shouldOverrideUrlLoading(WebView view,WebResourceRequest request){
    return !isTrustedLocalUrl(request.getUrl());
   }
  });
  if(!WebViewFeature.isFeatureSupported(WebViewFeature.WEB_MESSAGE_LISTENER)){
   browser.loadDataWithBaseURL(null,"<h1>GC UI host unavailable</h1><p>Update Android System WebView to use this secure preview.</p>","text/html","UTF-8",null);
   return; // No unsafe addJavascriptInterface fallback.
  }
  WebViewCompat.addWebMessageListener(browser,"GCAndroidHost",
   Collections.singleton(ORIGIN),(view,message,sourceOrigin,isMainFrame,replyProxy)->{
    if(!isMainFrame||!ORIGIN.equals(sourceOrigin.toString()))return;
    final String text=message.getData();
    if(text==null||text.length()>2048)return;
    runOnUiThread(()->respond(text,replyProxy));
   });
  String preview=BuildConfig.DEBUG?getIntent().getStringExtra("gcui_preview_mode"):null;
  browser.loadUrl("conserve".equals(preview)?ENTRY+"?gcPreview=conserve":ENTRY);
 }

 private static boolean isTrustedLocalUrl(Uri uri){
  return uri!=null&&"https".equals(uri.getScheme())&&
   "appassets.androidplatform.net".equals(uri.getHost())&&uri.getPort()==-1&&
   uri.getUserInfo()==null&&uri.getPath()!=null&&uri.getPath().startsWith("/assets/");
 }
 private static WebResourceResponse blockedResource(){
  WebResourceResponse response=new WebResourceResponse("text/plain","UTF-8",
   new ByteArrayInputStream(new byte[0]));
  response.setStatusCodeAndReasonPhrase(403,"Forbidden");
  return response;
 }

 private void respond(String text,JavaScriptReplyProxy reply){
  String id=null;
  try{
   JSONObject request=new JSONObject(text);
   if(request.optInt("v",-1)!=1||!"gc-host/request".equals(request.optString("type")))return;
   id=request.optString("id","");
   if(!ID.matcher(id).matches())return;
   String action=request.optString("action","");
   JSONObject params=request.optJSONObject("payload");
   JSONObject result;
   if("getCapabilities".equals(action)){
    if(params!=null&&params.length()>0)throw new IllegalArgumentException("invalid-request");
    result=capabilities();
   } else if("setAppearance".equals(action)){
    if(params==null||params.length()!=1)throw new IllegalArgumentException("invalid-request");
    String mode=params.optString("mode","");
    if(!"light".equals(mode)&&!"dark".equals(mode)&&!"system".equals(mode))throw new IllegalArgumentException("invalid-request");
    boolean light="light".equals(mode)||("system".equals(mode)&&
     (getResources().getConfiguration().uiMode&Configuration.UI_MODE_NIGHT_MASK)!=Configuration.UI_MODE_NIGHT_YES);
    setSystemBarAppearance(light);
    getPreferences(MODE_PRIVATE).edit().putString("appearance",mode).apply();
    result=new JSONObject().put("mode",mode);
   } else if("selectionFeedback".equals(action)){
    if(params!=null&&params.length()>0)throw new IllegalArgumentException("invalid-request");
    boolean performed=browser.performHapticFeedback(HapticFeedbackConstants.CLOCK_TICK);
    result=new JSONObject().put("performed",performed);
   } else {
    throw new IllegalArgumentException("invalid-request");
   }
   reply.postMessage(envelope(id,true,result,null).toString());
  }catch(Exception error){
   if(id!=null&&ID.matcher(id).matches()){
    try{reply.postMessage(envelope(id,false,null,"invalid-request").toString());}catch(Exception ignored){}
   }
  }
 }
 private JSONObject capabilities()throws JSONException{
  UiModeManager ui=(UiModeManager)getSystemService(Context.UI_MODE_SERVICE);
  boolean nativeContrast=Build.VERSION.SDK_INT>=34&&ui!=null&&ui.getContrast()>0.5f;
  PowerManager p=(PowerManager)getSystemService(Context.POWER_SERVICE);
  boolean compact=getResources().getConfiguration().smallestScreenWidthDp<600;
  return new JSONObject()
   .put("protocol",1).put("host","android").put("platform",compact?"phone":"tablet")
   .put("nativeAdapterInstalled",true)
   .put("highContrast",nativeContrast)
   .put("reducedMotion",!ValueAnimator.areAnimatorsEnabled())
   .put("reducedTransparency",false)
   .put("lowPower",p!=null&&p.isPowerSaveMode())
   .put("selectionFeedback",true).put("appearanceControl",true);
 }
 private static JSONObject envelope(String id,boolean ok,JSONObject result,String error)throws JSONException{
  JSONObject o=new JSONObject().put("v",1).put("type","gc-host/response").put("id",id).put("ok",ok);
  if(ok)o.put("result",result);else o.put("error",error);
  return o;
 }
 @SuppressWarnings("deprecation")
 private boolean preferredLightAppearance(){
  String mode=getPreferences(MODE_PRIVATE).getString("appearance","system");
  return "light".equals(mode)||(!"dark".equals(mode)&&
   (getResources().getConfiguration().uiMode&Configuration.UI_MODE_NIGHT_MASK)!=Configuration.UI_MODE_NIGHT_YES);
 }
 private void setSystemBarAppearance(boolean light){
  int canvas=light?Color.rgb(236,240,248):Color.rgb(16,19,30);
  if(viewport!=null)viewport.setBackgroundColor(canvas);
  if(Build.VERSION.SDK_INT>=30){
   WindowInsetsController controller=getWindow().getInsetsController();
   if(controller!=null)controller.setSystemBarsAppearance(light?
    WindowInsetsController.APPEARANCE_LIGHT_STATUS_BARS|WindowInsetsController.APPEARANCE_LIGHT_NAVIGATION_BARS:0,
    WindowInsetsController.APPEARANCE_LIGHT_STATUS_BARS|WindowInsetsController.APPEARANCE_LIGHT_NAVIGATION_BARS);
  }else{
   int flags=browser.getSystemUiVisibility();
   int lightBits=View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR|View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR;
   browser.setSystemUiVisibility(light?(flags|lightBits):(flags&~lightBits));
  }
 }
 @Override public void onBackPressed(){
  if(browser!=null&&browser.canGoBack())browser.goBack();
  else super.onBackPressed();
 }
 @Override protected void onPause(){
  if(browser!=null)browser.onPause();
  super.onPause();
 }
 @Override protected void onResume(){
  super.onResume();
  if(browser!=null)browser.onResume();
  setSystemBarAppearance(preferredLightAppearance());
 }
 @Override public void onDestroy(){
  if(browser!=null){browser.stopLoading();browser.destroy();browser=null;}
  super.onDestroy();
 }
}
