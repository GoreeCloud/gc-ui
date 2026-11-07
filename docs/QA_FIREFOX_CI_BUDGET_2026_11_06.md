# GC UI Firefox CI cold-mirror timeout diagnosis — November 6, 2026

**Scope:** Development CI time budgeting, not production deployment, accessibility waiver or security certification.

The [PR #205 Firefox job](https://github.com/GoreeCloud/gc-ui/actions/runs/42315841726), id `128228095822`, was cancelled at its previous **20-minute** job limit. The complete GitHub log, not an inferred timeout or a failing test assertion, shows:

- **00:03:37 UTC, Nov 7**: `npx playwright install --with-deps firefox` began, including updating Ubuntu apt indexes and downloading large browser/OS package dependencies from the hosted runner's configured mirror.
- **00:19:27**: Firefox installation finished (about **15 minutes 50 seconds**); the Foundations fixture verified.
- **00:19:27–00:23:24**: The Firefox interaction suite and retained visual/contrast/Seal evidence verifiers ran. No failed assertions were recorded in the finished steps.
- **00:23:24**: The separate native 200%/400% zoom step began with another `apt-get update`, despite the earlier Playwright `--with-deps` refresh.
- **00:23:44**: GitHub cancelled the remaining native zoom step at the deadline, then uploaded the failure/cancellation evidence. This cannot count as a successful native zoom result.

**Candidate correction:** Increase only the Firefox job's explicit time budget from **20 to 35 minutes**, and remove only the *second* apt-index refresh inside native zoom. Continue installing the needed X11 packages, running genuine browser zoom, all Firefox tests, screenshot/contrast checks, and uploading artifacts. The larger bounded budget accommodates variable distro mirror performance rather than skipping tests. The new `tests/ci-firefox-budget.test.mjs` checks this scope and prevents loss of required checks.

**Verification boundary:** Local source tests and full repository tests establish syntactic and contract integrity, not hosted performance. Validate this branch with exact-head hosted workflows, then verify final `main` after merge. Mirrors may remain unreliable; the adjusted timeout is not a guarantee. Main branch protection and independent security review remain separately gated. No sensitive device setting or production permission is changed.
