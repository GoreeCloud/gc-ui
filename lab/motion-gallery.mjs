import {createThemeController} from '../src/gc-theme-runtime.mjs';
import {createSurfaceController} from '../src/gc-surface-runtime.mjs';
import {createMotionCoordinator} from '../src/gc-transition-coordinator.mjs';
createThemeController();
createSurfaceController({key:'gc-ui-motion-lab:'});
const motion=createMotionCoordinator();
const buttons=[...document.querySelectorAll('[data-preset]')];
const direction=document.getElementById('direction');
const reduced=document.getElementById('demo-reduced');
const sample=document.getElementById('sample');
const status=document.getElementById('motion-status');
let selected='reveal';
for(const button of buttons){
 button.addEventListener('click',()=>{
  motion.cancel(sample);
  selected=button.dataset.preset;
  for(const choice of buttons)choice.setAttribute('aria-pressed',String(choice===button));
  status.textContent=button.textContent+' selected. Ready to play.';
 });
}
document.getElementById('play').addEventListener('click',()=>{
 const running=motion.play(sample,selected,{direction:direction.value,reducedMotion:reduced.checked});
 status.textContent=running ? selected+' played.' : 'Motion skipped; the content remains available.';
});
document.getElementById('stop').addEventListener('click',()=>{
 motion.cancel(sample);
 status.textContent='Motion stopped. Content stays available.';
});
reduced.addEventListener('change',()=>{
 if(reduced.checked)motion.cancel(sample);
 status.textContent=reduced.checked?'Reduced-motion preview enabled.':'Reduced-motion preview disabled.';
});
