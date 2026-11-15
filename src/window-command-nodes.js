/**
 * GoreeCloud UI Window Command Nodes (WCN).
 *
 * Progressive enhancement only: the owning native/window host supplies real
 * close, minimize and maximize/restore actions. This module never calls
 * browser window.close(), hides windows, or pretends to control OS chrome.
 * No persistence, networking, telemetry, dependencies, or icon assets.
 */
export function initWindowCommandNodes(group, {
  onDismiss, onDock, onExpand, isMaximized = false, onError
} = {}) {
  if (!group || typeof group.querySelectorAll !== "function" ||
      typeof group.addEventListener !== "function" ||
      typeof group.setAttribute !== "function") {
    throw new TypeError("WCN requires a window-command group element");
  }
  if (![onDismiss, onDock, onExpand].every(fn => typeof fn === "function")) {
    throw new TypeError("WCN requires real close, minimize and maximize/restore callbacks");
  }
  if (typeof isMaximized !== "boolean") {
    throw new TypeError("WCN isMaximized must be a boolean");
  }
  if (onError !== undefined && typeof onError !== "function") {
    throw new TypeError("WCN onError must be a function");
  }
  const actions = ["dismiss", "dock", "expand"];
  const nodes = Array.from(group.querySelectorAll("button[data-gc-window-command]"));
  if (nodes.length !== 3 || (group.children && group.children.length !== 3) || nodes.some((node, index) =>
    node.parentElement !== group ||
    node.getAttribute("data-gc-window-command") !== actions[index] ||
    node.children.length !== 0 || node.textContent.trim() !== "")) {
    throw new TypeError("WCN requires exactly three direct, empty button faces in Dismiss/Dock/Expand order");
  }
  // Never render action glyphs or DOM text inside the circular color faces.
  group.setAttribute("role", "group");
  group.setAttribute("aria-label", "Window commands");
  const [dismiss, dock, expand] = nodes;
  let maximized = isMaximized;
  let stateRevision = 0;
  let disposed = false;
  let pending = null;

  const labels = { dismiss: "Close window", dock: "Minimize window" };
  function setLabel(button, label) {
    button.setAttribute("aria-label", label);
    button.setAttribute("title", label);
    button.setAttribute("type", "button");
  }
  setLabel(dismiss, labels.dismiss);
  setLabel(dock, labels.dock);
  function updateExpandLabel() {
    setLabel(expand, maximized ? "Restore window" : "Maximize window");
  }
  updateExpandLabel();

  function setMaximized(value) {
    if (disposed) throw new Error("WCN controller is disposed");
    if (typeof value !== "boolean") throw new TypeError("WCN maximized state must be a boolean");
    maximized = value;
    stateRevision++;
    updateExpandLabel();
  }

  const callbacks = { dismiss: onDismiss, dock: onDock, expand: onExpand };
  async function activate(action) {
    if (disposed || pending) return;
    const button = nodes[actions.indexOf(action)];
    if (button.disabled || button.getAttribute("aria-disabled") === "true") return;
    const abort = new AbortController();
    const revision = stateRevision;
    pending = abort;
    group.setAttribute("aria-busy", "true");
    group.removeAttribute("data-gc-wcn-error");
    try {
      // OS callbacks may be asynchronous. A boolean expand result signals a
      // *confirmed* new state; undefined never optimistically toggles it.
      const confirmed = await callbacks[action]({ action, maximized, signal: abort.signal });
      if (!disposed && !abort.signal.aborted &&
          action === "expand" && typeof confirmed === "boolean" && revision === stateRevision) {
        setMaximized(confirmed);
      }
    } catch (error) {
      if (!disposed && !abort.signal.aborted) {
        group.setAttribute("data-gc-wcn-error", action);
        if (onError) {
          // Host error reporter failures must not become unhandled rejections.
          try { onError(error, action); } catch { /* state remains failed */ }
        }
      }
    } finally {
      if (pending === abort) {
        pending = null;
        group.removeAttribute("aria-busy");
      }
    }
  }
  const listeners = nodes.map((node, index) => {
    const listener = () => { void activate(actions[index]); };
    node.addEventListener("click", listener);
    return listener;
  });
  function dispose() {
    if (disposed) return;
    disposed = true;
    pending?.abort();
    pending = null;
    group.removeAttribute("aria-busy");
    nodes.forEach((node, index) => node.removeEventListener("click", listeners[index]));
  }
  return { setMaximized, dispose };
}
