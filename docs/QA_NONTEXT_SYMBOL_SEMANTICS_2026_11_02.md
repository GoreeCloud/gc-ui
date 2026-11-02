# GC UI — Selected non-text symbol semantics (2026-11-02)

**Scope:** Experimental reference labs only, current source baseline `e209730f7f92`. This is a **semantic and redundancy review**, not a blanket WCAG non-text contrast determination.

The axe incomplete triage currently identifies 17 distinct non-text-symbol review targets involving 55 affected node occurrences (historical totals retained until next fresh manifest). Several symbols are decorative glyphs paired with visible labels or ARIA-named controls, and others appear inside a disabled or decorative context. Their mere `aria-hidden` state does not automatically exempt any essential visual information from WCAG 1.4.11.

## Verified, bounded change

The v1 Materials reference used `<span>◈</span> LENS` for a decorative glyph next to the visible text LENS and an independently named Apply button. The glyph did not have `aria-hidden`, unlike equivalent glyphs in Components/Adaptive. The regression test failed in the unmodified baseline for compact light/dark/RTL cases. Adding **only** `aria-hidden="true"` to this glyph preserves the visible design and prevents redundant symbol exposure through the accessibility tree.

A new Chromium/Firefox test covers four display and viewport environments (320px light, 375px dark, 768px RTL, 1440px forced colors). Each scenario verifies the now-hidden v1 decorative glyph and visible LENS/Apply controls, Components menu and floating-control symbols paired with labeled controls, Forms stepper's explicit Remove one collaborator button name and decorative recovery preview, and Adaptive desktop/compact navigation glyphs accompanied by route text and metric/activity symbols accompanied by written information.

**Local result:** 4/4 Chromium and 4/4 Firefox tests passed after the single-markup fix. The full existing automated axe suite also passed **27/27**, the independent report verifier passed **27/27**, and refreshed manual triage retained exactly **30 checks / 318 occurrences / 180 distinct targets**, including all **17 non-text-symbol targets / 55 occurrences**. Source/package check passed. The test is wired into both browser interaction suites. These contract tests show semantic redundancy in specific reference states; they do not establish 3:1 contrast for any icon that independently conveys required information.

**Remaining:** The whole 17-target/55-occurrence historical group is **not** marked resolved by these tests. Any informational/interactive icon without an equivalent accessible indicator needs actual rendered/composited contrast review (typically 3:1 where applicable), including target OS/theme/forced colors and zoom. Keep source axe incompletes intact, do not suppress or waive targets, and retain owner visual, localized RTL, other-platform assistive-technology, and experimental Stable/Seal gates.

Related: [Axe triage](QA_AXE_INCOMPLETE_TRIAGE.md), [GoreeCloud UI stabilization #78](https://github.com/GoreeCloud/gc-ui/issues/78).
