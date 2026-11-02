# GC UI — Compact navigation scroll/focus acceptance evidence

**Source baseline:** main 85a306115ff0f19fdd5452a5fb9db065f78ede6a. This adds QA coverage to the experimental Adaptive Shell; it does not alter UI styling or navigation runtime.

The floating mobile navigation was investigated after a preliminary screenshot/instantaneous hit-test suggested that breadcrumb or route-heading focus might be hidden behind chrome. That initial measurement happened during an in-progress default smooth-scroll animation. Once the animation settled, no persistent obstruction was confirmed in the tested states. A speculative visual fix is not warranted from that observation.

The repeatable Playwright scenario checks the actual browser at six responsive variants spanning 320, 375 and 599 CSS px, 568/812 CSS px heights, LTR/RTL, and reduced/default motion. Each variant:

- scrolls to the final document position and checks that the footer link is actually hit-testable and clears the floating bottom dock by at least 80 CSS px;
- activates the bottom-navigation Activity route from that final scroll position;
- asserts that the destination heading receives focus and becomes fully visible below the floating top chrome after any smooth scrolling settles;
- attaches a viewport screenshot of the footer state and a machine-readable before/after geometry report.

**Results:** six of six scenarios passed locally in Chromium and six of six in Firefox on the review branch. These are actual browser focus/hit tests, not a certification of all intermediate scrolling, every dialog, touch hardware, OS accessibility settings, human listening, or complete visual acceptance.

The existing full-page visual evidence, unresolved axe incompletes, translated RTL quality, human assistive-technology review, and release approvals remain separate acceptance obligations. No Stable/Seal declaration or production deployment is inferred.

Related: [stabilization issue #78](https://github.com/GoreeCloud/gc-ui/issues/78), [experimental acceptance overview](QA_EXPANDED_VISUAL_AT_RELEASE_2026_11_01.md).
