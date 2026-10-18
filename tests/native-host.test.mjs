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
test('independent native clients never confuse replies on the same transport',async()=>{
 const f=fixture();
 const alpha=createNativeHostClient({transport:f.transport,timeoutMs:500});
 const beta=createNativeHostClient({transport:f.transport,timeoutMs:500});
 const one=alpha.request('getCapabilities'),two=beta.request('selectionFeedback');
 assert.equal(f.messages.length,2);
 assert.notEqual(f.messages[0].id,f.messages[1].id,'client request IDs must not collide');
 f.respond({v:1,type:'gc-host/response',id:f.messages[1].id,ok:true,result:{owner:'beta'}});
 f.respond({v:1,type:'gc-host/response',id:f.messages[0].id,ok:true,result:{owner:'alpha'}});
 assert.deepEqual(await one,{owner:'alpha'});
 assert.deepEqual(await two,{owner:'beta'});
 alpha.destroy();beta.destroy();
 assert.equal(f.subscribers.size,0);
});

test('a new client cannot consume a stale response for an earlier client',async()=>{
 const f=fixture();
 const first=createNativeHostClient({transport:f.transport,timeoutMs:500});
 const unfinished=first.request('getCapabilities');
 const oldId=f.messages[0].id;
 first.destroy();
 await assert.rejects(unfinished,/destroyed/);
 const next=createNativeHostClient({transport:f.transport,timeoutMs:500});
 const current=next.request('getCapabilities');
 const currentId=f.messages[1].id;
 assert.notEqual(oldId,currentId);
 f.respond({v:1,type:'gc-host/response',id:oldId,ok:true,result:{outdated:true}});
 f.respond({v:1,type:'gc-host/response',id:currentId,ok:true,result:{current:true}});
 assert.deepEqual(await current,{current:true});
 next.destroy();
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

test('Android host subscriptions can retire in reverse or original order',()=>{
 let priorCalls=0,alphaCalls=0,betaCalls=0;
 const original=()=>{priorCalls++};
 const android={postMessage(){},onmessage:original};
 const alpha=createNativeTransport({GCAndroidHost:android});
 const beta=createNativeTransport({GCAndroidHost:android});
 const retireAlpha=alpha.subscribe(()=>{alphaCalls++});
 const retireBeta=beta.subscribe(()=>{betaCalls++});
 const dispatcher=android.onmessage;
 dispatcher({data:'one'});
 assert.deepEqual([priorCalls,alphaCalls,betaCalls],[1,1,1]);
 retireAlpha();
 dispatcher({data:'two'});
 assert.deepEqual([priorCalls,alphaCalls,betaCalls],[2,1,2]);
 retireBeta();
 assert.equal(android.onmessage,original,'all clients retired: restore original callback');
 retireBeta();retireAlpha();
 assert.equal(android.onmessage,original,'teardown is idempotent');
 const nextA=alpha.subscribe(()=>{alphaCalls++});
 const nextB=beta.subscribe(()=>{betaCalls++});
 nextB();nextA();
 assert.equal(android.onmessage,original,'reverse teardown also restores original callback');
});

test('a failing Android subscriber cannot prevent another client from receiving an event',()=>{
 let received=0;
 const android={postMessage(){},onmessage:null};
 const first=createNativeTransport({GCAndroidHost:android});
 const second=createNativeTransport({GCAndroidHost:android});
 const stopBroken=first.subscribe(()=>{throw new Error('broken listener')});
 const stopHealthy=second.subscribe(()=>{received++});
 assert.doesNotThrow(()=>android.onmessage({data:'host-response'}));
 assert.equal(received,1);
 stopBroken();stopHealthy();
 assert.equal(android.onmessage,null);
});

test('Android transport delivers host replies even when an earlier message callback fails',async()=>{
 let previousReceiver;
 const earlier=function(){previousReceiver=this;throw new Error('unrelated listener failed')};
 let firstRequest;
 const android={postMessage(text){firstRequest=JSON.parse(text)},onmessage:earlier};
 const client=createNativeHostClient({transport:createNativeTransport({GCAndroidHost:android}),timeoutMs:250});
 const response=client.request('getCapabilities');
 android.onmessage({data:JSON.stringify({
  v:1,type:'gc-host/response',id:firstRequest.id,ok:true,result:{host:'android'}
 })});
 assert.deepEqual(await response,{host:'android'});
 assert.equal(previousReceiver,android,'previous callback retains the original receiver');
 client.destroy();
 assert.equal(android.onmessage,earlier,'teardown restores the preexisting callback');

 let secondRequest;
 const invalid={postMessage(text){secondRequest=JSON.parse(text)},onmessage:'not-a-function'};
 const next=createNativeHostClient({transport:createNativeTransport({GCAndroidHost:invalid}),timeoutMs:250});
 const pending=next.request('selectionFeedback');
 invalid.onmessage({data:JSON.stringify({
  v:1,type:'gc-host/response',id:secondRequest.id,ok:true,result:{performed:true}
 })});
 assert.deepEqual(await pending,{performed:true});
 next.destroy();
 assert.equal(invalid.onmessage,'not-a-function');
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
