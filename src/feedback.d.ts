/** Web-alpha semantic primitives. All trust/privacy decisions belong to owning products. */
export type GcBadgeFamily = "icon" | "achievement" | "profile" | "status" | "role" | "verification" | "notification" | "recognition";
export type GcFeedbackTone = "neutral" | "info" | "positive" | "warning" | "negative";
export type GcAsyncState = "loading" | "ready" | "empty" | "offline" | "stale" | "error" | "permission-denied" | "timed-out" | "cancelled" | "unknown";
export type GcStatusState = "online" | "available" | "healthy" | "active" | "synced" | "away" | "busy" | "degraded" | "stale" | "conflict" | "failed" | "blocked" | "error" | "offline" | "inactive" | "pending" | "queued" | "syncing" | "unknown";
export declare const BADGE_FAMILIES: ReadonlyArray<GcBadgeFamily>;
export declare const FEEDBACK_TONES: ReadonlyArray<GcFeedbackTone>;
export declare const ASYNC_STATES: ReadonlyArray<GcAsyncState>;
export declare const STATUS_TONES: Readonly<Record<GcStatusState, GcFeedbackTone>>;
export interface GcBadgeOptions {
  label: string;
  family?: GcBadgeFamily;
  tone?: GcFeedbackTone;
  size?: "sm" | "md";
  icon?: string;
  issuer?: string;
  evidenceRef?: string;
  verifiedAt?: string;
  visibility?: "visible" | "hidden";
}
/** Passive badge only; verification evidence is required metadata, never frontend authorization. */
export declare function createBadge(options: GcBadgeOptions, doc?: Document): HTMLElement | null;
export declare function createStatusIndicator(options: {state?: GcStatusState; label: string}, doc?: Document): HTMLElement;
/** sensitive=true never exposes an exact count; hidden/zero returns null. */
export declare function createCountBadge(options: {
  count: number;
  scope?: string;
  max?: number;
  sensitive?: boolean;
  mode?: "auto" | "count" | "dot" | "hidden";
}, doc?: Document): HTMLElement | null;
/** Omit done and total for indeterminate; confirmed must be true for phase complete. */
export declare function createTaskProgress(options: {
  label: string;
  done?: number;
  total?: number;
  phase?: "queued" | "working" | "paused" | "failed" | "complete";
  confirmed?: boolean;
}, doc?: Document): HTMLElement;
/** Caller replaces this region when real data, error, retry or recovery becomes available. */
export declare function createAsyncFeedback(options: {
  state?: GcAsyncState;
  label: string;
  rows?: number;
}, doc?: Document): HTMLElement;
