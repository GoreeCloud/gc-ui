import {createThemeController} from '../src/gc-theme-runtime.mjs';
import {initTabs,initDialog,createToast,runAsyncAction} from '../src/gc-interactions.mjs';

const theme=createThemeController();
const toast=createToast(document.getElementById('toast-region'));
const dialog=document.getElementById('confirm-dialog');
const tabs=initTabs(document.getElementById('example-tablist'),{
 rtl:getComputedStyle(document.documentElement).direction==='rtl'
});
initDialog(dialog);

function syncControls(){
 const preference=theme.get(),resolved=theme.resolved();
 document.querySelectorAll('[data-theme-mode]').forEach(button=>{
  button.setAttribute('aria-pressed',String(button.dataset.themeMode===preference.mode));
 });
 document.querySelectorAll('[data-theme-accent]').forEach(button=>{
  button.setAttribute('aria-pressed',String(button.dataset.themeAccent===preference.accent));
 });
 document.getElementById('lens-switch').checked=preference.material==='translucent';
 const label=document.getElementById('lens-switch').closest('label');
 label.title=resolved.material==='solid'&&preference.material==='translucent'
  ?'Solid Lens is active because of system accessibility settings':'';
}
document.documentElement.addEventListener('gc-theme-change',syncControls);
document.querySelectorAll('[data-theme-mode]').forEach(button=>{
 button.addEventListener('click',()=>theme.set({mode:button.dataset.themeMode}));
});
document.querySelectorAll('[data-theme-accent]').forEach(button=>{
 button.addEventListener('click',()=>theme.set({accent:button.dataset.themeAccent}));
});
document.getElementById('lens-switch').addEventListener('change',event=>{
 theme.set({material:event.target.checked?'translucent':'solid'});
});
syncControls();

document.getElementById('action-primary').addEventListener('click',async event=>{
 const button=event.currentTarget;
 await runAsyncAction(button,()=>new Promise(resolve=>setTimeout(resolve,420)));
 toast.show('Changes saved in the local demonstration.');
});
document.getElementById('action-secondary').addEventListener('click',()=>toast.show('Preview opened — reference demonstration only.'));
document.getElementById('show-toast').addEventListener('click',()=>toast.show('A quiet notification with an accessible live announcement.'));
document.getElementById('lens-apply').addEventListener('click',()=>toast.show('Lens action applied.'));

document.getElementById('project-form').addEventListener('submit',event=>{
 event.preventDefault();
 const name=document.getElementById('gc-name');
 const error=document.getElementById('gc-name-error');
 if(!name.value.trim()){
  name.setAttribute('aria-invalid','true');
  name.setAttribute('aria-describedby','gc-name-help gc-name-error');
  error.hidden=false;
  name.focus();
  return;
 }
 name.removeAttribute('aria-invalid');
 name.setAttribute('aria-describedby','gc-name-help');
 error.hidden=true;
 toast.show('Workspace “'+name.value.trim()+'” created locally in the demonstration.');
});
document.getElementById('gc-name').addEventListener('input',event=>{
 const name=event.target;
 if(!name.value.trim())return;
 name.removeAttribute('aria-invalid');
 name.setAttribute('aria-describedby','gc-name-help');
 document.getElementById('gc-name-error').hidden=true;
});
document.getElementById('confirm-delete').addEventListener('click',()=>{
 dialog.close();
 toast.show('Example cleared. No data was deleted.');
});
