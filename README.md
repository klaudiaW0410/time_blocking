# Time Blocking App 🌿

Spokojna, pastelowa aplikacja do planowania dnia za pomocą bloków czasowych i 24-godzinnego koła dnia (Time Blocking).

## Uruchamianie

### 1. W przeglądarce (Web)
```bash
npx expo start --web
```
Aplikacja otworzy się pod adresem `http://localhost:8081`.

### 2. Na symulatorze iPhone'a (iOS Simulator)
```bash
npx expo start --ios
```

### 3. Na Macu z Apple Silicon ("Designed for iPhone")
Aplikacja została zaprojektowana tak, aby działać na Macu z procesorem Apple Silicon (M1/M2/M3/M4) w oknie wielkości telefonu bez konieczności tworzenia osobnej wersji macOS:

1. Wygeneruj projekt natywny:
   ```bash
   npx expo prebuild --platform ios
   ```
2. Otwórz projekt w Xcode:
   ```bash
   open ios/timeblockingapp.xcworkspace
   ```
3. W pasku wyboru urządzenia docelowego w Xcode wybierz cel:
   **"My Mac (Designed for iPhone)"**
4. Kliknij **Run** (Cmd + R). Aplikacja uruchomi się w oknie o proporcjach telefonu z pełną obsługą myszy, klawiatury (Enter, Esc) i kółka przewijania.

## Testy i weryfikacja kodu

```bash
# Testy jednostkowe (Jest)
npm test

# Sprawdzanie typów TypeScript (Strict)
npx tsc --noEmit

# Linting
npx expo lint
```

## Architektura projektu

```text
src/
├── app/                  # Ekrany Expo Router (index.tsx, _layout.tsx)
├── components/           # Komponenty UI:
│   ├── DayWheel.tsx      # Koło 24-godzinne (SVG) ze wskaźnikiem czasu
│   ├── BlockSheet.tsx    # Dolny arkusz szczegółów i edycji bloku
│   ├── TaskRow.tsx       # Karta zadania z checklistą i etykietami
│   ├── AddModal.tsx      # Modal dodawania nowego bloku lub zadania
│   └── TabBar.tsx        # Dolny pasek nawigacji z pływającym przyciskiem "+"
├── store/                # Zustand: bloki czasowe, zadania, persistence
├── lib/                  # Pomocniki:
│   ├── geometry.ts       # Matematyka koła SVG (slicePath, kąty)
│   ├── time.ts           # Formatowanie, detekcja kolizji bloków
│   └── storage.ts        # Warstwa abstrakcji zapisu (wymienna na Supabase)
└── theme/                # Paleta kolorów (pastelowa) i odstępy
```
