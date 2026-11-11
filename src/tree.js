/**
 * GoreeCloud UI native-DOM ARIA treeview enhancement for OS-like navigation.
 *
 * Semantic role=tree/treeitem/group markup remains readable without JS.
 * No network, persistence, telemetry, HTML injection or third-party runtime.
 * Consumer applications must implement authorization in activation handlers.
 */
export function initTreeView(tree, { onSelect, onActivate, locale } = {}) {
  if (!tree || tree.getAttribute?.("role") !== "tree" ||
      typeof tree.querySelectorAll !== "function" ||
      typeof tree.addEventListener !== "function") {
    throw new TypeError("Treeview requires a role=tree container");
  }
  if (onSelect !== undefined && typeof onSelect !== "function") throw new TypeError("onSelect must be a function");
  if (onActivate !== undefined && typeof onActivate !== "function") throw new TypeError("onActivate must be a function");
  const items = Array.from(tree.querySelectorAll('[role="treeitem"]'))
    .filter(item => item.closest?.('[role="tree"]') === tree);
  if (!items.length) throw new Error("Treeview needs at least one treeitem");
  const groupFor = item => Array.from(item.children || [])
    .find(child => child.getAttribute?.("role") === "group") || null;
  const groupMap = new Map(items.map(item => [item, groupFor(item)]));
  const canChoose = item => Boolean(item && !item.hidden && !item.disabled &&
    item.getAttribute("aria-disabled") !== "true");
  const visible = item => {
    if (!canChoose(item) || tree.disabled || tree.getAttribute("aria-disabled") === "true") return false;
    let node = item;
    while (node && node !== tree) {
      if (node.hidden || (node !== item && (node.disabled || node.getAttribute?.("aria-disabled") === "true"))) return false;
      if (node !== item && node.getAttribute?.("role") === "treeitem" &&
          node.getAttribute("aria-expanded") === "false") return false;
      node = node.parentElement;
    }
    return node === tree;
  };
  const eligible = () => items.filter(visible);
  const parentItem = item => {
    const p = item.parentElement?.closest?.('[role="treeitem"]');
    return items.includes(p) ? p : null;
  };
  for (const item of items) {
    const group = groupMap.get(item);
    if (group) {
      const expanded = item.getAttribute("aria-expanded") === "true";
      item.setAttribute("aria-expanded", String(expanded));
      group.hidden = !expanded;
    } else if (item.getAttribute("aria-expanded") !== null) {
      throw new Error("Leaf treeitem must not use aria-expanded");
    }
  }
  if (!eligible().length) throw new Error("Treeview needs at least one visible enabled treeitem");
  let destroyed = false;
  let current = null;
  let typeahead = "";
  let typeaheadAt = 0;
  const select = (item, { focus = false, notify = true } = {}) => {
    if (destroyed || !visible(item)) return false;
    const changed = current !== item;
    current = item;
    items.forEach(candidate => {
      candidate.tabIndex = candidate === item ? 0 : -1;
      candidate.setAttribute("aria-selected", String(candidate === item));
    });
    if (focus) item.focus();
    if (changed && notify) onSelect?.(item);
    return true;
  };
  const setExpanded = (item, value) => {
    if (destroyed) throw new Error("Treeview has been disposed");
    const group = groupMap.get(item);
    if (!group) return false;
    const expanded = Boolean(value);
    item.setAttribute("aria-expanded", String(expanded));
    group.hidden = !expanded;
    if (!expanded && current && current !== item && item.contains(current)) {
      if (visible(item)) select(item,{focus:true});
      else {
        const fallback=eligible()[0];
        if (fallback) select(fallback,{focus:true});
      }
    }
    return true;
  };
  // A consumer may disable/hide items dynamically after mounting. Reconcile
  // the roving tab stop without trapping focus on an unavailable destination.
  const refresh = () => {
    if (destroyed) return false;
    const available = eligible();
    if (!available.length) {
      current = null;
      items.forEach(item => {
        item.tabIndex = -1;
        item.setAttribute("aria-selected", "false");
      });
      return false;
    }
    if (current && available.includes(current)) return true;
    const focused = Boolean(current && tree.ownerDocument?.activeElement === current);
    let ancestor = current ? parentItem(current) : null;
    while (ancestor && !available.includes(ancestor)) ancestor = parentItem(ancestor);
    return select(ancestor || available[0], { focus: focused });
  };
  const toggle = item => setExpanded(item,item.getAttribute("aria-expanded") !== "true");
  const targetItem = target => {
    const node = target?.closest?.('[role="treeitem"]');
    return items.includes(node) && tree.contains(node) ? node : null;
  };
  const onClick = event => {
    const node=targetItem(event.target);
    if (!node || !visible(node)) return;
    select(node,{focus:true});
    if (groupMap.get(node)) toggle(node);
    else onActivate?.(node);
  };
  const onFocus = event => {
    const node=targetItem(event.target);
    if (node) select(node);
  };
  const onKey = event => {
    const node=targetItem(event.target);
    if (!node || !visible(node) || event.altKey || event.ctrlKey ||
        event.metaKey || event.isComposing) return;
    const available=eligible();
    const index=available.indexOf(node);
    if (index<0) return;
    const rtl = tree.dir === "rtl" || tree.ownerDocument?.documentElement?.dir === "rtl";
    let next=null;
    if (event.key === "ArrowDown") next=available[(index+1)%available.length];
    if (event.key === "ArrowUp") next=available[(index-1+available.length)%available.length];
    if (event.key === "Home") next=available[0];
    if (event.key === "End") next=available[available.length-1];
    if (next) {
      event.preventDefault();
      select(next,{focus:true});
      return;
    }
    const expandKey=rtl?"ArrowLeft":"ArrowRight";
    const collapseKey=rtl?"ArrowRight":"ArrowLeft";
    if (event.key === expandKey) {
      const group=groupMap.get(node);
      if (!group) return;
      event.preventDefault();
      if (node.getAttribute("aria-expanded") !== "true") setExpanded(node,true);
      else {
        const first=eligible().find(candidate=>candidate!==node && node.contains(candidate));
        if (first) select(first,{focus:true});
      }
      return;
    }
    if (event.key === collapseKey) {
      if (groupMap.get(node) && node.getAttribute("aria-expanded") === "true") {
        event.preventDefault();
        setExpanded(node,false);
      } else {
        let ancestor=parentItem(node);
        while (ancestor && !visible(ancestor)) ancestor=parentItem(ancestor);
        if (ancestor) { event.preventDefault(); select(ancestor,{focus:true}); }
      }
      return;
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      select(node);
      if (groupMap.get(node)) toggle(node);
      else onActivate?.(node);
      return;
    }
    if (event.key?.length === 1 && /\S/u.test(event.key)) {
      const letter=event.key.toLocaleLowerCase(locale);
      const now=Date.now();
      const previous=now-typeaheadAt>700 ? "" : typeahead;
      // Repeating one letter cycles matching destinations, instead of
      // constructing a query such as "ddd" that matches none of them.
      typeahead=previous && [...previous].every(key=>key===letter)
        ? letter : previous+letter;
      typeaheadAt=now;
      const matches=available.slice(index+1).concat(available.slice(0,index+1));
      const labelFor=item=>(item.getAttribute("data-gc-tree-label") ||
        item.getAttribute("aria-label") ||
        Array.from(item.children||[]).find(child=>child.classList?.contains("gc-tree__row"))?.textContent ||
        "").trim().toLocaleLowerCase(locale);
      const choice=matches.find(item=>labelFor(item).startsWith(typeahead));
      if (choice) { event.preventDefault(); select(choice,{focus:true}); }
    }
  };
  tree.addEventListener("click",onClick);
  tree.addEventListener("focusin",onFocus);
  tree.addEventListener("keydown",onKey);
  const initial=items.find(item=>visible(item) && item.getAttribute("aria-selected")==="true") || eligible()[0];
  select(initial,{notify:false});
  return Object.freeze({
    select: item => select(item,{focus:true}),
    refresh,
    expand: item => setExpanded(item,true),
    collapse: item => setExpanded(item,false),
    dispose() {
      if (destroyed) return;
      destroyed=true;
      typeahead="";
      tree.removeEventListener("click",onClick);
      tree.removeEventListener("focusin",onFocus);
      tree.removeEventListener("keydown",onKey);
    }
  });
}
