# GoreeCloud UI — Owner-Provided Visual Reference Atlas (Web, Desktop and Mobile)

| Document control | Details |
| --- | --- |
| Document type | Owner-supplied visual reference analysis and proposed design guidance |
| Owner and perspective | GoreeCloud founder |
| Recorded | October 27, 2026; extended November 2 and November 3, 2026 |
| Scope | GoreeCloud UI (GC UI) and relevant GoreeCloud application interfaces |
| Status | Visual references documented; design interpretations proposed; implementation and adoption not established by these screenshots |
| Source | Eighteen reference screenshots supplied October 27, 2026; eight UX-pattern screenshots supplied November 2, 2026; one liquid-glass visual reference supplied November 3, 2026 (27 total, source images not committed) |
| Repository | `GoreeCloud/gc-ui`, `docs/OWNER_VISUAL_REFERENCE_ATLAS_2026_10_27.md` |

## My intent and the status of these references

I supplied two groups of screenshots as **examples of beautiful web-app and desktop-app user interfaces**, followed by eight mobile screenshots illustrating UX laws and responsive interaction feedback, and a further screenshot demonstrating a liquid-glass surface treatment. I want GoreeCloud's interfaces to reach this level of craft: sophisticated and organized yet inviting, visually expressive but practical, with clear navigation, readable information, richly functional screens, and details that feel intentionally designed.

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

- The 18 initial screenshots were presented in the founder's GoreeCloud project conversation on October 27, 2026; eight additional screenshots were supplied November 2, 2026; and one liquid-glass screenshot was supplied November 3, 2026. The later references are documented in the addenda below. This Markdown file preserves their **identifiers, observations and design insights**, **not the original image bytes**. The source images may not be independently accessible from this repository.
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

---

## Addendum — Five UX laws and three loading/feedback patterns (November 2, 2026)

**Provenance and classification.** I supplied eight smartphone screenshots of carousel-style UX educational posts on November 2, 2026. Five are attributed in the visible media to *Wadhah Aloui | UX/UI Designer*; the remaining three show *UX Dose* and a visible @UXBRAINY handle. These names identify the on-screen source attribution, not the creator or legal owner of underlying design rights. The screenshots were displayed within a TikTok-style mobile feed. **Only the educational slide content is the reference; the social-media shell, branding, avatars, social counters and interface chrome are not GC UI design targets.** File references below identify conversation uploads only; image bytes are not committed or licensed as repository assets.

These examples communicate usability concepts, not exhaustive scientific laws, an instruction to duplicate a third-party screenshot, or verified evidence that GoreeCloud currently implements the illustrated patterns. The founder supplied them for documentation. Proposed GC UI interpretations below must be reconciled with GC UI's existing specifications, the canonical Drive standards for rounded controls and floating navigation, actual product needs, and accessibility constraints before implementation.

### Third visual reference inventory (8 screenshots)

| Source screenshot | Visible lesson | Illustrated weak pattern | Illustrated stronger pattern | GC UI interpretation (proposed) |
| --- | --- | --- | --- | --- |
| `1225.png` | **Miller's Law** — manage cognitive load | Long unstructured application form | Form fields grouped into labeled sections | Chunk large forms into coherent, task-relevant groups; keep progress, current context and the ability to revisit earlier answers; do not impose a rigid seven-item limit |
| `1224.png` | **Law of Proximity** — spacing communicates relationships | Repetitive list content without clear item grouping | Each avatar and its metadata visually form a row, with larger gaps between groups | Place strongly related labels, values and actions closer together; increase spacing between unrelated records and sections; reinforce proximity semantically |
| `1223.png` | **Jakob's Law** — familiar conventions support comprehension | Ambiguous / unfamiliar navigation pictograms | Familiar home, search, bookmark/save and profile icons with labels | Reuse well-understood patterns and platform conventions while retaining original GC UI visual styling; label critical or potentially ambiguous actions |
| `1222.png` | **Fitts's Law** — target acquisition | Small Submit button high on a mobile form | Larger Submit action close to the bottom task flow | Make primary actions comfortably large, visually prominent and easy to reach; align bottom actions with safe-area and keyboard behavior rather than blindly placing every action at the edge |
| `1221.png` | **Hick–Hyman Law** — choice complexity | Six narrowly divided experience choices | Four broader, meaningfully differentiated ranges | Reduce unnecessary decisions and overlapping options; preserve legally/operationally necessary choices, explain consequences, and test category clarity rather than maximizing reduction |
| `1218.png` | **Immediate/optimistic feedback** — update first, sync later | User taps Like and waits while a spinner blocks feedback | Like state updates immediately, with network synchronization following | For safe reversible operations, update the local interaction state promptly and reconcile asynchronously; communicate queued/pending/failed state and allow rollback or retry; never fake irreversible or security-sensitive success |
| `1217.png` | **Show useful progress** — long operations | Uninformative "Uploading..." spinner | "Uploading 3 of 8", progress indicator and contextual time estimate | Prefer measured progress units (bytes, files or steps) and a realistic estimate **only when supported by actual measurements**; show indeterminate progress if no reliable denominator or ETA exists |
| `1216.png` | **Skeleton loading** — preserve perceived layout | Blank feed with centered spinner | Placeholder circles and lines approximating actual feed rows | Use shape-matched skeletons for predictably structured pending content; reserve loaded layout to avoid shift; show error/empty/offline states and never leave an indefinite skeleton without recovery |

**Attribution note:** The visible slides state simplified educational descriptions. The underlying laws are design heuristics, not universal equations for every interface or direct evidence that a specific arrangement is fastest. For example, reducing options is not inherently beneficial when it hides a needed answer; an optimistic update is inappropriate where a server-confirmed operation must precede the user-visible result.

### Proposed GC UI behavior contracts

#### 1. Information architecture, content grouping and decision quality

- Prefer one clear primary task per major screen, with related information grouped using proximity, headings, surfaces, alignment and appropriate nested spacing. Do not substitute arbitrary card walls for meaningful grouping.
- For longer forms, provide logical sections with persistent field labels, optional steps only where complexity warrants them, clear validation and preserved values. Grouping alone does not imply a wizard is better than a single-page form.
- Use the existing GC UI spacing scale and Canvas / Surface / Lens hierarchy; do **not** copy the example slides' violet, black or light-blue color scheme as normative GC UI tokens.
- Reduce redundant or nonfunctional actions while preserving user agency, accessibility and task completeness. Prefer progressive disclosure of advanced controls to silently removing essential choices.
- Keep navigation recognizable: consistent metaphors, textual or accessible labels, active states, focus order and native platform affordances. Apply the separate founder mandates for **rounded elements** and **floating GoreeCloud-controlled navigation bars**; do not copy the TikTok bottom bar.

#### 2. Reachability and accessible action placement

- Honor the current GC UI control contract: default controls are approximately 44 logical/CSS units high, touch-comfortable controls approximately 48, and target hit areas should generally be at least **44 × 44 logical/CSS units**, without treating these as a single universal legal accessibility threshold.
- Place the primary action near the task's conclusion when appropriate. On mobile, respect safe areas, browser/OS chrome, virtual keyboards, scroll endpoints and reachability; use sticky bottom actions only when they do not obscure content or compete with the floating navigation.
- Maintain visible focus, useful labels, selected/pressed/disabled states and full keyboard/screen-reader operability. Large visual targets do not excuse ambiguous meaning or poor contrast.

#### 3. Loading, progress and synchronization state models

Use explicit, testable states rather than a decorative spinner.

| Pattern | Minimum states | Preferred user communication | Required failure behavior |
| --- | --- | --- | --- |
| Skeleton-backed content | Initial, loading, loaded, empty, error, offline where applicable | Placeholder closely matches final layout; avoid excessive shimmering and announcements | Replace with accurate error/retry or offline explanation; no endless placeholder |
| Determinate job | Queued, running with measured progress, paused/cancelled where supported, completed, failed | `3 of 8 files` and progress bar, or bytes/steps with real denominator; optional ETA only if credible | Explain which work failed, what remains, and what retry/cancel/resume can actually do |
| Indeterminate job | Requested, in progress, complete, error/timeout | Honest status copy, activity indicator, optional stage or elapsed-time information | Escalate prolonged waiting to useful status, cancellation or recovery when technically supported |
| Optimistic reversible action | Initial, locally pending, server-confirmed, reconciliation failed, reverted or retried | Immediate visual reaction with a distinct pending state when relevant; live acknowledgment after confirmation | Roll back or clearly mark unsynced state and offer retry/undo without losing data or fabricating confirmation |

**Constraints and exceptions.** Prefer measured progress over artificial percentages; never invent elapsed-time-to-completion values. Do not equate a client-side visual toggle with a durable remote write. Treat payments, account deletion, permissions, credential changes, sensitive message delivery, and other security-critical or irreversible operations as server-validated workflows; do not optimistically announce completion. Offline-first queued actions may show local success *only when it is explicitly labeled as local/queued*, not as server confirmed.

For screen readers, announce meaningful status changes in a nonspammy live region; use `progressbar` semantics and real `aria-valuenow` values when determinate. Keep decorative skeleton elements out of the accessibility tree while presenting a concise loading status. Respect reduced motion and avoid shimmer-only feedback.

### Illustrative product-level applications — proposed, not shipped

- **GoreeCloud Messenger:** Familiar conversation/navigation controls, readable groupings, immediate draft/local actions, explicit queued/sending/sent/delivered/failed distinctions based on actual protocol and backend evidence, bounded skeletons for history loading.
- **GoreeCloud Drive/Sync:** File rows grouped by name and metadata; uploads with actual bytes/items completed and actionable retry; local queue status clearly differentiated from remote sync completion.
- **GoreeCloud Notepad:** Content-first editor, familiar Save/search actions, immediate locally persisted response where implemented, durable-save and cross-device-sync states clearly separated, meaningful loading/error recovery.
- **GoreeCloud Tasks:** Grouped work by project/date, reachable action controls, reduced redundant choices, clearly labeled completion pending/synced states, and progress when a multi-item operation is measurable.
- **GoreeCloud UI components:** Reusable FormSection, NavigationItem, ReachableAction, Skeleton, ProgressStatus and AsyncAction patterns may be evaluated against existing component catalog before adding anything new; names here are **conceptual**, not confirmed exports.

### Proposed acceptance and verification matrix

1. **Grouping / Miller / proximity:** Can a new user locate a field/record and recognize its related controls without scanning unrelated groups? Verify at phone, tablet, desktop, 200%/400% zoom, and enlarged text.
2. **Familiarity / Jakob:** Can an icon's meaning be identified without guesswork? Test accessible names, platform navigation, selected state, clear Back behavior, and alternate text where needed.
3. **Reachability / Fitts:** Can the primary action be activated reliably with touch, mouse and keyboard without overlap by floating navigation, keyboard or system gesture areas?
4. **Choice quality / Hick–Hyman:** Can the user select an accurate answer with no missing/overlapping ranges, misleading defaults or hidden requirements? Compare actual task outcomes rather than relying on number of options alone.
5. **Skeleton:** Does placeholder geometry resemble actual content, preserve layout, announce a useful loading status once, and terminate into loaded/empty/error/offline behavior?
6. **Progress:** Do visible fractions/percentages reconcile with real operation metrics? Is ETA omitted when not defensible? Are partial failures and cancellation/retry correctly represented?
7. **Optimistic action:** Is provisional UI state distinguishable where needed? Does reconciliation either confirm or recover correctly under offline, timeout, duplicate-request and server-rejection tests?
8. **Visual compliance:** Confirm current GC UI semantic roles, rounded geometry, floating navigation, high contrast, reduced motion, themes and platform-native interaction conventions in actual rendered builds.

**Evidence required before adopting as implemented:** Relevant source-code paths and contract tests, integration traces for server operations, accessibility checks, and before/after screenshots from the actual GoreeCloud application. None of those verification steps were performed for these reference images.

### Source-handling and governing references

- The eight uploaded files are `1225.png`, `1224.png`, `1223.png`, `1222.png`, `1221.png`, `1218.png`, `1217.png`, and `1216.png` in the November 2, 2026 conversation. They are not archived in this repository or the canonical GoreeCloud Drive; their identifiers are retained as provenance pointers, not assumed permanent URLs.
- Visible TikTok-style surrounding controls are incidental context. No image/copy/brand asset licensing, attribution permission, or permission to republish the source media was verified.
- Canonical design system and component contracts: [GC UI specification](GC_UI_1_0_SPECIFICATION.md), [component guidance](COMPONENTS.md), [interaction and motion](MOTION_INPUT.md), [accessibility and release](ACCESSIBILITY_RELEASE.md), and [theme specification](COLOR_THEMES.md).
- Existing founder standards are authoritative in Google Drive: [Universal Rounded UI Elements](https://drive.google.com/file/d/1JXamkBbF9T1EZIMDhcthmQV6ewLSQmTZ/view) and [Universal Floating Navigation Bars](https://drive.google.com/file/d/1Sh4JTGPM49gWk0VrqVDQN1qJ7ZkBJl0k/view). This addendum proposes interpretations and does not amend either standard.
- **Status:** Visual educational references reviewed and documented. Source screenshots not committed. No production code, design tokens, APIs, releases, integrations or consumer apps changed or verified through this documentation-only update.


---

## Addendum — Liquid glass material reference (November 3, 2026)

**Source and status.** I supplied the image \`Screenshot_20261103-162733_TikTok_1.png\` on November 3, 2026, with the instruction “Document this.” The visible design-demo text says **“Liquid glass”**, **“Blur, light edges, depth.”**, and **“Use it for: cards, nav bars, buttons.”** This is a founder-supplied aesthetic reference for evaluation, not a directive to copy another product’s implementation or an assertion that the depicted effect has already shipped in GC UI. The source image bytes are **not** part of this repository. Its creator, licensing, ownership and right to redistribute have not been verified; do not commit or redistribute them without clearance.

### Visible reference anatomy — observation, not measured specifications

| Element | What the supplied screenshot visibly shows | Implication for GC UI (proposed) |
| --- | --- | --- |
| Ambient background | White or near-white canvas with broad, soft-focus blue light at left, orange toward upper right, and pink/magenta toward lower right | Study restrained, semantic environmental light; do not elevate the screenshot's exact colors to brand tokens |
| Material panel | A large centered horizontal rectangle with generously rounded corners and partially visible color through the fill | Use a bounded **Lens** region above a distinct Canvas; maintain hierarchy with surrounding opaque Surface content |
| Translucency | Diffused color behind the panel remains perceptible, without sharp detail | Prefer progressive backdrop blur and a clearly legible solid fallback; alpha/blur values are implementation choices, not verified screenshot measurements |
| Edge and elevation | Thin bright hairline outline, modest soft shadow, softly illuminated edges | A subtle outline and local elevation can separate the floating panel without heavy borders, nested glass or excessive glow |
| Content | Large white bold heading and a smaller white supporting sentence aligned to the left near the lower portion of the panel | Ensure foreground pairing and real composited contrast; the screenshot alone does not establish that these white letters pass contrast |
| Intended examples | The demo caption suggests cards, navigation bars and buttons | Treat that caption as *source guidance*, not blanket GC UI permission: existing GC UI places Lens primarily on floating navigation and short-lived controls |

The screenshot is a **static promotional demonstration**. It cannot substantiate an actual backdrop-filter implementation, CSS values, hardware blur support, motion behavior, accessibility, responsive behavior, dark-mode appearance or functional controls. No pixel-exact palette, opacity, radius or shadow was sampled or approved.

### Translation into GoreeCloud UI — proposed pattern, not a new authority

Use GC UI's existing **Canvas → Surface → Lens** architecture. Canvas carries calm, optional ambient color; opaque or tonal Surface carries ordinary data and reading content; Lens differentiates selected foreground navigation, toolbars, compact action clusters or transient UI. The hierarchy follows [Design Language](DESIGN_LANGUAGE.md), [Component Contract](COMPONENTS.md), and [Contextual Surface & Environmental Light](SURFACES_ENVIRONMENT.md). In particular, the existing material specification limits environmental illumination to two static, diffuse, semantic container-color washes and budgets **one dominant Lens and up to two auxiliary Lens regions per viewport**. A literal recreation with three conspicuous colored glows is not the current recommended default.

**Recommended applications.** Consider a floating bottom navigation dock, compact overlay toolbar, small contextual popover, or carefully scoped primary control area. A selected hero/promo demonstration may use the treatment where the effect contributes clear hierarchy. Standard cards, data tables, file lists, forms, dashboards, long text, security alerts and critical workflows should normally use the existing opaque/tonal Surface treatments. Avoid glass-on-glass stacking and making the background itself a control-state indicator.

**Existing implementation surfaces to reuse, not fork:** \`styles/gc.v1.materials.css\`, \`src/gc-surface-runtime.mjs\`, and the \`data-gc-treatment="lens"\` contract documented in [Surface & Environment](SURFACES_ENVIRONMENT.md); respect [Token Implementation](TOKENS_IMPLEMENTATION.md) and active semantic foreground/background roles. These paths are references to the repository's documented implementation surface, **not evidence that this screenshot's precise appearance is implemented or approved**. No new palette, token namespace, component API or dependency is approved by this addendum.

**Suggested web implementation approach for future evaluation (conceptual):**

1. Render a stable, opaque Canvas first. Apply only approved semantic environmental washes when illumination is enabled; keep them static, diffuse and spatially restrained.
2. Create the Lens using the existing GC UI treatment/token path. Progressive \`backdrop-filter\` blur/saturation may enhance it where supported, but must never be the only reason the text or controls are readable.
3. Use a restrained light edge, semantic outline and grounded shadow; retain the GC UI corner scale and visual focus state independently of translucency.
4. Place short labels and actionable controls on Lens. Prefer a stable inset or solid backing for longer copy, numerals or dense metadata.
5. Preserve identical essential meaning and interaction when material effects are off; in \`forced-colors\`, elevated-contrast, reduced-transparency, low-performance and data-saving conditions, favor the opaque semantic fallback. Motion is not required for this reference.
6. Apply native platform materials and accessibility behavior when appropriate. Do not claim simulated CSS blur reproduces proprietary native optical behavior.

### Design acceptance and verification checklist

- **Composition:** Does the entire screen remain premium, purposeful and calm without overwhelming the content with gradient decoration?
- **Legibility:** Verify *rendered/composited* foreground/background contrast (target WCAG 2.2 AA: normally **4.5:1** for body text, **3:1** for qualifying large text and non-text UI boundaries); avoid assuming white text over a pink/blue scene is safe.
- **States:** Verify current, selected, pressed, hover, disabled, loading, open/closed and \`:focus-visible\` states where applicable. Do not rely on blur, color or light alone to communicate state.
- **Platforms:** Check narrow mobile widths, tablet and desktop layout, system text scaling, 200–400% zoom/reflow, touch targets, keyboard order, screen-reader names/states and RTL where supported.
- **Preferences:** Test light and dark appearance, high contrast and \`forced-colors\`, reduced transparency, reduced motion and illumination-off fallback.
- **Performance:** Compare GPU/frame behavior and memory usage on representative supported hardware; blur must degrade to an opaque treatment without losing navigation or tasks.
- **Fidelity:** Compare screenshots from the *running GC UI build* against this founder reference, while honoring semantic token constraints; record deviations and actual browser/device results.

**Acceptance state (November 3, 2026):** Reference interpretation documented only. No GC UI source component, token, repository asset, browser build, device deployment, customer interface, accessibility matrix or production release was changed, tested, approved or certified as a result of this visual documentation request.

**Governing cross-references:** [Design Language](DESIGN_LANGUAGE.md), [Surface & Environment](SURFACES_ENVIRONMENT.md), [Component Contract](COMPONENTS.md), [Token Implementation](TOKENS_IMPLEMENTATION.md), [Accessibility](ACCESSIBILITY.md), and the canonical GoreeCloud master instructions in Google Drive.