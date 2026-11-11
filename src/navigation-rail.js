/** GoreeCloud UI: progressive, icon-collapsible tablet/desktop navigation rail.
 * Native links preserve ordinary navigation and server-owned access control.
 * No persistence, network calls, analytics, or dependence on icon libraries.
 */
export function initNavigationRail(rail, { collapsed } = {}) {
  if (!rail || !["aside","nav"].includes(rail.tagName?.toLowerCase()) ||
      typeof rail.querySelector !== "function") {
    throw new TypeError("Navigation rail requires a native aside or nav element");
  }
  const doc = rail.ownerDocument, win = doc?.defaultView;
  if (!doc || !win) throw new TypeError("Navigation rail needs a browser document");
  const shell = rail.closest?.(".gc-navigation-shell");
  const nav = rail.matches("nav") ? rail : rail.querySelector("nav.gc-navigation-rail__links");
  const toggle = rail.querySelector("button[data-gc-rail-toggle]");
  if (!shell || !nav || !toggle || !nav.id ||
      toggle.ownerDocument !== doc || toggle.getAttribute("aria-controls") !== nav.id) {
    throw new Error("Navigation rail needs a shell, named nav and native toggle controlling its ID");
  }
  if (!nav.getAttribute("aria-label") && !nav.getAttribute("aria-labelledby")) {
    throw new Error("Navigation rail destinations require an accessible nav name");
  }
  if (collapsed !== undefined && typeof collapsed !== "boolean") {
    throw new TypeError("collapsed must be a boolean when provided");
  }
  const links = [...nav.querySelectorAll("a[href]")];
  if (!links.length || links.some(link => !link.querySelector(".gc-navigation-rail__label")?.textContent?.trim())) {
    throw new Error("Every navigation rail destination needs a readable label");
  }
  const titles = new Map(links.map(link => [link,link.getAttribute("title")]));
  const original = {
    rail:rail.getAttribute("data-gc-collapsed"),
    shell:shell.getAttribute("data-gc-rail-collapsed"),
    expanded:toggle.getAttribute("aria-expanded"),
    label:toggle.getAttribute("aria-label"),
    title:toggle.getAttribute("title")
  };
  // Tablet starts with an icon rail, large desktop with a full sidebar.
  // A manual toggle wins over later viewport resizes for this controller lifetime.
  const media = win.matchMedia?.("(min-width: 601px) and (max-width: 1023px)");
  let manual = collapsed !== undefined;
  let isCollapsed = false, disposed = false;
  toggle.type = "button";

  const apply = next => {
    if (disposed) return false;
    isCollapsed = next;
    rail.setAttribute("data-gc-collapsed",String(next));
    shell.setAttribute("data-gc-rail-collapsed",String(next));
    toggle.setAttribute("aria-expanded",String(!next));
    const action = next ? "Expand navigation" : "Collapse navigation";
    toggle.setAttribute("aria-label",action);
    toggle.title = action;
    for (const link of links) {
      const previous = titles.get(link);
      if (next && previous === null) {
        link.setAttribute("title",link.querySelector(".gc-navigation-rail__label").textContent.trim());
      } else if (!next) {
        if (previous === null) link.removeAttribute("title");
        else link.setAttribute("title",previous);
      }
    }
    return true;
  };
  const setCollapsed = next => {
    if (typeof next !== "boolean") throw new TypeError("collapsed must be a boolean");
    manual = true;
    return apply(next);
  };
  const sync = () => {
    if (disposed) return;
    const current = win.location;
    const selected = links.find(link => {
      if (link.hidden || link.getAttribute("aria-disabled") === "true") return false;
      try {
        const url = new URL(link.getAttribute("href"),doc.baseURI);
        return url.origin === current.origin &&
          url.pathname === current.pathname &&
          url.search === current.search &&
          url.hash === current.hash;
      } catch { return false; }
    });
    if (!selected) return; // Preserve consumer selection on an unmatched route.
    for (const link of links) {
      if (link === selected) link.setAttribute("aria-current","page");
      else link.removeAttribute("aria-current");
    }
  };
  const onClick = event => {
    const link = event.target?.closest?.("a[href]");
    if (link && links.includes(link) && link.getAttribute("aria-disabled") === "true") {
      event.preventDefault();
    }
  };
  const onToggle = () => setCollapsed(!isCollapsed);
  const onMedia = () => { if (!manual) apply(Boolean(media?.matches)); };
  toggle.addEventListener("click",onToggle);
  nav.addEventListener("click",onClick);
  win.addEventListener("hashchange",sync);
  win.addEventListener("popstate",sync);
  media?.addEventListener?.("change",onMedia);
  apply(collapsed ?? Boolean(media?.matches));
  sync();
  return Object.freeze({
    get collapsed() { return isCollapsed; },
    setCollapsed,
    toggle: onToggle,
    sync,
    dispose() {
      if (disposed) return;
      disposed = true;
      toggle.removeEventListener("click",onToggle);
      nav.removeEventListener("click",onClick);
      win.removeEventListener("hashchange",sync);
      win.removeEventListener("popstate",sync);
      media?.removeEventListener?.("change",onMedia);
      for (const [link,title] of titles) {
        if (title === null) link.removeAttribute("title");
        else link.setAttribute("title",title);
      }
      for (const [el,name,value] of [
        [rail,"data-gc-collapsed",original.rail],
        [shell,"data-gc-rail-collapsed",original.shell],
        [toggle,"aria-expanded",original.expanded],
        [toggle,"aria-label",original.label],
        [toggle,"title",original.title]
      ]) {
        if (value === null) el.removeAttribute(name);
        else el.setAttribute(name,value);
      }
    }
  });
}
