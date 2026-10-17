import test from 'node:test';
import assert from 'node:assert/strict';
import {dispatchDesktopHost} from '../host-contract.mjs';
const call=(id,action,payload={})=>JSON.stringify({v:1,type:'gc-host/request',id,action,payload});
test('Electron host exposes minimal, versioned capabilities',()=>{
 const response=JSON.parse(dispatchDesktopHost(call('x1','getCapabilities')));
 assert.equal(response.ok,true);
 assert.equal(response.result.platform,'desktop');
 assert.equal(response.result.host,'electron');
 assert.equal(response.result.nativeAdapterInstalled,true);
 assert.equal(response.result.selectionFeedback,false);
});
test('Electron host controls theme via narrow mode enum, never arbitrary OS commands',()=>{
 const theme={themeSource:'system'};
 const result=JSON.parse(dispatchDesktopHost(call('x2','setAppearance',{mode:'dark'}),{nativeTheme:theme}));
 assert.deepEqual(result.result,{mode:'dark'});
 assert.equal(theme.themeSource,'dark');
 for(const action of ['openFile','runCommand','getLocation','openExternal']){
  assert.equal(JSON.parse(dispatchDesktopHost(call('x3',action),{nativeTheme:theme})).ok,false);
 }
 assert.equal(JSON.parse(dispatchDesktopHost(call('x4','setAppearance',{mode:'evil'}),{nativeTheme:theme})).ok,false);
 assert.equal(theme.themeSource,'dark');
});
test('Desktop handler rejects malformed, huge and unknown protocol frames',()=>{
 for(const body of ['bad', '{}', call('id','getCapabilities')+' '.repeat(2200),
  JSON.stringify({v:999,type:'gc-host/request',id:'b',action:'getCapabilities'})]){
  const answer=JSON.parse(dispatchDesktopHost(body,{nativeTheme:{themeSource:'system'}}));
  assert.equal(answer.ok,false);
 }
 assert.equal(JSON.parse(dispatchDesktopHost(call('x','selectionFeedback'))).result.performed,false);
});
