import test from 'node:test';
import assert from 'node:assert/strict';
import {initDialog} from '../src/gc-interactions.mjs';
test('dialog skips an unavailable opener when restoring focus',()=>{
 const callbacks=new Map();
 const doc={addEventListener:(name,fn)=>callbacks.set(name,fn),removeEventListener:name=>callbacks.delete(name)};
 const dialog={localName:'dialog',id:'focus-dialog',ownerDocument:doc,open:false,
  addEventListener:(name,fn)=>callbacks.set(name,fn),removeEventListener:name=>callbacks.delete(name),
  showModal(){this.open=true},close(){this.open=false;callbacks.get('close')?.()}};
 let focusReturns=0,hidden=false;
 const opener={isConnected:true,dataset:{gcDialogOpen:'focus-dialog'},disabled:false,
  matches:()=>false,closest:()=>hidden?{}:null,focus(){focusReturns++}};
 const ctl=initDialog(dialog);
 const fire=()=>callbacks.get('click')({target:{closest:()=>opener}});
 fire();hidden=true;ctl.close();assert.equal(focusReturns,0);
 hidden=false;fire();ctl.close();assert.equal(focusReturns,1);
 fire();hidden=true;ctl.destroy();assert.equal(focusReturns,1);
});
