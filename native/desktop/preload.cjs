'use strict';
// Electron sandboxed preload: exposes only a text-based, bounded messaging contract.
const {contextBridge,ipcRenderer}=require('electron');
const REQUEST='gc-native:request',RESPONSE='gc-native:response';
contextBridge.exposeInMainWorld('GCNativeHost',Object.freeze({
 postMessage(text){
  if(typeof text!=='string'||text.length>2048)throw new TypeError('Invalid host message');
  ipcRenderer.send(REQUEST,text);
 },
 subscribe(listener){
  if(typeof listener!=='function')throw new TypeError('Listener required');
  const handler=(_event,text)=>{if(typeof text==='string'&&text.length<=4096)listener({data:text})};
  ipcRenderer.on(RESPONSE,handler);
  return ()=>ipcRenderer.removeListener(RESPONSE,handler);
 }
}));
