# DayFlow architecture

## User flow

First launch → four-step onboarding (identity and work/study pattern → waking/sleeping and working hours → reminder style → goals) → Today. Explore demo provides an explicitly labeled sample day with a fixed example clock. Personalization starts a fresh plan using real time.

Bottom navigation: Today / Calendar / Add / Insights / Profile. Wide screens use a sidebar and contextual right column. The same React Native screens run on native and web.

Today → complete/open an activity, start Focus, create an activity, or open Routines. Calendar → day/week/upcoming with search and date navigation. Insights → completion and focus history, daily review and tomorrow. Profile → appearance, schedule, reminders and onboarding. Routines → reusable steps, days, enable/disable, edit and delete.

## Code structure

- `app/`: Expo Router routes and navigation layout.
- `src/components/ui/`: source-owned React Native Reusables-style Button, Text, Switch and shared card/form/chip primitives.
- `src/components/`: timeline, activity detail, illustrations, responsive shell, progress visualization.
- `src/screens/`: composed screen views.
- `src/domain/`: typed activity, recurrence, date, focus and reminder logic independent of UI.
- `src/store/`: hydrated, versioned AsyncStorage state and typed actions.
- `src/services/`: native notification adapter with a safe web fallback.
- `tests/`: meaningful domain behavior checks (quiet hours, budgets, recurrence, conflicts, timer lifecycle).

## Data

Activities are dated once or repeated by weekday. Completions are stored per occurrence, so completing a recurring habit today does not complete tomorrow. Routines expand into activity templates with a routine ID. Focus runs use an absolute deadline; backgrounding does not make a one-second interval the source of truth. Historical focus sessions store seconds and date.

Schema-versioned local state is stored under a single namespaced key. Save errors appear to the user. Hydration rejects malformed storage and preserves a recovery message. State mutation is immutable, and notification rescheduling is serialized/debounced.

## Notification policy

Build a rolling seven-day plan with a global native pending-notification cap below iOS's 64-item limit. Policies consider lead/start reminders, optional follow-up/missed checks, habits, breaks and end-of-day review. They respect quiet hours, per-day budgets, minimum spacing, completion and active focus. Only DayFlow-owned notifications are replaced. Request permission from an explicit user action. Delivery capability is reported honestly on web.

The native adapter imports a local-only SDK facade rather than the `expo-notifications` barrel. In the installed SDK 57 package, the barrel's remote push-token auto-registration initializer throws on Android Expo Go, even for an app that only wants local reminders. The facade preserves local permissions, scheduling, foreground handling and completion actions in Expo Go and native builds. Regression checks inspect its transitive SDK imports and exercise the service with a push-barrel failure fixture. Revisit these build-module paths when upgrading Expo.

Future-day follow-ups can only be conditional when the app reconciles after completion. Native OS scheduled reminders do not execute arbitrary task-state checks at delivery time. Reconcile on foreground, mutation and notification response. No unsupported background AI is implied. A focus completion notification is managed separately from the daily reminder budget.

## Design system

The [selected Dribbble reference](https://dribbble.com/shots/25031393-Admin-Dashboard-Mobile-App) defines the current theme: blue/black metric cards, light gray pages, white panels, system typography, compact metadata, and small pastel status badges. Panels use 16px corners, subtle shadows and generous touch targets. Dark and system themes remain available. Motion uses brief Moti transitions and Reanimated press/progress feedback, honoring reduced-motion preferences. SVG handles charts and web progress; native Skia is isolated to circular progress. See [theme details](THEME.md).

## Extension points

Cloud sync can replace storage without changing domain records. Calendar adapters can import immutable external event IDs. Scheduling can evolve behind the gap finder. Widgets/wearables can consume occurrence selectors. No backend, credentials or calendar access is required in v1.
