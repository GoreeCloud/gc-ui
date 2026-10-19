# Foundations 1.0.1 — public npm registry handoff (NOT YET PUBLISHED)

**Release identity:** `@goreecloud/gc-ui@1.0.1`, Apache-2.0,
**Foundations-only**. Source `7e0b61ee70af2edb87aa736cca483425f0aacaf4`;
public GitHub [release](https://github.com/GoreeCloud/gc-ui/releases/tag/foundations-v1.0.1).
Expected SHA-256 of its ten-file package tarball:
`275d7e6dc9503b2e74b3190bcecf176d73d2345860e8a20fa5faa3b326cd2298`.
Do not publish the repository root `0.2.0-alpha.1` package; it is private
and exposes experimental APIs.

## Independent exact-byte handoff

Download the **actual release archive**, not a freshly packed alpha source.
A fresh download on the authorized GoreeCloud laptop (2026-10-18 local time)
was **16,043 bytes** and independently hashed to the expected SHA-256.
Verify every handoff again immediately before any publish:

```sh
curl -fL --retry 2 \
  https://github.com/GoreeCloud/gc-ui/releases/download/foundations-v1.0.1/goreecloud-gc-ui-1.0.1.tgz \
  -o /path/to/goreecloud-gc-ui-1.0.1.tgz

npm run release:foundations:handoff:verify -- \
  --artifact /path/to/goreecloud-gc-ui-1.0.1.tgz --json
```

The verifier fails closed on changed archive bytes, extraneous entries,
unsafe tar item types, unexpected package exports/dependencies/install scripts,
license and version mismatch, and per-file SHA-256 provenance failures.
The output `archiveVerified:true` only proves the exact *offline package*
readback; it always reports `npmPublished:false` as a non-claim.

## Missing npm identity and controlled publication

At this checkpoint `npm whoami --registry=https://registry.npmjs.org`
returned **ENEEDAUTH** and an unauthenticated
`npm view @goreecloud/gc-ui version` returned **404**. A 404 neither proves
the scope is unclaimed nor grants publishing rights. No token or credential
was read, stored, requested in chat, or inserted into GC UI source.

To finish issue [#28](https://github.com/GoreeCloud/gc-ui/issues/28),
the **owner-approved** npm organization must first authenticate using a
managed publishing identity and explicitly confirm scope/package write
permissions, publication visibility/version policy and provenance settings.
A designated authorized release operator must then verify the **unchanged
reviewed archive digest** and publish **that exact tarball**, using appropriate
public access and approved organization controls. Do not alter the released
GitHub artifact or repack it to make publication work.

After publication, require live public registry metadata for
`@goreecloud/gc-ui@1.0.1` including provenance/integrity, compare fetched
bytes against the reviewed SHA-256, and perform an independent fresh
**registry-installed** Node ESM/JSON/CSS/types/Chromium/Firefox consumer test.
Record scope ownership, operator approval, exact npm artifact integrity,
distribution identity and rollback steps in #28 before updating
`foundationsNpmRegistryPublished`.

**No npm publish was attempted here**. Foundations GitHub stability and the
separate experimental GC UI maturity remain unchanged.

## Repeatable, unauthenticated post-publication registry proof

From this repository, run:

```sh
npm run release:foundations:registry:readback -- --json --check
npm run release:foundations:registry:readback -- --strict
```

This read-only check uses only canonical public `registry.npmjs.org` endpoints
for the **exact version** `@goreecloud/gc-ui@1.0.1`. It never reads npm
credentials, uses third-party tarball URLs, publishes, logs in, changes tags,
or changes repository acceptance flags. It validates package identity, Apache-2.0
license, URL origin/path, npm SHA-512 integrity (and SHA-1 shasum when supplied),
and the tarball's **actual bytes against the pinned GitHub release SHA-256**.

A 403 or 404 means *public metadata unavailable to this unauthenticated probe*,
not that the scope is available or owned by GoreeCloud. `--check` exits zero
for this accurately blocked state and prints `verified:false`; `--strict`
exits **2** until all public artifact proofs pass. Unexpected HTTP, network,
malformed metadata, redirected/untrusted tarball URLs and checksum mismatches
fail closed with exit **3**, not a false unpublished claim.

The public metadata and tarball response bodies are streamed with a
**128-KiB hard cap each**, well above the reviewed 16,043-byte release
archive. Declared oversized or malformed `Content-Length` headers fail
before reading, and unexpectedly oversized streams are cancelled during
collection. This prevents a rogue or malfunctioning registry response from
requiring unbounded in-memory package evidence. Response-size rejection is
an integrity error, not evidence that npm publication is absent.

An exact-byte registry proof is necessary but does not establish the actual
publishing identity, organizational authorization, SLSA/signed provenance,
consumer TypeScript/browser adoption, owner release approval or rollback.
Preserve those separate checks and issue #28 until independently accepted.
