/** Native, progressive GC UI motion grammar; optional third-party adapters live in integrations. */
export const GC_MOTION_PRESETS=Object.freeze({
 reveal:Object.freeze([{opacity:0,transform:'translateY(6px)'},{opacity:1,transform:'translateY(0)'}]),
 soften:Object.freeze([{opacity:0.65},{opacity:1}]),
 settle:Object.freeze([{opacity:0.94,transform:'scale(0.985)'},{opacity:1,transform:'scale(1)'}]),
 slideInline:Object.freeze([{opacity:0,transform:'translateX(8px)'},{opacity:1,transform:'translateX(0)'}]),
 dismiss:Object.freeze([{opacity:1,transform:'translateY(0)'},{opacity:0,transform:'translateY(4px)'}])
});
const timing=Object.freeze({
 reveal:Object.freeze({duration:320,easing:'cubic-bezier(.16,1,.3,1)'}),
 soften:Object.freeze({duration:120,easing:'cubic-bezier(.2,.8,.2,1)'}),
 settle:Object.freeze({duration:220,easing:'cubic-bezier(.2,.8,.2,1)'}),
 slideInline:Object.freeze({duration:220,easing:'cubic-bezier(.2,.8,.2,1)'}),
 dismiss:Object.freeze({duration:160,easing:'cubic-bezier(.4,0,1,1)'})
});
export function getMotionPreset(name,{direction='ltr'}={}){
 if(!Object.hasOwn(GC_MOTION_PRESETS,name))throw new RangeError('Unknown GC motion preset: '+name);
 const frames=GC_MOTION_PRESETS[name].map(f=>({...f}));
 if(name==='slideInline' && direction==='rtl')frames[0].transform='translateX(-8px)';
 return {frames,timing:{...timing[name],fill:'both'}};
}
export function motionAllowed({media=globalThis.matchMedia?.bind(globalThis),root=globalThis.document?.documentElement}={}){
 if(root?.dataset?.gcContrast==='high')return false;
 try{return !(
  media?.('(prefers-reduced-motion: reduce)')?.matches||
  media?.('(forced-colors: active)')?.matches
 )}catch{return true}
}
export function playMotionPreset(element,name,options={}){
 if(!element || typeof element.animate!=='function')throw new TypeError('A Web Animations capable element is required');
 const p=getMotionPreset(name,options);
 if(options.reducedMotion===true||!motionAllowed(options)){
  // No animation means the caller's existing DOM state is already the final state.
  return null;
 }
 return element.animate(p.frames,p.timing);
}
