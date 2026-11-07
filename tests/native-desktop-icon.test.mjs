import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';

// Published central brand-assets /products/gc-ui/raster/icon-512.png is source
// authority; this is a pinned, source-identical native desktop preview copy.
const sha256='12f77149579508284e85c56033d6fe9a93b664db18887dccbf4f3f3f99081880';
const iconPath=new URL('../native/desktop/resources/aperture-weave-512.png',import.meta.url);
const mainPath=new URL('../native/desktop/main.mjs',import.meta.url);

test('desktop preview icon exactly matches approved GC UI raster and PNG dimensions',()=>{
 const bytes=readFileSync(iconPath);
 assert.equal(bytes.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
 assert.equal(bytes.readUInt32BE(16),512);
 assert.equal(bytes.readUInt32BE(20),512);
 assert.equal(bytes.length,75236);
 assert.equal(createHash('sha256').update(bytes).digest('hex'),sha256);
});

test('optional Electron preview uses the verified local icon rather than a remote or default icon',()=>{
 const src=readFileSync(mainPath,'utf8');
 assert.match(src,/icon:join\(import\.meta\.dirname,'resources','aperture-weave-512\.png'\)/);
 assert.match(src,/nodeIntegration:false,contextIsolation:true,sandbox:true,webSecurity:true/);
 assert.match(src,/show:false/);
});
