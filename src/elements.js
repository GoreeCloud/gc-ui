import { hasIcon, iconSvg } from "./icons.js";
import { applyTheme } from "./theme.js";

/** Upgrade only optional progressive-enhancement elements. Native HTML remains first choice. */
export function defineCustomElements(registry = globalThis.customElements) {
  if (!registry || typeof HTMLElement === "undefined") return false;
  if (!registry.get("gc-icon")) {
    class GoreeIcon extends HTMLElement {
      static get observedAttributes() { return ["name", "size", "label"]; }
      constructor() { super(); this.attachShadow({ mode: "open" }); }
      connectedCallback() { this.render(); }
      attributeChangedCallback() { this.render(); }
      render() {
        const name = this.getAttribute("name");
        const requested = Number(this.getAttribute("size") || 24);
        const size = Number.isFinite(requested) ? Math.min(256, Math.max(8, requested)) : 24;
        if (!hasIcon(name)) { this.shadowRoot.replaceChildren(); return; }
        // iconSvg uses only static, internal path definitions and a validated number.
        this.shadowRoot.innerHTML = iconSvg(name, { size, decorative: true });
        const label = this.getAttribute("label");
        if (label) { this.setAttribute("role", "img"); this.setAttribute("aria-label", label); }
        else { this.removeAttribute("role"); this.removeAttribute("aria-label"); this.setAttribute("aria-hidden", "true"); }
        if (label) this.removeAttribute("aria-hidden");
      }
    }
    registry.define("gc-icon", GoreeIcon);
  }
  return true;
}

/** WAI-ARIA tab behavior over native button[role=tab] elements and associated panels. */
export function initTabs(tablist) {
  if (!tablist || tablist.getAttribute?.("role") !== "tablist" ||
      typeof tablist.querySelectorAll !== "function") {
    throw new TypeError("Expected role=tablist");
  }
  const tabs = Array.from(tablist.querySelectorAll('[role="tab"]'));
  if (tabs.length === 0) throw new Error("Tablist is empty");
  const doc = tablist.ownerDocument;
  if (!doc || typeof doc.getElementById !== "function") throw new TypeError("Tablist needs an owner document");
  const panels = tabs.map(tab => {
    const id = tab.getAttribute("aria-controls");
    const panel = id && doc.getElementById(id);
    if (!panel || panel.getAttribute("role") !== "tabpanel") {
      throw new Error("Tab missing an associated tabpanel");
    }
    return panel;
  });
  const enabled = tab => !tab.disabled && !tab.hidden &&
    tab.getAttribute("aria-disabled") !== "true";
  const choices = () => tabs.filter(enabled);
  if (!choices().length) throw new Error("Tablist needs at least one enabled tab");

  const select = (tab, focus = false) => {
    if (!enabled(tab)) return;
    tabs.forEach((candidate, i) => {
      const active = candidate === tab;
      candidate.setAttribute("aria-selected", String(active));
      candidate.tabIndex = active ? 0 : -1;
      panels[i].hidden = !active;
    });
    if (focus) tab.focus();
  };
  const onClick = event => select(event.currentTarget);
  const onKey = event => {
    const available = choices();
    const index = available.indexOf(event.currentTarget);
    if (index < 0 || !available.length) return;
    const vertical = tablist.getAttribute("aria-orientation") === "vertical";
    const rtl = tablist.dir === "rtl" || doc.documentElement?.dir === "rtl";
    let delta = 0;
    if (vertical) {
      if (event.key === "ArrowDown") delta = 1;
      if (event.key === "ArrowUp") delta = -1;
    } else {
      if (event.key === "ArrowRight") delta = rtl ? -1 : 1;
      if (event.key === "ArrowLeft") delta = rtl ? 1 : -1;
    }
    let target = -1;
    if (delta) target = (index + delta + available.length) % available.length;
    if (event.key === "Home") target = 0;
    if (event.key === "End") target = available.length - 1;
    if (target < 0) return;
    event.preventDefault();
    select(available[target], true);
  };
  tabs.forEach(tab => {
    tab.addEventListener("click", onClick);
    tab.addEventListener("keydown", onKey);
  });
  const initial = tabs.find(tab => enabled(tab) && tab.getAttribute("aria-selected") === "true")
    || choices()[0];
  select(initial);
  return () => tabs.forEach(tab => {
    tab.removeEventListener("click", onClick);
    tab.removeEventListener("keydown", onKey);
  });
}
export function openDialog(dialog, invoker = null) {
  if (!dialog || typeof dialog.showModal !== "function") throw new TypeError("Expected HTML dialog");
  if (dialog.open) return;
  dialog.showModal();
  const onClose = () => { if (invoker && typeof invoker.focus === "function") invoker.focus(); dialog.removeEventListener("close", onClose); };
  dialog.addEventListener("close", onClose);
}
export function closeDialog(dialog) {
  if (!dialog || typeof dialog.close !== "function") throw new TypeError("Expected HTML dialog");
  if (dialog.open) dialog.close();
}
export function toast(message, { region, kind = "info", duration = 5000 } = {}) {
  if (typeof document === "undefined") throw new Error("Toast requires a browser document");
  if (!["info", "positive", "warning", "negative"].includes(kind)) throw new RangeError("Unknown toast kind");
  const target = region || document.querySelector("[data-gc-toasts]") || document.body;
  const item = document.createElement("div");
  item.className = "gc-toast";
  item.dataset.kind = kind;
  item.setAttribute("role", kind === "negative" ? "alert" : "status");
  const label = document.createElement("span");
  label.textContent = String(message);
  const dismiss = document.createElement("button");
  dismiss.type = "button";
  dismiss.className = "gc-button gc-button--quiet gc-button--sm";
  dismiss.textContent = "Dismiss";
  dismiss.setAttribute("aria-label", "Dismiss notification");
  dismiss.addEventListener("click", () => item.remove());
  item.append(label, dismiss);
  target.append(item);
  if (duration > 0 && Number.isFinite(duration)) globalThis.setTimeout(() => item.remove(), Math.min(duration, 60000));
  return item;
}
export function bindThemeControls(root, modeElement, accentElement) {
  if (!root) throw new TypeError("Root is required");
  const update = () => applyTheme(root, { mode: modeElement?.value || "auto", accent: accentElement?.value || "iris" });
  modeElement?.addEventListener("change", update);
  accentElement?.addEventListener("change", update);
  update();
  return () => { modeElement?.removeEventListener("change", update); accentElement?.removeEventListener("change", update); };
}
