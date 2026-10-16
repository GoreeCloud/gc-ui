import {generateTheme} from '../src/gc-color-engine.mjs';
(() => {
  const root=document.documentElement;
  const allowed={mode:['auto','light','dark'],accent:['iris','lagoon','ember','moss','custom'],material:['translucent','solid']};
  const key='gc-ui-v1:';
  const seedInput=document.getElementById('custom-seed');
  const seedPattern=/^#[0-9a-fA-F]{6}$/;
  let seed='#5145D9';
  const applied=new Set();
  const toKebab=s=>s.replace(/([a-z0-9])([A-Z])/g,'$1-$2').toLowerCase();
  const get=(k)=>{try{return localStorage.getItem(key+k)}catch{return null}};
  const set=(k,v)=>{try{localStorage.setItem(key+k,v)}catch{}};
  const media=window.matchMedia('(prefers-color-scheme: dark)');
  let choice={mode:get('mode')||'auto',accent:get('accent')||'iris',material:get('material')||'translucent'};
  seed=seedPattern.test(get('seed')||'')?get('seed'):'#5145D9';
  seedInput.value=seed;
  for(const k of Object.keys(choice))if(!allowed[k].includes(choice[k]))choice[k]=allowed[k][0];
  const effective=()=>choice.mode==='auto'?(media.matches?'dark':'light'):choice.mode;
  function render(){
    root.dataset.gcMode=effective();root.dataset.gcAccent=choice.accent;root.dataset.gcMaterial=choice.material;
    for(const name of applied)root.style.removeProperty('--gc-v1-color-'+toKebab(name));
    applied.clear();
    if(choice.accent==='custom'){
      const scheme=generateTheme(seed,effective());
      for(const [name,value] of Object.entries(scheme.roles)){
        root.style.setProperty('--gc-v1-color-'+toKebab(name),value);
        applied.add(name);
      }
    }
    seedInput.dataset.selected=String(choice.accent==='custom');
    for(const k of Object.keys(choice))document.querySelectorAll('[data-'+k+']').forEach(btn=>btn.setAttribute('aria-pressed',String(btn.getAttribute('data-'+k)===choice[k])));
  }
  for(const kind of Object.keys(choice))document.querySelectorAll('[data-'+kind+']').forEach(btn=>{
    btn.addEventListener('click',()=>{choice[kind]=btn.getAttribute('data-'+kind);set(kind,choice[kind]);render()});
  });
  seedInput.addEventListener('input',()=>{
    if(!seedPattern.test(seedInput.value))return;
    seed=seedInput.value;choice.accent='custom';set('seed',seed);set('accent','custom');render();
  });
  media.addEventListener?.('change',()=>{if(choice.mode==='auto')render()});
  render();
  const feedback=document.getElementById('feedback');
  document.getElementById('create').addEventListener('click',()=>{
    const name=document.getElementById('project-name').value.trim();
    if(!name){feedback.textContent='Enter a project name first.';document.getElementById('project-name').focus();return;}
    feedback.textContent='“'+name+'” created in this local-only reference demo.';
  });
  document.getElementById('reset').addEventListener('click',()=>{document.getElementById('project-name').value='';document.getElementById('updates').checked=false;feedback.textContent='Fields cleared.';});
  document.getElementById('lens-action').addEventListener('click',()=>{feedback.textContent='Lens action activated.';document.getElementById('controls').scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});});
})();
