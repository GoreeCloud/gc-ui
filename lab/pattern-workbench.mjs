import {createThemeController} from '../src/gc-theme-runtime.mjs';
import {createSurfaceController} from '../src/gc-surface-runtime.mjs';
import {createMotionCoordinator} from '../src/gc-transition-coordinator.mjs';
import {initChoiceChips,initDisclosureGroup} from '../src/gc-patterns.mjs';

createThemeController();
createSurfaceController({key:'gc-ui-pattern-workbench:'});
const motion=createMotionCoordinator();
const cards=[...document.querySelectorAll('#pattern-card-grid [data-kind]')];
const count=document.getElementById('pattern-results');
initChoiceChips(document.getElementById('pattern-chips'),{onChange:selection=>{
 let shown=0;
 for(const card of cards){
  const visible=selection==='all'||card.dataset.kind===selection;
  card.hidden=!visible;
  if(visible){shown++;motion.play(card,'surfaceEnter')}
 }
 count.textContent=shown+' example '+(shown===1?'surface':'surfaces')+' shown.';
}});
initDisclosureGroup(document.getElementById('pattern-disclosures'));
const progress=document.getElementById('pattern-progress');
const output=document.getElementById('pattern-progress-value');
document.getElementById('pattern-advance').addEventListener('click',()=>{
 progress.value=progress.value===100?0:Math.min(100,progress.value+25);
 output.textContent=progress.value+'% complete';
});
