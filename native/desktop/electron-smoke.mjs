import { _electron as electron } from 'playwright';
import {createRequire} from 'node:module';
import {resolve} from 'node:path';
const require=createRequire(import.meta.url);
const electronBinary=require('electron');
let app;
try{
 app=await electron.launch({
  executablePath:electronBinary,
  args:[resolve('native/desktop')],
  timeout:45000,
  env:{...process.env,ELECTRON_DISABLE_SECURITY_WARNINGS:'true'}
 });
 const win=await app.firstWindow({timeout:30000});
 await win.waitForSelector('#host-status',{timeout:20000});
 try{
  await win.getByText('Native electron host connected',{exact:false}).waitFor({timeout:20000});
 }catch(error){
  const diagnostic=await win.evaluate(()=>({
   hostStatus:document.getElementById('host-status')?.textContent,
   nativeTransport:typeof window.GCNativeHost,
   scripts:[...document.scripts].map(element=>element.src)
  })).catch(()=>null);
  console.error('ELECTRON NATIVE CONNECTION DIAGNOSTIC',JSON.stringify(diagnostic));
  throw error;
 }
 const platform=await win.locator('#platform').inputValue();
 if(platform!=='desktop')throw new Error('Host did not select desktop profile: '+platform);
 const before=await win.locator('html').getAttribute('data-gc-native-host');
 if(before!=='electron')throw new Error('No verified Electron connection');
 const current=await win.locator('html').getAttribute('data-gc-mode');
 const next=current==='dark'?'light':'dark';
 await win.getByRole('button',{name:'Switch to '+next+' appearance'}).click();
 await win.waitForFunction(mode=>document.documentElement.dataset.gcMode===mode,next);
 const title=await win.title();
 const version=await app.evaluate(()=>process.versions.electron);
 const expected=require('./package.json').devDependencies.electron;
 if(version!==expected)throw new Error('Electron runtime is not pinned version: '+version+' instead of '+expected);
 await win.screenshot({path:'/tmp/gc-electron-native-preview.png',fullPage:true});
 console.log('ELECTRON HOST SMOKE PASS',JSON.stringify({title,version,platform,verifiedHost:before,appearance:next}));
}finally{if(app)await app.close()}
