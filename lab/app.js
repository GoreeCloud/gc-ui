import { createThemeController, initCommandPalette, initActionMenu, initSortableTable, initTreeView, initCombobox, initBottomNavigation, defineCustomElements, initTabs, initAccordion, initToggleGroup, bindRangeOutput, initDrawer, openDialog, closeDialog, toast, ICON_NAMES } from "../src/index.js";

defineCustomElements();
const root = document.documentElement;
const appearance = document.querySelector("#appearance");
const accent = document.querySelector("#accent");
const contrast = document.querySelector("#contrast");
const customEnabled = document.querySelector("#demo-custom-accent");
const customColor = document.querySelector("#demo-custom-color");
const themeController = createThemeController(root);
const updateTheme = () => themeController.update({
  mode: appearance.value, accent: accent.value, contrast: contrast.checked ? "more" : "normal",
  customAccent: customEnabled.checked ? customColor.value : null
});
appearance.addEventListener("change", updateTheme);
accent.addEventListener("change", updateTheme);
contrast.addEventListener("change", updateTheme);
customEnabled.addEventListener("change", () => { customColor.disabled = !customEnabled.checked; updateTheme(); });
customColor.addEventListener("input", updateTheme);
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


// Pattern controllers enhance semantic native elements; clean up when a host SPA unmounts them.
initAccordion(document.querySelector("#demo-accordion"), { single: true });
initToggleGroup(document.querySelector("#demo-toggle-group"), {
  onChange(button) {
    toast(button.textContent.trim() + " layout selected locally.", { region, kind: "info" });
  }
});
bindRangeOutput(document.querySelector("#demo-radius"), document.querySelector("#demo-radius-value"), { format: value => value + "px" });
document.querySelector("#demo-radius").addEventListener("input", (event) => {
  document.querySelector("#demo-radius-preview").style.borderRadius = event.currentTarget.value + "px";
});
initDrawer(document.querySelector("#demo-drawer"), document.querySelector("#demo-drawer-open"), document.querySelector("#demo-drawer-close"));

for (const link of document.querySelectorAll("#demo-drawer a[href^='#']")) {
  link.addEventListener("click", () => document.querySelector("#demo-drawer").close());
}


// Local actions: no backend calls, persistence or simulated account mutations.
initCommandPalette(document.querySelector("#command-dialog"), {
  trigger:document.querySelector("#open-command"),
  onSelect(button) {
    const command=button.getAttribute("data-gc-command");
    if (command==="notify") {
      toast("The command palette opened this local notification.",{region,kind:"info"});
      return;
    }
    if (["light","dark","system"].includes(command)) {
      appearance.value=command==="system"?"auto":command;
      updateTheme();
      toast("Lab appearance updated to "+appearance.value+".",{region,kind:"positive"});
    }
  }
});


// Native popover with local, authorized demonstration actions only.
initActionMenu(document.querySelector("#demo-action-trigger"),
  document.querySelector("#demo-action-menu"), {
    onSelect(item) {
      const action = item.getAttribute("data-gc-local-action");
      if (action === "preview") {
        toast("The native action menu opened this local notification.", { region, kind:"info" });
      } else if (action === "system") {
        appearance.value = "auto";
        updateTheme();
        toast("Lab appearance now follows the operating system.", { region, kind:"positive" });
      }
    }
  });


// Browser-native semantic table; only the three displayed example rows are sorted.
const sortStatus = document.querySelector("#demo-sort-status");
const sorted = initSortableTable(document.querySelector("#demo-sort-table"), {
  onSort({column,direction}) {
    sortStatus.textContent = column === null ? "Original order" :
      "Local rows sorted by column " + (column + 1) + ", " + direction;
  }
});
document.querySelector("#demo-sort-reset").addEventListener("click", () => sorted.reset());


// Hierarchical keyboard navigation over local inert sample data.
const demoTreeStatus = document.querySelector("#demo-tree-status");
initTreeView(document.querySelector("#demo-tree"), {
  onSelect(item) {
    demoTreeStatus.textContent = item.getAttribute("data-gc-tree-label") + " selected locally.";
  },
  onActivate(item) {
    const label = item.getAttribute("data-gc-tree-label");
    toast(label + " example activated locally. No file was opened.", { region, kind:"info" });
  }
});


// Local-only accessible editable combobox. Selects the already-supported accent family.
initCombobox(document.querySelector("#demo-combobox"),
  document.querySelector("#demo-combobox-list"), {
    onSelect(option, value) {
      if (!["iris","lagoon","ember","moss"].includes(value)) return;
      accent.value=value;
      customEnabled.checked=false;
      customColor.disabled=true;
      updateTheme();
      document.querySelector("#demo-combobox-status").textContent=
        option.textContent.trim()+" accent selected in this preview.";
    }
  });

// Real local hash destinations; the floating dock tracks URL history automatically.
initBottomNavigation(document.querySelector("#demo-bottom-nav"), { content:document.querySelector("#main") });
