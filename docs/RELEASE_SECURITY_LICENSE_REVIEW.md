# GoreeCloud UI — Stable 1.0 release source, security and license review

**2026-11-13; baseline source:** [`c235f9b5e2577c440465de0d455372c363f4d01d`](https://github.com/GoreeCloud/gc-ui/commit/c235f9b5e2577c440465de0d455372c363f4d01d). This is **AI-assisted source inspection and machine-check evidence**, not independent certification, a legal opinion, a threat-model closure or review of a final 1.0.0 candidate. See [machine-readable review](../registry/release-security-audit.v1.json).

## Reviewed source, behavior and dependency boundary

Reviewed all **15 shipped `src/*.js` modules** for outbound network calls, persistence, credential handling, unsafe DOM writes, dynamic code and remote dependencies; inspected three shipped CSS files and original icon/identity asset provenance. No intentional browser `fetch`, XHR, sockets, beacon, cookie or Web Storage access, `indexedDB`, service worker installation, external CSS import or remote dynamic module loading was found in the reviewed published library. Existing `scripts/audit-client-boundary.mjs` detects these high-confidence patterns in CI; this change adds explicit tests for `eval`, `new Function`, `document.write` and string-evaluated timers. A reviewed exception is the first-party `iconSvg` function's validated SVG output assigned inside its custom element Shadow DOM (`src/elements.js`). Changes to the generator require fresh review. Pattern scanning does **not** rule out cleverly hidden behavior or malicious code by itself.

No runtime or development npm dependencies are declared. The shipped font stacks use system fonts (no remote font service). The `npm pack --offline --ignore-scripts` verification checks the 19 currently declared export specifiers and SHA-512 tarball integrity, installs the exact generated tarball offline with scripts disabled and renders the installed foundation in Chromium. The pinned checkout/setup-node/upload-artifact actions and hosted runner remain separate build-time dependencies rather than distributed npm runtime dependencies.

## License and graphics provenance

The package contains the repository's **MIT License** (copyright © 2026 GoreeCloud) and `package.json` declares `MIT`; this source review did not identify a declared bundled third-party npm runtime dependency or third-party icon/font library. The original glyph inventory and generated sprite are deterministic first-party assets.

The six official identity images are byte-pinned in [OFFICIAL_IDENTITY.md](OFFICIAL_IDENTITY.md) to [GoreeCloud/brand-assets `29be2e7`](https://github.com/GoreeCloud/brand-assets/tree/29be2e70201bd12adfcdcb3c25106abf9408c6d1), and existing CI rechecks their SHA-256 and excludes unsafe SVG resources. **The master repository has no separate LICENSE file or declared SPDX license at this inspected commit.** It is GoreeCloud-controlled artwork, but that fact alone does not establish a general-public trademark permission. Keep brand/reuse licensing classification open until the authorized owner explicitly documents how official marks may accompany a publicly distributed MIT UI package. Do not silently relicense the master artwork.

## Risk and policy outcome

No obvious direct malicious-code, credential-exfiltration, client-storage or network-telemetry behavior was detected in the current source. That is a **bounded source finding**, not a guarantee against compromise or a substitute for Wardveil cybersecurity. GoreeShield owns consent/privacy, Mesh integrations, Identity authentication; the UI library has no authority to claim those other implementations.

The [GitHub main branch](https://github.com/GoreeCloud/gc-ui/tree/main) was authoritatively read back as **`protected:false` with required checks off**; the admin-only protection endpoint returns 403 to the integration. Accordingly the repository-release-controls gate remains open. The `source-security-privacy` 1.0 gate also remains open until exact candidate reinspection, legal asset distribution decision, and the final release/package evidence. This review makes no Stable, signed artifact, npm publication, native platform or consumer migration claim.
