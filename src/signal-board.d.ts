/** Local-only, native-first status filter. Never fetches or polls services. */
export type GcSignalState = "ready" | "attention" | "offline";
export type GcSignalFilter = "all" | GcSignalState;
export declare const SIGNAL_STATES: readonly GcSignalState[];
export declare const SIGNAL_FILTERS: readonly GcSignalFilter[];
export declare function summarizeSignals(states: GcSignalState[]): Readonly<{ all:number; ready:number; attention:number; offline:number }>;
export declare function initSignalBoard(board: HTMLElement): Readonly<{
  readonly filter: GcSignalFilter;
  setFilter(value: GcSignalFilter): boolean;
  refresh(): Readonly<{filter:GcSignalFilter; visible:number; total:number; counts:Readonly<{all:number;ready:number;attention:number;offline:number}>; historyVisible:number; historyTotal:number}>;
  dispose(): void;
}>;
