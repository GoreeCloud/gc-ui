import {createThemeController} from '../src/gc-theme-runtime.mjs';

// This specimen validates only local example values. No submit, persistence, or network action.
createThemeController();

const form=document.getElementById('workflow-form');
const panels=[...form.querySelectorAll('[data-workflow-step]')];
const markers=[...document.querySelectorAll('.gc-workflow-steps li')];
const progress=document.getElementById('workflow-progress');
const alert=document.getElementById('workflow-alert');
const success=document.getElementById('workflow-success');
const back=document.getElementById('workflow-back');
const next=document.getElementById('workflow-next');
const check=document.getElementById('workflow-check');
const fieldIds=[
 ['workspace-name','workspace-owner','workspace-purpose'],
 ['workspace-goal','workspace-reminders','workspace-backups'],
 ['workspace-date','workspace-density']
];
const minimumLengths={'workspace-name':2,'workspace-owner':2,'workspace-goal':12};
let current=0;

function element(id){return document.getElementById(id)}
function isValid(id){
 const input=element(id);
 const minimum=minimumLengths[id]||0;
 return input.validity.valid && input.value.trim().length>=minimum;
}
function setError(id,invalid){
 const input=element(id),error=element(id+'-error');
 if(invalid){
  input.setAttribute('aria-invalid','true');
  input.setAttribute('aria-describedby',id+'-help '+id+'-error');
 }else{
  input.removeAttribute('aria-invalid');
  input.setAttribute('aria-describedby',id+'-help');
 }
 error.hidden=!invalid;
}
function validateStep(index){
 let firstInvalid=null;
 for(const id of fieldIds[index]||[]){
  const valid=isValid(id);
  setError(id,!valid);
  if(!valid && firstInvalid===null)firstInvalid=element(id);
 }
 if(firstInvalid){
  alert.hidden=false;
  alert.textContent='Check the highlighted fields before continuing.';
  firstInvalid.focus();
  return false;
 }
 alert.hidden=true;
 alert.textContent='';
 return true;
}
function formattedDate(value){
 // A date-only value has no timezone. UTC at noon preserves the calendar day
 // when asking Intl to format with its explicitly fixed UTC timezone.
 if(!/^\d{4}-\d{2}-\d{2}$/.test(value))return 'Not entered';
 const day=new Date(value+'T12:00:00Z');
 if(Number.isNaN(day.valueOf()) || day.toISOString().slice(0,10)!==value)return 'Invalid date';
 try{return new Intl.DateTimeFormat(navigator.language,{dateStyle:'long',timeZone:'UTC'}).format(day)}
 catch{return value}
}
function selectedText(id){
 const input=element(id);
 return input.selectedOptions[0]?.textContent||'Not entered';
}
function review(){
 const summary={
  name:element('workspace-name').value,
  owner:element('workspace-owner').value,
  purpose:selectedText('workspace-purpose'),
  goal:element('workspace-goal').value,
  reminders:selectedText('workspace-reminders'),
  backups:selectedText('workspace-backups'),
  date:formattedDate(element('workspace-date').value),
  density:selectedText('workspace-density')
 };
 for(const [key,value] of Object.entries(summary))element('review-'+key).textContent=value;
}
function showStep(index){
 if(index<0 || index>=panels.length)return;
 current=index;
 for(let i=0;i<panels.length;i++){
  panels[i].hidden=i!==index;
  if(i===index)markers[i].setAttribute('aria-current','step');
  else markers[i].removeAttribute('aria-current');
 }
 progress.textContent='Step '+(index+1)+' of '+panels.length+': '+panels[index].dataset.title;
 back.hidden=index===0;
 next.hidden=index===panels.length-1;
 check.hidden=index!==panels.length-1;
 next.textContent=index<panels.length-2?'Next: '+panels[index+1].dataset.title:'Review answers';
 alert.hidden=true;
 alert.textContent='';
 success.hidden=true;
 if(index===panels.length-1)review();
 panels[index].querySelector('h3').focus();
}
for(const ids of fieldIds){
 for(const id of ids){
  const input=element(id);
  // Only revalidate a field as it changes after an error has been shown.
  function onChange(){
   success.hidden=true;
   if(input.hasAttribute('aria-invalid'))setError(id,!isValid(id));
  }
  input.addEventListener('input',onChange);
  input.addEventListener('change',onChange);
 }
}
form.addEventListener('submit',event=>event.preventDefault());
next.addEventListener('click',()=>{
 if(current>=panels.length-1)return;
 if(validateStep(current))showStep(current+1);
});
back.addEventListener('click',()=>{
 if(current>0)showStep(current-1);
});
check.addEventListener('click',()=>{
 for(let i=0;i<fieldIds.length;i++){
  if(!fieldIds[i].every(isValid)){
   showStep(i);
   validateStep(i);
   return;
  }
 }
 alert.hidden=true;
 success.hidden=false;
 review();
});
// Activate only after every handler is installed. Without JS navigation remains disabled.
document.getElementById('workflow-fallback').hidden=true;
back.disabled=false;
next.disabled=false;
check.disabled=false;
