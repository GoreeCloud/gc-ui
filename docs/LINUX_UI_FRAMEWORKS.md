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
| [Contacts Linux client](https://github.com/GoreeCloud/contacts) | `linux/goreecloud_contacts/app.py` imports `gi.repository.Gtk` / `Adw` and defines `ContactsWindow(Adw.ApplicationWindow)`; `linux/pyproject.toml` names GTK4 | GTK4/libadwaita | **Migration required** | [Issue #25](https://github.com/GoreeCloud/contacts/issues/25): evaluate approved Qt Quick/Flutter/Slint primary UI, retain private SQLite, strict user-directed import/export and separate web/Android clients |
| [App Store Linux client](https://github.com/GoreeCloud/app-store) | `linux/run.sh` launches `goreecloud_store`; `linux/goreecloud_store/__main__.py` imports `gi.repository.Gtk` / `Adw` and defines `StoreWindow(Adw.ApplicationWindow)` | GTK4/libadwaita | **Migration required** | [Issue #4](https://github.com/GoreeCloud/app-store/issues/4): evaluate approved primary UI, retain curated GoreeCloud-only releases, SHA-256 checks, explicit downloads and separate Android client |

| [Tasks Linux client](https://github.com/GoreeCloud/tasks) | `linux/app.py` imports `Gtk` / `Adw` and declares `TasksWindow(Adw.ApplicationWindow)`; web/Android clients are separate | GTK4/libadwaita | **Migration required** | [Issue #28](https://github.com/GoreeCloud/tasks/issues/28): preserve private SQLite, task Trash/restore, backups, and a normal windowed Qt Quick/Flutter/Slint primary UI |
| [Memos Linux client](https://github.com/GoreeCloud/memos) | `clients/linux/app.py` imports `gi.repository.Gtk` and creates `Gtk.ApplicationWindow` | GTK4 | **Migration required** | [Issue #70](https://github.com/GoreeCloud/memos/issues/70): preserve redirect refusal, token confidentiality, HTTPS/loopback restrictions and timeline/memo workflows; [Qt Quick draft PR #71](https://github.com/GoreeCloud/memos/pull/71) is not a verified migration |

These are **verified current source observations** rather than completed migrations, release or runtime acceptance. Existing legacy consumer windowing, privacy and security tests remain valuable as migration regression baselines; a passing legacy test must **never** be reported as framework compliance.

## Required migration gates

1. Inventory current UI ownership, processes, runtime dependency and approved-framework licensing; select a supported target per app.
2. Isolate backend domain logic from the legacy UI, retaining single-instance profile locks, origin/permission boundaries, local-only consent and FD-pinned portal handoff where applicable.
3. Build an **actual Qt Quick / Flutter / Slint top-level application UI**, not a decorative QML overlay on a Qt Widgets primary window and not an HTML wrapper.
4. Apply verified GoreeCloud UI tokens/semantics, normal-windowed defaults, keyboard, accessibility, multiple displays, 100–400% text scaling and failure states.
5. Test security/privacy equivalence plus package/install/upgrade/rollback, Linux runtime and genuine representative device interactions. Do not remove legacy code until the replacement passes applicable gates.
6. Prove source, packaged runtime and primary framework before changing status from `migration-required` to `compliant`. Review cross-platform behavior separately.

**Targeted Drive governance reconciliation verified:** The [authoritative master instructions](https://drive.google.com/file/d/1W7eCxfSEw1_fpK7wSw8gfeHHCIJ8IrBE/view) now include **Section 14.2B**, mandating the same three exclusive Linux graphical primary UI frameworks for **all existing and future applications**, with **no grandfathering**. The former Linux portion of the Section 14.2 web-wrapper exception is explicitly superseded; that older option now applies to individually qualified **Windows-only** desktop wrappers. The [Native Development Guidelines](https://drive.google.com/file/d/1TYkSbgUNmZqR0MrpWwjOOXL5phknJEYF/view), [Native Applications and Services Requirement](https://drive.google.com/file/d/10QD9H9Klk3LrQLrFPiyQkS1R0uBPi48S/view), and [Linux framework standard](https://drive.google.com/file/d/1L-93POcFZE12F-vYxbSc9XquQ-KWOa6f/view) have been freshly read and show this targeted reconciliation. **Documentation reconciliation is not product migration**: Browser, Index and other verified legacy GTK/Widgets clients remain migration-required. Windows/mobile distinctions remain unchanged.

This documentation is **not** a certified native component SDK or a Stable 1.0 web release change.
