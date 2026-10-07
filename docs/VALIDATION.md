# Validation

Validated on 7 October 2026 in the provided Windows workspace.

- TypeScript strict checking passes.
- Ten domain tests pass: recurrence, per-occurrence completion, gap capacity and conflicts, quiet hours (including daytime sleep), paused routine history, reminder budgets/spacing/focus suppression, meeting priority within a constrained budget, queue limits, focus pause/resume timing, input validation and storage schema validation.
- Expo exports web, iOS and Android JavaScript/Hermes bundles. This is compilation validation, not a signed native device build.
- Browser checks cover Quick Add required-title validation, creation, task completion and reload persistence; calendar day/week/upcoming and schedule search; dark/light theme; routine creation and enabled state; focus start/pause/reload/resume/finish; daily reflection saving and review view; four-step onboarding to a clean personal schedule.
- Phone layout checked at 390×844. Wide layout checked with the sidebar and contextual columns. Screen height handling keeps navigation visible on shorter desktop viewports.
- Native notification delivery, native gestures/haptics and Skia rendering require device QA. No claim of physical-device verification is made.

## Android Expo Go import regression

The notification integration now avoids the SDK 57 barrel's remote push-token registration side effect. Five additional regression tests cover Android service loading, the installed SDK's transitive local import graph, permission/channel/category setup, queue ownership and local/focus scheduling, and completion-action cleanup. The full suite contains 15 passing tests. These checks do not substitute for physical-device delivery testing.

An Android JavaScript export also compiles successfully. Inspection of that debug-check bundle confirms the Expo Go push-error text, push-token listener implementation, and automatic server-registration implementation are absent. The non-bytecode export is an ignored diagnostic artifact; normal application exports continue to use Hermes bytecode.

Dependency audit was reviewed and targeted patches applied. Remaining high-severity findings originate in upstream braces and node-forge and propagate through tooling dependencies. See the README release notes. Do not use npm audit's proposed framework downgrades as an automatic fix.

No cloud account, backend, push server, telemetry or external calendar access was used. All browser tests used generated example data or synthetic entries.

## Mobile layout correction

Five additional regression tests cover equal card widths, no overflow across phone/tablet and fractional layout measurements, larger Android font sizes, and correct selection of current/upcoming/unfinished activities. The suite contains 20 passing tests. The native card geometry is owned by static `View` styles rather than a Pressable callback, and captions are separated from values. Device validation remains necessary to confirm the final Android rendering and operating-system safe areas.
