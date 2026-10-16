import {createThemeController} from '../src/gc-theme-runtime.mjs';
createThemeController();
const query=document.getElementById('component-query');
const category=document.getElementById('component-category');
const buttons=[...document.querySelectorAll('[data-filter-status]')];
const grid=document.getElementById('component-grid');
const results=document.getElementById('result-message');
const empty=document.getElementById('empty-state');
let components=[],status='all';
function element(tag,className,text){
 const node=document.createElement(tag);
 if(className)node.className=className;
 if(text!==undefined)node.textContent=text;
 return node;
}
function componentCard(component){
 const card=element('article','component-card');
 card.setAttribute('role','listitem');
 const top=element('div','component-card-top');
 top.append(element('span','component-id',component.id));
 const state=element('span','component-status',component.webStatus==='experimental'?'Experimental':'Specified');
 state.dataset.state=component.webStatus;
 top.append(state);
 card.append(top,element('h3','',component.name),element('span','component-category',component.category));
 card.append(element('p','',component.anatomy));
 const foot=element('div','component-card-footer');
 const link=document.createElement('a');
 link.href=component.web?.example?'./'+component.web.example.replace(/^lab\//,''):'../docs/COMPONENT_CATALOG_V1.md';
 link.textContent=component.web?'View live example ↗':'Read specification ↗';
 foot.append(link);
 card.append(foot);
 return card;
}
function render(){
 const needle=query.value.trim().toLocaleLowerCase();
 const available=components.filter(c=>(status==='all'||c.webStatus===status)&&(category.value==='all'||c.category===category.value)&&
  (!needle||[c.id,c.name,c.category,c.anatomy,c.behavior].some(s=>s.toLocaleLowerCase().includes(needle))));
 grid.replaceChildren(...available.map(componentCard));
 results.textContent=available.length+' of '+components.length+' patterns shown';
 empty.hidden=available.length!==0;
 for(const button of buttons)button.setAttribute('aria-pressed',String(button.dataset.filterStatus===status));
}
query.addEventListener('input',render);
category.addEventListener('change',render);
for(const button of buttons)button.addEventListener('click',()=>{status=button.dataset.filterStatus;render()});
document.getElementById('reset-filters').addEventListener('click',()=>{query.value='';category.value='all';status='all';render();query.focus()});
try{
 const response=await fetch('../registry/components.v1.json');
 if(!response.ok)throw new Error('Registry could not be loaded ('+response.status+')');
 const data=await response.json();
 if(!Array.isArray(data.components)||data.components.length!==63)throw new Error('Registry is missing entries.');
 components=data.components;
 document.getElementById('catalog-total').textContent=String(components.length);
 document.getElementById('catalog-experimental').textContent=String(components.filter(c=>c.webStatus==='experimental').length);
 document.getElementById('catalog-stable').textContent=String(components.filter(c=>c.webStatus==='stable').length);
 render();
}catch(error){
 results.textContent='Unable to load the component registry: '+error.message;
 empty.hidden=false;
 document.querySelector('#empty-state h3').textContent='Registry unavailable';
 document.querySelector('#empty-state p').textContent='Run the GC UI local server to load the registry. The written component specification remains available.';
}
