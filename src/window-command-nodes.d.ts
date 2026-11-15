export type WindowCommandAction = "dismiss" | "dock" | "expand";
export type WindowCommandContext = {
  action: WindowCommandAction;
  maximized: boolean;
  signal: AbortSignal;
};
export type WindowCommandNodesController = {
  /** Update from a confirmed host/window-manager state notification. */
  setMaximized(value: boolean): void;
  /** Abort pending callbacks and detach listeners; may be called repeatedly. */
  dispose(): void;
};
export declare function initWindowCommandNodes(
  group: HTMLElement,
  options: {
    onDismiss(context: WindowCommandContext): void | Promise<void>;
    onDock(context: WindowCommandContext): void | Promise<void>;
    onExpand(context: WindowCommandContext): boolean | void | Promise<boolean | void>;
    isMaximized?: boolean;
    onError?: (error: unknown, action: WindowCommandAction) => void;
  }
): WindowCommandNodesController;
