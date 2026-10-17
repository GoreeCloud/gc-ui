import test from 'node:test';
import assert from 'node:assert/strict';
import {GC_PLATFORM_PROFILES,resolvePlatformProfile,applyPlatformProfile} from '../src/gc-platform-profile.mjs';
test('platform profiles are explicit semantic guidance rather than inferred hardware',()=>{
 assert.deepEqual(Object.keys(GC_PLATFORM_PROFILES),['web','phone','tablet','desktop','tv','wearable','spatial']);
 assert.equal(resolvePlatformProfile('nonsense').kind,'web');
 assert.equal(resolvePlatformProfile('phone').navigation,'bottom');
 assert.equal(resolvePlatformProfile('desktop').navigation,'sidebar');
 assert.equal(resolvePlatformProfile('tv').targetPx,64);
 assert.equal(resolvePlatformProfile('wearable').maxDepth,'e0');
 assert.equal(resolvePlatformProfile('spatial').lens,'host-managed');
 for(const k of Object.keys(GC_PLATFORM_PROFILES))assert.equal(resolvePlatformProfile(k).nativeAdapterInstalled,false);
});
test('system accessibility and low power always restrict profiles',()=>{
 const profile=resolvePlatformProfile('tv',{reducedMotion:true,highContrast:true});
 assert.deepEqual([profile.motion,profile.lens,profile.maxDepth],['none','solid','e0']);
 const low=resolvePlatformProfile('desktop',{lowPower:true});
 assert.equal(low.maxDepth,'e0');assert.equal(low.lens,'solid');
 assert.equal(resolvePlatformProfile('phone',{reducedTransparency:true}).lens,'solid');
 const root={dataset:{}};
 assert.equal(applyPlatformProfile(root,'phone').kind,'phone');
 assert.equal(root.dataset.gcPlatform,'phone');
 assert.equal(root.dataset.gcPlatformDepth,'e2');
 assert.throws(()=>applyPlatformProfile(null,'web'),/Root/);
});
