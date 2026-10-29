import test from 'node:test';
import assert from 'node:assert/strict';
import {GC_MOTION_PRESETS,getMotionPreset} from '../src/gc-motion-presets.mjs';

test('the exported motion grammar cannot be mutated by consumers',()=>{
 assert.equal(Object.isFrozen(GC_MOTION_PRESETS),true);
 for(const [name,frames] of Object.entries(GC_MOTION_PRESETS)){
  assert.equal(Object.isFrozen(frames),true,name+' collection');
  for(const [index,frame] of frames.entries()){
   assert.equal(Object.isFrozen(frame),true,name+' frame '+index);
   assert.throws(()=>{frame.opacity=0},TypeError);
  }
 }
});
test('consumer-owned motion keyframe copies can be customized safely',()=>{
 const original=GC_MOTION_PRESETS.reveal[0].opacity;
 const first=getMotionPreset('reveal');
 first.frames[0].opacity=0.35;
 assert.equal(first.frames[0].opacity,0.35);
 assert.equal(GC_MOTION_PRESETS.reveal[0].opacity,original);
 assert.equal(getMotionPreset('reveal').frames[0].opacity,original);
 const rtl=getMotionPreset('slideInline',{direction:'rtl'});
 assert.equal(rtl.frames[0].transform,'translateX(-8px)');
 assert.equal(GC_MOTION_PRESETS.slideInline[0].transform,'translateX(8px)');
});
