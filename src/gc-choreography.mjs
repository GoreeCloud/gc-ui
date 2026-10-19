/** Bounded group choreography, DOM remains visible and accessible without animation. */
import {getMotionPreset,motionAllowed} from './gc-motion-presets.mjs';
const clampStagger=value=>Number.isFinite(value)?Math.min(45,Math.max(0,value)):32;
export function createChoreography({
 media=globalThis.matchMedia?.bind(globalThis),
 root=globalThis.document?.documentElement
}={}){
 let destroyed=false;
 const animations=new Map();
 const listeners=[];
 const permission=()=>motionAllowed({media,root});
 let token=0;
 function cancel(){
  token++;
  for(const animation of animations.values())animation.cancel?.();
  animations.clear();
 }
 function play(items=[],{preset='reveal',stagger=32,direction='ltr',reducedMotion=false}={}){
  if(destroyed)throw new Error('Choreography has been destroyed');
  if(!Array.isArray(items))throw new TypeError('Expected an array of element groups');
  cancel();
  if(reducedMotion||!permission())return {animated:0,skipped:items.length};
  const session=token,step=clampStagger(stagger);
  const seen=new Set();
  let animated=0;
  // Only three explicitly visible child groups should be staggered.
  // Repeated elements must never create animations that the map cannot retire.
  for(const [index,element] of items.slice(0,3).entries()){
   if(typeof element?.animate!=='function'||seen.has(element))continue;
   seen.add(element);
   const {frames,timing}=getMotionPreset(preset,{direction});
   let animation;
   try{animation=element.animate(frames,{...timing,delay:index*step})}
   catch{continue} // Optional motion must not prevent content from rendering.
   if(!animation)continue;
   animated++;
   animations.set(element,animation);
   const cleanup=()=>{
    if(token!==session||animations.get(element)!==animation)return;
    animations.delete(element);
    animation.cancel?.(); // remove fill once final DOM state is visible
   };
   animation.addEventListener?.('finish',cleanup,{once:true});
   animation.addEventListener?.('cancel',()=>{
    if(token===session&&animations.get(element)===animation)animations.delete(element);
   },{once:true});
  }
  return {animated,skipped:Math.max(0,items.length-animated)};
 }
 // Cancel active motion when OS/user accessibility preferences change mid-flight.
 for(const query of ['(prefers-reduced-motion: reduce)','(forced-colors: active)','(prefers-contrast: more)']){
  let mq;
  try{mq=media?.(query)}catch{}
  if(!mq?.addEventListener)continue;
  const onChange=()=>{if(!permission())cancel()};
  mq.addEventListener('change',onChange);
  listeners.push([mq,onChange]);
 }
 const onThemeChange=()=>{if(!permission())cancel()};
 root?.addEventListener?.('gc-theme-change',onThemeChange);
 return {
  play,cancel,activeCount:()=>animations.size,
  destroy(){
   if(destroyed)return;
   destroyed=true;cancel();
   for(const [mq,handler] of listeners)mq.removeEventListener?.('change',handler);
   root?.removeEventListener?.('gc-theme-change',onThemeChange);
  }
 };
}
