# Frontend Atomic Guide

## Why this document exists
This guide defines how to build UI in the frontend with an atomic approach, to:
- avoid duplicated UI code,
- keep pages easier to read and maintain,
- reduce rendering overhead by reusing stable components and shared hooks.

## Frontend layering
Use this layering rule in all new code:
1. `atoms`: smallest visual and interaction primitives, no business logic.
2. `molecules`: composition of atoms around a focused interaction.
3. `organisms`: larger sections combining molecules and local state.
4. `pages/routes`: orchestration, data fetching, wiring, navigation.

Current structure:
- `components/atoms`: `Button`, `Input`, `Card`, `IconButton`
- `components/molecules`: `IconField`
- `components/molecules/home`: reusable home-level molecules
- `components/organisms/home`: composed home sections and overlays
- `app/*`: route pages and route-specific views
- `hooks/*`: shared client state and browser sync logic
- `lib/*`: cross-cutting utilities

## Server vs Client responsibilities
- Prefer Server Components for data loading and redirects.
- Keep Client Components for user interactions, browser APIs (`localStorage`, keydown handlers), and optimistic UI.
- Put browser synchronization in hooks, not directly in multiple pages.

## Atomic components: when and how to use

### `Button`
Use for all clickable actions unless there is a clear semantic reason not to.
- Why: consistent disabled/hover/focus behavior and shared design language.
- How:
  - `variant="primary"` for main CTA
  - `variant="secondary"` for supporting actions
  - `variant="ghost"` for low-emphasis actions

### `IconButton`
Use for icon-only actions.
- Why: removes repeated width/height/padding boilerplate.
- How:
  - `size`: `sm` | `md` | `lg`
  - `shape`: `rounded` | `circle`
  - Keep an `aria-label` on every icon-only button.

### `Input`
Use for text, email, password, URL fields.
- Why: standard focus and contrast handling.
- How: pass native input props + optional `className` for local layout.

### `Card`
Use for all panel surfaces (modal body, auth card, info cards).
- Why: shared border/radius/backdrop styling and less class duplication.

### `IconField`
Use in forms where an input has a leading icon.
- Why: avoids repeating icon + spacing wrappers in auth/forms.

## Shared hooks and utilities

### `useDeckPreferences`
Purpose:
- synchronize selected deck and available deck list from `localStorage`.

Use when:
- page needs deck selection and persistence.

### `useAvatarPreference`
Purpose:
- synchronize avatar URL across pages via storage and custom event.

Use when:
- page/sidebar shows current user avatar.

### `avatar-preference` utility
Purpose:
- centralize avatar storage keys and write flow.

Use:
- call `persistAvatarPreference(url, id?)` after profile avatar update.
- read with `readAvatarPreference(fallback)` in hooks.

## Rendering and performance rules
- Do not duplicate global background/video rendering logic in route pages. Reuse `AppPageShell`.
- Keep heavy state local to the smallest component that needs it.
- Prefer deriving display state with `useMemo` for filtered lists.
- Avoid creating new inline callbacks in deeply repeated lists unless needed.
- Keep modal/popup open state in parent route and render body conditionally.

## Accessibility baseline
- Every icon-only button must have `aria-label`.
- Interactive controls must use semantic elements (`button`, `a`, `input`).
- Escape key handlers should close active modal/panel.
- For overlay modals: clicking backdrop closes, clicking panel does not.

## Refactor checklist for future pages
1. Replace raw `button`, `input`, card-like `div` with atoms first.
2. Extract repeated browser sync (`localStorage`, events) into a hook.
3. Keep route JSX shallow by moving repeated chunks into components.
4. Verify keyboard behavior (`Enter`, `Escape`, focus visibility).
5. Run lint and typecheck before merge.

## Quick examples

Button variants:
```tsx
<Button>Primary action</Button>
<Button variant="secondary">Secondary action</Button>
<Button variant="ghost">Low emphasis action</Button>
```

Icon button:
```tsx
<IconButton aria-label="Close modal" size="sm">
  <i className="fa-solid fa-xmark" />
</IconButton>
```

Avatar persistence after profile save:
```tsx
persistAvatarPreference(updated.avatar.url, updated.avatar.id);
```
