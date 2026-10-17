import {createThemeController} from '../src/gc-theme-runtime.mjs';
import {createSurfaceController} from '../src/gc-surface-runtime.mjs';
createThemeController();
createSurfaceController({key:'gc-ui-atlas:'});
const grid=document.getElementById('icon-grid');
const search=document.getElementById('icon-search');
const select=document.getElementById('family');
const result=document.getElementById('result-count');
const empty=document.getElementById('empty');
const sprite='../assets/third-party/gc-third-party-glyphs.svg#';
async function init(){
 try{
  const response=await fetch('../registry/third-party-assets.v1.json',{cache:'no-store'});
  if(!response.ok)throw new Error('Asset registry unavailable');
  const data=await response.json();
  const providers=new Map(data.providers.map(p=>[p.id,p]));
  for(const p of data.providers){
   const option=document.createElement('option');
   option.value=p.id;option.textContent=p.name+' — '+p.license;
   select.append(option);
  }
  const icons=data.icons.slice();
  function render(){
   const term=search.value.trim().toLocaleLowerCase();
   const family=select.value;
   const filtered=icons.filter(i=>(family==='all'||family===i.provider)
    &&(i.name.toLocaleLowerCase().includes(term)||i.provider.toLocaleLowerCase().includes(term)));
   grid.replaceChildren();
   for(const entry of filtered){
    const card=document.createElement('article');card.className='icon-card';
    const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
    svg.setAttribute('aria-hidden','true');
    const use=document.createElementNS('http://www.w3.org/2000/svg','use');
    use.setAttribute('href',sprite+entry.id);svg.append(use);
    const title=document.createElement('strong');title.textContent=entry.name.replaceAll('-',' ');
    const caption=document.createElement('small');caption.textContent=providers.get(entry.provider)?.name||entry.provider;
    const copy=document.createElement('button');copy.type='button';copy.textContent='Copy symbol ID';copy.setAttribute('aria-label','Copy symbol ID for '+title.textContent);
    copy.addEventListener('click',()=>{
     if(navigator.clipboard?.writeText){
      navigator.clipboard.writeText(entry.id).then(()=>{result.textContent='Copied '+entry.id+'.'}).catch(()=>{result.textContent='Symbol: '+entry.id});
     }else result.textContent='Symbol: '+entry.id;
    });
    card.append(svg,title,caption,copy);grid.append(card);
   }
   empty.hidden=filtered.length!==0;
   result.textContent=filtered.length+' of '+icons.length+' locally licensed glyphs shown.';
  }
  search.addEventListener('input',render);
  select.addEventListener('change',render);
  render();
 }catch(error){
  result.textContent='Could not load the offline asset registry.';
  empty.hidden=false;
 }
}
init();
