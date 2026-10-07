# DayFlow

A calm, local-first daily operating system for work, study, habits, meetings, rest and everything in between. Built with Expo SDK 57, React Native, TypeScript, Expo Router, NativeWind 4, source-owned React Native Reusables-style primitives, Reanimated, Moti and Expo Notifications. Native Skia is used only for circular progress; web uses SVG.

## Run

Requires Node 22.13+ or a compatible current LTS version, and npm.

```sh
npm install
npm start
```

Scan the terminal QR code with a compatible Expo Go app, or use an Expo development build. `npm run android` opens an available Android emulator; `npm run ios` requires macOS and Xcode. `npm run web` starts the development browser preview. For the exported preview, run `npm run export:web` followed by `npm run preview`, then open `http://localhost:4173`.

First launch opens onboarding. Choose **Explore an example day** for realistic sample data with an explicit 10:15 AM example clock. The development preview also supports `/?demo=1` on a fresh installation. **Make it yours** starts a fresh personal plan and adds a morning routine. Completing onboarding replaces example data, so use it before entering a real plan.

## Included

- Four-step onboarding: name, schedule type, work days/hours, waking/sleeping, reminder style and daily goals.
- Today dashboard with live greeting/time, progress, focus time, next activity, date strip, filters and a full day timeline.
- Quick Add for tasks, reminders, habits, meetings, focus and personal activities. Dates, durations, categories, notes, recurrence and reminder lead time are editable.
- Local gap suggestions, overlap notices, per-occurrence completion, editing and moving one-off activities to tomorrow.
- Routines with editable steps, weekday recurrence and enable/pause controls.
- Daily, weekly and upcoming calendar views, search, date navigation and a desktop month picker.
- Focus timer with deadline-based timing, pause/resume, partial-session saving and task completion.
- Insights based on actual saved activities and focus sessions, daily reflection, missed/open/completed distinction, and tomorrow preview.
- Light/dark/system appearance, schedule settings, reminder preferences and optional notification permission.
- Versioned AsyncStorage persistence. No backend, account, remote analytics or API key.

## Reminders

Native `expo-notifications` schedules local reminders, with an Android channel and a **Mark complete** action. Each device manages its own queue. Gentle/balanced/proactive modes have daily budgets of 4/8/12 and minimum spacing of 45/25/15 minutes. Meetings and explicit reminders take priority over routine nudges when the budget is small. Sleep quiet hours, completed tasks, active focus, habit/break preferences and a rolling 48-notification cap are enforced. Focus completion uses one additional notification.

Browser preview does not deliver native notifications and explains this in the UI. Permissions are requested only from an explicit button/switch. Demo plans never schedule notifications. Local notifications do not need a push server.

Android Expo Go supports DayFlow's local reminders. The SDK 57 notification barrel also starts remote push-token registration at import time, which fails in Expo Go. DayFlow isolates the local APIs in `expo-local-notifications.native.ts` to avoid that initializer, without disabling reminders. Its regression tests inspect the actual SDK import graph. If remote push is added later, use a development build; do not reintroduce the push barrel into the local adapter. After updating this code, restart Metro with `npx expo start --clear` and reload Expo Go.

Reconciliation runs on data changes, foregrounding and notification responses. If the app stays closed for more than seven days, open it to refresh the rolling queue. Follow-up and missed reminders are reconciled against the latest stored state; the operating system cannot run arbitrary task-state checks at delivery time. Native delivery should be verified on a device before release, including permission denied, completion cancellation, quiet hours, foreground/background delivery and timer expiry after app termination.

## Validate

```sh
npm run typecheck
npm test
npm run export:web
npx expo export --platform all
```

Tests cover recurrence and day-specific completion, capacity-aware free slots, conflicts, quiet hours including overnight schedules, notification budgets/spacing/caps, deadline-based focus timing and storage validation. The Node test runner compiles isolated domain tests into ignored `artifacts/test` without modifying application data.

See [competitor research](docs/RESEARCH.md), [architecture/user flows](docs/ARCHITECTURE.md), and [the selected visual theme](docs/THEME.md).

## Release notes

Web, iOS and Android bundle export verifies JavaScript compilation, not a signed native application or actual notification delivery. A physical device build and delivery QA remain required for release.

The dependency audit was reviewed during development. Targeted overrides update URI decoding, selector parsing and UUID handling while retaining compatible Expo/NativeWind versions. The remaining audit findings originate in upstream `braces` pattern parsing and `node-forge` signature verification, propagated through build dependencies. npm's suggested force fixes downgrade or replace the required framework stack; they were not applied. Re-check the audit and upstream patches before release.

Local storage is not a backup and is not encrypted by the app. Clearing app/browser storage removes the plan. Cloud sync, external calendar imports, AI scheduling, widgets and wearables are intentionally left as extension points rather than simulated features.
