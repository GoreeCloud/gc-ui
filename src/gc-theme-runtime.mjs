/**
 * GC UI Theme Runtime — dependency-free browser adapter.
 * The OS accessibility settings override decorative materials, not user-selected accent intent.
 * The custom seed engine is independent from Google HCT; wallpaper extraction is not provided.
 */
import {generateTheme} from './gc-color-engine.mjs';

export const GC_THEME_DEFAULTS=Object.freeze({
  mode:'auto',accent:'neutral',material:'translucent',contrast:'system',seed:'#374151'
});
const choices={
  mode:['auto','light','dark'],accent:['neutral','ocean','iris','lagoon','ember','moss','custom'],
  material:['translucent','solid'],contrast:['system','standard','high']
};
const hex=/^#[0-9a-fA-F]{6}$/;
const kebab=s=>s.replace(/([a-z0-9])([A-Z])/g,'$1-$2').toLowerCase();

export function normalizeTheme(input={},defaultAccent=GC_THEME_DEFAULTS.accent){
  const out={...GC_THEME_DEFAULTS,accent:choices.accent.includes(defaultAccent)&&defaultAccent!=='custom'?defaultAccent:GC_THEME_DEFAULTS.accent};
  if(!input||typeof input!=='object')return out;
  for(const [key,values] of Object.entries(choices))if(values.includes(input[key]))out[key]=input[key];
  if(typeof input.seed==='string'&&hex.test(input.seed))out.seed=input.seed.toUpperCase();
  return out;
}
export function resolveTheme(config={},system={}){
  const s=normalizeTheme(config);
  const mode=s.mode==='auto'?(system.dark?'dark':'light'):s.mode;
  const high=Boolean(system.forcedColors||system.highContrast||s.contrast==='high');
  const material=system.reducedTransparency||high?'solid':s.material;
  return {mode,accent:s.accent,material,contrast:high?'high':'standard',seed:s.seed};
}
export function createThemeController({
  root=globalThis.document?.documentElement,
  media=globalThis.matchMedia?.bind(globalThis),
  storage,key='gc-ui-v1:',defaultAccent=GC_THEME_DEFAULTS.accent
}={}){
  if(!root?.style||!root?.dataset)throw new TypeError('A document root with style and dataset is required');
  let persistence=storage;
  if(persistence===undefined){try{persistence=globalThis.localStorage}catch{persistence=null}}
  const requests={dark:'(prefers-color-scheme: dark)',highContrast:'(prefers-contrast: more)',
    reducedTransparency:'(prefers-reduced-transparency: reduce)',forcedColors:'(forced-colors: active)'};
  const mql=Object.fromEntries(Object.entries(requests).map(([name,query])=>{
    try{return [name,media?.(query)||null]}catch{return [name,null]}
  }));
  const previous={};
  for(const name of Object.keys(GC_THEME_DEFAULTS)){
    try{const value=persistence?.getItem(key+name);if(value!==null&&value!==undefined)previous[name]=value}catch{}
  }
  let state=normalizeTheme(previous,defaultAccent),destroyed=false;
  const overridden=new Map(),relinquished=new Set(),listeners=[];
  const datasetKeys=['gcMode','gcAccent','gcMaterial','gcContrast'];
  const priorDataset=new Map(datasetKeys.map(name=>[
    name,{present:Object.hasOwn(root.dataset,name),value:root.dataset[name]}
  ]));
  const writtenDataset=new Map();
  function setDataset(name,value){
    root.dataset[name]=value;
    writtenDataset.set(name,value);
  }
  function restoreDataset(){
    for(const name of datasetKeys){
      // If the application replaced a value after our last render, do not steal it.
      if(root.dataset[name]!==writtenDataset.get(name))continue;
      const prior=priorDataset.get(name);
      if(prior.present)root.dataset[name]=prior.value;
      else delete root.dataset[name];
    }
    writtenDataset.clear();
  }
  // Only restore the inline declarations this controller actually replaced.
  // Existing app-owned values and !important priorities must survive teardown.
  function clearOverrides(){
    for(const [name,original] of overridden){
      const property='--gc-v1-color-'+kebab(name);
      if(typeof root.style.getPropertyValue==='function' &&
         root.style.getPropertyValue(property)!==original.owned ||
         (root.style.getPropertyPriority?.(property)||'')!==original.ownedPriority){
        // Once the host changes an owned role, later OS preference changes or
        // seed updates must not silently retake that declaration.
        relinquished.add(name);
        continue;
      }
      if(original.value)root.style.setProperty(property,original.value,original.priority);
      else root.style.removeProperty(property);
    }
    overridden.clear();
  }
  const system=()=>Object.fromEntries(Object.entries(mql).map(([n,item])=>[n,Boolean(item?.matches)]));
  function render(){
    if(destroyed)return;
    const next=resolveTheme(state,system());
    setDataset('gcMode',next.mode);
    setDataset('gcAccent',next.accent);
    setDataset('gcMaterial',next.material);
    setDataset('gcContrast',next.contrast);
    clearOverrides();
    if((next.accent==='custom'||next.accent==='neutral'||next.accent==='ocean')&&next.contrast!=='high'&&!system().forcedColors){
      const seed=next.accent==='neutral'?'#374151':next.accent==='ocean'?'#1D4ED8':next.seed;
      for(const [name,value] of Object.entries(generateTheme(seed,next.mode).roles)){
        if(relinquished.has(name))continue;
        const property='--gc-v1-color-'+kebab(name);
        overridden.set(name,{
          value:root.style.getPropertyValue?.(property)||'',
          priority:root.style.getPropertyPriority?.(property)||'',
          owned:value,
          ownedPriority:''
        });
        root.style.setProperty(property,value);
      }
    }
    if(typeof CustomEvent==='function')root.dispatchEvent?.(new CustomEvent('gc-theme-change',{detail:{...next}}));
  }
  for(const item of Object.values(mql)){
    if(!item?.addEventListener)continue;
    const fn=()=>render();
    item.addEventListener('change',fn);
    listeners.push([item,fn]);
  }
  render();
  return {
    get:()=>({...state}),
    resolved:()=>resolveTheme(state,system()),
    set(patch={}){
      if(destroyed)throw new Error('Theme controller was destroyed');
      state=normalizeTheme({...state,...patch},defaultAccent);
      // Persist only fields explicitly chosen by the user, never an app-suggested accent.
      for(const name of Object.keys(patch)){
        if(!Object.hasOwn(choices,name)&&name!=='seed')continue;
        try{persistence?.setItem(key+name,state[name])}catch{}
      }
      render();
      return {...state};
    },
    reset(){
      if(destroyed)throw new Error('Theme controller was destroyed');
      state=normalizeTheme({},defaultAccent);
      for(const name of Object.keys(state)){
        try{persistence?.removeItem(key+name)}catch{}
      }
      render();
      return {...state};
    },
    destroy(){
      if(destroyed)return;
      for(const [item,fn] of listeners)item.removeEventListener('change',fn);
      clearOverrides();
      restoreDataset();
      destroyed=true;
    }
  };
}
