import {test,expect} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
import {resolve,join} from 'node:path';

const variants=[
 {id:'320-light',width:320,height:812,dark:false,rtl:false,forced:false,reduced:false},
 {id:'375-dark-reduced',width:375,height:812,dark:true,rtl:false,forced:false,reduced:true},
 {id:'768-rtl',width:768,height:900,dark:false,rtl:true,forced:false,reduced:false},
 {id:'1440-forced',width:1440,height:900,dark:false,rtl:false,forced:true,reduced:false}
];
const targets=[
 {id:'components-menu',path:'/lab/components.html',selector:'#gc-file-actions'},
 {id:'forms-suggestions',path:'/lab/forms.html',selector:'#project-suggestions'},
 {id:'forms-errors',path:'/lab/forms.html',selector:'#brief-errors'}
];
async function activate(page,id){
 if(id==='components-menu'){
  const trigger=page.locator('#gc-file-action-trigger');
  await trigger.press('ArrowDown');
  await expect(trigger).toHaveAttribute('aria-expanded','true');
  await expect(page.getByRole('menuitem',{name:'Duplicate workspace'})).toBeFocused();
 }else if(id==='forms-suggestions'){
  const input=page.getByRole('combobox',{name:'Search projects'});
  await expect(input).toBeEnabled();
  await input.fill('d'); await input.press('ArrowDown');
  await expect(input).toHaveAttribute('aria-expanded','true');
  await expect(input).toHaveAttribute('aria-activedescendant','project-suggestion-0');
 }else{
  const button=page.getByRole('button',{name:'Check brief'});
  await expect(button).toBeEnabled(); await button.click();
  await expect(page.locator('#brief-errors')).toBeFocused();
  await expect(page.locator('#brief-errors-list a')).toHaveCount(3);
 }
}
for(const target of targets)for(const variant of variants){
 test('open state '+target.id+' '+variant.id,async({page},testInfo)=>{
  await page.setViewportSize({width:variant.width,height:variant.height});
  await page.emulateMedia({colorScheme:variant.dark?'dark':'light',
   reducedMotion:variant.reduced?'reduce':'no-preference',
   forcedColors:variant.forced?'active':'none'});
  await page.goto(target.path);
  await page.evaluate(v=>{
   document.documentElement.dir=v.rtl?'rtl':'ltr';
   document.documentElement.dataset.gcMode=v.dark?'dark':'light';
  },variant);
  await activate(page,target.id);
  const surface=page.locator(target.selector);
  await expect(surface).toBeVisible();
  await surface.scrollIntoViewIfNeeded();
  await page.evaluate(()=>document.fonts.ready);
  const geometry=await surface.evaluate(el=>{
   const rect=el.getBoundingClientRect();
   const list=el.matches('#brief-errors')
    ? [...el.querySelectorAll('#brief-errors-list a')]
    : [...el.querySelectorAll('[role="option"],[role="menuitem"]')];
   return {
    surface:{left:rect.left,right:rect.right,top:rect.top,bottom:rect.bottom},
    viewport:{width:innerWidth,height:innerHeight},
    rootScrollWidth:document.documentElement.scrollWidth,
    bodyScrollWidth:document.body.scrollWidth,
    nodes:list.map(node=>{
     const r=node.getBoundingClientRect();
     // Inline summary anchors wrap across lines; the center of their union
     // can fall into empty whitespace. Check actual text fragment rectangles.
     const textRange=document.createRange();
     textRange.selectNodeContents(node);
     const fragments=node.tagName==='A'?Array.from(textRange.getClientRects()):[r];
     const fragmentHits=fragments.map(rect=>{
      const top=document.elementFromPoint(rect.left+rect.width/2,rect.top+rect.height/2);
      return top===node||node.contains(top);
     });
     return{name:(node.textContent||'').trim(),left:r.left,right:r.right,
      top:r.top,bottom:r.bottom,isHit:fragmentHits.some(Boolean),
      fragments:fragments.length};
    })
   };
  });
  expect(geometry.rootScrollWidth,'Root overflow').toBeLessThanOrEqual(variant.width+2);
  expect(geometry.bodyScrollWidth,'Body overflow').toBeLessThanOrEqual(variant.width+2);
  expect(geometry.surface.left,'Surface left').toBeGreaterThanOrEqual(-2);
  expect(geometry.surface.right,'Surface right').toBeLessThanOrEqual(variant.width+2);
  expect(geometry.surface.top,'Surface top').toBeGreaterThanOrEqual(-2);
  expect(geometry.surface.bottom,'Surface bottom').toBeLessThanOrEqual(variant.height+2);
  expect(geometry.nodes).toHaveLength(target.id==='components-menu'?4:3);
  for(const node of geometry.nodes){
   expect(node.left,'Item left '+node.name).toBeGreaterThanOrEqual(-2);
   expect(node.right,'Item right '+node.name).toBeLessThanOrEqual(variant.width+2);
   expect(node.isHit,'Obstructed item '+node.name).toBe(true);
  }
  const key=target.id+'-'+variant.id;
  const folder=resolve(testInfo.project.outputDir,'interactive-visual');
  await mkdir(folder,{recursive:true});
  const png=join(folder,key+'.png'),json=join(folder,key+'.json');
  await writeFile(png,await page.screenshot({animations:'disabled'}));
  await writeFile(json,JSON.stringify({schema:'gc-ui-interactive-visual-state.v1',
   target:target.id,path:target.path,variant,geometry,
   scope:'Actual open UI state and hit targets; not human visual or AT acceptance.'},null,2)+'\n');
  await testInfo.attach(key+'.png',{path:png,contentType:'image/png'});
  await testInfo.attach(key+'.json',{path:json,contentType:'application/json'});
 });
}
