import {createThemeController} from '../src/gc-theme-runtime.mjs';

/** The foundation and component laboratories share a single accessibility-aware theme contract. */
const theme=createThemeController();
const root=document.documentElement;
const seedInput=document.getElementById('custom-seed');
const materialState=document.getElementById('material-effective');

function syncControls(){
 const preference=theme.get(),resolved=theme.resolved();
 seedInput.value=preference.seed;
 seedInput.dataset.selected=String(preference.accent==='custom');
 for(const key of ['mode','accent','material']){
  document.querySelectorAll('[data-'+key+']').forEach(button=>{
   button.setAttribute('aria-pressed',String(button.getAttribute('data-'+key)===preference[key]));
  });
 }
 materialState.textContent=resolved.material==='solid'
  ?'Effective material: Solid'+(preference.material==='translucent'?' (accessibility preference overrides translucency).':'.')
  :'Effective material: Translucent Lens.';
}
root.addEventListener('gc-theme-change',syncControls);
for(const kind of ['mode','accent','material']){
 document.querySelectorAll('[data-'+kind+']').forEach(button=>{
  button.addEventListener('click',()=>theme.set({[kind]:button.getAttribute('data-'+kind)}));
 });
}
seedInput.addEventListener('input',()=>{
 if(/^#[0-9a-fA-F]{6}$/.test(seedInput.value)){
  theme.set({accent:'custom',seed:seedInput.value});
 }
});
syncControls();

const feedback=document.getElementById('feedback');
document.getElementById('create').addEventListener('click',()=>{
 const field=document.getElementById('project-name');
 const name=field.value.trim();
 if(!name){feedback.textContent='Enter a project name first.';field.focus();return}
 feedback.textContent='“'+name+'” created in this local-only reference demo.';
});
document.getElementById('reset').addEventListener('click',()=>{
 document.getElementById('project-name').value='';
 document.getElementById('updates').checked=false;
 feedback.textContent='Fields cleared.';
});
document.getElementById('lens-action').addEventListener('click',()=>{
 feedback.textContent='Lens action activated.';
 const reduced=globalThis.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
 document.getElementById('controls').scrollIntoView({behavior:reduced?'instant':'smooth'});
});
