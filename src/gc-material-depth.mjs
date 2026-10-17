/** GC UI material depth is semantic: E0 context, E1 content, E2 active, E3 transient. */
export const GC_DEPTH_TIERS=Object.freeze(['e0','e1','e2','e3']);
const CONTEXT_CAP=Object.freeze({workspace:3,reading:1,analysis:2,media:2});
const PURPOSE_DEPTH=Object.freeze({background:0,content:1,active:2,overlay:3});
export function resolveMaterialDepth({
 context='workspace',purpose='content',requested=null,highContrast=false,
 forcedColors=false,reducedTransparency=false,lowPower=false
}={}){
 const scene=Object.hasOwn(CONTEXT_CAP,context)?context:'workspace';
 const intended=Object.hasOwn(PURPOSE_DEPTH,purpose)?purpose:'content';
 const base=requested===null?PURPOSE_DEPTH[intended]:GC_DEPTH_TIERS.indexOf(requested);
 const clamped=Math.max(0,Math.min(3,base<0?PURPOSE_DEPTH[intended]:base));
 const safe=Boolean(highContrast||forcedColors);
 const cap=safe?0:lowPower?1:CONTEXT_CAP[scene];
 const depth=GC_DEPTH_TIERS[Math.min(clamped,cap)];
 // Layering is structural; user-requested contrast can suppress visual shadows.
 return Object.freeze({
  depth,context:scene,purpose:intended,
  shadow:!safe&&!lowPower&&depth!=='e0'&&scene!=='analysis',
  lens:!safe&&!reducedTransparency&&!lowPower&&intended==='overlay',
  decorativeLight:!safe&&!lowPower&&scene!=='reading'&&scene!=='analysis'
 });
}
