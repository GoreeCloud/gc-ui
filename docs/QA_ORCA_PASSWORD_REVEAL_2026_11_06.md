# GoreeCloud UI — Browser Orca Password-Reveal State Evidence

| Metadata | Scope |
| --- | --- |
| Verified baseline | Experimental GC UI Forms Lab on main `0fbb278c` |
| Test harness | `scripts/qa_browser_orca.py`, `scripts/qa-browser-orca.mjs` |
| Test contract | `scripts/test_qa_browser_orca.py` |
| Platform | Isolated Linux X11/AT-SPI, real Chromium + real Orca generated speech |
| Related work | UI accessibility [issue #78](https://github.com/GoreeCloud/gc-ui/issues/78) and translated control acceptance [issue #126](https://github.com/GoreeCloud/gc-ui/issues/126) |
| Maturity | **Experimental automated acceptance evidence only** |

## Scope

The existing fail-closed browser Orca harness already checks spoken menu and combobox interaction, observed named AT-SPI menu and combobox roles, and a local-only browser fixture. This update **preserves** those checks and adds a targeted password-reveal example.

The browser enters only `test-only-not-a-credential` in the local Forms Lab sample field, focuses the existing "Reveal sample passphrase" button, activates it once with the keyboard, then activates it again to re-mask. Both activations must preserve the exact stable accessible label and invented field value, change the native input `type`, and update `aria-pressed` as expected. The named control must appear in the live AT-SPI tree as a **toggle button**.

Two initial real Orca/AT-SPI executions observed both states on the isolated Linux laptop. After adding exact-name/value assertions, another run missed the temporary pressed state despite the browser verifying its own transition. That prompted the explicit AT-SPI observation gate above. Two independent gated exact-source runs subsequently passed all named-role, generated-speech, browser-phase and AT-SPI state gates, with stable accessible-name and invented-value preservation. The repository-wide `npm run check` passed 395/395 Node tests on the final gated source; Python Orca parser/state unit tests passed 6/6. The earlier ungated intermittent miss is retained as evidence of why the observation gate is necessary.

The isolated harness must observe both **not pressed** (masked) and **pressed** (revealed) states through AT-SPI itself. The browser holds the revealed state until a temporary local-only file gate confirms the external AT-SPI observer actually sampled it, or fails closed if the gate is not received. This prevents false failures caused by re-masking before the accessibility-tree observer can sample the transient state. Its real Orca debug log must contain fixture-specific generated speech identifying the named control, in addition to the pre-existing speech and role gates. Synthetic unit tests cover the state collector and speech parser independently.

## Privacy and trust boundaries

Only a local loopback HTTP fixture is opened. The test uses no real user data, secrets, external services, microphone input, persistent Orca preferences, actual audio capture, or system-wide desktop settings. It runs inside temporary X11 and D-Bus contexts. The synthetic example value must never be treated as a user password. No runtime password controller or stable Foundations API is modified by this QA evidence.

## Reproduction

```sh
npm run test:browser:orca:parsers
npm run qa:browser:orca
npm run check
```

The `qa:browser:orca` command requires actual system Orca, AT-SPI, Chromium, Xvfb and D-Bus dependencies. Missing platform support is a blocker; it is not a skipped pass. The harness fails closed on any absent accessible name/role, missing observed toggle state, missing generated speech class, or failed browser phase.

## Acceptance limits

This does **not** establish human-heard screen-reader quality, announcement timing, complete pressed/unpressed phrasing, NVDA/JAWS/VoiceOver/TalkBack behavior, translated screen-reader names, true RTL/IME entry, mobile keyboards, real credentials, physical-device acceptance, 200–400% zoom, or whole-product GoreeCloud UI Stable readiness. Orca generated speech and live AT-SPI state are separate evidence from human evaluation; unresolved acceptance work stays open.
