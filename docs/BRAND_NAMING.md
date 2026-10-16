# GoreeCloud UI — official name and usage

**Full public name:** GoreeCloud UI

**Short name:** GC UI

The acronym can be explained as **GoreeCloud User Interface** or **GoreeCloud UI**, but use **GoreeCloud UI** whenever the full product name is required in product copy. Do not use `GoreeCloud User Interface` as the main product title.

## Display

- **Official names, browser titles, introductory descriptions, package descriptions and formal publication headers:** use **GoreeCloud UI**, optionally followed by **(GC UI)** when introducing the short form.
- **Compact interface chrome, logos, navigation, limited-width headings, token documentation and repeated mentions:** use **GC UI**.
- **Visual identity:** existing GC glyph and logos are compatible with the short form. Do not expand a narrow brand lockup if it harms the adaptive layout.
- **Developer contracts:** retain `GoreeCloud/gc-ui`, `@goreecloud/gc-ui`, `gc-` CSS selectors, `--gc-` tokens and published path names. Naming guidelines do not authorize breaking programmatic APIs.
- **Brand scope:** GC UI is an independent GoreeCloud design system, not Glaze UI. Do not rename, alter or depend on Glaze UI to implement these conventions.

## Copy examples

Correct: "GoreeCloud UI is GoreeCloud's adaptive design language."

Correct: "GC UI components", "GC UI workspace", or a compact navigation label "GC UI".

Avoid as the canonical title: "GoreeCloud User Interface Design System". Use "GoreeCloud UI Design System" instead.

## Screenshot and QA guidance

The adaptive demo intentionally repeats illustration-only metrics across Overview, Activity and Library; it demonstrates responsive navigation, selection, heading updates and the modal side sheet, **not** real application data or full page routing. Brand terminology should be checked without conflating repeated sample content with a live data implementation.

The name rule is checked by `tests/brand-naming.test.mjs`. Existing accessibility, interaction and layout tests remain release gates.
