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
  if (!tablist || tablist.getAttribute("role") !== "tablist") throw new TypeError("Expected role=tablist");
  const tabs = Array.from(tablist.querySelectorAll('[role="tab"]'));
  if (tabs.length === 0) throw new Error("Tablist is empty");
  const doc = tablist.ownerDocument;
  const panels = tabs.map((tab) => {
    const id = tab.getAttribute("aria-controls");
    const panel = id && doc.getElementById(id);
    if (!panel || panel.getAttribute("role") !== "tabpanel") throw new Error("Tab missing an associated tabpanel");
    return panel;
  });
  const focusTab = (index, focus = false) => {
    tabs.forEach((tab, i) => {
      const selected = i === index;
      tab.setAttribute("aria-selected", String(selected));
      tab.tabIndex = selected ? 0 : -1;
      panels[i].hidden = !selected;
    });
    if (focus) tabs[index].focus();
  };
  const onClick = (event) => {
    const index = tabs.findIndex((tab) => tab === event.currentTarget);
    if (index >= 0) focusTab(index);
  };
  const onKey = (event) => {
    const index = tabs.indexOf(event.currentTarget);
    const rtl = doc.dir === "rtl" || doc.documentElement.dir === "rtl";
    const next = event.key === "ArrowRight" ? (rtl ? -1 : 1) :
      event.key === "ArrowLeft" ? (rtl ? 1 : -1) :
      event.key === "ArrowDown" ? 1 : event.key === "ArrowUp" ? -1 : 0;
    let target = -1;
    if (next) target = (index + next + tabs.length) % tabs.length;
    if (event.key === "Home") target = 0;
    if (event.key === "End") target = tabs.length - 1;
    if (target >= 0) { event.preventDefault(); focusTab(target, true); }
  };
  tabs.forEach((t) => { t.addEventListener("click", onClick); t.addEventListener("keydown", onKey); });
  const selected = tabs.findIndex((t) => t.getAttribute("aria-selected") === "true");
  focusTab(selected >= 0 ? selected : 0);
  return () => tabs.forEach((t) => { t.removeEventListener("click", onClick); t.removeEventListener("keydown", onKey); });
}
export function openDialog(dialog, invoker = null) {
  if (!dialog || typeof dialog.showModal !== "function") throw new TypeError("Expected HTML dialog");
  if (!dialog.open) dialog.showModal();
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
