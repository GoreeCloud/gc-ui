/**
 * GoreeCloud UI: native HTML popover action-menu enhancement.
 * Native top-layer click-outside and Escape behavior; no external dependencies,
 * injected HTML, storage, network, global state or telemetry.
 *
 * Require a real trigger, a popover="auto" element with role="menu",
 * and semantic button[role=menuitem] children. The consumer owns authorization.
 */
export function initActionMenu(trigger, menu, { onSelect } = {}) {
  if (!trigger || typeof trigger.addEventListener !== "function" ||
      typeof trigger.getBoundingClientRect !== "function") {
    throw new TypeError("Action menu requires a real trigger element");
  }
  if (!menu || menu.getAttribute?.("role") !== "menu" ||
      menu.getAttribute("popover") !== "auto" ||
      typeof menu.showPopover !== "function" ||
      typeof menu.hidePopover !== "function") {
    throw new TypeError('Action menu requires a native popover="auto" with role="menu"');
  }
  if (typeof onSelect !== "function") throw new TypeError("Action menu requires an onSelect callback");
  if (!menu.ownerDocument || !menu.ownerDocument.defaultView) {
    throw new TypeError("Action menu requires a browser document");
  }
  const doc = menu.ownerDocument;
  const view = doc.defaultView;
  const items = Array.from(menu.querySelectorAll('button[role="menuitem"]'));
  if (!items.length) throw new Error("Action menu needs at least one menuitem button");
  const status = menu.querySelector("[data-gc-menu-status]");
  let disposed = false;
  let busy = false;
  const isOpen = () => menu.matches(":popover-open");
  const enabledItems = () => items.filter(item => !item.disabled && !item.hidden &&
    item.getAttribute("aria-disabled") !== "true");
  const position = () => {
    if (!isOpen()) return;
    const rect = trigger.getBoundingClientRect();
    // Width may depend on its contents; read dimensions only after opening.
    const width = menu.offsetWidth || 240;
    const height = menu.offsetHeight || 160;
    const inset = 8;
    const viewportWidth = doc.documentElement.clientWidth || view.innerWidth;
    const viewportHeight = view.innerHeight;
    const left = Math.max(inset, Math.min(rect.left, viewportWidth - width - inset));
    const below = rect.bottom + inset;
    const above = rect.top - height - inset;
    const top = below + height <= viewportHeight - inset
      ? below : Math.max(inset, above);
    menu.style.left = Math.round(left) + "px";
    menu.style.top = Math.round(top) + "px";
    menu.style.right = "auto";
    menu.style.bottom = "auto";
  };
  const open = (last = false) => {
    if (disposed) throw new Error("Action menu has been disposed");
    if (!isOpen()) menu.showPopover();
    trigger.setAttribute("aria-expanded", "true");
    position();
    const choices = enabledItems();
    (last ? choices[choices.length - 1] : choices[0])?.focus();
  };
  const close = (returnFocus = true) => {
    if (isOpen()) menu.hidePopover();
    trigger.setAttribute("aria-expanded", "false");
    if (returnFocus && !disposed) trigger.focus();
  };
  const activate = async item => {
    if (disposed || busy || !isOpen() || !enabledItems().includes(item)) return;
    busy = true;
    if (status) status.textContent = "";
    try {
      const outcome = onSelect(item);
      if (outcome && typeof outcome.then === "function") {
        menu.setAttribute("aria-busy", "true");
        await outcome;
      }
      if (!disposed) close(true);
    } catch {
      if (status) status.textContent = "Action could not be completed. Try again.";
    } finally {
      busy = false;
      menu.removeAttribute("aria-busy");
    }
  };
  const onTriggerClick = () => {
    if (isOpen()) close(true);
    else open();
  };
  const onTriggerKey = event => {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    event.preventDefault();
    open(event.key === "ArrowUp");
  };
  const onMenuKey = event => {
    if (!isOpen()) return;
    if (event.key === "Escape") {
      event.preventDefault();
      close(true);
      return;
    }
    const choices = enabledItems();
    if (!choices.length) return;
    const item = event.target?.closest?.('button[role="menuitem"]');
    const index = choices.indexOf(item);
    let target = -1;
    if (event.key === "ArrowDown") target = (index + 1 + choices.length) % choices.length;
    if (event.key === "ArrowUp") target = (index - 1 + choices.length) % choices.length;
    if (event.key === "Home") target = 0;
    if (event.key === "End") target = choices.length - 1;
    if (target < 0) return;
    event.preventDefault();
    choices[target].focus();
  };
  const onMenuClick = event => {
    const item = event.target?.closest?.('button[role="menuitem"]');
    if (items.includes(item)) void activate(item);
  };
  const onToggle = () => {
    const showing = isOpen();
    trigger.setAttribute("aria-expanded", String(showing));
    // Outside click should preserve where the person moved focus.
    if (!showing && menu.contains(doc.activeElement)) trigger.focus();
  };
  const onScroll = () => { if (isOpen()) close(false); };
  trigger.setAttribute("aria-haspopup", "menu");
  trigger.setAttribute("aria-expanded", "false");
  if (menu.id) trigger.setAttribute("aria-controls", menu.id);
  trigger.addEventListener("click", onTriggerClick);
  trigger.addEventListener("keydown", onTriggerKey);
  menu.addEventListener("keydown", onMenuKey);
  menu.addEventListener("click", onMenuClick);
  menu.addEventListener("toggle", onToggle);
  view.addEventListener("resize", position);
  doc.addEventListener("scroll", onScroll, true);
  return Object.freeze({
    open, close,
    dispose() {
      if (disposed) return;
      // Close before changing state to avoid a visible orphaned popover.
      if (isOpen()) menu.hidePopover();
      disposed = true;
      trigger.removeEventListener("click", onTriggerClick);
      trigger.removeEventListener("keydown", onTriggerKey);
      menu.removeEventListener("keydown", onMenuKey);
      menu.removeEventListener("click", onMenuClick);
      menu.removeEventListener("toggle", onToggle);
      view.removeEventListener("resize", position);
      doc.removeEventListener("scroll", onScroll, true);
      trigger.setAttribute("aria-expanded", "false");
    }
  });
}
