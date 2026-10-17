import test from 'node:test';
import assert from 'node:assert/strict';
import {GC_MOTION_PRESETS,getMotionPreset,motionAllowed,playMotionPreset} from '../src/gc-motion-presets.mjs';
import {playWithMotion,enableAutoAnimate,mountLottie} from '../integrations/optional-motion.mjs';

test('motion presets are short and directional without mutating shared definitions',()=>{
 assert.equal(Object.keys(GC_MOTION_PRESETS).length,5);
 for(const name of Object.keys(GC_MOTION_PRESETS)){
  const preset=getMotionPreset(name);
  assert.ok(preset.timing.duration<=440,name);
  assert.ok(preset.frames.length>=2,name);
 }
 const rtl=getMotionPreset('slideInline',{direction:'rtl'});
 assert.equal(rtl.frames[0].transform,'translateX(-8px)');
 assert.equal(getMotionPreset('slideInline').frames[0].transform,'translateX(8px)');
 assert.throws(()=>getMotionPreset('bounceForever'));
});
test('reduced motion never invokes native animate',()=>{
 let calls=0;
 const el={animate(frames,timing){calls++;return {frames,timing}}};
 assert.equal(playMotionPreset(el,'reveal',{reducedMotion:true}),null);
 assert.equal(calls,0);
 assert.equal(motionAllowed({root:{dataset:{gcContrast:'high'}}}),false);
 assert.equal(playMotionPreset(el,'settle',{media:q=>({matches:q.includes('reduced-motion')})}),null);
 const result=playMotionPreset(el,'settle',{media:()=>({matches:false}),root:{dataset:{}}});
 assert.equal(calls,1);
 assert.equal(result.timing.duration,220);
});
test('optional adapters are injected and do not require peer packages',()=>{
 const element={};
 const motion=playWithMotion((el,frames,timing)=>({el,frames,timing}),element,'reveal',{media:()=>({matches:false}),root:{dataset:{}}});
 assert.equal(motion.timing.duration,.32);
 assert.equal(playWithMotion(()=>{throw Error('Must not animate')},element,'settle',{reducedMotion:true}),null);
 const config=enableAutoAnimate((_el,opts)=>opts,element,{duration:800,media:()=>({matches:false}),root:{dataset:{}}});
 assert.equal(config.duration,440);
 let params;
 const lottie={loadAnimation(x){params=x;return {goToAndStop:(frame)=>{params.frame=frame}}}};
 mountLottie(lottie,element,{v:'5.0'},{autoplay:true,loop:true,reducedMotion:true});
 assert.equal(params.autoplay,false);
 assert.equal(params.loop,false);
 assert.equal(params.frame,0);
 assert.throws(()=>mountLottie({},element,{}));
});
