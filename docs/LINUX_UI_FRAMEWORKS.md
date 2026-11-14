# Linux graphical application primary UI framework gate

**Founder requirement (November 13, 2026; applies to existing and future apps):** [canonical Drive standard](https://drive.google.com/file/d/1L-93POcFZE12F-vYxbSc9XquQ-KWOa6f/view), `GoreeCloud/Standards/GoreeCloud Linux Application UI Framework Standard.md`.

Every GoreeCloud **Linux graphical application** must use exactly one of these **primary** UI frameworks:

- **Qt Quick on Qt 6.12.0** (not Qt Widgets).
- **Flutter Linux Desktop** (no additional SDK version mandated by this directive).
- **Slint** (no additional version mandated by this directive).

GTK4/libadwaita, Qt Widgets, Tauri/Electron/web-rendered shells and other primary Linux app UIs are **not compliant**. There is **no grandfathering** or exception for older or working applications. Supporting OS/native libraries may still be used if not substituted for the approved **primary UI**. The rule does **not** silently change Windows, mobile, independent websites, headless services, or CLI-only tools.

The machine-readable governance mirror in [`registry/linux-primary-ui-frameworks.v1.json`](../registry/linux-primary-ui-frameworks.v1.json) does not replace the canonical Drive requirement or establish that the higher-priority master Drive instructions were revised.

## Source-verified consumer state at baseline

| Linux client | Evidence from current first-party repository | Current primary UI | Compliance | Next milestone |
| --- | --- | --- | --- | --- |
| [Browser](https://github.com/GoreeCloud/browser) | `goreecloud_browser/app.py` imports `PySide6.QtWidgets` and `QtWebEngineWidgets.QWebEngineView`; `pyproject.toml` pins PySide6 **6.11.3** | Qt Widgets | **Migration required** | Evaluate and implement Qt Quick **6.12.0** browser chrome, web profile and navigation bridges with isolated security equivalence; retain normal-windowed startup |
| [Index](https://github.com/GoreeCloud/index) | `src/goreecloud_index/ui.py` imports `gi.repository.Gtk` / `Adw` and uses `Adw.ApplicationWindow`; `pyproject.toml` classifies GTK | GTK4/libadwaita | **Migration required** | Evaluate Qt Quick 6.12.0/Slint as a genuine UI replacement, preserving consent, SQLite indexing, inode-pinned portal FD opening and accessibility |

These are **verified current source observations** rather than completed migrations, release or runtime acceptance. Existing Browser and Index windowing, privacy and security tests remain valuable as migration regression baselines; a passing legacy test must **never** be reported as framework compliance.

## Required migration gates

1. Inventory current UI ownership, processes, runtime dependency and approved-framework licensing; select a supported target per app.
2. Isolate backend domain logic from the legacy UI, retaining single-instance profile locks, origin/permission boundaries, local-only consent and FD-pinned portal handoff where applicable.
3. Build an **actual Qt Quick / Flutter / Slint top-level application UI**, not a decorative QML overlay on a Qt Widgets primary window and not an HTML wrapper.
4. Apply verified GoreeCloud UI tokens/semantics, normal-windowed defaults, keyboard, accessibility, multiple displays, 100–400% text scaling and failure states.
5. Test security/privacy equivalence plus package/install/upgrade/rollback, Linux runtime and genuine representative device interactions. Do not remove legacy code until the replacement passes applicable gates.
6. Prove source, packaged runtime and primary framework before changing status from `migration-required` to `compliant`. Review cross-platform behavior separately.

**Governance reconciliation still open:** The authoritative Drive master instructions and subordinate native guidelines contain an older conditional Linux desktop-wrapper allowance. They must be explicitly amended **in place** by an authorized Drive Markdown byte-replacement path; do not silently interpret this mirror as changing a higher-priority document. The newer founder standard states the stricter no-grandfathering requirement. Windows/mobile distinctions remain intact.

This documentation is **not** a certified native component SDK or a Stable 1.0 web release change.
