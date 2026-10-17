/** Pure, testable Electron host policy: no arbitrary IPC, URLs, files or OS commands. */
import {validateNativeHostRequest} from '../../src/gc-native-host.mjs';
export const CHANNEL_REQUEST='gc-native:request';
export const CHANNEL_RESPONSE='gc-native:response';
export function dispatchDesktopHost(raw,{nativeTheme}={}){
 let id='invalid';
 try{
  const request=validateNativeHostRequest(raw);
  id=request.id;
  let result;
  switch(request.action){
   case 'getCapabilities':
    result={
     protocol:1,host:'electron',platform:'desktop',nativeAdapterInstalled:true,
     highContrast:false,reducedMotion:false,reducedTransparency:false,lowPower:false,
     selectionFeedback:false,appearanceControl:true
    };break;
   case 'setAppearance':
    if(!nativeTheme || !('themeSource' in nativeTheme))throw new Error('Appearance control unavailable');
    nativeTheme.themeSource=request.payload.mode;
    result={mode:nativeTheme.themeSource};break;
   case 'selectionFeedback':
    result={performed:false};break;
   default:throw new Error('Unsupported action');
  }
  return JSON.stringify({v:1,type:'gc-host/response',id,ok:true,result});
 }catch(error){
  // Never pass exception stacks or platform data to renderer.
  return JSON.stringify({v:1,type:'gc-host/response',id,ok:false,error:
   error instanceof SyntaxError||error instanceof TypeError||error instanceof RangeError
    ?'invalid-request':'action-unavailable'});
 }
}
