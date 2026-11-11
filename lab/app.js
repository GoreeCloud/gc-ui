import { applyTheme, defineCustomElements, initTabs, openDialog, closeDialog, toast, ICON_NAMES } from "../src/index.js";

defineCustomElements();
const root = document.documentElement;
const appearance = document.querySelector("#appearance");
const accent = document.querySelector("#accent");
const contrast = document.querySelector("#contrast");
const updateTheme = () => applyTheme(root, {
  mode: appearance.value, accent: accent.value, contrast: contrast.checked ? "more" : "normal"
});
appearance.addEventListener("change", updateTheme);
accent.addEventListener("change", updateTheme);
contrast.addEventListener("change", updateTheme);
updateTheme();
initTabs(document.querySelector('[role="tablist"]'));
const dialog = document.querySelector("#demo-dialog");
const region = document.querySelector("[data-gc-toasts]");
document.querySelector("#open-dialog").addEventListener("click", (event) => openDialog(dialog, event.currentTarget));
document.querySelector("#dialog-cancel").addEventListener("click", () => closeDialog(dialog));
document.querySelector("#dialog-confirm").addEventListener("click", () => {
  closeDialog(dialog);
  toast("You explored the native dialog demo.", { region, kind: "positive" });
});
document.querySelector("#notify").addEventListener("click", () => toast("This is a local GoreeCloud UI notification preview.", { region, kind: "info" }));
for (const button of document.querySelectorAll("[data-demo-toast]")) {
  button.addEventListener("click", () => toast(button.dataset.demoToast, { region }));
}
document.querySelector("#demo-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  if (!form.reportValidity()) return;
  toast("Sample input validated locally. No data was saved.", { region, kind: "positive" });
});
document.querySelector("#demo-switch").addEventListener("change", (event) => {
  toast(event.target.checked ? "Motion example enabled." : "Motion example disabled. This setting is demo-only.", { region });
});
for (const chip of document.querySelectorAll("[data-chip]")) {
  chip.addEventListener("click", () => {
    for (const other of document.querySelectorAll("[data-chip]")) other.setAttribute("aria-pressed", String(other === chip));
    toast(chip.textContent.trim() + " example selected.", { region });
  });
}
const grid = document.querySelector("#icon-grid");
for (const name of ICON_NAMES) {
  const tile = document.createElement("div");
  tile.className = "gc-lab-icon-tile";
  const icon = document.createElement("gc-icon");
  icon.setAttribute("name", name);
  icon.setAttribute("size", "26");
  const text = document.createElement("span");
  text.textContent = name;
  tile.append(icon, text);
  grid.append(tile);
}
