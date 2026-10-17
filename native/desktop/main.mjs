/** Optional Electron host; core GC UI remains dependency-free and browser compatible. */
import {app,BrowserWindow,ipcMain,nativeTheme,session} from 'electron';
import {fileURLToPath} from 'node:url';
import {join,resolve,sep} from 'node:path';
import {dispatchDesktopHost,CHANNEL_REQUEST,CHANNEL_RESPONSE} from './host-contract.mjs';
const repo=resolve(fileURLToPath(new URL('../../',import.meta.url)));
const lab=join(repo,'lab');
const entry=join(lab,'experience-studio.html');
let win;
function isAllowedFile(url){
 try{
  const value=new URL(url);
  if(value.protocol!=='file:')return false;
  const target=resolve(fileURLToPath(value));
  return target.startsWith(repo+sep);
 }catch{return false}
}
function createWindow(){
 win=new BrowserWindow({
  width:1200,height:850,minWidth:320,minHeight:500,
  backgroundColor:'#ECF0F8',
  title:'GoreeCloud UI — Desktop Host',
  show:false,
  webPreferences:{
   preload:join(import.meta.dirname,'preload.cjs'),
   nodeIntegration:false,contextIsolation:true,sandbox:true,webSecurity:true,
   webviewTag:false
  }
 });
 win.once('ready-to-show',()=>win?.show());
 win.webContents.setWindowOpenHandler(()=>({action:'deny'}));
 win.webContents.on('will-navigate',(event,url)=>{
  // Local lab/documentation navigation only; never navigate to remote origins.
  if(!isAllowedFile(url))event.preventDefault();
 });
 win.webContents.on('will-attach-webview',event=>event.preventDefault());
 win.loadFile(entry);
}
app.whenReady().then(()=>{
 session.defaultSession.setPermissionRequestHandler((_webContents,_permission,callback)=>callback(false));
 session.defaultSession.webRequest.onBeforeRequest({urls:['<all_urls>']},(details,callback)=>{
  const scheme=details.url.slice(0,details.url.indexOf(':'));
  callback({cancel:scheme!=='file'||!isAllowedFile(details.url)});
 });
 ipcMain.on(CHANNEL_REQUEST,(event,message)=>{
  if(!win||event.sender!==win.webContents||event.senderFrame!==win.webContents.mainFrame)return;
  const response=dispatchDesktopHost(message,{nativeTheme});
  event.sender.send(CHANNEL_RESPONSE,response);
 });
 createWindow();
 app.on('activate',()=>{if(BrowserWindow.getAllWindows().length===0)createWindow()});
});
app.on('window-all-closed',()=>{if(process.platform!=='darwin')app.quit()});
app.on('before-quit',()=>ipcMain.removeAllListeners(CHANNEL_REQUEST));
