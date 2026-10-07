# DayFlow visual theme

Reference: [Admin Dashboard Mobile App by ByeWind](https://dribbble.com/shots/25031393-Admin-Dashboard-Mobile-App), inspected on 7 October 2026.

DayFlow adopts the reference's visual system across all screens while retaining its productivity features and existing saved data:

- Light gray (`#F7F7F7`) pages, white panels, 16px panel corners, and very subtle shadows.
- Bright blue (`#007AFF`) actions and navigation, with white foregrounds.
- A compact two-column metric grid. Blue cards alternate diagonally with black cards. The soft blue/cyan and black/charcoal gradients are confined to these cards.
- Native system typography: SF on Apple devices and the platform's equivalent elsewhere. Regular body labels, medium values, and restrained semibold headings.
- Small muted labels, metadata rows, centered mobile navigation titles, and compact white form panels.
- Lavender progress badges and chart lines, green completion badges, blue upcoming badges, and pale yellow attention states.
- Matching dark mode uses neutral black and charcoal surfaces with the same blue accent.

## Native mobile layout

Metric sizing belongs to regular native `View` containers, with measured equal-width columns and consistent rounded clipping. Captions occupy their own line under each value. Small containers and larger Android font settings switch to one readable column. Pressable callback styles are resolved into static styles before NativeWind/native interop; they do not own the cards' geometry. Android uses the platform's `sans-serif` family, while Apple platforms use `System`.

The mobile header uses three measured regions instead of an absolutely positioned title. The greeting separates the user's name from the salutation, and bottom navigation owns its safe-area padding. A first-day account gets an actionable empty progress panel. Unfinished activities remain visible instead of being described as “all clear.”

`src/theme.tsx` owns the colors. Shared primitives own text, panel and form styling. `MetricCard` and `OverviewChart` provide reusable dashboard treatments. Skia remains isolated to native progress rings and the focus timer; cards, charts, lists and forms use normal React Native/SVG components.

The reference's admin figures, author avatar and device mockup are not inserted into DayFlow. Metrics and charts are calculated from the user's stored activities, habits and focus sessions.
