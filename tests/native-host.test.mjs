import test from 'node:test';
import assert from 'node:assert/strict';
import {createNativeHostClient,createNativeTransport,validateNativeHostRequest,applyVerifiedHostCapabilities,resolveEffectiveNativePreferences} from '../src/gc-native-host.mjs';
const req=(id,action,payload={})=>JSON.stringify({v:1,type:'gc-host/request',id,action,payload});
function fixture(){
 const subscribers=new Set(),messages=[];
 const transport={platform:'desktop',subscribe:fn=>{subscribers.add(fn);return()=>subscribers.delete(fn)},
  postMessage:msg=>{messages.push(JSON.parse(msg))}};
 const respond=(message)=>{for(const fn of subscribers)fn({data:JSON.stringify(message)})};
 return {transport,messages,respond,subscribers};
}
test('request envelope prevents oversized, arbitrary, and malformed actions',()=>{
 assert.equal(validateNativeHostRequest(req('request_1','getCapabilities')).action,'getCapabilities');
 assert.equal(validateNativeHostRequest(req('request_2','setAppearance',{mode:'dark'})).payload.mode,'dark');
 for(const raw of ['garbage','{}',req('a','runShell'),req('a','getCapabilities',{file:'/etc/passwd'}),
  req('a','setAppearance',{mode:'other'}),req('hi!','getCapabilities'),req('a','getCapabilities')+'x'.repeat(2500)]){
  assert.throws(()=>validateNativeHostRequest(raw));
 }
});
test('browser fallback requires no host and returns a descriptive nonconnected client',async()=>{
 assert.equal(createNativeTransport({}),null);
 const client=createNativeHostClient({transport:null});
 assert.equal(client.available,false);
 await assert.rejects(client.request('getCapabilities'),/No native host/);
});
test('host client correlates out-of-order replies, ignores invalid response and unsubscribes',async()=>{
 const f=fixture(),client=createNativeHostClient({transport:f.transport,timeoutMs:500});
 const first=client.request('getCapabilities'),second=client.request('selectionFeedback');
 assert.equal(f.messages.length,2);
 f.respond({v:1,type:'gc-host/response',id:'unexpected',ok:true,result:{}});
 f.respond({v:1,type:'gc-host/response',id:f.messages[1].id,ok:true,result:{performed:true}});
 f.respond({v:1,type:'gc-host/response',id:f.messages[0].id,ok:true,result:{host:'electron'}});
 assert.deepEqual(await second,{performed:true});
 assert.deepEqual(await first,{host:'electron'});
 client.destroy();assert.equal(f.subscribers.size,0);
 await assert.rejects(client.request('getCapabilities'),/destroyed/);
});
test('time limits, action validation, and destroy reject pending host calls',async()=>{
 const f=fixture(),client=createNativeHostClient({transport:f.transport,timeoutMs:50});
 await assert.rejects(client.request('selectionFeedback',{unexpected:1}),/payload/);
 await assert.rejects(client.request('getCapabilities'),/timeout/);
 const pending=client.request('getCapabilities');
 client.destroy();
 await assert.rejects(pending,/destroyed/);
});
test('capabilities require trusted schema before marking a profile as native',()=>{
 const root={dataset:{}};
 assert.throws(()=>applyVerifiedHostCapabilities(root,{platform:'desktop',nativeAdapterInstalled:true}),/Invalid/);
 const result=applyVerifiedHostCapabilities(root,{
  protocol:1,platform:'phone',host:'android',nativeAdapterInstalled:true,
  highContrast:true,selectionFeedback:true,appearanceControl:true
 });
 assert.equal(result.nativeAdapterInstalled,true);
 assert.equal(result.maxDepth,'e0');
 assert.equal(root.dataset.gcNativeHost,'android');
 assert.equal(root.dataset.gcPlatform,'phone');
});
test('desktop and android transports expose only postMessage and subscription',()=>{
 let listener;
 const desktop=createNativeTransport({GCNativeHost:{postMessage(){},subscribe:fn=>{listener=fn;return()=>{listener=null}}}});
 assert.equal(desktop.platform,'desktop');desktop.subscribe(()=>{})();assert.equal(listener,null);
 const android={postMessage(){},onmessage:null};
 const t=createNativeTransport({GCAndroidHost:android});
 let calls=0;
 const unsubscribe=t.subscribe(()=>calls++);
 android.onmessage({data:'hello'});
 assert.equal(calls,1);
 unsubscribe();assert.equal(android.onmessage,null);
});

test('malformed native host capability types and inconsistent platform identities fail closed',()=>{
 const root={dataset:{}};
 const valid={protocol:1,platform:'phone',host:'android',nativeAdapterInstalled:true};
 for(const bad of [
  {...valid,highContrast:'true'},
  {...valid,reducedMotion:1},
  {...valid,platform:'desktop'},
  {...valid,host:'electron'},
  {...valid,appearanceControl:'yes'}
 ])assert.throws(()=>applyVerifiedHostCapabilities(root,bad),/Invalid/);
 assert.equal(root.dataset.gcNativeHost,undefined);
 assert.throws(()=>validateNativeHostRequest(req('x','setAppearance',{mode:'light',extra:'unexpected'})),/Invalid appearance/);
});

test('host hints never disable browser safety preferences and low power is preserved',()=>{
 const browser={highContrast:false,reducedMotion:true,reducedTransparency:false,lowPower:false,forcedColors:true};
 const native={highContrast:true,reducedMotion:false,reducedTransparency:true,lowPower:true};
 const result=resolveEffectiveNativePreferences(browser,native);
 assert.deepEqual(result,{highContrast:true,reducedMotion:true,reducedTransparency:true,lowPower:true,forcedColors:true});
 assert.equal(Object.isFrozen(result),true);
 assert.deepEqual(resolveEffectiveNativePreferences({reducedMotion:true}),{
  highContrast:false,reducedMotion:true,reducedTransparency:false,lowPower:false,forcedColors:false
 });
 assert.deepEqual(resolveEffectiveNativePreferences(),{
  highContrast:false,reducedMotion:false,reducedTransparency:false,lowPower:false,forcedColors:false
 });
});

test('native injection getter failures preserve browser fallback and allow a valid Android bridge',()=>{
 const android={postMessage(){},onmessage:null};
 const scope=Object.defineProperty({GCAndroidHost:android},'GCNativeHost',{
  get(){throw new Error('preload not ready')}
 });
 const transport=createNativeTransport(scope);
 assert.equal(transport.platform,'android');
 assert.equal(createNativeTransport(Object.defineProperty({},'GCAndroidHost',{
  get(){throw new Error('Android injection failed')}
 })),null);
});

test('throwing and incomplete native subscriptions fail closed without blocking web controls',async()=>{
 for(const subscribe of [
  ()=>{throw new Error('preload registration failed')},
  ()=>undefined,
  ()=>null
 ]){
  let sent=0;
  const client=createNativeHostClient({transport:{
   platform:'desktop',postMessage(){sent++},subscribe
  }});
  assert.equal(client.available,false);
  assert.equal(client.platform,'web');
  await assert.rejects(client.request('selectionFeedback'),/Native host subscription unavailable/);
  client.destroy();
  assert.equal(sent,0);
 }
});

test('client teardown settles pending calls even when native unsubscribe throws',async()=>{
 let unsubscribes=0;
 const client=createNativeHostClient({transport:{
  platform:'desktop',postMessage(){},
  subscribe(){return ()=>{unsubscribes++;throw new Error('Native bridge already closed')}}
 }});
 const pending=client.request('getCapabilities');
 assert.doesNotThrow(()=>client.destroy());
 await assert.rejects(pending,/destroyed/);
 client.destroy();
 assert.equal(unsubscribes,1);
});
