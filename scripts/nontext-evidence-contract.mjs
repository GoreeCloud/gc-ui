/** Immutable QA inventory independent of Playwright fixture's selector list.
 * This validates reported metadata, not contrast remeasurement from PNG bytes.
 */
import assert from 'node:assert/strict';

export const expectedNontextSelectors=Object.freeze({
 v1:Object.freeze(['.status-pill span[aria-hidden=true]','.material-lens > span[aria-hidden=true]']),
 environment:Object.freeze(['.lens.gc-material-surface[data-gc-treatment="lens"] > span[aria-hidden=true]']),
 components:Object.freeze(['.floating-control > span[aria-hidden=true]','#gc-file-action-trigger > span[aria-hidden=true]']),
 adaptive:Object.freeze([
  '.gc-metric-card:nth-child(1) .gc-metric-icon',
  '.gc-metric-card:nth-child(3) .gc-metric-icon',
  '.gc-activity-list li:nth-child(1) .gc-activity-symbol',
  '.gc-activity-list li:nth-child(2) .gc-activity-symbol'
 ]),
 forms:Object.freeze(['.gc-recovery-symbol','#demo-decrease'])
});


// These six axe-incomplete glyph identities exist only in particular responsive
// navigation shells. The independent evidence contract must match the visible
// selector inventory at each tested viewport; a tablet rail does not masquerade
// as either phone bottom navigation or desktop sidebar coverage.
export const adaptiveNavigationGlyphs=Object.freeze({
 phone:Object.freeze([
  '.gc-bottom-link[href$="#overview"][data-gc-route="overview"] > span[aria-hidden="true"]',
  '.gc-bottom-link[href$="#activity"][data-gc-route="activity"] > span[aria-hidden="true"]',
  '.gc-bottom-link[href$="#library"][data-gc-route="library"] > span[aria-hidden="true"]'
 ]),
 desktop:Object.freeze([
  '.gc-nav-link[href$="#overview"][data-gc-route="overview"] > .gc-nav-glyph[aria-hidden="true"]',
  '.gc-nav-link[href$="#activity"][data-gc-route="activity"] > .gc-nav-glyph[aria-hidden="true"]',
  '.gc-nav-link[href$="#library"][data-gc-route="library"] > .gc-nav-glyph[aria-hidden="true"]'
 ])
});
export function expectedNontextSelectorsForViewport(lab,width){
 const base=expectedNontextSelectors[lab];
 assert.ok(base,'Unknown non-text evidence lab '+lab);
 assert.ok(Number.isSafeInteger(width)&&width>0,'Viewport width must be a positive integer');
 if(lab!=='adaptive')return base;
 const extras=width<600?adaptiveNavigationGlyphs.phone:
  width>=1200?adaptiveNavigationGlyphs.desktop:[];
 return [...base,...extras];
}

export function verifyNontextEvidenceRecord(record,{lab,width,mode,rtl}){
 assert.ok(record&&typeof record==='object'&&!Array.isArray(record),'Non-text evidence must be an object');
 assert.equal(record.schema,'gc-ui-nontext-visual.v2');
 assert.equal(record.lab,lab);
 assert.equal(record.width,width);
 assert.equal(record.mode,mode);
 assert.equal(record.rtl,rtl);
 assert.deepEqual(record.captureOrigin,{x:0,y:0},
  lab+' screenshot capture origin must match the document top');
 const selectors=expectedNontextSelectorsForViewport(lab,width);
 assert.ok(Array.isArray(record.measurements),'Non-text measurements must be an array');
 assert.deepEqual(record.measurements.map(p=>p?.selector),selectors,
  lab+' must retain each canonical glyph once in the expected order');
 for(const point of record.measurements){
  assert.equal(point.lab,lab);
  assert.ok(Number.isSafeInteger(point.samples)&&point.samples>30,
   lab+' '+point.selector+' must have a valid actual pixel-sample count');
  assert.ok(Number.isFinite(point.min)&&point.min>=3,
   lab+' '+point.selector+' recorded sampled ratio must meet 3:1');
  if(lab==='forms'&&point.selector==='#demo-decrease'){
   assert.equal(point.decorative,false,'Interactive decrement button is not decorative');
   assert.equal(point.interactive,true,'Decrement button must be an enabled interactive control');
   assert.equal(point.accessibleName,'Remove one collaborator',
    'Decrement action must have a full accessible name');
  }else assert.equal(point.decorative,true,lab+' '+point.selector+' decorative role must be true');
 }
}
