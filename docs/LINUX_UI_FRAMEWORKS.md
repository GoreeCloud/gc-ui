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

| [Documents Linux client](https://github.com/GoreeCloud/documents) | `goreedocs/linux.py` imports `gi.repository.Gtk` and declares `DocumentsWindow(Gtk.ApplicationWindow)`; existing GTK4 native API editor and experimental Debian package | GTK4 | **Migration required** | [Issue #29](https://github.com/GoreeCloud/documents/issues/29): preserve owner API token boundaries, local authenticated Documents client, editor, consent, pagination and package rollback under an approved Linux UI |
| [Rich Text Editor Linux candidate](https://github.com/GoreeCloud/rich-text-editor) | `Cargo.toml` depends on `gpui = "0.2.2"` and describes Linux; `src/main.rs` imports `gpui::*`; Linux support is experimental in the attributed Quiet.md import | Rust GPUI | **Migration required for Linux GUI** | [Issue #12](https://github.com/GoreeCloud/rich-text-editor/issues/12): evaluate approved Slint/Qt Quick/Flutter UI after reviewing imported third-party licensing, dependency security, local document formats and platform viability; no compliant Linux release presumed |

### Optional Qt Quick migration candidates — not approved primary app migrations

The [versioned source inventory](../registry/linux-primary-ui-frameworks.v1.json) separately records *optional/draft* implementation progress. Candidate code does not change the current **noncompliant** Linux primary window or validate full feature parity.

| Linux client | Source-backed candidate | Verified state | Next acceptance |
| --- | --- | --- | --- |
| [Index](https://github.com/GoreeCloud/index) | `src/goreecloud_index/qtquick_app.py` and actual `qtquick/Main.qml` `ApplicationWindow` | [Index PRs #46–52](https://github.com/GoreeCloud/index/pulls?q=is%3Apr+is%3Amerged) merged an **optional** Qt Quick 6.12.0 source preview: private local index bridge, folder consent/subfolder exclusions, inode-pinned portal FD and isolated D-Bus regression, all-monitor normal-window sizing, keyboard/accessibility tests and rootless Debian QML asset packaging. [PR #52](https://github.com/GoreeCloud/index/pull/52) passed dedicated CI; documented synthetic Qt 6.12 Wayland previews are not founder visual, real Orca or release acceptance. Existing GTK `gui` remains primary | Verify actual installed Qt candidate/desktop handler/Orca, 100–400% scaling, package rollback and full GTK feature parity; do not promote to compliant |
| [App Store](https://github.com/GoreeCloud/app-store) | `linux/goreecloud_store/qtquick_preview.py` and genuine Qt Quick `ApplicationWindow` | Opt-in development source merged in [PR #6](https://github.com/GoreeCloud/app-store/pull/6) and offline catalog in [PR #7](https://github.com/GoreeCloud/app-store/pull/7); [PR #8](https://github.com/GoreeCloud/app-store/pull/8) made legacy download saves no-clobber. Actual **Qt 6.12.0** offscreen and dual-X-screen CI passed on those merged increments; [PR #9](https://github.com/GoreeCloud/app-store/pull/9) merged bounded release details; [PR #11](https://github.com/GoreeCloud/app-store/pull/11) merged a separate **explicit-confirmation, checksum-verified no-clobber save** after all four hosted CI gates; [PR #12](https://github.com/GoreeCloud/app-store/pull/12) merged strict malicious GitHub metadata handling (all four CI jobs passed). The original conflicting [PR #10](https://github.com/GoreeCloud/app-store/pull/10) was closed as superseded | Fully native primary UI feature parity, publisher verification, package/rollback, real GNOME/KDE/Wayland/Orca and user-hardware evidence |
| [Contacts Linux](https://github.com/GoreeCloud/contacts) | `linux/goreecloud_contacts/qt_preview.py` | [Draft PR #27](https://github.com/GoreeCloud/contacts/pull/27): read-only Qt Quick preview, not merged or delivered; current GTK4 UI remains default | Edit/delete/import/export, permissions and local SQLite parity, physical Linux UX, signed packages |
| [Memos Linux](https://github.com/GoreeCloud/memos) | `clients/linux/qt_app.py` | [Draft PR #71](https://github.com/GoreeCloud/memos/pull/71): Qt Quick API/memo preview, not merged or delivered; current GTK4 UI remains default | Service/auth, create/update/delete, network/privacy, layout, full runtime and packaging parity |

Do not promote a repository to `compliant` because an optional UI can render in CI or a draft passes its isolated checks. The existing primary entrypoint, approved-framework packaging and real runtime/feature acceptance are the gates.

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
