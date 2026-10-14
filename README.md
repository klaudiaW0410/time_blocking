# Time Blocking App 🌿

A tranquil, minimalist time-blocking application designed around a 24-hour circular day visualization.

## Getting Started

### 1. In Browser (Web)
```bash
npx expo start --web
```
Opens the web version at `http://localhost:8081`.

### 2. On iOS Simulator
```bash
npx expo start --ios
```

### 3. On Apple Silicon Mac ("Designed for iPhone")
The application runs natively on Apple Silicon Macs (M1/M2/M3/M4) in a phone-proportioned window without requiring a separate macOS target:

1. Generate the native project:
   ```bash
   npx expo prebuild --platform ios
   ```
2. Open the Xcode workspace:
   ```bash
   open ios/timeblockingapp.xcworkspace
   ```
3. In Xcode's destination dropdown, choose:
   **"My Mac (Designed for iPhone)"**
4. Press **Run** (Cmd + R). The app launches in an iPhone-sized window with mouse, trackpad, and keyboard shortcuts (Enter to add tasks, Esc to dismiss sheets).

## Testing & Verification

```bash
# Unit tests (Jest)
npm test

# Strict TypeScript type check
npx tsc --noEmit

# Linting
npx expo lint
```

## Architecture

```text
src/
├── app/                  # Expo Router navigation (index.tsx, _layout.tsx)
├── components/           # UI Components:
│   ├── DayWheel.tsx      # 24-hour SVG circle with time needle
│   ├── BlockSheet.tsx    # Bottom sheet for block inspection & editing
│   ├── TaskRow.tsx       # Task card with checkbox and tint styling
│   ├── AddModal.tsx      # Modal for creating blocks or tasks
│   ├── TabBar.tsx        # Bottom tab bar with floating "+" action button
│   └── WidgetsView.tsx   # iOS WidgetKit mockups preview (Small, Medium, Lock Screen)
├── store/                # Zustand global state (blocks, tasks, persistence, themes)
├── lib/                  # Utilities:
│   ├── geometry.ts       # SVG 24-hour circular math (slicePath, polar coordinates)
│   ├── time.ts           # Time formatting and block collision/overlap detection
│   └── storage.ts        # Pluggable storage abstraction (swappable with Supabase)
└── theme/                # Pastel color tokens and spacing
```

## Documentation

Comprehensive project documentation is maintained in the `docs/` directory:

- [01-product-brief.md](docs/01-product-brief.md) — **Product Brief**: problem statement, user personas, competitive differentiators, and MVP scope.
- [backlog.md](docs/backlog.md) — **Backlog**: 8 epics and 35 user stories (TB-1 to TB-35) with priorities (P0–P2), sizing (S/M/L), Definition of Done, and sprint plan.
- [PLAYBOOK.md](docs/PLAYBOOK.md) — **Playbook**: end-to-end handbook for building commercial-grade applications (product discovery, architecture, CI/CD, TestFlight beta, and App Store submission).
