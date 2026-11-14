/**
 * GoreeCloud UI interaction enhancements.
 * Native details, dialog, button and range elements remain functional without JS.
 * These utilities add explicitly scoped behavior; none use storage or network.
 */
function requireElement(element, condition, message) {
  if (!element || !condition(element)) throw new TypeError(message);
  return element;
}

/**
 * Give native details elements single-open (optional) accordion behavior.
 * The first initially open item wins. Browser-native disclosure works even without JS.
 */
export function initAccordion(container, { single = true } = {}) {
  requireElement(container, (value) => typeof value.querySelectorAll === "function",
    "Accordion requires a containing element");
  const items = Array.from(container.querySelectorAll("details"));
  if (items.length === 0) throw new Error("Accordion requires at least one details element");
  if (single) {
    let found = false;
    for (const item of items) {
      if (item.open) {
        if (found) item.open = false;
        found = true;
      }
    }
  }
  const handlers = items.map((item) => {
    const handler = () => {
      if (single && item.open) {
        for (const sibling of items) if (sibling !== item) sibling.open = false;
      }
    };
    item.addEventListener("toggle", handler);
    return handler;
  });
  return () => items.forEach((item, i) => item.removeEventListener("toggle", handlers[i]));
}

/**
 * Exclusive selection for an author-labeled group of real buttons.
 * Arrow/Home/End roving focus supports horizontal RTL.
 * For forms, native radio inputs remain the preferred selection control.
 */
export function initToggleGroup(container, { onChange } = {}) {
  requireElement(container, (value) => typeof value.querySelectorAll === "function" &&
    typeof value.getAttribute === "function", "Toggle group requires an element");
  if (onChange !== undefined && typeof onChange !== "function") {
    throw new TypeError("onChange must be a function");
  }
  const buttons = Array.from(container.querySelectorAll('button[aria-pressed]'));
  if (buttons.length === 0) throw new Error("Toggle group has no buttons with aria-pressed");
  const canChoose = button => Boolean(button && !button.disabled &&
    button.getAttribute("aria-disabled") !== "true");
  const enabled = () => buttons.filter(canChoose);
  const select = (button, focus = false, notify = true) => {
    if (!buttons.includes(button) || !canChoose(button)) return;
    for (const entry of buttons) {
      const active = entry === button;
      entry.setAttribute("aria-pressed", String(active));
      entry.tabIndex = active ? 0 : -1;
    }
    if (focus) button.focus();
    if (notify && onChange) onChange(button);
  };
  const initial = buttons.find(b => b.getAttribute("aria-pressed") === "true" && canChoose(b)) || enabled()[0];
  select(initial, false, false);
  const handleClick = (event) => select(event.currentTarget);
  const handleKey = (event) => {
    const choices = enabled();
    const index = choices.indexOf(event.currentTarget);
    if (index < 0) return;
    const direction = container.getAttribute("aria-orientation") === "vertical" ? "vertical" : "horizontal";
    const doc = container.ownerDocument;
    const rtl = container.dir === "rtl" || doc?.documentElement?.dir === "rtl";
    let delta = 0, next = -1;
    if (direction === "vertical") {
      if (event.key === "ArrowDown") delta = 1;
      if (event.key === "ArrowUp") delta = -1;
    } else {
      if (event.key === "ArrowRight") delta = rtl ? -1 : 1;
      if (event.key === "ArrowLeft") delta = rtl ? 1 : -1;
    }
    if (delta) next = (index + delta + choices.length) % choices.length;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = choices.length - 1;
    if (next >= 0) {
      event.preventDefault();
      select(choices[next], true);
    }
  };
  buttons.forEach(b => {b.addEventListener("click", handleClick);b.addEventListener("keydown", handleKey);});
  return () => buttons.forEach(b => {b.removeEventListener("click", handleClick);b.removeEventListener("keydown", handleKey);});
}

/** Keep output content in sync with a native range control. */
export function bindRangeOutput(input, output, { format = (value) => value } = {}) {
  requireElement(input, (el) => el.type === "range" && typeof el.addEventListener === "function",
    "Expected input[type=range]");
  requireElement(output, (el) => "textContent" in el, "Expected range output element");
  if (typeof format !== "function") throw new TypeError("format must be a function");
  const update = () => {
    const value = String(format(input.value));
    output.textContent = value;
    if ("value" in output) output.value = value;
    return value;
  };
  // Render the initial value before installing a listener. If consumer
  // formatting fails, initialization must not leave a live event callback.
  update();
  input.addEventListener("input", update);
  return () => input.removeEventListener("input", update);
}

/** Wire a native modal dialog as an accessible side drawer with focus return. */
export function initDrawer(dialog, openButton, closeButton) {
  requireElement(dialog, (el) => typeof el.showModal === "function" && typeof el.close === "function",
    "Expected native dialog");
  requireElement(openButton, (el) => typeof el.addEventListener === "function", "Expected open button");
  requireElement(closeButton, (el) => typeof el.addEventListener === "function", "Expected close button");
  let active = false;
  const onClosed = () => {
    // Only restore focus when this controller opened the drawer. External
    // dialog owners must retain control of focus after their own close.
    const restoreFocus = active;
    active = false;
    if (restoreFocus) openButton.focus?.();
  };
  const onOpen = () => {
    if (dialog.open) return;
    dialog.showModal();
    active = true;
  };
  const onClose = () => { if (dialog.open) dialog.close(); };
  openButton.addEventListener("click", onOpen);
  closeButton.addEventListener("click", onClose);
  dialog.addEventListener("close", onClosed);
  return () => {
    openButton.removeEventListener("click", onOpen);
    closeButton.removeEventListener("click", onClose);
    dialog.removeEventListener("close", onClosed);
    // Do not force-close externally-owned dialogs during teardown.
    active = false;
  };
}
