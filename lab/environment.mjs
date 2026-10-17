import {createThemeController} from '../src/gc-theme-runtime.mjs';
import {createSurfaceController} from '../src/gc-surface-runtime.mjs';
import {playMotionPreset} from '../src/gc-motion-presets.mjs';

const theme=createThemeController();
const surface=createSurfaceController();
const appearance=document.querySelector('#appearance');
const fields=['context','intensity','illumination','lightDirection'];
function render(){
 const config=surface.get(),effective=surface.resolved();
 for(const name of fields)document.getElementById(name).value=config[name];
 document.getElementById('effective').textContent=
  'Active: '+effective.context+' context · '+effective.intensity+' tonal intensity · '+
  effective.illumination+' light from '+effective.lightDirection+' · '+(effective.solidLens?'solid':'adaptive')+' Lens.';
 const next=theme.resolved().mode==='dark'?'light':'dark';
 appearance.textContent=next==='dark'?'Dark mode':'Light mode';
 appearance.setAttribute('aria-label','Switch to '+next+' appearance');
}
for(const name of fields)document.getElementById(name).addEventListener('change',event=>{
 surface.set({[name]:event.target.value});
 render();
});
appearance.addEventListener('click',()=>{theme.set({mode:theme.resolved().mode==='dark'?'light':'dark'});render()});
document.documentElement.addEventListener('gc-surface-change',render);
document.documentElement.addEventListener('gc-theme-change',render);
document.getElementById('replay').addEventListener('click',()=>{
 const animation=playMotionPreset(document.querySelector('.hero-card'),'settle');
 if(animation)animation.addEventListener('finish',()=>animation.cancel(),{once:true});
});
render();
