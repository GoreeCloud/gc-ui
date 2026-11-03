import {test,expect} from '@playwright/test';

/** English fixtures still need natural punctuation when the shell mirrors.
 * Text content stays isolatable for future genuine translations.
 * This is not a completed localized RTL experience.
 */
const pages=[
 {name:'components',heading:'.intro h1',lead:'.intro .summary',headingRuns:2,sectionHeadings:5},
 {name:'catalog',heading:'.hero h1',lead:'.hero > p:last-of-type',headingRuns:2,sectionHeadings:2},
 {name:'forms',heading:'.gc-form-intro h1',lead:'.gc-form-intro > p:last-child',headingRuns:1},
 {name:'environment',heading:'.hero h1',lead:'.hero .lead',headingRuns:2,sectionHeadings:3},
 {name:'experience-studio',heading:'#studio-title',lead:'.intro > p:last-of-type',headingRuns:2,sectionHeadings:3}
];
async function punctuationPositions(span){
 return span.evaluate(node=>{
  const walk=document.createTreeWalker(node,NodeFilter.SHOW_TEXT);
  const all=[];
  while(walk.nextNode())if(walk.currentNode.textContent)all.push(walk.currentNode);
  if(!all.length)throw new Error('No rendered isolated text');
  const first=all[0],last=all.at(-1);
  const firstRange=document.createRange(),lastRange=document.createRange();
  firstRange.setStart(first,0);firstRange.setEnd(first,1);
  const n=last.textContent.length;
  lastRange.setStart(last,n-1);lastRange.setEnd(last,n);
  return {
   first:firstRange.getBoundingClientRect().left,
   last:lastRange.getBoundingClientRect().left,
   direction:getComputedStyle(node).direction
  };
 });
}
for(const reference of pages){
 for(const width of [320,1440]){
  test(reference.name+' RTL heading/intro punctuation at '+width+'px',async({page})=>{
   await page.setViewportSize({width,height:900});
   await page.goto('/lab/'+reference.name+'.html');
   await page.evaluate(()=>document.documentElement.dir='rtl');
   const heading=page.locator(reference.heading);
   const lead=page.locator(reference.lead);
   const parts=heading.locator('bdi[dir=auto]');
   await expect(parts).toHaveCount(reference.headingRuns);
   const leadParts=lead.locator('bdi[dir=auto]');
   await expect(leadParts).toHaveCount(1);
   await expect(heading).toBeVisible();
   await expect(lead).toBeVisible();
   await expect(heading).toHaveCSS('direction','rtl');
   for(const span of [...await parts.all(),leadParts]){
    await expect(span).toHaveCSS('direction','ltr');
   }
   const lastHeading=parts.last();
   const positions=await punctuationPositions(lastHeading);
   expect(positions.first,'LTR text first glyph must precede its final punctuation').toBeLessThan(positions.last);
   const leadPositions=await punctuationPositions(leadParts);
   expect(leadPositions.first,'LTR intro phrase punctuation').toBeLessThan(leadPositions.last);
   if(reference.sectionHeadings){
    const sections=page.locator('h2 > bdi[dir=auto]');
    await expect(sections).toHaveCount(reference.sectionHeadings);
    for(const isolated of await sections.all())await expect(isolated).toHaveCSS('direction','ltr');
    const sectionPunctuation=await punctuationPositions(sections.first());
    expect(sectionPunctuation.first,'Section text first glyph before punctuation')
     .toBeLessThan(sectionPunctuation.last);
   }
   const over=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
   expect(over,reference.name+' RTL horizontal overflow').toBeLessThanOrEqual(1);
  });
 }
}
test('RTL text direction remains automatic for non-Latin content',async({page})=>{
 await page.goto('/lab/forms.html');
 await page.evaluate(()=>document.documentElement.dir='rtl');
 const heading=page.locator('.gc-form-intro h1 bdi');
 await heading.evaluate(node=>{node.textContent='تفاصيل مهمة.'});
 await expect(heading).toHaveCSS('direction','rtl');
 await expect(page.locator('.gc-form-intro h1')).toHaveCSS('direction','rtl');
});

for(const width of [320,375,768,1440]){
 test('Catalog release note stays LTR inside RTL page at '+width+'px',async({page})=>{
  await page.setViewportSize({width,height:900});
  await page.goto('/lab/catalog.html');
  await page.evaluate(()=>{document.documentElement.dir='rtl';});
  const note=page.locator('.release-scope-note');
  await expect(note).toHaveCSS('direction','rtl');
  const isolated=note.locator(':scope > bdi[dir=auto]');
  await expect(isolated).toHaveCount(1);
  await expect(isolated).toHaveCSS('direction','ltr');
  await expect(isolated).toContainText('These catalog component demos');
  const release=isolated.getByRole('link',{name:'Stable Foundations 1.0.1'});
  await expect(release).toHaveAttribute('href','https://github.com/GoreeCloud/gc-ui/releases/tag/foundations-v1.0.1');
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
  expect(overflow,'Catalog release note RTL horizontal overflow').toBeLessThanOrEqual(2);
 });
}

for(const width of [320,375,768,1440]){
 test('Catalog browse helper remains LTR in RTL shell at '+width+'px',async({page})=>{
  await page.setViewportSize({width,height:900});
  await page.goto('/lab/catalog.html');
  await page.evaluate(()=>document.documentElement.dir='rtl');
  const helper=page.locator('.registry-section .heading > p');
  await expect(helper).toHaveCSS('direction','rtl');
  const isolated=helper.locator(':scope > bdi[dir=auto]');
  await expect(isolated).toHaveCount(1);
  await expect(isolated).toHaveCSS('direction','ltr');
  await expect(isolated).toHaveText('Find components by category, name, code or behavior.');
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
  expect(overflow,'Catalog browse helper RTL horizontal overflow').toBeLessThanOrEqual(2);
 });
}
