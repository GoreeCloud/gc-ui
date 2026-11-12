/**
 * GoreeCloud UI command palette controller for a native <dialog>.
 * Uses textContent, never user-provided HTML, regex or network services.
 * Consumers supply meaningful actions via onSelect(button, { signal }).
 */
const normalize = value => String(value ?? "").normalize("NFKC").toLocaleLowerCase().trim();

export function matchesCommand(query, label, keywords = "") {
  return normalize(label + " " + keywords).includes(normalize(query));
}

/**
 * @param {HTMLDialogElement} dialog - Native modal with labeled search input and command buttons.
 * @param {{trigger?:HTMLElement,shortcut?:boolean,onSelect:(button:HTMLButtonElement,context:{signal:AbortSignal})=>void|Promise<void>}} options
 * @returns {{open:()=>void,close:()=>void,refresh:()=>void,dispose:()=>void}}
 */
export function initCommandPalette(dialog, { trigger = null, shortcut = true, onSelect } = {}) {
  if (!dialog || typeof dialog.showModal !== "function" || typeof dialog.close !== "function" ||
      typeof dialog.querySelector !== "function") {
    throw new TypeError("Command palette requires a native dialog");
  }
  if (typeof onSelect !== "function") throw new TypeError("Command palette requires an onSelect callback");
  const input = dialog.querySelector('input[type="search"]');
  if (!input || typeof input.addEventListener !== "function") {
    throw new Error("Command palette requires an input[type=search]");
  }
  const initialButtons = Array.from(dialog.querySelectorAll('button[data-gc-command]'));
  if (initialButtons.length === 0) throw new Error("Command palette requires at least one command button");
  if (trigger && typeof trigger.addEventListener !== "function") throw new TypeError("Trigger must be a button-like element");
  const owner = dialog.ownerDocument;
  if (!owner || typeof owner.addEventListener !== "function") throw new TypeError("Dialog must be attached to a document");
  const status = dialog.querySelector("[data-gc-command-status]");
  const empty = dialog.querySelector("[data-gc-command-empty]");
  // Commands may be added or removed when a product enables a new local
  // capability. Keep bindings and focus in sync with the current native DOM.
  let entries = [];
  const boundButtons = new Set();
  let destroyed = false, pendingSession = null, activeController = null, restoreFocus = null;
  let composing = false;
  // A pending action must not close or announce errors in a later dialog
  // session after Escape, native close, or a deliberate reopen.
  let session = 0;

  const selectable = () => entries.filter(x => !x.row.hidden && !x.button.disabled &&
    x.button.getAttribute("aria-disabled") !== "true" &&
    x.row.getAttribute?.("aria-disabled") !== "true").map(x => x.button);
  const refresh = () => {
    if (destroyed) return;
    // Reconcile current native command nodes, not a stale initialization
    // snapshot. Removed actions must never remain keyboard/pointer active.
    const nextButtons = Array.from(dialog.querySelectorAll('button[data-gc-command]'));
    const nextSet = new Set(nextButtons);
    for (const button of boundButtons) {
      if (!nextSet.has(button)) {
        button.removeEventListener("click", onItemClick);
        button.removeEventListener("keydown", onItemKey);
        boundButtons.delete(button);
        if (dialog.open && owner.activeElement === button) input.focus();
      }
    }
    for (const button of nextButtons) {
      if (!boundButtons.has(button)) {
        button.addEventListener("click", onItemClick);
        button.addEventListener("keydown", onItemKey);
        boundButtons.add(button);
      }
    }
    entries = nextButtons.map(button => ({ button, row: button.closest?.("li") || button }));
    let visible = 0;
    for (const entry of entries) {
      const match = matchesCommand(input.value,
        entry.button.textContent || "", entry.button.getAttribute("data-gc-keywords") || "");
      entry.row.hidden = !match;
      if (match) visible++;
    }
    if (empty) empty.hidden = visible > 0;
    const actionable = selectable().length;
    if (status) status.textContent = visible === 0 ? "No matching commands" :
      actionable + (actionable === 1 ? " command available" : " commands available");
  };
  const open = () => {
    if (destroyed) throw new Error("Command palette has been disposed");
    if (dialog.open) { input.focus(); return; }
    restoreFocus = owner.activeElement;
    composing = false;
    input.value = "";
    refresh();
    dialog.showModal();
    session += 1;
    // Async work from a dismissed session cannot make this new dialog busy.
    dialog.removeAttribute("aria-busy");
    input.focus();
  };
  const abortPending = () => {
    const controller = activeController;
    activeController = null;
    pendingSession = null;
    dialog.removeAttribute("aria-busy");
    if (controller && !controller.signal.aborted) controller.abort();
  };
  const close = () => {
    if (!dialog.open) return;
    // Cancellation is advisory: consumer operations must honor the signal
    // before doing any further work. Mesh/Identity permissions stay separate.
    abortPending();
    dialog.close();
    session += 1; // Invalidate pending actions before queued close events.
  };
  const activate = async button => {
    // An operation must block repeat activation only in the session that
    // started it. Reopening may safely launch a different action even while
    // a prior callback has yet to settle.
    if (destroyed || !dialog.open || pendingSession === session ||
        !selectable().includes(button)) return;
    const actionSession = session;
    const controller = new AbortController();
    pendingSession = actionSession;
    activeController = controller;
    try {
      const operation = onSelect(button, { signal: controller.signal });
      if (operation && typeof operation.then === "function") {
        if (session === actionSession) dialog.setAttribute("aria-busy", "true");
        await operation;
      }
      if (!destroyed && dialog.open && session === actionSession) {
        // Successful work is finished, not cancelled by normal dismissal.
        if (activeController === controller) activeController = null;
        close();
      }
    } catch {
      if (!destroyed && dialog.open && session === actionSession && status) {
        status.textContent = "Action could not be completed. Try again.";
      }
    } finally {
      // A stale completion cannot revoke or clear a newer session.
      if (activeController === controller) activeController = null;
      if (pendingSession === actionSession) {
        pendingSession = null;
        dialog.removeAttribute("aria-busy");
      }
    }
  };
  // IME composition must not be interpreted as an Enter-to-execute or
  // shortcut request. Filtering only applies to committed input text.
  const onCompositionStart = () => { composing = true; };
  const onCompositionEnd = () => { composing = false; if (!destroyed) refresh(); };
  const onInput = event => {
    if (!composing && !event?.isComposing) refresh();
  };
  const isComposingKey = event => composing || event.isComposing ||
    event.key === "Process" || event.keyCode === 229;
  const onInputKey = event => {
    if (isComposingKey(event) || event.altKey || event.ctrlKey || event.metaKey) return;
    const items = selectable();
    if (!items.length) return;
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      (event.key === "ArrowDown" ? items[0] : items[items.length - 1]).focus();
    } else if (event.key === "Enter") {
      event.preventDefault();
      void activate(items[0]);
    }
  };
  const onItemKey = event => {
    if (isComposingKey(event) || event.altKey || event.ctrlKey || event.metaKey) return;
    const items = selectable();
    const index = items.indexOf(event.currentTarget);
    if (index < 0) return;
    let selected = -1;
    if (event.key === "ArrowDown") selected = (index + 1) % items.length;
    if (event.key === "ArrowUp") selected = (index - 1 + items.length) % items.length;
    if (event.key === "Home") selected = 0;
    if (event.key === "End") selected = items.length - 1;
    if (selected >= 0) {
      event.preventDefault();
      items[selected].focus();
    }
  };
  const onItemClick = event => { void activate(event.currentTarget); };
  const onGlobalKey = event => {
    if (destroyed || event.defaultPrevented || !shortcut || event.altKey ||
        event.shiftKey || isComposingKey(event)) return;
    if ((event.ctrlKey || event.metaKey) && String(event.key).toLowerCase() === "k") {
      event.preventDefault();
      open();
    }
  };
  const onClose = () => {
    // A delayed native close event from an older session must not interrupt
    // a dialog that has already been reopened.
    if (dialog.open) return;
    abortPending(); // Native Escape and platform light-dismiss also cancel.
    session += 1;
    const previous = restoreFocus;
    restoreFocus = null;
    // Do not steal focus from a person who has moved to another control
    // after external dismissal. Focus inside the closed dialog or on the
    // document body is safe to restore, preserving ordinary Escape behavior.
    const focused = owner.activeElement;
    if (!destroyed && previous && previous.isConnected !== false &&
        typeof previous.focus === "function" &&
        (!focused || focused === owner.body || dialog.contains?.(focused))) {
      previous.focus();
    }
  };
  input.addEventListener("input", onInput);
  input.addEventListener("compositionstart", onCompositionStart);
  input.addEventListener("compositionend", onCompositionEnd);
  input.addEventListener("keydown", onInputKey);
  trigger?.addEventListener("click", open);
  if (shortcut) owner.addEventListener("keydown", onGlobalKey);
  dialog.addEventListener("close", onClose);
  refresh();
  return Object.freeze({
    open, close, refresh,
    dispose() {
      if (destroyed) return;
      // Never leave an inert native modal occupying the top layer after its
      // controller has detached every command and keyboard handler.
      if (dialog.open) {
        const previous = restoreFocus;
        const focusedBeforeClose = owner.activeElement;
        close();
        // Native close events may be queued asynchronously. Restore focus
        // only if it still belongs to the dismissed dialog.
        if (restoreFocus === previous && previous &&
            previous.isConnected !== false && typeof previous.focus === "function" &&
            (!focusedBeforeClose || focusedBeforeClose === owner.body ||
             dialog.contains?.(focusedBeforeClose))) previous.focus();
      }
      abortPending(); // Also cover already-closed dialogs awaiting close events.
      restoreFocus = null;
      destroyed = true;
      dialog.removeAttribute("aria-busy");
      input.removeEventListener("input", onInput);
      input.removeEventListener("compositionstart", onCompositionStart);
      input.removeEventListener("compositionend", onCompositionEnd);
      input.removeEventListener("keydown", onInputKey);
      for (const button of boundButtons) {
        button.removeEventListener("click", onItemClick);
        button.removeEventListener("keydown", onItemKey);
      }
      boundButtons.clear();
      entries = [];
      trigger?.removeEventListener("click", open);
      if (shortcut) owner.removeEventListener("keydown", onGlobalKey);
      dialog.removeEventListener("close", onClose);
    }
  });
}
