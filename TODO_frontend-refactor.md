# TODO Frontend Refactor (Next.js App Router)

## Context
- [ ] **REF-CTX-1.1 [Current Frontend Stack]**:
  - **Current State**: Next.js 16.1.6 (App Router) + React 19 + TypeScript + Tailwind CSS v4, with Better Auth and Prisma-backed API routes.
  - **Evidence**: `frontend/package.json`, `frontend/app/**`, `frontend/components/**`.
  - **Risk/Constraint**: Core flows are currently heavily client-rendered and mixed with side effects (`localStorage`, auth session reads in UI), increasing hydration and performance risk.

- [ ] **REF-CTX-1.2 [Target Platform]**:
  - **Current State**: App Router is already in use but not consistently leveraging Server Components/SSR.
  - **Target State**: Next.js 16 App Router architecture with explicit Server vs Client boundaries, cache/revalidation policy, and metadata strategy.
  - **Constraint**: Keep behavior compatible while refactoring incrementally.

- [ ] **REF-CTX-1.3 [Technical Debt & Constraints]**:
  - **Current State**: Repeated visual patterns (buttons/cards/nav), inline style blocks (`<style jsx>`), CDN Font Awesome in root layout, and duplicated localStorage sync logic across pages/components.
  - **Target State**: Reusable UI primitives + design tokens + consolidated hooks/utilities for preferences/session-aware UI.
  - **Constraint**: Preserve current route surface (`/`, `/home`, `/decks`, `/social`, `/profile/[pseudo]`, etc.) during migration.

## Refactor Plan
- [ ] **REF-PLAN-1.1 [Audit Routes & Render Modes]**:
  - **Current State**: High-value pages (`frontend/app/page.tsx`, `frontend/app/home/page.tsx`, `frontend/app/profile/[pseudo]/ProfileClientView.tsx`) are client-heavy.
  - **Target State**: Critical route shells move to Server Components; interactive islands remain Client Components.
  - **Changes Needed**: Route-by-route render matrix, identify SSR/SSG candidates, and mark data dependencies.

- [ ] **REF-PLAN-1.2 [Architecture Reorganization]**:
  - **Current State**: Components exist but are not organized by atomic levels and concern boundaries.
  - **Target State**: Scalable structure: `app/`, `components/atoms`, `components/molecules`, `components/organisms`, `lib/`, `hooks/`, `styles/`.
  - **Changes Needed**: Introduce folder convention, migration map, and deprecation checklist for legacy components.

- [ ] **REF-PLAN-1.3 [Server/Client Strategy]**:
  - **Current State**: Auth/session checks and state bootstrap done in client effects.
  - **Target State**: Session lookup in server layer where possible; pass serialized props into client islands.
  - **Changes Needed**: Add server loaders/helpers and reduce `useEffect`-driven initial render logic.

- [ ] **REF-PLAN-1.4 [Data Fetching, Caching, Revalidation]**:
  - **Current State**: API calls mostly from client (`fetch('/api/...')`) and ad hoc caching.
  - **Target State**: Server-first data reads for profile/home where applicable, explicit cache directives and revalidation windows.
  - **Changes Needed**: Introduce tagged fetches/revalidate strategy and only use client fetch for user-triggered mutations.

- [ ] **REF-PLAN-1.5 [Metadata & SEO Plan]**:
  - **Current State**: Minimal global metadata in `frontend/app/layout.tsx`.
  - **Target State**: Route-level metadata for public and profile pages (title templates, descriptions, OG defaults).
  - **Changes Needed**: Add `metadata`/`generateMetadata` per route and canonical conventions.

- [ ] **REF-PLAN-1.6 [Accessibility Baseline]**:
  - **Current State**: Some semantics are present, but keyboard/focus/dialog behavior and icon button labeling need systematic validation.
  - **Target State**: WCAG 2.1 AA baseline with keyboard-first flows, focus-visible standards, and ARIA constraints documented.
  - **Changes Needed**: Add a11y acceptance criteria per feature and automate audits.

- [ ] **REF-PLAN-1.7 [Performance Baseline & Budgets]**:
  - **Current State**: Client-heavy bundles, inline style blocks, and unoptimized image usage patterns (`unoptimized` flags in user-facing views).
  - **Target State**: Reduced client JS, improved LCP/CLS, lazy hydration for non-critical interactions.
  - **Changes Needed**: Establish before/after Lighthouse + bundle analyzer snapshots and route-level budgets.

- [ ] **REF-PLAN-1.8 [Testing Strategy Rollout]**:
  - **Current State**: No visible standardized unit/e2e/a11y suite in frontend workspace.
  - **Target State**: Unit tests (critical components), e2e (main flows), accessibility checks integrated in CI.
  - **Changes Needed**: Add Vitest + Testing Library + Playwright + axe checks and enforce in CI pipeline.

## Refactor Items
- [ ] **REF-ITEM-1.1 [Route Group Layout Migration]**:
  - **Files**: `frontend/app/layout.tsx`, `frontend/app/(auth)/layout.tsx`, `frontend/app/(app)/layout.tsx`, `frontend/app/(auth)/page.tsx`, `frontend/app/(app)/home/page.tsx`
  - **Changes**: Introduce route groups for auth vs in-app surfaces; move shared app-shell logic to nested layout.
  - **Code**: See patch in Proposed Code Changes (`PATCH-A`).

- [ ] **REF-ITEM-1.2 [Atomic UI Foundation]**:
  - **Files**: `frontend/components/atoms/Button.tsx`, `frontend/components/atoms/Input.tsx`, `frontend/components/molecules/FormField.tsx`, `frontend/components/organisms/SidebarNav.tsx`, `frontend/components/Sidebar.tsx`
  - **Changes**: Replace duplicated class-heavy controls with typed primitives and composed building blocks.
  - **Code**: See patch in Proposed Code Changes (`PATCH-B`).

- [ ] **REF-ITEM-1.3 [Design Tokens & Styling Standardization]**:
  - **Files**: `frontend/app/globals.css`, `frontend/styles/tokens.css`
  - **Changes**: Define semantic tokens (color, spacing, radius, typography, elevation), remove hardcoded hex repetition and inline style drift.
  - **Code**: See patch in Proposed Code Changes (`PATCH-C`).

- [ ] **REF-ITEM-1.4 [Auth Page Server-First Refactor]**:
  - **Files**: `frontend/app/page.tsx`, `frontend/components/auth/AuthForm.tsx`, `frontend/lib/server/session.ts`
  - **Changes**: Server-side session check and redirect, isolate interactive form in client component, reduce initial client effect work.
  - **Code**: See patch in Proposed Code Changes (`PATCH-D`).

- [ ] **REF-ITEM-1.5 [Home Page Island Decomposition]**:
  - **Files**: `frontend/app/home/page.tsx`, `frontend/components/home/PlayCta.tsx`, `frontend/components/home/DeckSelector.tsx`, `frontend/hooks/useDeckPreferences.ts`
  - **Changes**: Split monolithic page into focused components/hooks; move derived state and storage sync to dedicated hook.
  - **Code**: See patch in Proposed Code Changes (`PATCH-E`).

- [ ] **REF-ITEM-1.6 [Accessibility Hardening]**:
  - **Files**: `frontend/components/Sidebar.tsx`, `frontend/app/home/page.tsx`, `frontend/app/profile/[pseudo]/ProfileClientView.tsx`
  - **Changes**: Replace anchor-with-click handlers by semantic buttons/links, enforce visible focus states, dialog semantics for popups, ESC + focus return patterns.
  - **Code**: See patch in Proposed Code Changes (`PATCH-F`).

- [ ] **REF-ITEM-1.7 [Performance Optimization Pass]**:
  - **Files**: `frontend/components/AppPageShell.tsx`, `frontend/app/home/page.tsx`, `frontend/app/profile/[pseudo]/ProfileClientView.tsx`, `frontend/next.config.ts`
  - **Changes**: Remove non-critical client rendering, use dynamic imports for optional panels, tune image strategy and caching.
  - **Code**: See patch in Proposed Code Changes (`PATCH-G`).

- [ ] **REF-ITEM-1.8 [Data Fetching and Cache Policy]**:
  - **Files**: `frontend/app/profile/[pseudo]/page.tsx`, `frontend/lib/profile.ts`, `frontend/app/api/profile/route.ts`
  - **Changes**: Move profile read path to server utility with typed responses; define revalidation and mutation invalidation strategy.
  - **Code**: See patch in Proposed Code Changes (`PATCH-H`).

- [ ] **REF-ITEM-1.9 [Testing Infrastructure]**:
  - **Files**: `frontend/package.json`, `frontend/vitest.config.ts`, `frontend/playwright.config.ts`, `frontend/tests/**`, `frontend/.github/workflows/frontend-ci.yml`
  - **Changes**: Add unit + e2e + a11y tests, wire into CI and quality gates.
  - **Code**: See patch in Proposed Code Changes (`PATCH-I`).

- [ ] **REF-ITEM-1.10 [Hydration & Legacy Cleanup]**:
  - **Files**: `frontend/app/**`, `frontend/components/**`, `frontend/lib/**`
  - **Changes**: Remove dead code, eliminate hydration mismatch sources, and document server/client boundaries per module.
  - **Code**: See patch in Proposed Code Changes (`PATCH-J`).

## Proposed Code Changes

### PATCH-A: Route groups and nested layouts (example)
```diff
diff --git a/frontend/app/layout.tsx b/frontend/app/layout.tsx
--- a/frontend/app/layout.tsx
+++ b/frontend/app/layout.tsx
@@
-export default function RootLayout({ children }: { children: React.ReactNode }) {
+export default function RootLayout({ children }: { children: React.ReactNode }) {
   return (
     <html lang="en">
-      <head>
-        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />
-      </head>
       <body className="antialiased">
         <BackgroundPreferenceSync />
         <AccentPreferenceSync />
         {children}
       </body>
     </html>
   );
 }
```

```diff
diff --git a/frontend/app/(app)/layout.tsx b/frontend/app/(app)/layout.tsx
new file mode 100644
--- /dev/null
+++ b/frontend/app/(app)/layout.tsx
@@
+import AppPageShell from "@/components/AppPageShell";
+
+export default function AppLayout({ children }: { children: React.ReactNode }) {
+  return <AppPageShell showSidebar containerClassName="min-h-0 flex-1">{children}</AppPageShell>;
+}
```

### PATCH-B: Atomic components (example)
```diff
diff --git a/frontend/components/atoms/Button.tsx b/frontend/components/atoms/Button.tsx
new file mode 100644
--- /dev/null
+++ b/frontend/components/atoms/Button.tsx
@@
+import { forwardRef } from "react";
+
+type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
+  variant?: "primary" | "secondary" | "ghost";
+};
+
+export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
+  { variant = "primary", className, ...props },
+  ref,
+) {
+  return <button ref={ref} data-variant={variant} className={className} {...props} />;
+});
```

### PATCH-C: Design tokens (example)
```diff
diff --git a/frontend/app/globals.css b/frontend/app/globals.css
--- a/frontend/app/globals.css
+++ b/frontend/app/globals.css
@@
-:root {
-  --accent-color: #8e82ff;
-  --accent-hover: #7d71ec;
-}
+:root {
+  --color-accent-500: #5f8cff;
+  --color-accent-600: #4e79e6;
+  --radius-md: 12px;
+  --radius-lg: 16px;
+  --space-3: 0.75rem;
+  --space-4: 1rem;
+}
```

### PATCH-D: Auth route server-first split (example)
```diff
diff --git a/frontend/app/page.tsx b/frontend/app/page.tsx
--- a/frontend/app/page.tsx
+++ b/frontend/app/page.tsx
@@
-"use client";
+import { redirect } from "next/navigation";
+import { getServerSession } from "@/lib/server/session";
+import AuthForm from "@/components/auth/AuthForm";
@@
-export default function LoginPage() {
-  // client session check + form logic
-}
+export default async function LoginPage() {
+  const session = await getServerSession();
+  if (session) redirect("/home");
+  return <AuthForm />;
+}
```

### PATCH-E: Home decomposition (example)
```diff
diff --git a/frontend/app/home/page.tsx b/frontend/app/home/page.tsx
--- a/frontend/app/home/page.tsx
+++ b/frontend/app/home/page.tsx
@@
-import { useState, useEffect, useRef } from "react";
+import DeckSelector from "@/components/home/DeckSelector";
+import PlayCta from "@/components/home/PlayCta";
+import { useDeckPreferences } from "@/hooks/useDeckPreferences";
@@
-const [selectedDeck, setSelectedDeck] = useState("Flygon");
-const [availableDecks, setAvailableDecks] = useState<string[]>(defaultDecks);
+const { selectedDeck, setSelectedDeck, availableDecks } = useDeckPreferences(defaultDecks);
```

### PATCH-F: Accessibility fixes (example)
```diff
diff --git a/frontend/components/Sidebar.tsx b/frontend/components/Sidebar.tsx
--- a/frontend/components/Sidebar.tsx
+++ b/frontend/components/Sidebar.tsx
@@
-<a href="#" onClick={handleProfileClick} title={pseudo ?? "Profil"}>
+<button type="button" onClick={handleProfileClick} aria-label={pseudo ?? "Profil"}>
   <Image src={avatar} alt="Avatar" width={56} height={56} />
-</a>
+</button>
```

### PATCH-G: Performance pass (example)
```diff
diff --git a/frontend/app/home/page.tsx b/frontend/app/home/page.tsx
--- a/frontend/app/home/page.tsx
+++ b/frontend/app/home/page.tsx
@@
-<style jsx>{`/* animation blocks */`}</style>
+// Move animation rules to CSS module and lazy-load non-critical notification panel
```

### PATCH-H: Data fetching and cache policy (example)
```diff
diff --git a/frontend/lib/profile.ts b/frontend/lib/profile.ts
new file mode 100644
--- /dev/null
+++ b/frontend/lib/profile.ts
@@
+export async function getProfileByPseudo(pseudo: string) {
+  return fetch(`/api/profile?pseudo=${encodeURIComponent(pseudo)}`, {
+    next: { revalidate: 60, tags: ["profile", `profile:${pseudo}`] },
+  });
+}
```

### PATCH-I: Testing stack bootstrap (example)
```diff
diff --git a/frontend/package.json b/frontend/package.json
--- a/frontend/package.json
+++ b/frontend/package.json
@@
   "scripts": {
+    "test": "vitest run",
+    "test:watch": "vitest",
+    "test:e2e": "playwright test",
+    "test:a11y": "playwright test --grep @a11y",
+    "analyze": "ANALYZE=true next build",
     "build": "next build"
   }
```

### PATCH-J: Legacy cleanup and hydration guardrails (example)
```diff
diff --git a/frontend/app/home/page.tsx b/frontend/app/home/page.tsx
--- a/frontend/app/home/page.tsx
+++ b/frontend/app/home/page.tsx
@@
-const getInitialDeckState = () => {
-  if (typeof window === "undefined") {
-    return { availableDecks: defaultDecks, selectedDeck: "Flygon" };
-  }
-  // localStorage logic...
-};
+// moved to useDeckPreferences() hook to centralize hydration-safe storage access
```

## Commands
- [ ] **REF-CMD-1.1 [Install Dependencies]**:
  - **Local**: `cd frontend && bun add -d vitest @testing-library/react @testing-library/jest-dom jsdom playwright @axe-core/playwright @next/bundle-analyzer`
  - **CI**: `cd frontend && bun install --frozen-lockfile`

- [ ] **REF-CMD-1.2 [Lint & Typecheck]**:
  - **Local**: `cd frontend && bun run lint && bunx tsc --noEmit`
  - **CI**: `cd frontend && bun run lint && bunx tsc --noEmit`

- [ ] **REF-CMD-1.3 [Unit Tests]**:
  - **Local**: `cd frontend && bun test`
  - **CI**: `cd frontend && bun test -- --runInBand`

- [ ] **REF-CMD-1.4 [E2E + Accessibility]**:
  - **Local**: `cd frontend && bunx playwright install && bun run test:e2e && bun run test:a11y`
  - **CI**: `cd frontend && bunx playwright install --with-deps && bun run test:e2e && bun run test:a11y`

- [ ] **REF-CMD-1.5 [Build Validation]**:
  - **Local**: `cd frontend && bun run build && bun run start`
  - **CI**: `cd frontend && bun run build`

- [ ] **REF-CMD-1.6 [Performance Regression Check]**:
  - **Local**: `cd frontend && bun run analyze`
  - **CI**: `cd frontend && bun run build` (with analyzer artifact upload in workflow)

## Quality Assurance Task Checklist
- [ ] **REF-QA-1.1 [Build Integrity]**: Next.js build passes without errors.
- [ ] **REF-QA-1.2 [Hydration Safety]**: No hydration warnings in dev/prod.
- [ ] **REF-QA-1.3 [Routing Validation]**: All routes function correctly.
- [ ] **REF-QA-1.4 [Performance Improvement]**: Lighthouse scores improve versus pre-refactor baseline.
- [ ] **REF-QA-1.5 [Accessibility Compliance]**: Accessibility checks pass with zero critical issues.
- [ ] **REF-QA-1.6 [Maintainability]**: Code is clean, modular, and maintainable.

## Refactor Quality Task Checklist
- [ ] **REF-QUAL-1.1 [Legacy Cleanup]**: No legacy or unused code remains.
- [ ] **REF-QUAL-1.2 [SSR/SSG Rendering]**: All pages render correctly in SSR/SSG.
- [ ] **REF-QUAL-1.3 [Hydration Stability]**: No hydration errors in Next.js.
- [ ] **REF-QUAL-1.4 [A11y Audit]**: Accessibility audit passes with zero critical issues.
- [ ] **REF-QUAL-1.5 [Lighthouse Gains]**: Performance metrics improved (Lighthouse).
- [ ] **REF-QUAL-1.6 [UI Consistency]**: UI consistency achieved across the application.
- [ ] **REF-QUAL-1.7 [Scalable Modularity]**: Codebase is modular and scalable.
