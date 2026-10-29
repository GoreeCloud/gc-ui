import test from 'node:test';
import assert from 'node:assert/strict';
import {applyVerifiedHostCapabilities,resolveEffectiveNativePreferences} from '../src/gc-native-host.mjs';

test('verified native capabilities cannot weaken browser forced-colors safety',()=>{
 const root={dataset:{}};
 const capabilities={protocol:1,platform:'desktop',host:'electron',
  nativeAdapterInstalled:true,highContrast:false,reducedMotion:false,
  reducedTransparency:false,lowPower:false};
 const browser={forcedColors:true};
 const options=resolveEffectiveNativePreferences(browser,capabilities);
 const profile=applyVerifiedHostCapabilities(root,capabilities,options);
 assert.equal(profile.nativeAdapterInstalled,true);
 assert.equal(profile.maxDepth,'e0');
 assert.equal(profile.lens,'solid');
 assert.equal(profile.motion,'none');
 assert.equal(root.dataset.gcPlatformDepth,'e0');
 assert.equal(root.dataset.gcPlatformLens,'solid');
 assert.equal(root.dataset.gcNativeHost,'electron');
});
test('normal native profiles retain their platform-specific defaults',()=>{
 const root={dataset:{}};
 const c={protocol:1,platform:'phone',host:'android',nativeAdapterInstalled:true};
 const resolved=applyVerifiedHostCapabilities(root,c,{forcedColors:false});
 assert.equal(resolved.maxDepth,'e2');
 assert.equal(resolved.motion,'standard');
 assert.equal(resolved.lens,'bounded');
});
