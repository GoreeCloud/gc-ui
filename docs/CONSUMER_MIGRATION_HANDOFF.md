# GC UI — consumer migration evidence handoff

**Source snapshot:** 2026-10-17 provider/ledger reconciliation. **Generated from:** `npm run migration:cutover:readiness -- --json`. **Not a live repo audit.**

**Current scope:** 18 historical products; 14 repository identities confirmed, 4 UI source subtrees verified, 3 mappings awaiting confirmation, 1 unresolved, **0 migration acceptances**.

Historical pinned revisions below are **evidence timestamps**, not claims that current `main` still matches. Only `GoreeCloud/gc-ui` is writable in this project. No downstream repository inspection, modification, publication or acceptance is authorized by this document.

## Blocking gates

- `read-only-drive-governance-not-superseded`
- `per-consumer-runtime-adoption-unverified`
- `separately-authorized-legacy-retirement-pending`
- `no-evidence-for-final-exclusive-cutover`

## Next verification actions (ordered by readiness)

### 1. Source subtree identified — request authorized source inspection

| Historical product | Dated repository evidence | Dated source path | Pinned revision | Next authorization/evidence action |
|---|---|---|---|---|
| GoreeCloud Website | GoreeCloud/static-websites | sites/main | `4746af244b8e59f4939fb327f923e3bbfff5e335` | Obtain authorized current-revision source audit and review runtime imports |
| GoreeCloud Reader | GoreeCloud/reader | apps | `402deebb7bfc2865f42d871d6e1dc9a8d20b40a8` | Obtain authorized current-revision source audit and review runtime imports |
| GoreeCloud Since | GoreeCloud/since | app | `8a4a90208e868fae11ab4dc5a3f32f7eb9901f55` | Obtain authorized current-revision source audit and review runtime imports |
| GoreeCloud Memos | GoreeCloud/memos | web | `538ef410ba8248ae83eb69dae9fba0ae0ed09cb3` | Obtain authorized current-revision source audit and review runtime imports |

### 2. Repository verified — establish whether a runnable UI exists

| Historical product | Dated repository evidence | Dated source path | Pinned revision | Next authorization/evidence action |
|---|---|---|---|---|
| GoreeCloud Manager | GoreeCloud/manager | . | `ebf5ea526c14a198ebaabf76fe923e82bddd2ad6` | Confirm whether runnable consumer UI exists, then identify the exact source subtree |
| GoreeCloud Tasks | GoreeCloud/tasks | . | `316e7d5c87da1a51cc20e3b47d73d1880a82167f` | Confirm whether runnable consumer UI exists, then identify the exact source subtree |
| GoreeCloud Launcher | GoreeCloud/launcher | . | `23f27b60e2b98aec00fa3e4a0ed17938000c2026` | Confirm whether runnable consumer UI exists, then identify the exact source subtree |
| GoreeCloud Keyboard | GoreeCloud/keyboard | . | `264dac81dabfdaf028851cf4dff09912c351f23b` | Confirm whether runnable consumer UI exists, then identify the exact source subtree |
| GoreeCloud Monitor | GoreeCloud/monitor | . | `46897de12f514a43da3a668e3e9c952e63e9dea6` | Confirm whether runnable consumer UI exists, then identify the exact source subtree |
| GoreeCloud Browser | GoreeCloud/browser | . | `32863174b623ff516ef885eb300c91564943637d` | Confirm whether runnable consumer UI exists, then identify the exact source subtree |
| GoreeCloud Security Center | GoreeCloud/security-center | . | `ba4b53ac8db03450fdbb2163cffa9bb60550ef35` | Confirm whether runnable consumer UI exists, then identify the exact source subtree |
| GoreeCloud Gallery | GoreeCloud/gallery | . | `99ba2db393f89c01558e89336140a802e5ef1a10` | Confirm whether runnable consumer UI exists, then identify the exact source subtree |
| GoreeCloud Notify | GoreeCloud/notify | . | `1e713ceee14fb2549e254f6532dbe38a64a8de22` | Confirm whether runnable consumer UI exists, then identify the exact source subtree |
| GoreeCloud News & Weather | GoreeCloud/news-weather | . | `c2aa6df47dae3629e83d9ba3ce9f727cb68fae0a` | Confirm whether runnable consumer UI exists, then identify the exact source subtree |

### 3. Product mapping needs owner confirmation

| Historical product | Dated repository evidence | Dated source path | Pinned revision | Next authorization/evidence action |
|---|---|---|---|---|
| GoreeCloud Care | GoreeCloud/zorin-os | Not verified | `4562f2fd1a2c389c51b05de08111f54efe52d109` | Confirm owner product mapping and current UI source subtree |
| GoreeCloud Advanced Tab Manager | GoreeCloud/firefox-addons | Not verified | `cf4aef5bb5f1108f5964b39f57ba768ea3733236` | Confirm owner product mapping and current UI source subtree |
| GoreeCloud Privacy Center | GoreeCloud/privacy-shield | Not verified | `8be5fee633f1da19b2d195dc6ae235c2f94d16d6` | Confirm owner product mapping and current UI source subtree |

### 4. Product identity unresolved

| Historical product | Dated repository evidence | Dated source path | Pinned revision | Next authorization/evidence action |
|---|---|---|---|---|
| GoreeCloud Notes | Unresolved | Not verified | Unresolved | Identify and authorize a current owning repository |

## Acceptance packet required for every product

1. Authorize access to the exact current owning repository and revision; confirm the runnable UI scope.
2. Audit legacy assets/imports and verify an installed supported GC UI scope, never just a string rename.
3. Record functional, keyboard/accessibility, security, supported-platform, rollout and rollback results with owner acceptance.

**Current ledger fact:** Every consumer is `staticSourceAudit: not-run`, `actualGcUiAcceptance: not-evaluated`, and `migrationComplete: false`. A clean static scan alone is not acceptance. Do not alter reconciliation flags until the actual independently authorized product release and verification evidence is available.

**Not automatically cleared by npm publication:** the stable Foundations subset is not the full GC UI, and package availability does not prove app migration. Governance supersession, individually verified consumer runtime migration, legacy retirement and exclusive cutover remain separate gates.
