# GC UI — Evidence-driven consumer cutover readiness

**As of 2026-10-18:** GC UI is the approved **future exclusive successor** to Glaze.
This is not proof that the current deployed applications have switched.
The verified public **Foundations 1.0.1 GitHub tarball** is a narrow stable contract;
the development repository and optional component catalog remain alpha.

## Machine-checkable inventory, not an acceptance certificate

Use `npm run migration:cutover:readiness -- --json` for a read-only report
derived **only** from GC UI's already-versioned
`registry/consumer-migration-reconciliation.v1.json` and
`registry/design-authority.v1.json`. No GitHub consumer, npm account or Google
Drive material is fetched or changed.

The 18 historical consumer entries contain **zero** accepted migrations:
14 known repository identities (including four verified non-root UI source
paths), three product identity mappings needing confirmation, and one unresolved
product. Existing static source audits remain marked `not-run` in this ledger:
separate historical source checks do not silently update it.
Do not assume all 18 have active running UIs.

**Two distinct exit contracts:**

- `npm run migration:cutover:readiness -- --check` exits zero when the
  *blocked report is internally consistent*; this is suitable for core CI and
  is not a release-pass signal.
- `npm run migration:cutover:readiness -- --strict` exits **2** until consumer
  rollout and retirement proofs actually exist. Treat 2 as **blocked**, not
  as a broken audit script.

## Ordered execution gates

1. Confirm the exact **current** owning product, repo, UI subtree and runtime
   for each entry, resolving Care / Advanced Tab Manager / Privacy Center and
   the unresolved Notes mapping before assigning migrations.
2. With separate access to an owning consumer, run the existing **read-only**
   `npm run migration:audit -- --root <authorized-checkout> --json --strict`
   against a pinned current revision; preserve `incomplete` and `review`
   results. Never convert absence of string matches into GC UI acceptance.
3. In that **authorized consumer's** repository, implement independently
   designed GC UI semantic tokens and appropriate web/native controls. Confirm
   what subset of the supported Foundations API or separately experimental
   components the app actually uses. No mechanical Glaze renaming.
4. Prove installed artifact/version, no remaining live legacy dependencies,
   product-specific keyboard/AT/contrast, runtime/security, visual, responsive
   and rollback/rollout evidence with owner acceptance.
5. Supersede actual Drive Standards/Policies records **through their authorized
   governance process** and verify source readback; this GC UI project has
   read-only Drive access.
6. Only after no verified active legacy consumer/dependency remains and
   authority/recovery/legal retention are documented may the independently
   authorized predecessor retirement and cutover statuses be advanced.

The npm registry is a **parallel distribution route**, not a universal
prerequisite for consuming a verified GitHub release tarball. Publication
still requires its own authorized npm identity and exact-byte checks.

**Not performed by this gate:** consumer repository access or modifications,
npm publication, governance edits, product release, Glaze retirement or
promotion of `allConsumerMigrationsVerified` /
`exclusiveCutoverCompleted` flags. See issues
[#13](https://github.com/GoreeCloud/gc-ui/issues/13) and
[#28](https://github.com/GoreeCloud/gc-ui/issues/28).
