export type GcMode = "auto" | "light" | "dark";
export type GcAccent = "iris" | "lagoon" | "ember" | "moss";
export type GcContrast = "normal" | "more";
export declare const ACCENTS: readonly GcAccent[];
export declare const MODES: readonly GcMode[];
export declare function contrastRatio(a: string, b: string): number;
export declare function getAccentColor(accent: GcAccent, mode?: "light" | "dark"): string;
export declare function deriveAccent(hex: string, mode?: "light" | "dark"): Readonly<{
  brand: string; onBrand: string; brandContainer: string; onBrandContainer: string;
}>;
export declare function applyTheme(root: HTMLElement, options?: { mode?: GcMode; accent?: GcAccent; contrast?: GcContrast; customAccent?: string }): { mode: GcMode; accent: GcAccent; contrast: GcContrast };
export declare const ICON_NAMES: readonly string[];
export declare function hasIcon(name: string): boolean;
export declare function iconSvg(name: string, options?: { size?: number; decorative?: boolean }): string;
export declare function defineCustomElements(registry?: CustomElementRegistry): boolean;
export declare function initTabs(tablist: HTMLElement): () => void;
export declare function openDialog(dialog: HTMLDialogElement, invoker?: HTMLElement | null): void;
export declare function closeDialog(dialog: HTMLDialogElement): void;
export declare function toast(message: string, options?: { region?: HTMLElement; kind?: "info" | "positive" | "warning" | "negative"; duration?: number }): HTMLElement;
export declare function bindThemeControls(root: HTMLElement, modeElement?: HTMLSelectElement, accentElement?: HTMLSelectElement): () => void;

export declare function initAccordion(container: HTMLElement, options?: { single?: boolean }): () => void;
export declare function initToggleGroup(container: HTMLElement, options?: { onChange?: (button: HTMLButtonElement) => void }): () => void;
export declare function bindRangeOutput(input: HTMLInputElement, output: HTMLOutputElement, options?: { format?: (value: string) => string }): () => void;
export declare function initDrawer(dialog: HTMLDialogElement, openButton: HTMLElement, closeButton: HTMLElement): () => void;
export declare function createThemeController(root: HTMLElement, options?: { mode?: GcMode; accent?: GcAccent; contrast?: GcContrast; customAccent?: string }): { update: (options?: { mode?: GcMode; accent?: GcAccent; contrast?: GcContrast; customAccent?: string | null }) => { mode: GcMode; accent: GcAccent; contrast: GcContrast }; dispose: () => void };

export declare function matchesCommand(query: string, label: string, keywords?: string): boolean;
export declare function initCommandPalette(dialog: HTMLDialogElement, options: {
  trigger?: HTMLElement | null;
  shortcut?: boolean;
  onSelect: (button: HTMLButtonElement) => void | Promise<void>;
}): { open: () => void; close: () => void; refresh: () => void; dispose: () => void };

export declare function initActionMenu(trigger: HTMLElement, menu: HTMLElement, options: {
  onSelect: (item: HTMLButtonElement) => void | Promise<void>;
}): { open: (last?: boolean) => void; close: (returnFocus?: boolean) => void; dispose: () => void };

export declare function initSortableTable(table: HTMLTableElement, options?: {
  locale?: string;
  onSort?: (state: {column: number | null; direction: "ascending" | "descending" | "none"; rows: HTMLTableRowElement[]}) => void;
}): { sortBy: (column: number, direction?: "ascending" | "descending") => void; reset: () => void; dispose: () => void };

export declare function initTreeView(tree: HTMLElement, options?: {
  onSelect?: (item: HTMLElement) => void;
  onActivate?: (item: HTMLElement) => void;
  locale?: string;
}): { select: (item: HTMLElement) => boolean; expand: (item: HTMLElement) => boolean; collapse: (item: HTMLElement) => boolean; dispose: () => void };

export declare function initCombobox(input: HTMLInputElement, list: HTMLElement, options?: {
  onSelect?: (option: HTMLElement, value: string) => void | Promise<void>;
}): { open: () => void; close: () => void; refresh: () => void; dispose: () => void };

export declare function initBottomNavigation(nav: HTMLElement, options?: {
  onNavigate?: (link: HTMLAnchorElement) => boolean | void;
}): { select: (link: HTMLAnchorElement) => boolean; sync: () => void; dispose: () => void };
