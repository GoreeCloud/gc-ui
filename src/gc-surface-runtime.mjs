/** Context-aware GC UI surface preferences. Static material state, no pointer tracking or background animation. */
export const GC_SURFACE_DEFAULTS=Object.freeze({context:'workspace',intensity:'auto',illumination:'auto',lightDirection:'overhead'});
const modes=Object.freeze({
 context:['workspace','reading','analysis','media'],
 intensity:['auto','quiet','balanced','expressive'],
 illumination:['auto','soft','off'],
 lightDirection:['overhead','leading','trailing']
});
const makeMedia=(fn,query)=>{try{return fn?.(query)||null}catch{return null}};
export function normalizeSurfaceConfig(input={}){
 const config={...GC_SURFACE_DEFAULTS};
 if(!input || typeof input!=='object')return config;
 for(const [key,allowed] of Object.entries(modes))if(allowed.includes(input[key]))config[key]=input[key];
 return config;
}
export function resolveSurfaceEnvironment(config={},system={}){
 const c=normalizeSurfaceConfig(config);
 const safe=Boolean(system.highContrast||system.forcedColors);
 const intensity=c.intensity==='auto'?(c.context==='reading'||c.context==='analysis'?'quiet':'balanced'):c.intensity;
 const illumination=safe||c.illumination==='off'?'off':c.illumination==='soft'?'soft':'soft';
 return {
  context:c.context,
  intensity:safe?'quiet':intensity,
  illumination,
  lightDirection:c.lightDirection,
  solidLens:Boolean(safe||system.reducedTransparency),
  motionAllowed:!Boolean(system.reducedMotion||safe)
 };
}
export function createSurfaceController({
 root=globalThis.document?.documentElement,
 media=globalThis.matchMedia?.bind(globalThis),
 storage,
 key='gc-ui-surface:'
}={}){
 if(!root?.dataset)throw new TypeError('A root element with dataset is required');
 let persistence=storage;
 if(persistence===undefined){try{persistence=globalThis.localStorage}catch{persistence=null}}
 const queries={
  forcedColors:'(forced-colors: active)',
  highContrast:'(prefers-contrast: more)',
  reducedTransparency:'(prefers-reduced-transparency: reduce)',
  reducedMotion:'(prefers-reduced-motion: reduce)'
 };
 const mql=Object.fromEntries(Object.entries(queries).map(([k,v])=>[k,makeMedia(media,v)]));
 const initial={};
 for(const keyName of Object.keys(GC_SURFACE_DEFAULTS))try{initial[keyName]=persistence?.getItem(key+keyName)}catch{}
 let state=normalizeSurfaceConfig(initial),destroyed=false;
 const listeners=[];
 // Preserve application-owned attributes when this controller borrows a root.
 const datasetKeys=['gcSurfaceContext','gcSurfaceIntensity','gcIllumination','gcLightDirection','gcSurfaceLens'];
 const priorDataset=new Map(datasetKeys.map(name=>[
  name,{present:Object.hasOwn(root.dataset,name),value:root.dataset[name]}
 ]));
 const writtenDataset=new Map();
 const setDataset=(name,value)=>{
  root.dataset[name]=value;
  writtenDataset.set(name,value);
 };
 function restoreDataset(){
  for(const name of datasetKeys){
   // Do not overwrite consumer changes made after the controller's last render.
   if(root.dataset[name]!==writtenDataset.get(name))continue;
   const prior=priorDataset.get(name);
   if(prior.present)root.dataset[name]=prior.value;
   else delete root.dataset[name];
  }
  writtenDataset.clear();
 }
 const system=()=>Object.fromEntries(Object.entries(mql).map(([k,v])=>[k,Boolean(v?.matches)]));
 function render(){
  if(destroyed)return;
  const effective=resolveSurfaceEnvironment(state,system());
  setDataset('gcSurfaceContext',effective.context);
  setDataset('gcSurfaceIntensity',effective.intensity);
  setDataset('gcIllumination',effective.illumination);
  setDataset('gcLightDirection',effective.lightDirection);
  setDataset('gcSurfaceLens',effective.solidLens?'solid':'auto');
  if(typeof CustomEvent==='function')root.dispatchEvent?.(new CustomEvent('gc-surface-change',{detail:{...effective}}));
 }
 for(const m of Object.values(mql)){
  if(!m?.addEventListener)continue;
  const handler=()=>render();
  m.addEventListener('change',handler);
  listeners.push([m,handler]);
 }
 render();
 return {
  get:()=>({...state}),
  resolved:()=>resolveSurfaceEnvironment(state,system()),
  set(patch={}){
   if(destroyed)throw new Error('Surface controller has been destroyed');
   state=normalizeSurfaceConfig({...state,...patch});
   for(const [name,val] of Object.entries(state))try{persistence?.setItem(key+name,val)}catch{}
   render();return {...state};
  },
  reset(){
   if(destroyed)throw new Error('Surface controller has been destroyed');
   state=normalizeSurfaceConfig();
   for(const name of Object.keys(state))try{persistence?.removeItem(key+name)}catch{}
   render();return {...state};
  },
  destroy(){
   if(destroyed)return;
   destroyed=true;
   for(const [m,fn] of listeners)m.removeEventListener?.('change',fn);
   restoreDataset();
  }
 };
}
