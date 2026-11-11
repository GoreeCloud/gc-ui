/**
 * GoreeCloud UI: semantic floating bottom destination navigation.
 * Native links perform actual navigation. The controller only updates
 * visible selection and offers optional, synchronous consumer approval.
 * No network, storage, telemetry or privileged actions.
 */
export function initBottomNavigation(nav, { onNavigate, content } = {}) {
  if (!nav || nav.tagName?.toLowerCase() !== "nav" ||
      typeof nav.querySelectorAll !== "function" ||
      typeof nav.addEventListener !== "function") {
    throw new TypeError("Bottom navigation requires a native nav element");
  }
  if (!nav.getAttribute("aria-label") && !nav.getAttribute("aria-labelledby")) {
    throw new Error("Bottom navigation requires an accessible name");
  }
  if (onNavigate !== undefined && typeof onNavigate !== "function") {
    throw new TypeError("onNavigate must be a synchronous function");
  }
  const doc = nav.ownerDocument;
  const win = doc?.defaultView;
  if (!doc || !win || !doc.baseURI) throw new TypeError("Bottom navigation needs a browser document");
  if (content !== undefined && (!content || content.ownerDocument !== doc ||
      typeof content.style?.setProperty !== "function" ||
      typeof content.style?.getPropertyValue !== "function")) {
    throw new TypeError("Dock content must be an element in the same document");
  }
  const links = Array.from(nav.querySelectorAll("a[href]"));
  if (links.length < 2 || links.length > 6) {
    throw new RangeError("Bottom navigation requires two to six primary destinations");
  }
  const urls = links.map(link => {
    const raw = link.getAttribute("href")?.trim();
    if (!raw || raw === "#") throw new Error("Each destination must have a real link");
    const url = new URL(raw, doc.baseURI);
    if (!["https:", "http:"].includes(url.protocol) ||
        url.origin !== new URL(doc.baseURI).origin) {
      throw new Error("Bottom navigation accepts same-origin HTTP(S) destinations only");
    }
    return url;
  });
  if (new Set(urls.map(x => x.href)).size !== urls.length) {
    throw new Error("Bottom navigation destinations must be unique");
  }
  let disposed = false;
  let selected = null;
  const enabled = link => Boolean(link && links.includes(link) && !link.hidden &&
    !link.closest?.("[hidden]") && link.getAttribute("aria-disabled") !== "true");
  const choices = () => links.filter(enabled);
  if (!choices().length) throw new Error("Bottom navigation needs an enabled destination");

  const select = link => {
    if (disposed || !enabled(link)) return false;
    selected = link;
    for (const item of links) {
      if (item === link) {
        item.setAttribute("aria-current", "page");
        item.setAttribute("data-gc-active", "");
      } else {
        item.removeAttribute("aria-current");
        item.removeAttribute("data-gc-active");
      }
    }
    return true;
  };
  const syncFromLocation = () => {
    if (disposed) return;
    const location = win.location;
    const match = links.find((link,i) => enabled(link) &&
      urls[i].pathname === location.pathname &&
      urls[i].search === location.search &&
      urls[i].hash === location.hash);
    if (match) select(match);
    else {
      // Browser history can leave the dock's route set. Never present a stale
      // selection as the current page, even when it was selected earlier.
      selected = null;
      for (const item of links) {
        item.removeAttribute("aria-current");
        item.removeAttribute("data-gc-active");
      }
    }
  };
  const onClick = event => {
    const link = event.target?.closest?.("a[href]");
    if (!links.includes(link)) return;
    if (!enabled(link)) { event.preventDefault(); return; }
    // A new tab, download, alternative browsing context or a consumer-canceled
    // click is not navigation of this document. Never falsify aria-current.
    // Disabled destinations above are still blocked even for modified clicks.
    if (event.defaultPrevented || event.ctrlKey || event.metaKey ||
        event.shiftKey || event.altKey || event.button > 0 ||
        (link.getAttribute("target") && link.getAttribute("target") !== "_self") ||
        link.getAttribute("download") !== null) return;
    if (onNavigate) {
      try {
        const decision = onNavigate(link);
        // Only an explicit true or no decision allows the browser's native link.
        // Promise or unexpected values are NOT permission to navigate.
        if (decision !== undefined && decision !== true) {
          event.preventDefault();
          // A mistaken async callback must not leak an unhandled rejection.
          if (decision && typeof decision.then === "function") {
            Promise.resolve(decision).catch(() => {});
          }
          return;
        }
      } catch {
        // An authorization or route-validation failure cannot silently
        // fall through to the native navigation default.
        event.preventDefault();
        return;
      }
    }
    select(link); // Navigation remains native; callback must not claim backend success.
  };
  const onKey = event => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    const item = event.target?.closest?.("a[href]");
    const available = choices();
    const index = available.indexOf(item);
    if (index < 0) return;
    const rtl = nav.dir === "rtl" || doc.documentElement?.dir === "rtl";
    const forward = rtl ? "ArrowLeft" : "ArrowRight";
    const backward = rtl ? "ArrowRight" : "ArrowLeft";
    let next = -1;
    if (event.key === forward) next = (index + 1) % available.length;
    if (event.key === backward) next = (index - 1 + available.length) % available.length;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = available.length - 1;
    if (next < 0) return;
    event.preventDefault();
    available[next].focus(); // Focus does not navigate or change aria-current.
  };

  // Reserve actual viewport space for the floating capsule at any font scale.
  // A ResizeObserver is local-only: no polling, storage, or remote telemetry.
  let clearanceObserver = null;
  let previousClearance = "";
  let lastClearance = "";
  const updateClearance = () => {
    if (disposed || !content) return;
    const height = nav.getBoundingClientRect().height;
    // Ignore transient or malformed measurements rather than writing NaNpx.
    if (!Number.isFinite(height) || height < 0) return;
    const bottom = Number.parseFloat(win.getComputedStyle(nav).bottom);
    const padding = Number.isFinite(bottom) ? Math.max(0, bottom) : 0;
    const px = Math.ceil(height + padding + 16) + "px";
    content.style.setProperty("--gc-bottom-nav-clearance", px);
    lastClearance = px;
  };
  if (content) {
    previousClearance = content.style.getPropertyValue("--gc-bottom-nav-clearance");
    updateClearance();
    if (typeof win.ResizeObserver === "function") {
      clearanceObserver = new win.ResizeObserver(updateClearance);
      clearanceObserver.observe(nav);
    }
    // Resize fallback and device orientation updates.
    win.addEventListener("resize", updateClearance);
  }
  nav.addEventListener("click", onClick);
  nav.addEventListener("keydown", onKey);
  win.addEventListener("hashchange", syncFromLocation);
  win.addEventListener("popstate", syncFromLocation);
  const initial = links.find(link=>enabled(link) && link.getAttribute("aria-current")==="page");
  const current = links.find((link,i)=>enabled(link) &&
    urls[i].pathname === win.location.pathname &&
    urls[i].search === win.location.search &&
    urls[i].hash === win.location.hash);
  select(current || initial || choices()[0]);
  return Object.freeze({
    select,
    sync: syncFromLocation,
    dispose() {
      if (disposed) return;
      disposed = true;
      nav.removeEventListener("click", onClick);
      nav.removeEventListener("keydown", onKey);
      win.removeEventListener("hashchange", syncFromLocation);
      win.removeEventListener("popstate", syncFromLocation);
      if (content) {
        clearanceObserver?.disconnect();
        win.removeEventListener("resize", updateClearance);
        if (content.style.getPropertyValue("--gc-bottom-nav-clearance") === lastClearance) {
          if (previousClearance) content.style.setProperty("--gc-bottom-nav-clearance", previousClearance);
          else content.style.removeProperty("--gc-bottom-nav-clearance");
        }
      }
    }
  });
}
