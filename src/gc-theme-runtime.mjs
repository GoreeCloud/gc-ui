/**
 * GC UI Theme Runtime — dependency-free browser adapter.
 * The OS accessibility settings override decorative materials, not user-selected accent intent.
 * The custom seed engine is independent from Google HCT; wallpaper extraction is not provided.
 */
import {generateTheme} from './gc-color-engine.mjs';

export const GC_THEME_DEFAULTS=Object.freeze({
  mode:'auto',accent:'iris',material:'translucent',contrast:'system',seed:'#5145D9'
});
const choices={
  mode:['auto','light','dark'],accent:['iris','lagoon','ember','moss','custom'],
  material:['translucent','solid'],contrast:['system','standard','high']
};
const hex=/^#[0-9a-fA-F]{6}$/;
const kebab=s=>s.replace(/([a-z0-9])([A-Z])/g,'$1-$2').toLowerCase();

export function normalizeTheme(input={}){
  const out={...GC_THEME_DEFAULTS};
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
  storage,key='gc-ui-v1:'
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
    try{previous[name]=persistence?.getItem(key+name)}catch{}
  }
  let state=normalizeTheme(previous),destroyed=false;
  const overridden=new Map(),listeners=[];
  // Only restore the inline declarations this controller actually replaced.
  // Existing app-owned values and !important priorities must survive teardown.
  function clearOverrides(){
    for(const [name,original] of overridden){
      const property='--gc-v1-color-'+kebab(name);
      if(typeof root.style.getPropertyValue==='function' &&
         root.style.getPropertyValue(property)!==original.owned)continue;
      if(original.value)root.style.setProperty(property,original.value,original.priority);
      else root.style.removeProperty(property);
    }
    overridden.clear();
  }
  const system=()=>Object.fromEntries(Object.entries(mql).map(([n,item])=>[n,Boolean(item?.matches)]));
  function render(){
    if(destroyed)return;
    const next=resolveTheme(state,system());
    root.dataset.gcMode=next.mode;
    root.dataset.gcAccent=next.accent;
    root.dataset.gcMaterial=next.material;
    root.dataset.gcContrast=next.contrast;
    clearOverrides();
    if(next.accent==='custom'&&next.contrast!=='high'&&!system().forcedColors){
      for(const [name,value] of Object.entries(generateTheme(next.seed,next.mode).roles)){
        const property='--gc-v1-color-'+kebab(name);
        overridden.set(name,{
          value:root.style.getPropertyValue?.(property)||'',
          priority:root.style.getPropertyPriority?.(property)||'',
          owned:value
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
      state=normalizeTheme({...state,...patch});
      for(const [name,value] of Object.entries(state)){
        try{persistence?.setItem(key+name,value)}catch{}
      }
      render();
      return {...state};
    },
    reset(){
      if(destroyed)throw new Error('Theme controller was destroyed');
      state=normalizeTheme();
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
      destroyed=true;
    }
  };
}
