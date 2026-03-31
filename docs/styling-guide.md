# Styling Guide

## 📖 Table of Contents

- [Back to Main README](../README.md)
- [Overview](#overview)
- [Setup](#setup)
- [Core Concepts](#core-concepts)
- [Best Practices](#best-practices)

**Other Docs**: [Overview](frontend-overview.md) • [Components](components-guide.md) • [Hooks](hooks-guide.md) • [Auth](authentication-guide.md)

---

## Overview

Kyogre uses **Tailwind CSS v4** for utility-first styling with responsive design, dark mode support, and consistent design tokens.

**Features**:
- Utility-first approach: compose styles with small reusable classes
- No CSS files needed for simple components
- Automatic dark mode with `dark:` prefix
- Built-in responsive design system
- Tree-shaken unused styles in production

## Setup

### Configuration

**Location**: `postcss.config.mjs`

```mjs
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';

export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

### Global Styles

**Location**: `app/globals.css`

```css
@import 'tailwindcss';

html {
  scroll-behavior: smooth;
}

body {
  @apply antialiased;
  font-family: system-ui, -apple-system, sans-serif;
}
```

## Core Concepts

### Utility Classes

Combine utility classes instead of custom CSS:

```tsx
// ❌ Bad: Custom CSS file
<div className="card">Card</div>
<style>.card { ... }</style>

// ✅ Good: Tailwind utilities
<div className="bg-white rounded-lg p-4 shadow">Card</div>
```

### Responsive Design

Use responsive prefixes (`sm:`, `md:`, `lg:`, `xl:`):

```tsx
<div className="w-full md:w-1/2 lg:w-1/3">
  Responsive width
</div>

<button className="bg-blue-500 hover:bg-blue-600 active:bg-blue-700">
  Click me
</button>
```

### Common Utilities

**Layout**:
- Flexbox: `flex`, `flex-col`, `justify-center`, `items-start`
- Grid: `grid`, `grid-cols-3`, `gap-4`
- Spacing: `p-4` (padding), `m-2` (margin), `gap-6`

**Colors**:
- Text: `text-blue-500`, `text-gray-700`
- Background: `bg-white`, `bg-slate-100`
- Border: `border-blue-200`, `border-2`
- Dark mode: `dark:bg-slate-800`, `dark:text-white`

**Sizing**:
- Width/Height: `w-full`, `h-12`, `w-1/2`, `w-screen`
- Size: `text-sm`, `text-lg`, `font-bold`

## Best Practices

✅ Use utility classes for simple styling  
✅ Combine classes: `className="flex items-center justify-between p-4"`  
✅ Use responsive prefixes: `className="w-full md:w-1/2"`  
✅ Leverage dark mode: `className="bg-white dark:bg-slate-900"`  
✅ Use space scale: `p-4`, `m-2`, `gap-6` (use base units)  
✅ Extract complex styles to CSS modules or components  

❌ Mix inline styles with Tailwind  
❌ Create custom CSS for utility-like styles  
❌ Use too many arbitrary values: `px-[42px]` (use base units)  
❌ Skip responsive design  

### Component Styling Example

```tsx
// components/Card.tsx
export function Card({ title, children }: Props) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-slate-700">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        {title}
      </h2>
      <div className="text-gray-700 dark:text-gray-300">
        {children}
      </div>
    </div>
  );
}
```

### Common Patterns

**Button Styling**:
```tsx
<button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
  Submit
</button>
```

**Input Styling**:
```tsx
<input className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
```

**Card Layout**:
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {items.map(item => (
    <div key={item.id} className="bg-white rounded-lg shadow-md p-6">
      {item.content}
    </div>
  ))}
</div>
```

---

See [Components Guide](components-guide.md) for styled component examples.
