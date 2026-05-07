# Code Audit Report - RPG Project Frontend

**Date:** 7 Mai 2026  
**Scope:** Frontend Application (`/frontend/`)  
**Status:** ⚠️ Multiple issues identified

---

## Executive Summary

This audit identified **dead code**, **duplicate patterns**, **unused imports**, and **code smell issues** across the frontend codebase. The most significant issues are:

- **Unused dynamic imports** in `/app/home/page.tsx`
- **Repeated socket connection patterns** across multiple pages
- **Duplicate user authentication logic** in most pages
- **Unused state variables** in several components
- **Hardcoded data** that could be centralized
- **Repetitive localStorage persistence** logic

---

## Critical Issues

### 1. Unused Imports & Dead Code in `/app/home/page.tsx`

**Severity:** 🔴 HIGH  
**Location:** Lines 17-20, 111

**Issue:**
```tsx
// Line 19: Imported but NEVER USED
const MatchmakingModal = dynamic(() => import("@/components/organisms/home/MatchmakingModal"), { ssr: false });

// Line 20: Imported but NEVER USED
const NotificationToast = dynamic(() => import("@/components/organisms/home/NotificationToast"), { ssr: false });

// Line 111: State created but NEVER USED
const [showMatchmaking, setShowMatchmaking] = useState(false);
```

**Impact:** Dead code adds bundle size and confusion for future maintainers.

**Action:** Remove unused imports and state variables.

---

### 2. Unused Import in `/app/home/page.tsx`

**Severity:** 🟡 MEDIUM  
**Location:** Line 11

**Issue:**
```tsx
import { DEFAULT_PROFILE_ICON } from "@/lib/profile-icons"; // NEVER USED
```

**Action:** Remove this import.

---

## Major Issues

### 3. Duplicate User Session Logic Across Pages

**Severity:** 🔴 HIGH  
**Affected Files:**
- `/app/home/page.tsx` (Lines 122-130)
- `/app/social/page.tsx` (Lines 114-130)
- `/app/profile/[pseudo]/ProfileClientView.tsx` (Lines 100-112)
- `/app/admin/page.tsx` (Lines 29-42)

**Issue:** Every page manually fetches user session with identical logic:

```tsx
// Repeated in 4+ places
useEffect(() => {
  const getUserData = async () => {
    const { data } = await authClient.getSession();
    if (data?.user?.name) {
      setPseudo(data.user.name); // or setUserPseudo
    }
  };

  const timeoutId = window.setTimeout(() => {
    void getUserData();
  }, 0);

  return () => window.clearTimeout(timeoutId);
}, []);
```

**Recommendation:** Extract into a custom hook `useUserSession()`:

```tsx
// hooks/useUserSession.ts
export function useUserSession() {
  const [pseudo, setPseudo] = useState<string | null>(null);

  useEffect(() => {
    const getUserData = async () => {
      const { data } = await authClient.getSession();
      if (data?.user?.name) setPseudo(data.user.name);
    };

    const timeoutId = window.setTimeout(() => {
      void getUserData();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  return pseudo;
}
```

---

### 4. Socket Connection Pattern Duplication

**Severity:** 🔴 HIGH  
**Affected Files:**
- `/app/home/page.tsx` (Lines 137-142)
- `/app/social/page.tsx` (Lines 171-185)
- `/app/profile/[pseudo]/ProfileClientView.tsx` (Lines 128-145)
- `/app/admin/page.tsx` (Lines 75-82)
- `/app/characters/page.tsx` (Lines 32-49)

**Issue:** Each page implements socket connection initialization separately:

```tsx
// Repeated pattern in multiple files
useEffect(() => {
  if (!userPseudo || socket.connected) return;

  const timeoutId = window.setTimeout(() => {
    socket.connect();
    socket.emit("login", userPseudo);

    socket.on("online_users", (users) => {
      console.log("Users from Redis:", users);
    });
  }, 0);

  return () => {
    window.clearTimeout(timeoutId);
    socket.off("online_users");
  };
}, [userPseudo]);
```

**Recommendation:** Extract into a custom hook `useSocketConnection()`:

```tsx
// hooks/useSocketConnection.ts
export function useSocketConnection(userPseudo: string | null) {
  useEffect(() => {
    if (!userPseudo || socket.connected) return;

    const timeoutId = window.setTimeout(() => {
      socket.connect();
      socket.emit("login", userPseudo);
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [userPseudo]);
}
```

---

### 5. Duplicate Socket Event Listeners

**Severity:** 🟡 MEDIUM  
**Location:** `/app/admin/page.tsx` (Lines 102-118)

**Issue:** Multiple handlers call the same function:

```tsx
const modFetch = () => fetchUsers();
const noModFetch = () => fetchUsers();
const banFetch = () => fetchUsers();
const unbanFetch = () => fetchUsers();
const handleNewUser = () => fetchUsers();

socket.on("newUser", handleNewUser);
socket.on("newMod", modFetch);
socket.on("noMod", noModFetch);
socket.on("ban", banFetch);
socket.on("unban", unbanFetch);
```

**Recommendation:** Simplify to:

```tsx
socket.on("newUser", fetchUsers);
socket.on("newMod", fetchUsers);
socket.on("noMod", fetchUsers);
socket.on("ban", fetchUsers);
socket.on("unban", fetchUsers);
```

Or use a single handler:

```tsx
const socketEvents = ["newUser", "newMod", "noMod", "ban", "unban"];
socketEvents.forEach(event => socket.on(event, fetchUsers));
```

---

### 6. Duplicate Helper Functions

**Severity:** 🟡 MEDIUM  
**Location:** `/app/social/page.tsx` (Lines 73-95) vs `/app/profile/[pseudo]/ProfileClientView.tsx` (Lines 60-70)

**Issue:** Both files define similar date formatting functions:

```tsx
// social/page.tsx - Line 23
const formatTime = (date: Date) =>
  date.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });

// profile/page.tsx - Line 60 (different but similar)
const formatDate = (date: Date) =>
  date.toLocaleDateString("fr-FR", {
    timeZone: "Europe/Paris",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
```

**Recommendation:** Move to a shared utility `/lib/date-utils.ts`:

```tsx
export const formatTime = (date: Date) => 
  date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

export const formatDate = (date: Date) =>
  date.toLocaleDateString("fr-FR", {
    timeZone: "Europe/Paris",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
```

---

### 7. Hardcoded Static Data

**Severity:** 🟡 MEDIUM  
**Location:** `/app/profile/[pseudo]/ProfileClientView.tsx` (Lines 45-48)

**Issue:** Hardcoded hero portrait mapping:

```tsx
const TEAM_PORTRAITS: Record<string, string> = {
  Knight: "/heroes/Avatar_Sorel.webp",
  Assassin: "/heroes/Avatar_Wanda.webp",
  Healer: "/heroes/Avatar_Tulu.webp",
  Archer: "/heroes/Avatar_Uvhash.webp",
  Mage: "/heroes/Avatar_Thais.webp",
};
```

**Also appears in:** `/app/characters/characters-data.ts`

**Recommendation:** Reference from centralized data source, not duplicate.

---

### 8. Unused Component Props

**Severity:** 🟡 MEDIUM  
**Location:** `/app/home/page.tsx` (Line 10)

**Issue:**
```tsx
import AppPageShell from "@/components/AppPageShell";
// AppPageShell is imported but the page uses direct JSX instead:
return (
  <div className="flex h-screen w-full overflow-hidden bg-[#0c0a0f] font-serif text-white">
    // ... custom layout instead of using AppPageShell
  </div>
);
```

**Recommendation:** Either use AppPageShell or remove the import. (Looks like AppPageShell is unused here intentionally for custom layout.)

---

## Minor Issues

### 9. Unused State Variables

**Severity:** 🟢 LOW

**Location:** `/app/social/page.tsx`

**Issue:**
```tsx
const [typer, setTyper] = useState<string | null>(null);        // Set but never rendered
const [expandedMessages, setExpandedMessages] = useState<Set<string>>(new Set()); // Unused
const [reported, setReported] = useState(false);               // Set but not used
```

**Action:** Remove or document why these are kept.

---

### 10. Unused Variable Declarations

**Severity:** 🟢 LOW  
**Location:** `/app/social/page.tsx` (Line 72)

**Issue:**
```tsx
let timeout: NodeJS.Timeout; // Declared but never initialized or used consistently
```

**Recommendation:** Remove or document usage.

---

### 11. Inconsistent Error Handling

**Severity:** 🟡 MEDIUM  
**Affected Files:**
- `/app/social/page.tsx` - Many silent catches
- `/app/profile/[pseudo]/ProfileClientView.tsx` - console.error but no user feedback
- `/app/admin/page.tsx` - No error handling at all

**Issue:** Inconsistent error handling makes debugging difficult.

**Recommendation:** Implement centralized error handling or consistent patterns.

---

### 12. Background Preference References (Orphaned Code)

**Severity:** 🟡 MEDIUM  
**Location:** `/app/profile/[pseudo]/ProfileClientView.tsx` (Lines 10, 168)

**Issue:**
```tsx
import { applyBackgroundPreferenceToDocument, ... } from "@/lib/background-utils";
// Line 168:
applyBackgroundPreferenceToDocument(profileBackground, defaultBackground);
```

Since `background-preference-sync.tsx` was deleted, verify this code path is still needed or if it's orphaned.

---

## Code Smell Patterns

### 13. Large Component Files

**Severity:** 🟡 MEDIUM

**Files Over 600+ Lines:**
- `/app/home/page.tsx` (~670 lines) - Should extract modals and handlers
- `/app/social/page.tsx` (~1100+ lines) - Should split into smaller components
- `/app/profile/[pseudo]/ProfileClientView.tsx` (~400+ lines) - Could extract match history

**Recommendation:** Break into smaller, focused components.

---

### 14. Repeated useEffect Patterns

**Severity:** 🟡 MEDIUM  
**Affected:** Most pages have 5-10+ useEffects

**Pattern Observed:**
```tsx
useEffect(() => {
  const timeoutId = window.setTimeout(() => {
    void someFunction();
  }, 0);
  return () => window.clearTimeout(timeoutId);
}, []);
```

This pattern appears 15+ times across the codebase.

**Recommendation:** Extract as `useDeferred()` hook.

---

### 15. Missing TypeScript Types

**Severity:** 🟡 MEDIUM

**Issue:** Inline types instead of proper type definitions:

```tsx
// app/social/page.tsx - Line 40
const [currentMessages, setCurrentMessages] = useState<type.Messages[]>([]);

// Should be
type Message = { id: string; sender: string; content: string; /* ... */ };
const [currentMessages, setCurrentMessages] = useState<Message[]>([]);
```

---

## Summary Table

| Category | Count | Severity | Action |
|----------|-------|----------|--------|
| Unused Imports | 3 | HIGH | Remove |
| Dead Code (State/Variables) | 4 | HIGH | Remove |
| Duplicate Patterns | 5 | HIGH | Extract Hooks |
| Hardcoded Data | 1 | MEDIUM | Centralize |
| Socket Duplication | 4 | HIGH | Extract Hook |
| Large Components | 3 | MEDIUM | Split |
| Type Issues | 2+ | MEDIUM | Improve Types |
| **Total** | **22+** | | |

---

## Recommended Quick Wins (Priority Order)

### Phase 1: Remove Dead Code (1-2 hours)
- [ ] Remove `MatchmakingModal` and `NotificationToast` imports from home/page.tsx
- [ ] Remove unused state variables
- [ ] Remove unused imports
- [ ] Remove duplicate socket handler declarations in admin/page.tsx

### Phase 2: Extract Hooks (2-3 hours)
- [ ] Create `/hooks/useUserSession.ts`
- [ ] Create `/hooks/useSocketConnection.ts`
- [ ] Create `/hooks/useDeferredEffect.ts`
- [ ] Update all pages to use these hooks

### Phase 3: Consolidate Utilities (2-3 hours)
- [ ] Move date formatting to `/lib/date-utils.ts`
- [ ] Centralize hero portrait mapping
- [ ] Centralize localStorage keys

### Phase 4: Refactor Large Components (4+ hours)
- [ ] Split social/page.tsx into sub-components
- [ ] Extract modals from home/page.tsx
- [ ] Extract match history component

---

## Files Requiring Attention

| File | Issues | Action |
|------|--------|--------|
| `/app/home/page.tsx` | Unused imports, unused state | Remove 3-4 lines |
| `/app/social/page.tsx` | Large file, duplicate logic, unused state | Refactor & extract |
| `/app/profile/[pseudo]/ProfileClientView.tsx` | Unused functions, duplicate date formatting | Clean & extract |
| `/app/admin/page.tsx` | Duplicate handlers, socket duplication | Simplify |
| `/app/characters/page.tsx` | Duplicate session logic | Extract to hook |
| `/components/` | Check for duplicate components | Audit |
| `/lib/` | Check for utility duplication | Consolidate |

---

## Conclusion

The codebase has significant opportunities for optimization, particularly:
1. **Extracting shared hooks** (estimated 3-4 hours of work saves 5+ duplicates)
2. **Removing dead code** (estimated 30-60 minutes)
3. **Consolidating utilities** (estimated 2-3 hours)

These improvements will:
- ✅ Reduce bundle size
- ✅ Improve maintainability
- ✅ Reduce bugs from duplicate logic
- ✅ Make onboarding easier for new developers
- ✅ Improve code readability

**Estimated Total Cleanup Time:** 8-12 hours
**Estimated Code Reduction:** 10-15% less source code

---

**Report Generated:** 2026-05-07
