import test from 'node:test';
import assert from 'node:assert/strict';
import {GC_PLATFORM_PROFILES,resolvePlatformProfile,applyPlatformProfile} from '../src/gc-platform-profile.mjs';

test('forced-colors removes motion, depth and translucent lens on every platform profile',()=>{
 for(const kind of Object.keys(GC_PLATFORM_PROFILES)){
  const normal=resolvePlatformProfile(kind);
  const forced=resolvePlatformProfile(kind,{forcedColors:true});
  assert.equal(forced.kind,kind);
  assert.equal(forced.maxDepth,'e0',kind+' depth');
  assert.equal(forced.motion,'none',kind+' motion');
  assert.equal(forced.lens,'solid',kind+' lens');
  assert.equal(forced.targetPx,normal.targetPx,kind+' touch target');
  assert.equal(forced.navigation,normal.navigation,kind+' navigation');
  assert.equal(forced.focus,normal.focus,kind+' focus');
  assert.equal(forced.nativeAdapterInstalled,false);
 }
});
test('forced-colors settings flow through the platform root profile',()=>{
 const root={dataset:{}};
 const output=applyPlatformProfile(root,'spatial',{forcedColors:true});
 assert.equal(output.motion,'none');
 assert.equal(root.dataset.gcPlatform,'spatial');
 assert.equal(root.dataset.gcPlatformDepth,'e0');
 assert.equal(root.dataset.gcPlatformLens,'solid');
 assert.equal(resolvePlatformProfile('desktop').maxDepth,'e3');
});
