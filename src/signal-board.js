/**
 * GoreeCloud UI — Signal Constellation.
 * Native buttons and list items remain meaningful without JavaScript.
 * Enhancement filters only caller-supplied DOM. No fetch, storage, timer,
 * observer, telemetry, authorization decision, or service-health claim.
 */
import { initToggleGroup } from "./patterns.js";

export const SIGNAL_STATES = Object.freeze(["ready", "attention", "offline"]);
export const SIGNAL_FILTERS = Object.freeze(["all", ...SIGNAL_STATES]);

export function summarizeSignals(states) {
  if (!Array.isArray(states)) throw new TypeError("Signal states must be an array");
  const counts = { all:0, ready:0, attention:0, offline:0 };
  for (const state of states) {
    if (!SIGNAL_STATES.includes(state)) throw new RangeError("Unknown signal state");
    counts[state]++;
    counts.all++;
  }
  return Object.freeze(counts);
}

/**
 * Initialize one board with an aria-labeled button group, list and live
 * summary. Consumers own the data, real authorization and state changes.
 */
export function initSignalBoard(board) {
  if (!board || typeof board.querySelector !== "function" ||
      typeof board.querySelectorAll !== "function") {
    throw new TypeError("Signal Constellation requires a container");
  }
  const filters = board.querySelector("[data-gc-signal-filters]");
  const list = board.querySelector("[data-gc-signal-list]");
  const summary = board.querySelector("[data-gc-signal-summary]");
  const empty = board.querySelector("[data-gc-signal-empty]");
  // Optional linked Timeflow. Existing signal-only consumers remain unchanged.
  const history = board.querySelector("[data-gc-timeflow-list]");
  const historyEmpty = board.querySelector("[data-gc-timeflow-empty]");
  if ((history && (!historyEmpty || history.tagName?.toUpperCase() !== "OL" ||
        !(history.getAttribute("aria-label") || history.getAttribute("aria-labelledby")))) ||
      (!history && historyEmpty)) {
    throw new TypeError("Linked Timeflow requires a labeled native ol and empty message");
  }
  if (!filters || !["group", "toolbar"].includes(filters.getAttribute("role")) ||
      !(filters.getAttribute("aria-label") || filters.getAttribute("aria-labelledby")) ||
      !list || !["OL", "UL"].includes(list.tagName?.toUpperCase()) ||
      !summary || summary.getAttribute("role") !== "status") {
    throw new TypeError("Board requires a labeled filter group, native list and status");
  }

  const buttons = [...filters.querySelectorAll("button[data-gc-signal-filter]")];
  const selectedValues = new Set();
  const everyToggle = [...filters.querySelectorAll("button[aria-pressed]")];
  if(everyToggle.length !== buttons.length || everyToggle.some(button => !buttons.includes(button))) {
    throw new TypeError("Signal filter group cannot contain unrecognized toggle buttons");
  }
  for (const button of buttons) {
    const value = button.getAttribute("data-gc-signal-filter");
    if (!SIGNAL_FILTERS.includes(value) || selectedValues.has(value) ||
        button.getAttribute("aria-pressed") === null ||
        button.getAttribute("type") !== "button") {
      throw new TypeError("Signal filters require unique known type=button toggle controls");
    }
    selectedValues.add(value);
  }
  if (!selectedValues.has("all") || buttons.every(b => b.disabled || b.getAttribute("aria-disabled") === "true")) {
    throw new TypeError("Board needs an enabled All filter");
  }
  const allButton = buttons.find(button => button.getAttribute("data-gc-signal-filter") === "all");
  if (allButton.disabled || allButton.getAttribute("aria-disabled") === "true") {
    throw new TypeError("All filter must be enabled");
  }

  const originalButtons = new Map(buttons.map(button => [button, {
    pressed:button.getAttribute("aria-pressed"),
    tabindex:button.getAttribute("tabindex")
  }]));
  const originalStatus = summary.textContent;
  const originalEmpty = empty?.hidden;
  const originalHistoryEmpty = historyEmpty?.hidden;
  const counts = [...board.querySelectorAll("[data-gc-signal-count]")];
  const originalCounts = new Map();
  for (const node of counts) {
    if (!SIGNAL_FILTERS.includes(node.getAttribute("data-gc-signal-count"))) {
      throw new RangeError("Unknown signal count key");
    }
    originalCounts.set(node,node.textContent);
  }
  const initialHidden = new Map();
  const initialHistoryHidden = new Map();
  let disposed = false;
  let filter = allButton.getAttribute("data-gc-signal-filter");

  // The caller must provide a real list; avoid selecting nested card content
  // or changing controls owned by other boards.
  const collect = () => {
    const nodes = [...list.children];
    for (const node of nodes) {
      if (node.tagName?.toUpperCase() !== "LI" ||
          !SIGNAL_STATES.includes(node.getAttribute("data-gc-signal"))) {
        throw new TypeError("Each direct list item must declare a known signal state");
      }
    }
    return nodes;
  };

  const collectHistory = () => {
    if (!history) return [];
    const events = [...history.children];
    for (const event of events) {
      const time = event.querySelector?.("time[datetime]");
      if (event.tagName?.toUpperCase() !== "LI" ||
          !SIGNAL_STATES.includes(event.getAttribute("data-gc-signal")) ||
          !time || !time.getAttribute("datetime")?.trim()) {
        throw new TypeError("Each Timeflow entry must have a known status and a dated time element");
      }
    }
    return events;
  };

  const remember = (nodes, events) => {
    nodes.forEach(node => {
      if (!initialHidden.has(node)) initialHidden.set(node,Boolean(node.hidden));
    });
    events.forEach(event => {
      if (!initialHistoryHidden.has(event)) initialHistoryHidden.set(event,Boolean(event.hidden));
    });
  };

  const render = (nextFilter, nodes, events) => {
    const states = nodes.filter(node => !initialHidden.get(node)).map(node =>
      node.getAttribute("data-gc-signal"));
    const totals = summarizeSignals(states);
    const visible = nextFilter === "all" ? totals.all : totals[nextFilter];
    const eligibleEvents = events.filter(event => !initialHistoryHidden.get(event));
    const historyTotal = eligibleEvents.length;
    const historyVisible = eligibleEvents.filter(event => nextFilter === "all" ||
      event.getAttribute("data-gc-signal") === nextFilter).length;
    const focused = board.ownerDocument?.activeElement;
    const chosen = buttons.find(button =>
      button.getAttribute("data-gc-signal-filter") === nextFilter);
    const reconcileItem = (node, shouldHide) => {
      if (shouldHide && focused && node.contains(focused)) chosen?.focus();
      node.hidden = shouldHide;
    };
    for (const node of nodes) {
      reconcileItem(node,initialHidden.get(node) ||
        (nextFilter !== "all" && node.getAttribute("data-gc-signal") !== nextFilter));
    }
    for (const event of events) {
      reconcileItem(event,initialHistoryHidden.get(event) ||
        (nextFilter !== "all" && event.getAttribute("data-gc-signal") !== nextFilter));
    }
    buttons.forEach(button => {
      const active = button === chosen;
      button.setAttribute("aria-pressed", String(active));
      button.tabIndex = active ? 0 : -1;
    });
    for (const [node] of originalCounts) {
      const key = node.getAttribute("data-gc-signal-count");
      node.textContent = String(totals[key]);
    }
    if (empty) empty.hidden = visible > 0;
    if (historyEmpty) historyEmpty.hidden = historyVisible > 0;
    summary.textContent = "Showing " + visible + " of " + totals.all + " signals" +
      (history ? "; " + historyVisible + " of " + historyTotal + " related events" : "");
    filter = nextFilter;
    return Object.freeze({
      filter, visible, total:totals.all, counts:totals,
      historyVisible, historyTotal
    });
  };

  let disposeToggle = null;
  try {
    const nodes = collect();
    const events = collectHistory();
    remember(nodes,events);
    // Discard disabled or conflicting initial pressed states in favor of All.
    const initial = buttons.find(button =>
      button.getAttribute("aria-pressed") === "true" &&
      !button.disabled && button.getAttribute("aria-disabled") !== "true");
    filter = initial?.getAttribute("data-gc-signal-filter") || "all";
    buttons.forEach(button => button.setAttribute("aria-pressed", String(
      button.getAttribute("data-gc-signal-filter") === filter)));
    disposeToggle = initToggleGroup(filters,{ onChange(button) {
      const next = button.getAttribute("data-gc-signal-filter");
      try {
        const current = collect();
        const currentEvents = collectHistory();
        remember(current,currentEvents);
        render(next,current,currentEvents);
      } catch(error) {
        // The shared toggle group selects before invoking onChange.
        // Roll it back if a consumer inserted invalid status markup.
        for(const entry of buttons) {
          const active = entry.getAttribute("data-gc-signal-filter") === filter;
          entry.setAttribute("aria-pressed",String(active));
          entry.tabIndex = active ? 0 : -1;
        }
        throw error;
      }
    }});
    render(filter,nodes,events);
  } catch (error) {
    disposeToggle?.();
    for (const [button, original] of originalButtons) {
      button.setAttribute("aria-pressed",original.pressed);
      if (original.tabindex === null) button.removeAttribute("tabindex");
      else button.setAttribute("tabindex",original.tabindex);
    }
    throw error;
  }

  const refresh = () => {
    if (disposed) throw new Error("Signal board disposed");
    const nodes = collect();
    const events = collectHistory();
    // Applications may disable filters when their data or permissions change.
    // Never leave aria-pressed and the roving Tab stop on a disabled button.
    // Validate all entries before mutating the board, and fail closed if
    // consumers have disabled every choice.
    const available = buttons.filter(button =>
      !button.disabled && button.getAttribute("aria-disabled") !== "true");
    if (!available.length) throw new Error("Signal board needs an enabled filter");
    const chosen = available.find(button =>
      button.getAttribute("data-gc-signal-filter") === filter) ||
      available.find(button => button.getAttribute("data-gc-signal-filter") === "all") ||
      available[0];
    remember(nodes,events);
    return render(chosen.getAttribute("data-gc-signal-filter"),nodes,events);
  };
  const setFilter = (value) => {
    if (disposed) throw new Error("Signal board disposed");
    if (!SIGNAL_FILTERS.includes(value)) throw new RangeError("Unknown signal filter");
    const target = buttons.find(button => button.getAttribute("data-gc-signal-filter") === value);
    if (!target || target.disabled || target.getAttribute("aria-disabled") === "true") return false;
    const nodes = collect();
    const events = collectHistory();
    remember(nodes,events);
    render(value,nodes,events);
    return true;
  };
  const dispose = () => {
    if (disposed) return;
    disposed = true;
    disposeToggle?.();
    for(const [node,hidden] of initialHidden) node.hidden = hidden;
    for(const [event,hidden] of initialHistoryHidden) event.hidden = hidden;
    for(const [node,content] of originalCounts) node.textContent = content;
    for(const [button,original] of originalButtons) {
      button.setAttribute("aria-pressed",original.pressed);
      if(original.tabindex === null) button.removeAttribute("tabindex");
      else button.setAttribute("tabindex",original.tabindex);
    }
    if(empty) empty.hidden = originalEmpty;
    if(historyEmpty) historyEmpty.hidden = originalHistoryEmpty;
    summary.textContent = originalStatus;
  };
  return Object.freeze({ get filter(){return filter;}, setFilter, refresh, dispose });
}
