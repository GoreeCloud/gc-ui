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
  let pendingSession = null, activeController = null;
  // A late asynchronous action must not reclaim focus or announce errors after
  // the person dismissed this popover or opened a fresh session.
  let session = 0;
  const isOpen = () => menu.matches(":popover-open");
  const enabledItems = () => items.filter(item => !item.disabled && !item.hidden &&
    item.getAttribute("aria-disabled") !== "true");
  const abortPending = () => {
    const controller = activeController;
    activeController = null;
    pendingSession = null;
    menu.removeAttribute("aria-busy");
    if (controller && !controller.signal.aborted) controller.abort();
  };
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
    if (!isOpen()) {
      session += 1;
      menu.removeAttribute("aria-busy");
      menu.showPopover();
    }
    trigger.setAttribute("aria-expanded", "true");
    position();
    const choices = enabledItems();
    (last ? choices[choices.length - 1] : choices[0])?.focus();
  };
  const close = (returnFocus = true) => {
    if (isOpen()) {
      abortPending(); // Consumers must honor the cooperative cancellation signal.
      session += 1;
      menu.hidePopover();
    }
    typeahead = "";
    typeaheadAt = 0;
    composing = false; // A dismissed menu cannot retain a stale IME session.
    trigger.setAttribute("aria-expanded", "false");
    if (returnFocus && !disposed) trigger.focus();
  };
  const activate = async item => {
    if (disposed || pendingSession === session || !isOpen() ||
        !enabledItems().includes(item)) return;
    const activationSession = session;
    const controller = new AbortController();
    pendingSession = activationSession;
    activeController = controller;
    if (status) status.textContent = "";
    try {
      const outcome = onSelect(item, { signal: controller.signal });
      if (outcome && typeof outcome.then === "function") {
        if (session === activationSession) menu.setAttribute("aria-busy", "true");
        await outcome;
      }
      if (!disposed && isOpen() && session === activationSession) {
        // Successful completion must not look like cancellation.
        if (activeController === controller) activeController = null;
        close(true);
      }
    } catch {
      // Dismissed or previous-session actions cannot announce stale errors.
      if (!disposed && isOpen() && session === activationSession && status) {
        status.textContent = "Action could not be completed. Try again.";
      }
    } finally {
      // Do not clear or abort the currently active action in a newer session.
      if (activeController === controller) activeController = null;
      if (pendingSession === activationSession) {
        pendingSession = null;
        menu.removeAttribute("aria-busy");
      }
    }
  };
  const onTriggerClick = () => {
    if (isOpen()) close(true);
    else open();
  };
  const onTriggerKey = event => {
    // Keep legacy IME process keys under native input control.
    if (event.isComposing || event.keyCode === 229 || event.key === "Process") return;
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    event.preventDefault();
    open(event.key === "ArrowUp");
  };
  let typeahead = "";
  let typeaheadAt = 0;
  let composing = false;
  const onCompositionStart = () => {
    composing = true;
    typeahead = "";
    typeaheadAt = 0;
  };
  const onCompositionEnd = () => {
    composing = false;
    // A finished IME composition is not an incremental typeahead query.
    typeahead = "";
    typeaheadAt = 0;
  };
  const onMenuKey = event => {
    if (!isOpen() || composing || event.isComposing || event.keyCode === 229 ||
        event.key === "Process" || event.altKey || event.ctrlKey || event.metaKey) return;
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
    if (target >= 0) {
      event.preventDefault();
      choices[target].focus();
      return;
    }
    if (event.key.length !== 1 || !/\S/u.test(event.key)) return;
    const now = Date.now();
    const previous = now - typeaheadAt > 700 ? "" : typeahead;
    // Repeated single-letter input cycles matching options, like native menus.
    typeahead = previous && [...previous].every(letter => letter === event.key)
      ? event.key : previous + event.key;
    typeaheadAt = now;
    const query = typeahead.toLocaleLowerCase();
    const start = index < 0 ? 0 : (index + 1) % choices.length;
    const match = Array.from({length: choices.length}, (_, i) => choices[(start + i) % choices.length])
      .find(choice => (choice.getAttribute("aria-label") || choice.textContent || "").trim()
        .toLocaleLowerCase().startsWith(query));
    if (match) { event.preventDefault(); match.focus(); }
  };
  const onMenuClick = event => {
    const item = event.target?.closest?.('button[role="menuitem"]');
    if (items.includes(item)) void activate(item);
  };
  const onBeforeToggle = event => {
    // Native beforetoggle fires synchronously. Do not allow a delayed toggle
    // event or rapid reopen to leave old cooperative work un-cancelled.
    if (event.newState === "closed") abortPending();
  };
  const onToggle = () => {
    const showing = isOpen();
    if (!showing) {
      abortPending(); // Native Escape/light-dismiss invalidates this action.
      session += 1;
      typeahead = "";
      typeaheadAt = 0;
      composing = false;
    }
    trigger.setAttribute("aria-expanded", String(showing));
    // Outside click should preserve where the person moved focus.
    if (!showing && !disposed && menu.contains(doc.activeElement)) trigger.focus();
  };
  const onScroll = () => { if (isOpen()) close(false); };
  trigger.setAttribute("aria-haspopup", "menu");
  trigger.setAttribute("aria-expanded", "false");
  if (menu.id) trigger.setAttribute("aria-controls", menu.id);
  trigger.addEventListener("click", onTriggerClick);
  trigger.addEventListener("keydown", onTriggerKey);
  menu.addEventListener("keydown", onMenuKey);
  menu.addEventListener("compositionstart", onCompositionStart);
  menu.addEventListener("compositionend", onCompositionEnd);
  menu.addEventListener("click", onMenuClick);
  menu.addEventListener("beforetoggle", onBeforeToggle);
  menu.addEventListener("toggle", onToggle);
  view.addEventListener("resize", position);
  doc.addEventListener("scroll", onScroll, true);
  return Object.freeze({
    open, close,
    dispose() {
      if (disposed) return;
      // Stop the UI owner first; native hide still closes the top-layer popup.
      disposed = true;
      abortPending();
      if (isOpen()) menu.hidePopover();
      trigger.removeEventListener("click", onTriggerClick);
      trigger.removeEventListener("keydown", onTriggerKey);
      menu.removeEventListener("keydown", onMenuKey);
      menu.removeEventListener("compositionstart", onCompositionStart);
      menu.removeEventListener("compositionend", onCompositionEnd);
      menu.removeEventListener("click", onMenuClick);
      menu.removeEventListener("beforetoggle", onBeforeToggle);
      menu.removeEventListener("toggle", onToggle);
      view.removeEventListener("resize", position);
      doc.removeEventListener("scroll", onScroll, true);
      trigger.setAttribute("aria-expanded", "false");
    }
  });
}
