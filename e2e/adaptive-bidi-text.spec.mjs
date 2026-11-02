import {test,expect} from '@playwright/test';

const cases=[
 {width:320,height:812},
 {width:375,height:812},
 {width:768,height:900},
 {width:1440,height:900}
];
const labels={overview:'Your overview.',activity:'Your activity.',library:'Your library.'};
async function glyphPositions(node){
 return node.evaluate(element=>{
  const text=element.firstChild;
  if(!text||text.nodeType!==Node.TEXT_NODE)throw new Error('Expected isolated text node');
  const first=document.createRange(),last=document.createRange();
  first.setStart(text,0);first.setEnd(text,1);
  last.setStart(text,text.length-1);last.setEnd(text,text.length);
  return {first:first.getBoundingClientRect().left,last:last.getBoundingClientRect().left,
   direction:getComputedStyle(element).direction};
 });
}
for(const size of cases){
 test('Adaptive RTL English UI labels retain correct bidi punctuation and focus at '+size.width+'px',async({page})=>{
  await page.setViewportSize(size);
  await page.goto('/lab/adaptive.html');
  await page.evaluate(()=>document.documentElement.dir='rtl');
  for(const [route,label] of Object.entries(labels)){
   await page.evaluate(route=>{location.hash='#'+route},route);
   await expect(page.locator('#page-title')).toHaveText(label);
   const title=page.locator('#page-title > bdi[dir=auto]');
   const subtitle=page.locator('#page-subtitle > bdi[dir=auto]');
   const crumb=page.locator('#crumb-current > bdi[dir=auto]');
   const section=page.locator('#content-title > bdi[dir=auto]');
   await expect(title).toHaveText(label);
   await expect(subtitle).not.toBeEmpty();
   await expect(crumb).not.toBeEmpty();
   await expect(section).not.toBeEmpty();
   for(const node of [subtitle,crumb,section]){
    await expect(node).toHaveCSS('direction','ltr');
   }
   const subtitlePunctuation=await glyphPositions(subtitle);
   expect(subtitlePunctuation.first).toBeLessThan(subtitlePunctuation.last);

   const geometry=await glyphPositions(title);
   expect(geometry.direction,'English phrase chooses LTR for punctuation').toBe('ltr');
   expect(geometry.first,'English first letter precedes final punctuation').toBeLessThan(geometry.last);
   expect(await page.locator('#page-title').evaluate(el=>getComputedStyle(el).direction),
    'Layout-level heading stays RTL').toBe('rtl');
   await expect(page.locator('#page-title')).toBeFocused();
  }
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
 });
}
test('isolated label direction follows translated RTL text without changing shell direction',async({page})=>{
 await page.goto('/lab/adaptive.html');
 await page.evaluate(()=>document.documentElement.dir='rtl');
 const title=page.locator('#page-title > bdi[dir=auto]');
 await title.evaluate(node=>{node.textContent='لوحة المعلومات.'});
 await expect(title).toHaveCSS('direction','rtl');
 await expect(page.locator('#page-title')).toHaveCSS('direction','rtl');
});
