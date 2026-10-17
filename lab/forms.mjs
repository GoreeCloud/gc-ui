import {createThemeController} from '../src/gc-theme-runtime.mjs';
import {initPasswordReveal,initNumberStepper} from '../src/gc-form-controls.mjs';

createThemeController();

const brief=document.getElementById('brief-form');
const summary=document.getElementById('brief-errors');
const summaryList=document.getElementById('brief-errors-list');
const success=document.getElementById('brief-success');
const fields=[
 {id:'brief-name',help:'brief-name-help',error:'brief-name-error',label:'Project name',
  valid:el=>el.value.trim().length>0},
 {id:'brief-email',help:'brief-email-help',error:'brief-email-error',label:'Contact email',
  valid:el=>el.value.trim().length>0&&el.validity.valid},
 {id:'brief-notes',help:'brief-notes-help brief-notes-count',error:'brief-notes-error',label:'Project notes',
  valid:el=>el.value.trim().length>=10}
];
const notes=document.getElementById('brief-notes');
const count=document.getElementById('brief-notes-count');
function updateCount(){count.textContent=notes.value.length+' / 280'}
notes.addEventListener('input',updateCount);
function validateField(field){
 const el=document.getElementById(field.id),valid=field.valid(el);
 const help=[field.help,...(valid?[]:[field.error])].join(' ');
 el.setAttribute('aria-describedby',help);
 if(valid)el.removeAttribute('aria-invalid');
 else el.setAttribute('aria-invalid','true');
 document.getElementById(field.error).hidden=valid;
 return valid;
}
function updateSummary(){
 const invalid=fields.filter(field=>document.getElementById(field.id).getAttribute('aria-invalid')==='true');
 summaryList.replaceChildren();
 for(const field of invalid){
  const li=document.createElement('li'),link=document.createElement('a');
  link.href='#'+field.id;
  link.textContent=field.label+': '+document.getElementById(field.error).textContent;
  li.append(link);summaryList.append(li);
 }
 summary.hidden=invalid.length===0;
 return invalid.length;
}
brief.addEventListener('submit',event=>{
 event.preventDefault();
 success.hidden=true;
 for(const field of fields)validateField(field);
 if(updateSummary()){
  summary.focus();
  return;
 }
 summary.hidden=true;
 success.hidden=false;
});
// Only enable submission after the local-only handler is ready.
// Without JavaScript the button remains disabled and no form data has name attributes.
document.getElementById('brief-js-required').hidden=true;
document.getElementById('brief-submit').disabled=false;
summaryList.addEventListener('click',event=>{
 const link=event.target.closest?.('a[href^="#"]');
 if(!link)return;
 const target=document.getElementById(link.getAttribute('href').slice(1));
 if(target){event.preventDefault();target.focus()}
});
for(const field of fields){
 document.getElementById(field.id).addEventListener('input',()=>{
  success.hidden=true;
  if(document.getElementById(field.id).hasAttribute('aria-invalid')){
   validateField(field);
   updateSummary();
  }
 });
}
updateCount();

const examples=[
 {name:'Studio refresh',type:'Design system'},
 {name:'Mobile launch',type:'Product'},
 {name:'Research library',type:'Knowledge'},
 {name:'Team dashboard',type:'Workspace'},
 {name:'Design tokens',type:'Foundation'},
 {name:'Community portal',type:'Platform'}
];
const search=document.getElementById('project-search');
const suggestionList=document.getElementById('project-suggestions');
const results=document.getElementById('project-results');
const countStatus=document.getElementById('project-result-count');
const empty=document.getElementById('project-empty');
const clear=document.getElementById('search-clear');
const anchor=document.querySelector('.gc-search-anchor');
let choices=[],active=-1,composing=false;
const matching=()=>examples.filter(p=>p.name.toLocaleLowerCase().includes(search.value.trim().toLocaleLowerCase()));
function closeSuggestions(){
 suggestionList.hidden=true;
 search.setAttribute('aria-expanded','false');
 search.removeAttribute('aria-activedescendant');
 active=-1;
}
function selectChoice(index){
 if(!choices[index])return;
 search.value=choices[index].name;
 renderResults();
 closeSuggestions();
 search.focus();
}
function markChoice(index){
 active=index;
 const items=[...suggestionList.querySelectorAll('[role=option]')];
 items.forEach((el,i)=>el.setAttribute('aria-selected',String(i===index)));
 if(items[index]){
  search.setAttribute('aria-activedescendant',items[index].id);
  items[index].scrollIntoView({block:'nearest'});
 }else search.removeAttribute('aria-activedescendant');
}
function openSuggestions(){
 choices=search.value.trim()?matching().slice(0,5):[];
 suggestionList.replaceChildren();
 if(!choices.length){closeSuggestions();return}
 choices.forEach((choice,i)=>{
  const li=document.createElement('li');
  li.id='project-suggestion-'+i;
  li.setAttribute('role','option');
  li.setAttribute('aria-selected','false');
  li.textContent=choice.name;
  li.addEventListener('pointerdown',event=>event.preventDefault());
  li.addEventListener('click',()=>selectChoice(i));
  suggestionList.appendChild(li);
 });
 suggestionList.hidden=false;
 search.setAttribute('aria-expanded','true');
 active=-1;
 search.removeAttribute('aria-activedescendant');
}
function renderResults(){
 const matches=matching();
 clear.hidden=!search.value;
 results.replaceChildren();
 for(const item of matches){
  const li=document.createElement('li');
  const name=document.createElement('strong');
  const type=document.createElement('span');
  name.textContent=item.name;type.textContent=item.type;
  li.append(name,type);results.append(li);
 }
 countStatus.textContent=matches.length+' '+(matches.length===1?'project':'projects')+' found';
 empty.hidden=matches.length!==0;
}
search.addEventListener('compositionstart',()=>{
 composing=true;
 closeSuggestions();
});
search.addEventListener('compositionend',()=>{
 composing=false;
 renderResults();
 openSuggestions();
});
search.addEventListener('input',()=>{
 if(composing)return;
 renderResults();
 openSuggestions();
});
search.addEventListener('focus',()=>{
 if(!composing&&search.value.trim())openSuggestions();
});
search.addEventListener('keydown',event=>{
 if(composing||event.isComposing||event.keyCode===229)return;
 if(event.key==='Escape'){
  if(!suggestionList.hidden){event.preventDefault();closeSuggestions()}
  else if(search.value){event.preventDefault();search.value='';renderResults()}
  return;
 }
 if(event.key==='ArrowDown'||event.key==='ArrowUp'){
  if(suggestionList.hidden)openSuggestions();
  if(!choices.length)return;
  event.preventDefault();
  markChoice(active<0?(event.key==='ArrowDown'?0:choices.length-1):
   (active+(event.key==='ArrowDown'?1:-1)+choices.length)%choices.length);
  return;
 }
 if(event.key==='Enter'){
  event.preventDefault();
  if(!suggestionList.hidden&&active>=0)selectChoice(active);
  else closeSuggestions();
 }
});
anchor.addEventListener('focusout',event=>{
 if(!anchor.contains(event.relatedTarget))closeSuggestions();
});
function resetSearch(){
 search.value='';
 renderResults();
 closeSuggestions();
 search.focus();
}
clear.addEventListener('click',resetSearch);
document.getElementById('empty-reset').addEventListener('click',resetSearch);
renderResults();

/* Native-first experimental field and recovery controls (local-only specimens). */
initPasswordReveal(document.getElementById('demo-passphrase'),document.getElementById('passphrase-reveal'));
const density=document.getElementById('demo-density');
const preferenceState=document.getElementById('preference-state');
const quantity=document.getElementById('demo-collaborators');
const stepper=initNumberStepper(
 quantity,document.getElementById('demo-decrease'),document.getElementById('demo-increase'),{
  onChange:n=>{
   preferenceState.textContent=density.selectedOptions[0].text+' density · '+n+
    ' '+(n===1?'collaborator':'collaborators');
  }
 }
);
density.addEventListener('change',()=>stepper.set(stepper.get()));

const failure=document.getElementById('recovery-error');
const recovered=document.getElementById('recovery-success');
const simulate=document.getElementById('simulate-failure');
simulate.addEventListener('click',()=>{
 recovered.hidden=true;
 failure.hidden=false;
});
document.getElementById('recovery-retry').addEventListener('click',()=>{
 failure.hidden=true;
 recovered.hidden=false;
 simulate.focus();
});
