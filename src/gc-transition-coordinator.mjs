/** Managed GC UI transitions: one optional animation per element, bounded duration, safe teardown. */
import {getMotionPreset,motionAllowed} from './gc-motion-presets.mjs';
export function createMotionCoordinator({media=globalThis.matchMedia?.bind(globalThis),
 root=globalThis.document?.documentElement}={}){
 const active=new Map(),listeners=[];
 let destroyed=false;
 const permitted=()=>motionAllowed({media,root});
 function cancelAll(){
  for(const element of [...active.keys()])cancel(element);
 }
 function cancel(element){
  const animation=active.get(element);
  if(!animation)return false;
  active.delete(element);
  animation.cancel?.();
  return true;
 }
 function play(element,name,{direction='ltr',reducedMotion=false}={}){
  if(destroyed)throw new Error('Motion coordinator was destroyed');
  if(!element)throw new TypeError('An element is required');
  cancel(element);
  if(reducedMotion||!permitted()||typeof element.animate!=='function')return null;
  const {frames,timing}=getMotionPreset(name,{direction});
  const animation=element.animate(frames,timing);
  active.set(element,animation);
  const finish=()=>{
   if(active.get(element)!==animation)return;
   active.delete(element);
   // No animation-fill should remain after the underlying DOM reaches its normal state.
   animation.cancel?.();
  };
  animation.addEventListener?.('finish',finish,{once:true});
  animation.addEventListener?.('cancel',()=>{
   if(active.get(element)===animation)active.delete(element);
  },{once:true});
  return animation;
 }
 // Accessibility changes must interrupt already-running transitions, not
 // merely prevent *new* ones. This matches the group choreography contract.
 const onPreferenceChange=()=>{if(!permitted())cancelAll()};
 for(const query of ['(prefers-reduced-motion: reduce)','(forced-colors: active)','(prefers-contrast: more)']){
  let mq;
  try{mq=media?.(query)}catch{}
  if(!mq?.addEventListener)continue;
  mq.addEventListener('change',onPreferenceChange);
  listeners.push(mq);
 }
 root?.addEventListener?.('gc-theme-change',onPreferenceChange);
 return {
  play,cancel,cancelAll,activeCount:()=>active.size,
  destroy(){
   if(destroyed)return;
   destroyed=true;
   cancelAll();
   for(const mq of listeners)mq.removeEventListener?.('change',onPreferenceChange);
   root?.removeEventListener?.('gc-theme-change',onPreferenceChange);
  }
 };
}
