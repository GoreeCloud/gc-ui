/**
 * GoreeCloud UI editable single-select combobox (ARIA listbox pattern).
 * Works with an actual labeled input, a controlled list of safe DOM option
 * elements, and no injected markup, network requests, telemetry or storage.
 */
export function initCombobox(input, list, { onSelect } = {}) {
  if (!input || input.getAttribute?.("role") !== "combobox" ||
      typeof input.addEventListener !== "function" ||
      typeof input.setAttribute !== "function") {
    throw new TypeError("Combobox requires an input with role=combobox");
  }
  if (!list || list.getAttribute?.("role") !== "listbox" ||
      typeof list.querySelectorAll !== "function" ||
      !list.id || input.getAttribute("aria-controls") !== list.id) {
    throw new TypeError("Combobox requires a matching, identified role=listbox");
  }
  if (onSelect !== undefined && typeof onSelect !== "function") throw new TypeError("onSelect must be a function");
  const hasLabel=Boolean(input.getAttribute("aria-label") || input.getAttribute("aria-labelledby") ||
    input.labels?.length);
  if (!hasLabel) throw new Error("Combobox input requires an accessible label");
  const doc=input.ownerDocument;
  if (!doc || typeof doc.addEventListener !== "function") throw new TypeError("Combobox needs a document");
  const options=Array.from(list.querySelectorAll('[role="option"]'));
  if (!options.length) throw new Error("Combobox requires at least one option");
  if (options.some(option => !option.id) ||
      new Set(options.map(option=>option.id)).size!==options.length) {
    throw new Error("Combobox options require unique IDs for aria-activedescendant");
  }
  const status=doc.getElementById(input.getAttribute("aria-describedby") || "") || null;
  const empty=list.querySelector?.("[data-gc-combobox-empty]") || null;
  const normalize=text=>String(text??"").normalize("NFKC").toLocaleLowerCase().trim();
  const label=option=>option.getAttribute("data-gc-label") || option.textContent?.trim() || "";
  const enabled=option=>!option.disabled && option.getAttribute("aria-disabled")!=="true";
  let destroyed=false, pending=false, active=null, selected=null;
  const choices=()=>options.filter(option=>!option.hidden && enabled(option));
  const setActive=option=>{
    if (option && !choices().includes(option)) return;
    active=option;
    for (const candidate of options) {
      if (candidate===option) candidate.setAttribute("data-gc-active","");
      else candidate.removeAttribute("data-gc-active");
    }
    if (option) {
      input.setAttribute("aria-activedescendant",option.id);
      option.scrollIntoView?.({block:"nearest"});
    } else input.removeAttribute("aria-activedescendant");
  };
  const refresh=()=>{
    if (destroyed || pending) return;
    const query=normalize(input.value);
    for (const option of options) {
      const text=normalize(label(option)+" "+(option.getAttribute("data-gc-keywords")||""));
      option.hidden=!text.includes(query);
    }
    if (active?.hidden) setActive(null);
    const count=choices().length;
    if (empty) empty.hidden=count!==0;
    if (status) status.textContent=count===0?"No matching options":
      count+(count===1?" option available":" options available");
  };
  const open=()=>{
    if (destroyed) throw new Error("Combobox has been disposed");
    if (pending) return;
    refresh();list.hidden=false;
    input.setAttribute("aria-expanded","true");
  };
  const close=()=>{
    list.hidden=true;
    input.setAttribute("aria-expanded","false");
    setActive(null);
  };
  const choose=async option=>{
    if (destroyed||pending||!options.includes(option)||option.hidden||!enabled(option)) return;
    pending=true;
    try {
      const value=option.getAttribute("data-gc-value")??label(option);
      const result=onSelect?.(option,value);
      if (result && typeof result.then==="function") {
        input.setAttribute("aria-busy","true");
        await result;
      }
      if (destroyed) return;
      selected=option;
      input.value=label(option);
      options.forEach(candidate=>candidate.setAttribute("aria-selected",String(candidate===option)));
      close();
      // Programmatic value updates do not forge input/change DOM events.
    } catch {
      if (status) status.textContent="Selection could not be completed. Try again.";
    } finally {
      pending=false;
      input.removeAttribute("aria-busy");
    }
  };
  const onInput=()=>{if (pending || destroyed) return; selected=null;options.forEach(option=>option.setAttribute("aria-selected","false"));setActive(null);open()};
  const onFocus=()=>{if (!pending && !destroyed) open();};
  const onKey=event=>{
    if (pending || destroyed) return;
    if (event.altKey||event.ctrlKey||event.metaKey) return;
    if (event.key==="Escape") {
      if (!list.hidden) {event.preventDefault();close();}
      return;
    }
    if (event.key==="Tab") {close();return;}
    if (event.key==="ArrowDown"||event.key==="ArrowUp") {
      event.preventDefault();
      if (list.hidden) open();
      const available=choices();
      if (!available.length) return;
      const index=available.indexOf(active);
      const delta=event.key==="ArrowDown"?1:-1;
      setActive(available[(index<0?(delta===1?0:available.length-1):
        (index+delta+available.length)%available.length)]);
      return;
    }
    if (event.key==="Enter"&&active&&!list.hidden) {
      event.preventDefault();
      void choose(active);
    }
  };
  const onClick=event=>{
    if (pending || destroyed) return;
    const option=event.target?.closest?.('[role="option"]');
    if (options.includes(option)) void choose(option);
  };
  const onPointerDown=event=>{
    if (pending || destroyed) return;
    const option=event.target?.closest?.('[role="option"]');
    if (options.includes(option)) event.preventDefault();
  };
  const onOutside=event=>{
    if (!pending && !destroyed && event.target!==input && !list.contains(event.target)) close();
  };
  input.setAttribute("aria-haspopup","listbox");
  input.setAttribute("aria-autocomplete","list");
  input.setAttribute("aria-expanded","false");
  list.hidden=true;
  options.forEach(option=>option.setAttribute("aria-selected","false"));
  input.addEventListener("focus",onFocus);
  input.addEventListener("focusin",onFocus);
  input.addEventListener("input",onInput);
  input.addEventListener("keydown",onKey);
  list.addEventListener("click",onClick);
  list.addEventListener("pointerdown",onPointerDown);
  doc.addEventListener("pointerdown",onOutside);
  if (doc.activeElement === input) open();
  else refresh();
  return Object.freeze({
    open,close,refresh,
    dispose(){
      if (destroyed) return;
      close();destroyed=true;
      input.removeEventListener("focus",onFocus);
      input.removeEventListener("focusin",onFocus);
      input.removeEventListener("input",onInput);
      input.removeEventListener("keydown",onKey);
      list.removeEventListener("click",onClick);
      list.removeEventListener("pointerdown",onPointerDown);
      doc.removeEventListener("pointerdown",onOutside);
    }
  });
}
