# GoreeCloud UI — Web runtime privacy/source guard

**Scope:** Read-only, dependency-free automated **source heuristic** for the shipped `src/*.js` modules and semantic CSS, integrated into `npm test`. Source inspection confirmed no direct use of fetch, XHR, sockets, beacon, browser storage, cookie access, service-worker registration or remote CSS imports among current published modules. The guard fails CI when such patterns are added without an explicit design and risk review.

One narrowly inspected exception is `src/elements.js`: the icon web component inserts **locally generated, name-validated** `iconSvg(...)` markup into its own shadow root. The guard permits only that exact assignment pattern and flags other HTML write assignments. This **does not certify** all icon rendering safe against future source changes, browser exploits or hostile extensions; recheck its sanitization on edits.

**What this does not prove:** clever network access through dynamic properties, import indirection, CSS obfuscation, unknown browser APIs, actual consumer activity, private data flows or an externally verified Wardveil/GoreeShield risk assessment. Do not treat these checks as a sandbox, consent policy, penetration test or full release supply-chain audit. The 1.0 `source-security-privacy` evidence gate remains OPEN; finish source, dependency, asset/license and platform review on the exact candidate SHA.

GoreeShield is the privacy steward, Wardveil cybersecurity, Mesh integration, Identity authentication/authorization; GoreeCloud UI components remain presentation-only. No mandatory accent color or appearance is imposed by this guard.
