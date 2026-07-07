<!-- BEGIN:nextjs-agent-rules -->

# VenueMind AI Engineering Agent

This repository follows strict engineering, design and architecture standards.

Before writing any code, always read

- docs/ARCHITECTURE.md
- docs/DESIGN.md
- docs/ENGINEERING.md
- docs/FEATURES.md
- docs/IMPLEMENTATION_ORDER.md
- docs/USER_FLOW.md
- docs/TESTING.md

These documents are the source of truth.

Never violate them.

---

# Project Goal

Build a premium AI-powered Stadium Operations platform for FIFA World Cup 2026.

The application should feel like enterprise software used by professional stadium operators.

Never generate generic AI dashboards.

---

# Development Rules

Always complete one feature at a time.

Never build multiple unfinished features.

Every feature must

- compile
- lint
- be responsive
- be accessible
- support loading
- support empty state
- support error state

before moving to the next feature.

---

# Folder Ownership

app/

Routing only.

components/

Reusable UI.

services/

Business logic.

store/

Global state.

hooks/

Reusable logic.

types/

Interfaces.

schemas/

Validation.

config/

Configuration.

utils/

Pure helper functions.

prompts/

AI prompts.

public/

Assets.

docs/

Project standards.

---

# TypeScript

Use strict typing.

Never use

any

Prefer

interface

for objects.

Prefer

type

for unions.

---

# React

Prefer Server Components.

Use Client Components only when required.

Avoid unnecessary

useEffect.

Avoid duplicated state.

---

# Zustand

One responsibility per store.

Business logic belongs inside stores.

No giant stores.

---

# Validation

Validate every external input using Zod.

Never trust user input.

---

# AI

Separate

System Prompt

Persona Prompt

User Prompt

Context Builder

Never hardcode prompts inside components.

---

# UI Rules

Follow

docs/DESIGN.md

Use existing components before creating new ones.

Maintain one design language.

---

# Skills

Use installed design skills automatically.

Priority

- design-taste-frontend
- high-end-visual-design
- minimalist-ui
- stitch-design-taste

Brand

- brandkit

Animation

- animation-vocabulary
- review-animations

Quality

- gpt-taste
- emil-design-eng
- full-output-enforcement

Responsive

- image-to-code
- imagegen-frontend-web
- imagegen-frontend-mobile

Never use industrial-brutalist-ui unless requested.

---

# Performance

Avoid unnecessary renders.

Dynamic import heavy modules.

Keep bundle size small.

Memoize expensive calculations.

---

# Accessibility

WCAG AA minimum.

Keyboard navigation.

ARIA labels.

Focus rings.

Reduced motion.

Semantic HTML.

---

# Logging

Never leave

console.log()

inside production code.

Use

logger.ts

for meaningful logging.

---

# Security

Never expose API keys.

Never commit secrets.

Use environment variables.

Validate every request.

---

# Before Every Commit

Run

npm run lint

npm run build

Both must pass.

---

# Code Review Checklist

✓ Readable

✓ Typed

✓ Responsive

✓ Accessible

✓ Reusable

✓ No dead code

✓ No duplicated logic

✓ No console.log

✓ Build passes

✓ Lint passes

---

# Definition of Done

A feature is complete only if

- UI completed
- Mobile ready
- Responsive
- Accessible
- Loading state
- Empty state
- Error state
- Store integrated
- Mock data connected
- Build passes
- Lint passes

Otherwise the feature is NOT complete.

---

# Final Rule

Prefer maintainability over speed.

Every commit should improve the repository.

<!-- END:nextjs-agent-rules -->
