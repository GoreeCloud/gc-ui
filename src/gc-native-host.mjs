/** Versioned, allowlisted GC UI host messaging. Browser preview remains fully functional. */
import {resolvePlatformProfile,applyPlatformProfile} from './gc-platform-profile.mjs';
export const GC_NATIVE_PROTOCOL_VERSION=1;
export const GC_NATIVE_ACTIONS=Object.freeze(['getCapabilities','setAppearance','selectionFeedback']);
const LIMIT=2048;
const IDs=/^[A-Za-z0-9_-]{1,64}$/;
const androidMessageSubscribers=new WeakMap();
let requestCounter=0;
function dataPayload(payload){
 try{
  if(!payload||typeof payload!=='object'||Array.isArray(payload))return null;
  const keys=Reflect.ownKeys(payload);
  const fields=Object.getOwnPropertyDescriptors(payload);
  // Do not evaluate source-controlled getters or ignore nonenumerable/symbol data.
  if(keys.some(key=>typeof key!=='string'||!Object.prototype.hasOwnProperty.call(fields[key],'value')))return null;
  return {keys,fields};
 }catch{return null}
}
function normalizeAction(action,payload){
 if(!GC_NATIVE_ACTIONS.includes(action))throw new RangeError('Unsupported native action');
 if(action==='setAppearance'){
  const inspected=dataPayload(payload);
  if(!inspected||inspected.keys.length!==1||inspected.keys[0]!=='mode'||
   !['system','light','dark'].includes(inspected.fields.mode.value))throw new TypeError('Invalid appearance mode');
  return {mode:inspected.fields.mode.value};
 }
 if(payload!=null){
  const inspected=dataPayload(payload);
  if(!inspected||inspected.keys.length)throw new TypeError('Unexpected native action payload');
 }
 return {};
}
export function validateNativeHostRequest(value){
 if(typeof value!=='string'||value.length>LIMIT)throw new TypeError('Invalid native host message length');
 let obj;
 try{obj=JSON.parse(value)}catch{throw new SyntaxError('Malformed native host JSON')}
 if(!obj||typeof obj!=='object'||Array.isArray(obj)||obj.v!==GC_NATIVE_PROTOCOL_VERSION||
  obj.type!=='gc-host/request'||typeof obj.id!=='string'||!IDs.test(obj.id))throw new TypeError('Invalid native host envelope');
 return {v:GC_NATIVE_PROTOCOL_VERSION,type:'gc-host/request',id:obj.id,
  action:obj.action,payload:normalizeAction(obj.action,obj.payload)};
}
export function createNativeTransport(scope=globalThis){
 // A partially injected or broken native bridge must not crash the browser lab.
 try{
  const desktop=scope?.GCNativeHost;
  if(desktop&&typeof desktop.postMessage==='function'&&typeof desktop.subscribe==='function')
   return {platform:'desktop',postMessage:text=>desktop.postMessage(text),subscribe:fn=>desktop.subscribe(fn)};
 }catch{/* Ignore a broken desktop bridge and probe Android or use the web fallback. */}
 try{
  const android=scope?.GCAndroidHost;
  if(android&&typeof android.postMessage==='function'){
   return {platform:'android',postMessage:text=>android.postMessage(text),subscribe:fn=>{
    // Multiple GC UI clients can attach to one WebView bridge. A shared dispatcher
    // permits teardown in any order without leaving an abandoned wrapper installed.
    let state=androidMessageSubscribers.get(android);
    if(!state){
      const previous=android.onmessage,subscribers=new Set();
      const dispatcher=event=>{
        try{if(typeof previous==='function')previous.call(android,event)}catch{/* Preserve live host replies. */}
        for(const subscriber of [...subscribers]){
          if(!subscribers.has(subscriber))continue;
          try{subscriber(event)}catch{/* One subscriber cannot silence the others. */}
        }
      };
      state={previous,subscribers,dispatcher};
      android.onmessage=dispatcher;
      androidMessageSubscribers.set(android,state);
    }
    if(android.onmessage!==state.dispatcher)throw new Error('Android host callback replaced');
    const subscriber=event=>fn(event);
    state.subscribers.add(subscriber);
    let active=true;
    return ()=>{
      if(!active)return;
      active=false;
      state.subscribers.delete(subscriber);
      if(state.subscribers.size!==0)return;
      if(android.onmessage===state.dispatcher)android.onmessage=state.previous;
      androidMessageSubscribers.delete(android);
    };
   }};
  }
 }catch{/* A broken Android bridge is not evidence of native capability. */}
 return null;
}
function unavailableNativeHost(reason='No native host'){
 return Object.freeze({available:false,platform:'web',request:()=>Promise.reject(new Error(reason)),destroy(){}});
}
export function createNativeHostClient({transport=createNativeTransport(),timeoutMs=3000}={}){
 if(!transport)return unavailableNativeHost();
 if(typeof transport.postMessage!=='function'||typeof transport.subscribe!=='function')throw new TypeError('Invalid host transport');
 const pending=new Map();
 let closed=false;
 const onResponse=event=>{
  const text=typeof event==='string'?event:event?.data;
  if(typeof text!=='string'||text.length>4096)return;
  let data;
  try{data=JSON.parse(text)}catch{return}
  if(data?.v!==1||data?.type!=='gc-host/response'||typeof data?.id!=='string'||!IDs.test(data.id))return;
  const current=pending.get(data.id);
  if(!current)return;
  pending.delete(data.id);clearTimeout(current.timeout);
  if(data.ok===true)current.resolve(data.result);
  else current.reject(new Error(typeof data.error==='string'?data.error.slice(0,160):'Native host refused request'));
 };
 // Native preload/Android injections may be incomplete during startup.
 // Requiring a valid cleanup function also prevents a teardown-time exception.
 let unsubscribe;
 try{unsubscribe=transport.subscribe(onResponse)}
 catch{return unavailableNativeHost('Native host subscription unavailable')}
 if(typeof unsubscribe!=='function')return unavailableNativeHost('Native host subscription unavailable');
 function request(action,payload={}){
  if(closed)return Promise.reject(new Error('Native host client destroyed'));
  let safe;
  try{safe=normalizeAction(action,payload)}catch(err){return Promise.reject(err)}
  if(pending.size>=24)return Promise.reject(new Error('Too many pending native requests'));
  const id='gc'+(++requestCounter).toString(36);
  const message=JSON.stringify({v:1,type:'gc-host/request',id,action,payload:safe});
  if(message.length>LIMIT)return Promise.reject(new Error('Native request too large'));
  return new Promise((resolve,reject)=>{
   const timeout=setTimeout(()=>{pending.delete(id);reject(new Error('Native host timeout'))},Math.max(50,Math.min(10000,timeoutMs)));
   pending.set(id,{resolve,reject,timeout});
   try{transport.postMessage(message)}catch(err){
    clearTimeout(timeout);pending.delete(id);reject(err);
   }
  });
 }
 return Object.freeze({available:true,platform:transport.platform||'native',request,
  destroy(){
   if(closed)return;closed=true;
   try{unsubscribe()}catch{/* Never strand pending requests if a disappearing bridge throws on teardown. */}
   for(const v of pending.values()){clearTimeout(v.timeout);v.reject(new Error('Native host client destroyed'))}
   pending.clear();
  }});
}
/** Strictly monotone preference merge: a native host can only strengthen system safety. */
export function resolveEffectiveNativePreferences(browser={},native=null){
 const supported=['highContrast','reducedMotion','reducedTransparency','lowPower'];
 return Object.freeze({
  highContrast:Boolean(browser.highContrast||native?.highContrast),
  reducedMotion:Boolean(browser.reducedMotion||native?.reducedMotion),
  reducedTransparency:Boolean(browser.reducedTransparency||native?.reducedTransparency),
  lowPower:Boolean(browser.lowPower||native?.lowPower),
  forcedColors:Boolean(browser.forcedColors)
 });
}
export function applyVerifiedHostCapabilities(root,capabilities,options={}){
 if(!capabilities||capabilities.protocol!==1||!['phone','tablet','desktop'].includes(capabilities.platform)||
 !['android','electron'].includes(capabilities.host)||capabilities.nativeAdapterInstalled!==true||
 (capabilities.host==='electron'&&capabilities.platform!=='desktop')||
 (capabilities.host==='android'&&capabilities.platform==='desktop')||
 ['highContrast','reducedMotion','reducedTransparency','lowPower','selectionFeedback','appearanceControl']
  .some(key=>Object.hasOwn(capabilities,key)&&typeof capabilities[key]!=='boolean'))
  throw new TypeError('Invalid native host capabilities');
 const profile=applyPlatformProfile(root,capabilities.platform,{
  highContrast:Boolean(capabilities.highContrast||options.highContrast),
  reducedMotion:Boolean(capabilities.reducedMotion||options.reducedMotion),
  reducedTransparency:Boolean(capabilities.reducedTransparency||options.reducedTransparency),
  lowPower:Boolean(capabilities.lowPower||options.lowPower)
 });
 root.dataset.gcNativeHost=capabilities.host;
 return Object.freeze({...profile,nativeAdapterInstalled:true,
  selectionFeedback:Boolean(capabilities.selectionFeedback),
  appearanceControl:Boolean(capabilities.appearanceControl)});
}
