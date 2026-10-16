import {createThemeController} from '../src/gc-theme-runtime.mjs';
import {initDialog} from '../src/gc-interactions.mjs';

const theme=createThemeController();
const dialog=initDialog(document.getElementById('details-sheet'));
const labels={
 overview:{title:'Your overview.',subtitle:'A connected workspace that feels right at every screen size.',heading:'Today at a glance'},
 activity:{title:'Your activity.',subtitle:'Updates and work, consistently navigable on any device.',heading:'Activity at a glance'},
 library:{title:'Your library.',subtitle:'A calm home for components and shared materials.',heading:'Library at a glance'}
};
const title=document.getElementById('page-title');
const subtitle=document.getElementById('page-subtitle');
const contentTitle=document.getElementById('content-title');
const crumb=document.getElementById('crumb-current');
const links=[...document.querySelectorAll('[data-gc-route]')];
const themeToggle=document.getElementById('appearance-toggle');
function routeFromHash(){const route=location.hash.slice(1);return Object.hasOwn(labels,route)?route:'overview'}
function renderRoute(){
 const route=routeFromHash(),current=labels[route];
 document.title='GoreeCloud UI · '+route[0].toUpperCase()+route.slice(1);
 title.textContent=current.title;
 subtitle.textContent=current.subtitle;
 contentTitle.textContent=current.heading;
 crumb.textContent=route[0].toUpperCase()+route.slice(1);
 for(const link of links){
  if(link.dataset.gcRoute===route)link.setAttribute('aria-current','page');
  else link.removeAttribute('aria-current');
 }
}
function renderAppearance(){
 const mode=theme.resolved().mode;
 const next=mode==='dark'?'light':'dark';
 themeToggle.textContent=next==='dark'?'Dark mode':'Light mode';
 themeToggle.setAttribute('aria-label','Switch to '+next+' appearance');
}
window.addEventListener('hashchange',()=>{
 renderRoute();
 document.getElementById('route-announcement').textContent='Now viewing '+labels[routeFromHash()].title;
 title.focus();
});
document.documentElement.addEventListener('gc-theme-change',renderAppearance);
themeToggle.addEventListener('click',()=>theme.set({mode:theme.resolved().mode==='dark'?'light':'dark'}));
renderRoute();
renderAppearance();
