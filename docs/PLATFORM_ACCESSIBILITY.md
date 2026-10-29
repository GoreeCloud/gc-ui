# Experimental platform profile accessibility contract

The web-facing [platform-profile runtime](../src/gc-platform-profile.mjs) describes design guidance; it does not implement a native operating-system UI adapter or detect hardware.

Call `resolvePlatformProfile(kind, options)` with accessibility and device hints supplied by a trusted host. The supported options include `highContrast`, `forcedColors`, `reducedMotion`, `reducedTransparency`, and `lowPower`.

When `forcedColors` is true, the resolved profile uses `maxDepth: 'e0'`, `motion: 'none'`, and `lens: 'solid'`, matching the visual restrictions for `highContrast`. Target size, navigation mode, and focus guidance remain platform-specific. An ordinary profile retains its existing defaults.

`applyPlatformProfile(root,kind,options)` writes `data-gc-platform`, `data-gc-platform-depth`, and `data-gc-platform-lens` to a caller-owned root. The host owns the timing of subsequent updates and teardown; these fields are not a substitute for actual CSS `forced-colors` support or native platform accessibility enforcement.

### Consumer integration requirements

- Detect forced-colors using the platform's actual accessibility signals, such as the browser media query `(forced-colors: active)`, where available.
- Re-resolve the profile whenever that signal changes; the resolver does not subscribe to system events automatically.
- Preserve platform focus behavior and reachable, semantically labeled controls even when all decoration is suppressed.
- Verify contrast, keyboard navigation, and assistive-technology behavior in each consuming application; these profile values are guidance, not WCAG or native-device certification.

This contract applies to the experimental `0.2.0-alpha.1` workspace only. The separately stable Foundations subset and native distribution status are unchanged.
