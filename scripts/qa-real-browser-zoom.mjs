/**
 * Opt-in, Linux X11 *native browser zoom* QA.
 * Run only on an isolated virtual Xvfb display:
 * GDK_BACKEND=x11 MOZ_ENABLE_WAYLAND=0 XDG_SESSION_TYPE=x11
 *   xvfb-run -a -s '-screen 0 1440x900x24' node scripts/qa-real-browser-zoom.mjs chromium
 *
 * This sends genuine Ctrl+= browser-window shortcuts with XTest and confirms
 * DPR/viewport changes. Not an OS accessibility/AT or Safari acceptance test.
 */
import assert from 'node:assert/strict';
import {chromium,firefox} from '@playwright/test';
import {execFileSync} from 'node:child_process';
import {createServer} from 'node:http';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {dirname,extname,resolve,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {captureZoomScreenshot} from './zoom-screenshot-evidence.mjs';

const engineName=process.argv[2];
assert(['chromium','firefox'].includes(engineName),'Use chromium or firefox');
assert(process.platform==='linux'&&process.env.DISPLAY,
 'Native browser zoom QA requires Linux on a dedicated Xvfb display');
assert(process.env.GC_ZOOM_ISOLATED_DISPLAY==='1',
 'Refusing to send XTest key events without GC_ZOOM_ISOLATED_DISPLAY=1');
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const out=resolve(root,'test-results','real-browser-zoom',engineName);
const helper=resolve(root,'scripts','qa-x11-zoom.py');
const mime={'.html':'text/html','.mjs':'text/javascript','.js':'text/javascript',
 '.css':'text/css','.json':'application/json','.svg':'image/svg+xml',
 '.png':'image/png','.webp':'image/webp','.ico':'image/x-icon'};
const server=createServer(async(req,res)=>{
 try{
  const path=resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
  if(!path.startsWith(root+sep)){res.writeHead(403).end();return}
  const bytes=await readFile(path);
  res.writeHead(200,{'Content-Type':mime[extname(path)]||'application/octet-stream'}).end(bytes);
 }catch{res.writeHead(404).end()}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const baseURL='http://127.0.0.1:'+server.address().port;
const observations=[],screenshotFailures=[];
let screenshotCount=0,browser=null;
try{
 await mkdir(out,{recursive:true});
 const engine=engineName==='chromium'?chromium:firefox;
 browser=await engine.launch({headless:false,args:engineName==='chromium'?['--window-size=1280,800','--ozone-platform=x11']:[]});
 const context=await browser.newContext({viewport:null});
 const page=await context.newPage();
 await page.goto(baseURL+'/lab/v1.html');
 await page.waitForTimeout(300);
 const tree=execFileSync('xwininfo',['-root','-tree'],{encoding:'utf8'});
 const windowMatch=tree.match(/(0x[0-9a-f]+) "GoreeCloud UI[^\n]*"/i);
 assert(windowMatch,'Could not identify browser window on isolated X11 display');
 const windowId=windowMatch[1];
 const metrics=()=>page.evaluate(()=>{
  const html=document.documentElement,body=document.body;
  return {dpr:devicePixelRatio,cssWidth:innerWidth,cssHeight:innerHeight,
   htmlOverflow:html.scrollWidth-html.clientWidth,
   bodyOverflow:body.scrollWidth-body.clientWidth,
   direction:html.dir||getComputedStyle(html).direction};
 });
 async function setNativeZoom(target){
  for(let i=0;i<30;i++){
   const dpr=(await metrics()).dpr;
   if(Math.abs(dpr-target)<0.025)return;
   assert(dpr<target,'Zoom passed requested level: '+dpr+' > '+target);
   execFileSync('python3',[helper,windowId,'plus'],{env:process.env});
   await page.waitForTimeout(100);
  }
  assert.fail('Browser never reached '+target+'x zoom');
 }
 const initial=await metrics();
 assert(Math.abs(initial.dpr-1)<0.025,'Expected clean 100% browser zoom at start');
 console.log(JSON.stringify({engine:engineName,initial,windowId}));

 for(const scale of [2,4]){
  await setNativeZoom(scale);
  for(const lab of ['v1','components','catalog','adaptive','forms']){
   await page.goto(baseURL+'/lab/'+lab+'.html');
   await page.waitForTimeout(90);
   for(const direction of ['ltr','rtl']){
    await page.evaluate(dir=>document.documentElement.dir=dir,direction);
    const current=await metrics();
    const label=engineName+' '+lab+' '+(scale*100)+'% '+direction;
    assert(Math.abs(current.dpr-scale)<0.025,label+': native zoom drifted');
    assert(Math.abs(current.cssWidth-initial.cssWidth/scale)<3,label+': no true viewport reflow');
    assert(current.htmlOverflow<=1,label+': HTML horizontal overflow '+current.htmlOverflow);
    assert(current.bodyOverflow<=1,label+': body horizontal overflow '+current.bodyOverflow);
    observations.push({lab,scale,direction,...current});
   }
   await page.evaluate(()=>document.documentElement.dir='ltr');
   const capture=await captureZoomScreenshot(page,{
    path:resolve(out,lab+'-'+scale*100+'.png'),
    animations:'disabled',timeout:15000
   });
   if(capture.captured){
    screenshotCount++;
    if(capture.attempts>1)console.log('RECOVERED screenshot '+engineName+' '+lab+' '+scale*100+'% on retry');
   }else{
    // Screenshot coverage is optional evidence, separate from required
    // native DPR, reflow, hit-target, and keyboard assertions.
    screenshotFailures.push({lab,scale,message:String(capture.error).slice(0,350)});
    console.warn('WARN screenshot unavailable after '+capture.attempts+' attempts '+engineName+' '+lab+' '+scale*100+'%: '+String(capture.error).split('\n')[0]);
   }
   console.log('PASS '+engineName+' '+lab+' '+scale*100+'% native zoom LTR/RTL');
  }
 }

 await page.goto(baseURL+'/lab/adaptive.html');
 assert(await page.locator('.gc-nav-bottom').isVisible(),'Bottom navigation should be visible at 400%');
 const geometry=await page.evaluate(()=>{
  const select=s=>document.querySelector(s);
  const box=el=>{const r=el.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height,bottom:r.bottom,z:getComputedStyle(el).zIndex}};
  const header=select('.gc-app-bar'),nav=select('.gc-nav-bottom'),link=select('.gc-nav-bottom [data-gc-route="library"]');
  const l=link.getBoundingClientRect();
  const mid={x:l.left+l.width/2,y:l.top+l.height/2};
  return {dpr:devicePixelRatio,innerHeight,mozInnerScreenX:window.mozInnerScreenX,mozInnerScreenY:window.mozInnerScreenY,screenX,screenY,outerHeight,header:box(header),nav:box(nav),link:box(link),mid,hit:document.elementFromPoint(mid.x,mid.y)?.outerHTML.slice(0,240)};
 });
 console.log('400% geometry '+engineName+' '+JSON.stringify(geometry));
 const interactionCapture=await captureZoomScreenshot(page,{
  path:resolve(out,'adaptive-interaction-400.png'),animations:'disabled',timeout:15000
 });
 if(interactionCapture.captured){
  screenshotCount++;
  if(interactionCapture.attempts>1)console.log('RECOVERED interaction screenshot on retry');
 }else{
  screenshotFailures.push({lab:'adaptive interaction',scale:4,message:String(interactionCapture.error).slice(0,350)});
  console.warn('WARN interaction screenshot unavailable after '+interactionCapture.attempts+' attempts: '+String(interactionCapture.error).split('\n')[0]);
 }
 if(engineName==='firefox'){
  const px=Math.round((geometry.mozInnerScreenX+geometry.mid.x)*geometry.dpr);
  const py=Math.round((geometry.mozInnerScreenY+geometry.mid.y)*geometry.dpr);
  console.log('FIREFOX X11 native pointer click '+px+','+py);
  execFileSync('python3',[helper,windowId,'click',String(px),String(py)],{env:process.env});
  await page.waitForTimeout(250);
 }else{
  await page.locator('.gc-nav-bottom [data-gc-route="library"]').click({timeout:5000});
 }
 assert(page.url().endsWith('#library'),'Compact route click must navigate at native 400%');
 const activate=async locator=>{
  if(engineName==='firefox'){await locator.focus();await locator.press('Enter')}
  else await locator.click();
 };
 const trigger=page.getByRole('button',{name:'Details',exact:true});
 await trigger.evaluate(el=>el.scrollIntoView({block:'center',behavior:'instant'}));
 const detailsHit=await trigger.evaluate(el=>{
  const r=el.getBoundingClientRect(),x=r.left+r.width/2,y=r.top+r.height/2;
  return {rect:{y:r.y,height:r.height},hit:document.elementFromPoint(x,y)?.outerHTML.slice(0,160),
   viewport:innerHeight,scrollY};
 });
 console.log('Details target geometry '+engineName+' '+JSON.stringify(detailsHit));
 await activate(trigger);
 const dialog=page.getByRole('dialog',{name:'Designed to adapt.'});
 assert(await dialog.isVisible(),'Native sheet must remain operable at 400%');
 await activate(dialog.getByRole('button',{name:'Done'}));
 assert(!(await dialog.isVisible()),'Native sheet must close');
 assert(await trigger.evaluate(el=>el===document.activeElement),'Dialog must restore focus');
 const footer=page.locator('.gc-shell-footer a[href="./forms.html"]');
 await activate(footer);
 assert(page.url().endsWith('/lab/forms.html'),'Footer link must remain clickable at 400%');
 const stepper=page.getByRole('button',{name:'Add one collaborator'});
 await activate(stepper);
 assert.equal(await page.getByRole('spinbutton',{name:'Collaborators'}).inputValue(),'4');
 await activate(page.getByRole('button',{name:'Create brief'}));
 assert(await page.locator('#brief-errors').evaluate(el=>el===document.activeElement),
  'Form validation must focus summary at native 400%');
 console.log('PASS '+engineName+' native 400% navigation/dialog/footer/form focus');

 execFileSync('python3',[helper,windowId,'reset'],{env:process.env});
 await page.waitForTimeout(120);
 const reset=await metrics();
 assert(Math.abs(reset.dpr-1)<0.025,'Native browser zoom failed to reset');
 await writeFile(resolve(out,'metrics.json'),JSON.stringify({
  engine:engineName,windowId,initial,reset,observations,
  screenshotCount,screenshotExpected:11,screenshotFailures,
  interaction:'PASS',method:'XTest Ctrl+= in isolated Xvfb browser window',
  limitations:'Not manual screen-reader speech, Safari, OS text scaling or visual certification'
 },null,2)+'\n');
 console.log(JSON.stringify({engine:engineName,status:'PASS',layoutChecks:observations.length,
  screenshots:screenshotCount,screenshotFailures:screenshotFailures.length,interaction:'PASS',reset}));
} finally {
 await browser?.close();
 await new Promise((res,rej)=>server.close(err=>err?rej(err):res()));
}
