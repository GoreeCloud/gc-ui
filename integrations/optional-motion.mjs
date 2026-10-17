/**
 * Optional adapters accept user-installed engines (no implicit CDN, dependencies or fetching).
 * The base GC UI package uses native Web Animations. Animation JSON/illustration licensing is separate.
 */
import {getMotionPreset,motionAllowed} from '../src/gc-motion-presets.mjs';

export function playWithMotion(animate,element,name,options={}){
 if(typeof animate!=='function')throw new TypeError('Supply a Motion animate function');
 if(!element)throw new TypeError('Element is required');
 if(options.reducedMotion===true||!motionAllowed(options))return null;
 const {frames,timing}=getMotionPreset(name,options);
 return animate(element,frames,{duration:timing.duration/1000,ease:timing.easing});
}
export function enableAutoAnimate(autoAnimate,element,options={}){
 if(typeof autoAnimate!=='function'||!element)throw new TypeError('Supply an AutoAnimate function and element');
 if(options.reducedMotion===true||!motionAllowed(options))return null;
 return autoAnimate(element,{duration:Math.min(Math.max(options.duration??220,0),440),easing:'ease-in-out'});
}
export function mountLottie(lottie,container,animationData,options={}){
 if(typeof lottie?.loadAnimation!=='function'||!container||!animationData)
  throw new TypeError('Supply lottie-web, a container and licensed animation data');
 const allow=options.reducedMotion!==true&&motionAllowed(options);
 const animation=lottie.loadAnimation({
  container,renderer:'svg',loop:allow&&Boolean(options.loop),autoplay:allow&&Boolean(options.autoplay),
  animationData
 });
 if(!allow)animation.goToAndStop?.(0,true);
 return animation;
}
