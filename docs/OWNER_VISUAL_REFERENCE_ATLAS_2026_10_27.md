# GoreeCloud UI — Owner-Provided Web and Desktop Visual Reference Atlas

| Document control | Details |
| --- | --- |
| Document type | Owner-supplied visual reference analysis and proposed design guidance |
| Owner and perspective | GoreeCloud founder |
| Recorded | October 27, 2026 |
| Scope | GoreeCloud UI (GC UI) and relevant GoreeCloud application interfaces |
| Status | Visual references documented; design interpretations proposed; implementation and adoption not established by these screenshots |
| Source | Eighteen screenshots supplied by the founder in two GoreeCloud project conversation messages, October 27, 2026 |
| Repository | `GoreeCloud/gc-ui`, `docs/OWNER_VISUAL_REFERENCE_ATLAS_2026_10_27.md` |

## My intent and the status of these references

I supplied two groups of screenshots as **examples of beautiful web-app and desktop-app user interfaces**. I want GoreeCloud's interfaces to reach this level of craft: sophisticated and organized yet inviting, visually expressive but practical, with clear navigation, readable information, richly functional screens, and details that feel intentionally designed.

These screenshots communicate aesthetic and experiential aspirations, **not approval to copy another company's product**, its identity, illustrations, proprietary assets, interface markup, or code. They are reference evidence of my tastes, not proof that GoreeCloud already provides any illustrated feature. The analyses and product applications below are expressly **proposed interpretations** of my examples, except where they quote or accurately restate existing GC UI standards.

The official GoreeCloud design and experience authority remains **GoreeCloud UI (GC UI)** and its canonical repository `GoreeCloud/gc-ui`. This atlas is a supporting reference, **not a second design system, replacement for existing specifications, automatic feature approval, or release certification**. The canonical master instructions and current GC UI contracts take precedence. Web-interface reference images do not repeal GoreeCloud's requirement to implement genuine native operating-system applications where applicable; cross-platform principles may be shared without treating a website wrapper as a native app.

## Visual reference inventory — first group (10 screenshots)

The file identifiers below identify screenshots in the founder's conversation, **not files committed into this repository**. The visual descriptions are observations, and the takeaways are proposed translations for GC UI.

| Reference | Observed design | Useful patterns to study |
| --- | --- | --- |
| `807.png` | Todoist-style desktop **Upcoming** week calendar, with colored timed events, all-day rows, time scale, persistent left navigation, and two mobile previews | Multi-day schedule density, calendar grid alignment, colored event categories, desktop-to-mobile continuity, current-time indicator, concise event metadata |
| `806.png` | Todoist-style **Today** task list with red top application bar, grouped sidebar, and mobile quick-entry sheet | Fast task capture, understandable hierarchy, structured input chips, project and date metadata, compact but readable list rows |
| `805.jpg` | Project tasks with time estimates, timers, colored status affordances, assignees, progress and an expanded task/subtask detail panel | Embedded productivity tools, timer state and controls, assignee context, estimated versus actual time, contextual detail without losing list location |
| `804.png` | Spacious **Today** view with collapsible navigation, project groups, labeled task rows, due times and project associations | Quiet primary work surface, grouped sections, task completion affordances, easy scanning and alignment |
| `803.png` | Tall angled mobile **Today** screen with group headings, task checkmarks and inline schedule details | Mobile information density, readable grouping, platform-appropriate touch sizing, task identity retained on narrow layouts |
| `802.png` | Earlier Todoist-like **Today / Tomorrow / Saturday** task list, left project hierarchy, top product-colored bar and compact labels | Date-grouped scanning, project taxonomy, light status indicators, minimal cognitive overhead, mature list-row layouts |
| `801.png` | Todoist-style desktop **Today** workspace with mobile inbox and quick-task overlay, metadata chips and keyboard | Cross-device content structure, frictionless capture, accessible inline parsing, context-preserving editing |
| `800.jpg` | Evernote-style rich-text editor with toolbar, breadcrumb context, AI Edit menu and suggestion panel | Productive editor chrome, contextual AI operations, preview-before-insert, selectable/copyable results, transparent user control |
| `799.jpg` | Three Evernote-style mobile screens: AI-assisted search result, rich note with embedded media and annotation, and personal home dashboard | Search + content relationship, useful result summaries, document annotations, personalized home modules, mobile navigation |
| `798.jpg` | Evernote-style desktop home with left rail, note previews, scratch pad, calendar, tasks and modular dashboard areas | Personal workspace composition, multiple tools in one cohesive view, flexible cards, restrained yet useful context |

**Shared themes in the first group:** intuitive task/note organization, readable white or softly tinted content areas, disciplined sidebars, contextual overlays, multi-column scheduling, cross-device adaptation, contextual intelligence, and deeply functional detail views. The clearest lesson is that complex productivity workflows can remain visually calm when typography, spacing, alignment, and semantic color are handled consistently.

## Visual reference inventory — second group (8 screenshots)

| Reference | Observed design | Useful patterns to study |
| --- | --- | --- |
| `815.png` | Tratta-style payment analytics dashboard with dark left sidebar, white workspace, violet data visualization, metric cards and transaction tables | Strong left-nav/workspace contrast, useful KPI hierarchy, trend charts, concise data tables, restrained brand emphasis |
| `814.png` | SaaSCa-style light e-commerce dashboard with narrow sidebar, search bar, colored KPI icons, bar charts and circular analytics | Friendly data visualization, modular white cards, simple filtering, balance between density and breathing room |
| `813.jpg` | Skydash-style vivid analytics dashboard with violet/blue-pink ambiance, illustrated welcome card, four saturated metric tiles and chart panels | Expressive dashboard personality, deliberate card color coding, illustrated hero only when useful, hierarchy among widgets |
| `812.png` | tweakcn.com / shadcn/ui dark theme reference with charcoal surfaces, violet line/bars, calendar and compact controls | Premium dark appearance, subtle edge separation, sophisticated micro-components, coherent accent usage, readable small-panel structure |
| `811.webp` | Google Drive-style Shared Drives window with compact navigation and contextual **Manage members** menu | Familiar file-management organization, contextual actions near selection, restrained surface hierarchy, permission actions that remain understandable |
| `810.png` | Google Drive-style **My Drive** file list, persistent navigation, search, filtering chips, folder/file type icons and selected navigation state | High-utility file navigation, filter affordances, selection clarity, scan-friendly rows, approachable category iconography |
| `809.jpg` | Gmail-style large **Compose** action, left service rail, highlighted Inbox, message count and search bar | Prominent primary action, clear current destination, nested navigation, counters, search-first workflows |
| `808.png` | Gmail-style inbox with categories, dense message rows, toolbar, selection controls, sidebar and search | High information density without visual chaos, structured rows, bulk actions, categorical scanning, progressively disclosed tools |

**Shared themes in the second group:** polished analytical dashboards, stronger color confidence, clearly segmented navigation, charts and KPI cards, flexible information density, lively-but-controlled personalization, carefully designed dark mode, and highly practical file/mail workflows. The references range from subdued operational UIs to expressive illustration-heavy compositions. They should be reconciled through GC UI's semantic roles, rather than copied as incompatible skins.

## How I want these influences translated into GoreeCloud

The examples collectively suggest a recognizable and cohesive application experience, **not one identical dashboard imposed on every product**:

1. **Calm structure, premium detail.** Keep screen purpose obvious. Use disciplined grid geometry, purposeful whitespace, aligned baselines and refined density; avoid empty expanses or arbitrary decoration.
2. **Elegant application shell.** A well-organized, collapsible sidebar or rail; discoverable global/local search; a clear content heading; relevant actions; optional contextual panels; navigation that stays obvious in all supported layouts.
3. **Beautiful and functional data.** Meaningful metrics, trends, date scopes, legends, units, filters, status labels and tables where the domain warrants them. No decorative graphs with fabricated production data.
4. **A small, expressive visual vocabulary.** Apply semantic accent, tonal surfaces, category colors, typography, iconography, corner hierarchy and elevation consistently, not a different visual system per application.
5. **Context-preserving tasks.** Inline editing, fast creation, right-side details, sheets or dialogs, and clear save/cancel feedback should keep users oriented rather than unnecessarily switching full pages.
6. **Human-centered empty and secondary states.** Design onboarding, success, loading, no results, offline, permissions, errors, paused/degraded operation, disabled features and settings with the same care as hero dashboards.
7. **Responsive and genuinely native behavior.** Preserve information architecture across desktop, tablet and mobile; implement platform-specific controls, windowing, shortcuts, touch/keyboard conventions, safe areas and assistive technology interfaces as applicable.
8. **Progressive disclosure.** Show the actions users need now, with well-labeled advanced options available nearby. Richness must mean useful capability, not clutter.
9. **Transparent intelligent assistance.** AI-generated text/search suggestions must be explicitly identified, editable, previewable and controlled by the user; do not imply network access, automatic insertion, or verified answers without backing capability.
10. **An original GoreeCloud identity.** Use original licensed assets and GC UI tokens. References from Todoist, Evernote, Gmail, Google Drive, Tratta, SaaSCa, Skydash and tweakcn/shadcn examples are inspiration only, not reusable ownership claims.

## Reference-to-component translation

| GC UI pattern family | Proposed design requirements derived from examples | Important limitations |
| --- | --- | --- |
| App shell/navigation | Expanded sidebar, compact rail, selected state, top app bar, section grouping, context breadcrumbs, keyboard navigation | Native navigation conventions and existing adaptive-shell contracts control actual breakpoints |
| Global search/filters | Persistent or discoverable search, filter chips, sort controls, result metadata, saved scopes where supported | Search must return actual supported data; no fake results or decorative filters |
| Dashboard and KPI card | Semantic headline, value/unit, period, comparison, trend, supporting chart/table, inspectable details | Source and time range must be known; no invented metrics or deceptive status |
| Chart and visualization | Purposeful line/bar/donut/calendar styles, clear legends, explicit axes/scales, accessible summaries and table alternatives | Charts must be based on accurate data; color alone is insufficient |
| List/row/table | High scanability, stable alignment, row-level actions, sortable columns where functional, responsive density | Avoid inaccessible micro-text, hover-only controls and nonfunctional buttons |
| Calendar/timeline | Clear date navigation, all-day/timed separation, current-time mark, overflow handling, readable event chips | Avoid collisions and hidden events; time-zone and DST behavior need verification |
| Rich editor/quick capture | Focused composition, chips/metadata, autocomplete where supported, undo, contextual menu, save state, copy/select | AI and natural-language parsing must be real, disclosed and reversible |
| Side pane/dialog/menu | Detail panel with visible hierarchy, discoverable dismiss action, correct focus and nonmodal/modal choice | Use solid reading surfaces and preserve return focus |
| File manager | List/grid when appropriate, folder tree, filters, selections, bulk actions, contextual permissions | Access rights and mutation results must come from authoritative backends |
| Notification/status | Noticeable but restrained status, counts and severity meaning, actionable messages | Never imply a feature, success or integration that does not actually exist |
| Theme/personalization | Polished light/dark modes, semantic color, tonal panels, optional density, accessibility overrides | Follow current GC UI token and theme specifications; never hardcode screenshot palettes as canonical |
| Native desktop polish | Window-aware spacing, drag/drop when supported, keyboard shortcuts, responsive panes, platform menus | A responsive web layout or desktop web wrapper alone is not proof of a native application |

## Visual craft: composition and density

- **Hierarchy:** lead with the most useful page title and primary next action; present summary metrics before detailed tables only when this ordering improves the workflow.
- **Surfaces:** retain GC UI's *Canvas / Surface / Lens* separation. Use softly tinted Canvas, readable primary Surface, differentiated tonal/inset surfaces and limited Lens for navigation or ephemeral controls. Avoid the white-on-white “whiteout” failure and equally flat black-on-black dark themes.
- **Spacing:** align labels, icons, values, buttons, filters, headings and data axes on consistent visual grids. Use GC UI's current spacing/shape tokens; do not derive production values from pixel estimates of compressed screenshots.
- **Typography:** readable headings, strong titles, accessible body text, stable numeric alignment and careful secondary labels. Avoid tiny washed-out charts or low-contrast metadata merely to match a screenshot.
- **Iconography:** a single coherent family or well-governed set with consistent stroke/size/meaning. Support text labels, tooltips and accessible names where needed.
- **Color:** reserve color for navigational selection, priority, category, identity, trends or system meaning. Repeat semantic meaning consistently; reinforce with text, shapes or icons.
- **Depth and motion:** use subtle elevation, clean boundaries, purposeful transitions and interaction feedback; reduce/disable optional effects for reduced-motion/contrast/transparency conditions.
- **Data density:** allow product-appropriate compact and comfortable layouts. A calendar or inbox can be dense; a personal home should feel more spacious. Do not force decorative charts into tools that do not need them.

The prior conversation displayed an **illustrative, nonbinding** accent sample: `#6839E8`, `#4C6CEB`, `#54A4F4`, `#18A982`, `#ED737D`, and `#24242A`. These are **not approved GC UI tokens or a palette change**. The existing GC UI Iris, Lagoon, Ember and Moss seed palettes and the current semantic theme specification remain authoritative until changed through normal design control.

## Interaction and accessibility expectations

For all applicable designs, evaluate keyboard navigation and visible focus; touch-target comfort; screen-reader role/name/state; reduced motion; high contrast and forced colors; zoom and text scaling; light/dark appearance; responsive widths and orientation; RTL readiness where supported; predictable back navigation; full error, loading, empty and offline states; dynamic live announcements; and accessible alternatives for charts. Preserve selectable/copyable text and offer direct actions only when implemented.

Use exact backend-derived status for completion, failures, security, availability and permissions. A visual “success” chip, connected icon, interactive chart, payment count, AI suggestion, task timer or file-sharing menu is not evidence of a functioning implementation.

## Proposed product-specific applications

| GoreeCloud product | Suggested visual patterns | Product-specific guardrail |
| --- | --- | --- |
| **GoreeCloud UI** (`gc-ui`) | Tokens, card and metric patterns, layout shell, navigation, chart guidance, coherent editor/list/dialog components | Central design authority; validate components and versioned contracts before declaring consumers conformant |
| **GoreeCloud DNS** | Resolver activity charts, query trends, filtering categories, protection status, log tables, clear diagnostics | Never fabricate AdGuard Home metrics or claim blocking without backend evidence |
| **GoreeCloud Sync** | File-manager navigation, transfers, device state, queue/progress rows, contextual panels and activity history | Preserve clear separation between Syncthing and LocalSend backend capabilities |
| **GoreeCloud Gateway** | Service health, route tables, configuration forms, change previews, certificates and traffic analytics | Show validated Caddy state and honest deployment/change outcomes |
| **GoreeCloud Search** | Search bar, scope and filter chips, result cards/lists, keyboard navigation, accessible relevance explanation | Explain index/source provenance and unavailable providers; do not imply universal search where absent |
| **GoreeCloud desktop applications** | Native-style windows, adaptive panes, keyboard shortcuts, status and settings surfaces | Genuine native platform behavior and packaging must be evaluated separately |
| **Other GoreeCloud tools** | Reuse appropriate GC UI primitives and product-relevant modules instead of copying full unrelated dashboards | Architecture and capability should determine density and the available controls |

These mappings are **recommendations**, not assertions that any named consumer is implemented, migrated, released, or passing tests. They reflect the earlier discussion of DNS, Sync, Gateway, Search and shared desktop/web visual standards.

## Suggested implementation sequence (not an approved release commitment)

1. **Inventory and compare.** For a given GoreeCloud app, inspect its verified current build, existing design tokens and relevant components. Compare entire visible screens with these references, owner-specific mockups and controlling GC UI specifications.
2. **Strengthen shared foundations.** Fill actual gaps in semantic typography, tonal surfaces, density, navigation states, layout grids and action patterns, with high-contrast and light/dark validation.
3. **Build functional vertical patterns.** Introduce tested dashboard widgets, chart legends, filter controls, data tables, calendar/timeline layouts, search, quick capture and detail panels only where product needs justify them.
4. **Apply platform adaptation.** Validate expanded desktop layouts, constrained windows, tablets and narrow devices, then implement genuine native UI and OS interactions where required.
5. **Prove quality.** Capture before-and-after **screenshots from the real build**; check spacing, scale, contrast, semantic color, chart readability, card quality, navigation, all UI states, keyboard/screen-reader interactions and regression behavior.
6. **Record honest adoption.** Keep repository-specific implementation evidence, pending gaps and release scope current; do not mark screenshot inspiration as shipped functionality or migration completion.

**Visual acceptance:** A screen should look intentional, complete, visually distinctive, professionally composed, readable, accessible and purpose-built; it must also work. A merely functioning generic component demo or static screenshot recreation is not a sufficient product release.

## Reference limitations and reuse rights

- The 18 screenshots were presented as images in the founder's GoreeCloud project conversation on October 27, 2026. This Markdown file preserves their **identifiers, observations and design insights**, **not the original image bytes**. The source images may not be independently accessible from this repository.
- Branding visible in the images is identifying context, not product endorsement or authorization to reproduce third-party graphics, text, logos, data or compositions. The provenance and licensing of the supplied screenshots have not been verified; **do not publish or redistribute the images as repository assets without verifying rights**.
- Some source images are marketing mockups, historical designs, cropped previews or stylized renders. They do **not** prove responsive behavior, accessibility, working interactions, current vendor features or runtime performance.
- The atlas is qualitative and does not assert verified competitor capabilities. A product comparison requires separate research and source checks.

## Governing and implementation cross-references

- [GC UI design language](DESIGN_LANGUAGE.md): identity, Canvas/Surface/Lens material hierarchy, typography, motion, interaction and responsive principles.
- [Color and theme specification](COLOR_THEMES.md): semantic roles, approved seed palettes, balanced surface color, contrast and accessibility precedence.
- [Adaptive shell contract](ADAPTIVE_SHELL.md): existing reference breakpoints, navigation landmarks, focus and sheet behavior, with explicit alpha limitations.
- [Component contract](COMPONENTS.md): supported alpha controls, semantic behavior and known implementation limitations.
- [Design-system succession](DESIGN_SYSTEM_SUCCESSION.md): exclusive design authority and migration evidence requirements.
- [Current consumer reconciliation](CURRENT_CONSUMER_RECONCILIATION_2026_10_17.md): recorded consumer mapping status rather than assumed ecosystem-wide completion.
- GoreeCloud Google Drive: `GoreeCloud/GoreeCloud-Instructions.md` (governance); `GoreeCloud/Strategy/GoreeCloud-UI-Founders-Vision-and-Architectural-Standards.md` (founder vision); `GoreeCloud/Memory.md` (project memory). These external records retain their own identity and authority.

**Verification scope:** The user-supplied conversation screenshots, current master instructions, existing GC UI founder-vision record, and listed repository design documents informed this atlas. This document records **design reference analysis only**; it does not claim that any UI was modified, screenshot assets archived, test run, native app rebuilt, external vendor audited or feature shipped.
