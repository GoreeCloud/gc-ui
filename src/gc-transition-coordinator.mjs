/** Managed GC UI transitions: one optional animation per element, bounded duration, safe teardown. */
import {getMotionPreset,motionAllowed} from './gc-motion-presets.mjs';
export function createMotionCoordinator({media=globalThis.matchMedia?.bind(globalThis),
 root=globalThis.document?.documentElement}={}){
 const active=new Map();
 let destroyed=false;
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
  if(reducedMotion||!motionAllowed({media,root})||typeof element.animate!=='function')return null;
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
 return {
  play,cancel,cancelAll(){
   for(const element of [...active.keys()])cancel(element);
  },activeCount:()=>active.size,
  destroy(){
   if(destroyed)return;
   destroyed=true;
   for(const element of [...active.keys()])cancel(element);
  }
 };
}
