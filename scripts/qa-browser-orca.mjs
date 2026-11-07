/** Local-only, headed browser fixture for isolated Orca/AT-SPI acceptance diagnostics. */
import {chromium} from '@playwright/test';
import {access} from 'node:fs/promises';

const port=Number(process.env.GC_UI_AT_PORT);
if(!Number.isInteger(port)||port<1024||port>65535)
 throw new Error('GC_UI_AT_PORT must be a valid local test port');
const base='http://127.0.0.1:'+port;
// Speech gates are written by an independent observer only after real Orca
// debug output includes the expected utterance. Bounded focus retries help
// platforms which do not announce the first synthetic keyboard focus event.
async function waitForSpeechGate(page,envKey,restoreFocus){
 const gate=process.env[envKey];
 if(!gate)throw new Error('Real Orca speech gate missing: '+envKey);
 for(let attempt=0;attempt<56;attempt++){
  try{await access(gate);return}catch(error){
   if(error.code!=='ENOENT')throw error;
  }
  if(attempt===16||attempt===32)await restoreFocus();
  await page.waitForTimeout(250);
 }
 throw new Error('Real Orca did not announce focused control: '+envKey);
}
const browser=await chromium.launch({headless:false,args:['--force-renderer-accessibility']});
try{
 const page=await browser.newPage({viewport:{width:1000,height:850}});
 await page.goto(base+'/lab/components.html');
 const trigger=page.locator('#gc-file-action-trigger');
 await trigger.focus();
 await page.waitForTimeout(2500);
 await trigger.press('ArrowDown');
 await page.getByRole('menuitem',{name:'Duplicate workspace'}).waitFor();
 console.log('PHASE_COMPONENTS_MENU_OPEN');
 await page.waitForTimeout(5000);
 await page.keyboard.press('Escape');
 await page.waitForTimeout(1400);
 await page.goto(base+'/lab/forms.html');
 const input=page.getByRole('combobox',{name:'Search projects'});
 await input.focus();
 await input.fill('d');
 await input.press('ArrowDown');
 await page.getByRole('option',{name:'Studio refresh'}).waitFor();
 console.log('PHASE_FORMS_SUGGESTION_OPEN');
 await waitForSpeechGate(page,'GC_UI_AT_FORMS_SPEECH_GATE',async()=>{
  await page.keyboard.press('Tab');
  await page.keyboard.press('Shift+Tab');
  await input.focus();
 });
 await input.press('Escape');
 await page.waitForTimeout(1400);
 const sample=page.locator('#demo-passphrase');
 const invented='test-only-not-a-credential';
 await sample.fill(invented);
 const reveal=page.locator('#passphrase-reveal');
 const stableName='Reveal sample passphrase';
 const statesMatch=async(pressed,type)=>await reveal.getAttribute('aria-pressed')===pressed
  &&await sample.getAttribute('type')===type
  &&await sample.inputValue()===invented
  &&await reveal.getAttribute('aria-label')===stableName;
 if(!await statesMatch('false','password'))
  throw new Error('Password reveal initial name, value or masked state invalid');
 await sample.focus();
 await sample.press('Tab');
 if(!await reveal.evaluate(element=>document.activeElement===element))
  await reveal.focus();
 console.log('PHASE_PASSWORD_REVEAL_FOCUSED');
 await waitForSpeechGate(page,'GC_UI_AT_REVEAL_SPEECH_GATE',async()=>{
  await sample.focus();
  await sample.press('Tab');
  if(!await reveal.evaluate(element=>document.activeElement===element))
   await reveal.focus();
 });
 await reveal.press('Space');
 if(!await statesMatch('true','text'))
  throw new Error('Password reveal did not expose stable label, value and visible state');
 console.log('PHASE_PASSWORD_REVEAL_ON');
 // Do not re-mask until the external real AT-SPI observer has actually
 // sampled the pressed state; an arbitrary sleep can miss this brief phase.
 const gate=process.env.GC_UI_AT_PRESSED_GATE;
 if(!gate)throw new Error('Isolated AT-SPI state-observation gate required');
 let atspiObservedPressed=false;
 for(let attempt=0;attempt<40;attempt++){
  try{
   await access(gate);
   atspiObservedPressed=true;
   break;
  }catch(error){
   if(error.code!=='ENOENT')throw error;
  }
  await page.waitForTimeout(250);
 }
 if(!atspiObservedPressed)
  throw new Error('AT-SPI observer did not report the pressed toggle state');
 await page.waitForTimeout(600);
 await reveal.press('Space');
 if(!await statesMatch('false','password'))
  throw new Error('Password reveal did not restore stable label, value and masked state');
 console.log('PHASE_PASSWORD_REVEAL_OFF');
 await page.waitForTimeout(2200);
}finally{
 await browser.close();
}
