import { _electron as electron } from 'playwright';
import {createRequire} from 'node:module';
import {join,resolve} from 'node:path';
import {tmpdir} from 'node:os';
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
 // Browser's accessible-role exposure and keyboard activation on the actual Electron host.
 // This is an automated semantic smoke check, not spoken Orca/VoiceOver acceptance.
 const combobox=win.getByRole('combobox',{name:'Platform profile'});
 if(await combobox.count()!==1)throw new Error('Native desktop platform selector lacks its accessible label');
 if(await win.getByRole('checkbox',{name:'Preview resource conservation'}).count()!==1)
  throw new Error('Conservation preview checkbox lacks its accessible name');
 if(await win.getByRole('heading',{name:'Tune the experience.'}).count()!==1)
  throw new Error('Native desktop experience heading is missing');
 const current=await win.locator('html').getAttribute('data-gc-mode');
 const next=current==='dark'?'light':'dark';
 const appearance=win.getByRole('button',{name:'Switch to '+next+' appearance'});
 await appearance.focus();
 if(!(await appearance.evaluate(element=>element===document.activeElement)))
  throw new Error('Native desktop appearance control did not receive keyboard focus');
 await win.keyboard.press('Enter');
 await win.waitForFunction(mode=>document.documentElement.dataset.gcMode===mode,next);
 const title=await win.title();
 const version=await app.evaluate(()=>process.versions.electron);
 const expected=require('./package.json').devDependencies.electron;
 if(version!==expected)throw new Error('Electron runtime is not pinned version: '+version+' instead of '+expected);
 await win.screenshot({path:join(tmpdir(),'gc-electron-native-preview.png'),fullPage:true});
 console.log('ELECTRON HOST SMOKE PASS',JSON.stringify({title,version,hostOS:process.platform,platform,verifiedHost:before,appearance:next,accessibleLabels:true,keyboardActivation:true}));
}finally{if(app)await app.close()}
