import test from 'node:test';
import assert from 'node:assert/strict';
import {GC_DEPTH_TIERS,resolveMaterialDepth} from '../src/gc-material-depth.mjs';

test('surface depth is semantic, capped per context and never unbounded',()=>{
 assert.deepEqual(GC_DEPTH_TIERS,['e0','e1','e2','e3']);
 assert.equal(resolveMaterialDepth({context:'workspace',purpose:'overlay'}).depth,'e3');
 assert.equal(resolveMaterialDepth({context:'reading',purpose:'overlay'}).depth,'e1');
 assert.equal(resolveMaterialDepth({context:'analysis',purpose:'overlay'}).depth,'e2');
 assert.equal(resolveMaterialDepth({context:'unknown',purpose:'unknown'}).depth,'e1');
 assert.equal(resolveMaterialDepth({context:'workspace',requested:'not-a-tier'}).depth,'e1');
 assert.equal(resolveMaterialDepth({context:'media',requested:'e3'}).depth,'e2');
});
test('high contrast, low power and reduced transparency disable visual excess',()=>{
 const strong=resolveMaterialDepth({purpose:'overlay',highContrast:true});
 assert.deepEqual([strong.depth,strong.shadow,strong.lens,strong.decorativeLight],['e0',false,false,false]);
 assert.equal(resolveMaterialDepth({purpose:'overlay',forcedColors:true}).depth,'e0');
 const low=resolveMaterialDepth({purpose:'overlay',lowPower:true});
 assert.equal(low.depth,'e1');assert.equal(low.shadow,false);assert.equal(low.lens,false);
 assert.equal(resolveMaterialDepth({purpose:'overlay',reducedTransparency:true}).lens,false);
 assert.equal(resolveMaterialDepth({context:'analysis',purpose:'active'}).shadow,false);
});
