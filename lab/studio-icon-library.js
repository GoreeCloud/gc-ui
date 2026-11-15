/** Lab-only, offline, accessible GoreeCloud icon reference. */
export const STUDIO_ICON_GROUPS = Object.freeze([
  { id:"navigation", title:"Navigation", description:"Find a place and move through it.", names:["home","search","menu","close","chevronDown","chevronRight","arrowLeft","arrowRight","more","external"] },
  { id:"actions", title:"Actions", description:"Act on content, files and choices.", names:["plus","minus","check","edit","trash","share","download","upload","filter"] },
  { id:"workspace", title:"Workspace", description:"Organize information and work.", names:["folder","file","calendar","clock","grid","list","cloud","sync"] },
  { id:"protection", title:"People & protection", description:"Identity, access and visibility.", names:["user","users","lock","shield","eye","eyeOff"] },
  { id:"feedback", title:"Feedback & appearance", description:"Communicate state and preferences.", names:["info","alert","error","settings","sun","moon","bell","help","sparkle"] }
]);
const humanize = name => name.replace(/([a-z])([A-Z])/g,"$1 $2").replace(/^./, c=>c.toUpperCase());

export function initStudioIconLibrary(root, iconNames) {
  if (!root || !Array.isArray(iconNames) || !iconNames.length ||
      iconNames.some(name=>typeof name!=="string")) {
    throw new TypeError("Icon library requires its DOM root and original icon manifest");
  }
  const doc=root.ownerDocument, grid=root.querySelector("#icon-grid"),
    search=root.querySelector("#gc-studio-icon-search"),
    category=root.querySelector("#gc-studio-icon-category"),
    count=root.querySelector("#gc-studio-icon-results"),
    clear=root.querySelector("#gc-studio-icon-clear");
  if (!doc || !grid || !search || !category || !count || !clear) {
    throw new Error("Icon library requires its labeled native form controls");
  }
  const unique=new Set(iconNames);
  if (unique.size!==iconNames.length) throw new Error("Duplicate icon manifest entry");
  const known=new Set(STUDIO_ICON_GROUPS.flatMap(group=>group.names));
  const groups=STUDIO_ICON_GROUPS.map(group=>({...group,names:group.names.filter(name=>unique.has(name))}));
  const extra=iconNames.filter(name=>!known.has(name));
  if (extra.length) groups.push({id:"other",title:"Additional icons",description:"New source manifest entries.",names:extra});
  const all=[], sections=[];
  for(const group of groups) {
    if (!group.names.length) continue;
    const section=doc.createElement("section");
    section.className="gc-studio-icon-group";
    section.dataset.iconGroup=group.id;
    section.setAttribute("aria-label",group.title);
    const heading=doc.createElement("div");heading.className="gc-studio-icon-group-head";
    const copy=doc.createElement("div");
    const h=doc.createElement("h3");h.textContent=group.title;
    const p=doc.createElement("p");p.textContent=group.description;
    copy.append(h,p);
    const counter=doc.createElement("span");counter.className="gc-studio-icon-group-count";
    heading.append(copy,counter);
    const tiles=doc.createElement("div");tiles.className="gc-lab-icon-grid";
    for(const name of group.names) {
      const item=doc.createElement("div");item.className="gc-lab-icon-tile";
      item.dataset.iconName=name;item.dataset.iconGroup=group.id;
      const icon=doc.createElement("gc-icon");
      icon.setAttribute("name",name);icon.setAttribute("size","24");
      icon.setAttribute("aria-hidden","true");
      const label=doc.createElement("span");label.textContent=humanize(name);
      const token=doc.createElement("code");token.textContent=name;
      item.append(icon,label,token);tiles.append(item);all.push(item);
    }
    section.append(heading,tiles);grid.append(section);sections.push({section,group,counter});
  }
  let disposed=false;
  function filter() {
    if(disposed)return 0;
    const term=search.value.trim().toLocaleLowerCase(),selected=category.value;
    let shown=0;
    for(const item of all) {
      const hit=(!term||item.dataset.iconName.toLocaleLowerCase().includes(term)||
        humanize(item.dataset.iconName).toLocaleLowerCase().includes(term))&&
        (selected==="all"||selected===item.dataset.iconGroup);
      item.hidden=!hit;if(hit)shown++;
    }
    for(const entry of sections) {
      const n=entry.group.names.filter(name=>all.some(i=>i.dataset.iconName===name&&!i.hidden)).length;
      entry.section.hidden=n===0;entry.counter.textContent=String(n).padStart(2,"0");
    }
    count.textContent=shown?shown+" of "+all.length+" original icons shown":
      "No matching icons. Change the search or category.";
    clear.hidden=!term&&selected==="all";
    return shown;
  }
  function reset(){search.value="";category.value="all";filter();search.focus();}
  search.addEventListener("input",filter);
  category.addEventListener("change",filter);
  clear.addEventListener("click",reset);
  filter();
  return Object.freeze({filter,dispose(){
    if(disposed)return;disposed=true;
    search.removeEventListener("input",filter);
    category.removeEventListener("change",filter);
    clear.removeEventListener("click",reset);
    for(const entry of sections)entry.section.remove();
    count.textContent="";clear.hidden=true;
  }});
}
