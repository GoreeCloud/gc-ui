/**
 * GoreeCloud UI Studio navigation enhancements.
 * Lab-only section discovery: no network, persistence, injected HTML,
 * generated routes, telemetry or changes to shared navigation semantics.
 */
export function initStudioSectionFinder(rail, controller) {
  if (!rail || !controller || typeof controller.setCollapsed !== "function") {
    throw new TypeError("The studio finder requires a mounted navigation rail controller");
  }
  const doc = rail.ownerDocument;
  const win = doc?.defaultView;
  const nav = rail.querySelector("#gc-lab-rail-links");
  const input = rail.querySelector("#gc-lab-rail-search");
  const status = rail.querySelector("#gc-lab-search-status");
  const breadcrumb = doc?.querySelector("#gc-lab-current-section");
  if (!win || !nav || !input || !status || !breadcrumb) {
    throw new Error("The studio finder requires its labeled search, status, navigation and breadcrumb");
  }

  const links = [...nav.querySelectorAll('a[href^="#"]')];
  const groups = [...nav.querySelectorAll(".gc-lab-nav-group")];
  if (!links.length || !groups.length) throw new Error("Studio navigation has no indexed sections");
  const initialVisibility = new Map([...links, ...groups].map(element => [element, element.hidden]));
  const label = link => link.querySelector(".gc-navigation-rail__label")?.textContent?.trim() || "";
  let disposed = false;
  const temporaryFocusTargets = new Set();

  function filter() {
    if (disposed) return [];
    const term = input.value.trim().toLocaleLowerCase();
    const visible = [];
    for (const link of links) {
      const matches = !term || label(link).toLocaleLowerCase().includes(term);
      link.hidden = !matches;
      if (matches) visible.push(link);
    }
    // Keep group headings with their visible destinations. No orphan headings.
    for (const group of groups) {
      let child = group.nextElementSibling;
      let any = false;
      while (child && !child.classList.contains("gc-lab-nav-group")) {
        if (links.includes(child) && !child.hidden) any = true;
        child = child.nextElementSibling;
      }
      group.hidden = !any;
    }
    status.hidden = !term;
    status.textContent = term
      ? visible.length ? `${visible.length} section${visible.length === 1 ? "" : "s"} found.`
        : "No matching sections. Try another search."
      : "";
    return visible;
  }

  function updateBreadcrumb() {
    if (disposed) return;
    const current = links.find(link => link.getAttribute("href") === win.location.hash);
    breadcrumb.textContent = current ? label(current) : "Design Language";
  }

  function onSearchKeydown(event) {
    if (event.isComposing) return;
    if (event.key === "Escape" && input.value) {
      event.preventDefault();
      input.value = "";
      filter();
      return;
    }
    if (event.key === "Enter") {
      const first = filter()[0];
      if (!first) return;
      event.preventDefault();
      input.value = "";
      filter();
      first.click();
      // A search result is a destination, not just another rail selection.
      // Programmatically focus that section for meaningful keyboard continuity.
      const target = doc.getElementById(first.getAttribute("href").slice(1));
      if (target) {
        if (!target.hasAttribute("tabindex")) {
          target.setAttribute("tabindex", "-1");
          temporaryFocusTargets.add(target);
        }
        target.focus({ preventScroll: true });
      }
      updateBreadcrumb();
    }
  }

  function onShortcut(event) {
    if (event.defaultPrevented || event.isComposing || event.key !== "/" ||
        event.altKey || event.ctrlKey || event.metaKey) return;
    const source = event.target;
    if (source?.closest?.('input,textarea,select,[contenteditable="true"],[role="textbox"]')) return;
    if (win.getComputedStyle(rail).display === "none") return;
    event.preventDefault();
    if (controller.collapsed) controller.setCollapsed(false);
    input.focus();
  }

  function onLinkClick(event) {
    const link = event.target?.closest?.('a[href^="#"]');
    if (!links.includes(link)) return;
    if (input.value) {
      input.value = "";
      filter();
    }
    // The shared rail controller remains the source of aria-current routing;
    // this helper only reflects the selected section in the visible breadcrumb.
    breadcrumb.textContent = label(link);
  }

  input.addEventListener("input", filter);
  input.addEventListener("keydown", onSearchKeydown);
  nav.addEventListener("click", onLinkClick);
  doc.addEventListener("keydown", onShortcut);
  win.addEventListener("hashchange", updateBreadcrumb);
  win.addEventListener("popstate", updateBreadcrumb);
  filter();
  updateBreadcrumb();

  return Object.freeze({
    filter,
    dispose() {
      if (disposed) return;
      disposed = true;
      input.removeEventListener("input", filter);
      input.removeEventListener("keydown", onSearchKeydown);
      nav.removeEventListener("click", onLinkClick);
      doc.removeEventListener("keydown", onShortcut);
      win.removeEventListener("hashchange", updateBreadcrumb);
      win.removeEventListener("popstate", updateBreadcrumb);
      for (const [element, hidden] of initialVisibility) element.hidden = hidden;
      for (const target of temporaryFocusTargets) {
        if (target.getAttribute("tabindex") === "-1") target.removeAttribute("tabindex");
      }
      temporaryFocusTargets.clear();
      status.hidden = true;
      status.textContent = "";
    }
  });
}

/**
 * Reflect the section actually in view during scrolling.
 * This is a lab-only scroll-location indicator, not a URL router:
 * it never mutates location.hash, history, or the shared navigation API.
 * A manual #anchor navigation still updates normally via the shared rail.
 */
export function initStudioViewportNavigation(rail) {
  if (!rail || typeof rail.querySelectorAll !== "function") {
    throw new TypeError("Studio viewport navigation requires its rail element");
  }
  const doc = rail.ownerDocument, win = doc?.defaultView;
  const nav = rail.querySelector("#gc-lab-rail-links");
  const breadcrumb = doc?.querySelector("#gc-lab-current-section");
  const toolbar = doc?.querySelector(".gc-lab-toolbar");
  if (!win || !nav || !breadcrumb || !toolbar) {
    throw new TypeError("Studio viewport navigation requires the document and toolbar");
  }

  const entries = [...nav.querySelectorAll('a[href^="#"]')].map(link => ({
    link,
    section: doc.getElementById(link.getAttribute("href").slice(1)),
    label: link.querySelector(".gc-navigation-rail__label")?.textContent?.trim()
  }));
  if (!entries.length || entries.some(entry => !entry.section || !entry.label)) {
    throw new Error("Studio viewport navigation needs real labeled section destinations");
  }
  let frame = 0, disposed = false;

  function sync() {
    frame = 0;
    if (disposed) return;
    // The section nearest the top reading position wins. A scroll spy must
    // never incorrectly claim that Overview remains current deep in the page.
    const toolbarBottom = toolbar.getBoundingClientRect().bottom;
    const limit = Math.max(0, toolbarBottom) + 28;
    let current = entries[0];
    for (const entry of entries) {
      if (entry.section.getBoundingClientRect().top <= limit) current = entry;
    }
    // At the exact document end, the last section stays reachable/current.
    for (const entry of entries) {
      if (entry.link === current.link) entry.link.setAttribute("aria-current", "page");
      else entry.link.removeAttribute("aria-current");
    }
    breadcrumb.textContent = current.label;
  }

  function schedule() {
    if (disposed || frame) return;
    frame = win.requestAnimationFrame(sync);
  }
  win.addEventListener("scroll", schedule, { passive: true });
  win.addEventListener("resize", schedule);
  win.addEventListener("hashchange", schedule);
  win.addEventListener("pageshow", schedule);
  schedule();

  return Object.freeze({
    sync,
    dispose() {
      if (disposed) return;
      disposed = true;
      if (frame) win.cancelAnimationFrame(frame);
      win.removeEventListener("scroll", schedule);
      win.removeEventListener("resize", schedule);
      win.removeEventListener("hashchange", schedule);
      win.removeEventListener("pageshow", schedule);
    }
  });
}
