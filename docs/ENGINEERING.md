# Engineering Guidelines

> Version: 1.0
> Project: VenueMind AI
> Framework: Next.js 16 + React 19 + TypeScript + TailwindCSS v4

---

# Purpose

This document defines the engineering standards for VenueMind AI.

Every implementation must follow these rules.

The objective is:

- Enterprise-level code quality
- Excellent AI evaluation score
- High maintainability
- Predictable architecture
- Production-ready implementation

---

# Engineering Philosophy

VenueMind AI is NOT a hackathon prototype.

Every feature should look like it belongs to a production SaaS product.

Priorities:

1. Readability
2. Maintainability
3. Type Safety
4. Performance
5. Accessibility
6. Security

Never sacrifice code quality for speed.

---

# General Rules

Always

✅ Small reusable components

✅ Strong typing

✅ No duplicated code

✅ Descriptive naming

✅ Predictable folder structure

Never

❌ Massive components

❌ any type

❌ console.log()

❌ commented dead code

❌ unused imports

❌ magic numbers

❌ inline styles

---

# Component Rules

Each component should have only one responsibility.

Maximum:

300 lines

Ideal:

100-180 lines

Split large components into

- Layout
- Card
- Header
- Footer
- Hooks
- Utilities

---

# Naming

Components

PascalCase

Example

IncidentCard.tsx

AssistantPanel.tsx

Heatmap.tsx

Hooks

camelCase

useIncident()

usePersona()

Stores

incidentStore

assistantStore

Constants

UPPER_CASE

MAX_ALERTS

Routes

camelCase

---

# TypeScript Rules

Strict Mode

No

any

unknown only if necessary.

Always

interface

for objects

type

for unions

Never disable

typescript-eslint

rules.

---

# Zustand Rules

Each store owns ONE responsibility.

Example

personaStore

incidentStore

uiStore

assistantStore

No gigantic stores.

Derived values belong in selectors.

Business logic stays in stores.

---

# React Rules

Prefer

Server Components

when possible.

Only use

"use client"

when needed.

Avoid unnecessary

useEffect.

Prefer

derived state

instead of duplicated state.

---

# State Rules

Never duplicate state.

Never store derived values.

Single source of truth.

---

# Forms

Validate using

Zod

Never trust user input.

Sanitize everything.

---

# API Rules

Every API returns

success

data

error

message

No inconsistent responses.

---

# Error Handling

Never crash.

Always

try/catch

Return friendly messages.

Log only meaningful errors.

---

# Logging

Development

debug()

info()

warn()

error()

Production

Only

warn()

error()

Never

console.log()

---

# Performance

Avoid unnecessary renders.

Memoize expensive calculations.

Lazy load heavy modules.

Dynamic import dashboards.

Keep bundle size small.

---

# Accessibility

Every button

aria-label

Every input

label

Keyboard navigation

Focus states

Semantic HTML

Respect

prefers-reduced-motion

---

# Animations

Use

Framer Motion

Purpose:

Guide attention.

Not decoration.

Duration

150–350ms

Avoid excessive animations.

---

# Security

Validate everything.

Escape user input.

Never expose secrets.

No API keys in client.

Environment variables only.

---

# AI Integration

Prompt templates stay inside

src/prompts

Never hardcode prompts inside UI.

Separate

System Prompt

User Prompt

Persona Prompt

---

# Folder Rules

components/

Reusable UI

services/

Business logic

store/

Global state

hooks/

Reusable logic

types/

Interfaces

utils/

Pure functions

config/

Configuration

schemas/

Validation

---

# Import Rules

Always use aliases

@/components

@/store

@/types

Never use long relative imports.

---

# Constants

Never hardcode

colors

routes

labels

limits

Extract into constants.

---

# Testing

Every business function should be testable.

Pure functions preferred.

Avoid hidden side effects.

---

# Git Rules

Every commit must pass

npm run lint

npm run build

before commit.

---

# Code Review Checklist

Before finishing any feature:

✓ Build passes

✓ Lint passes

✓ Types pass

✓ Accessibility checked

✓ Responsive

✓ No console.log

✓ No dead code

✓ No duplicated logic

✓ Proper loading states

✓ Proper error states

---

# AI Evaluation Optimization

The evaluator favors

Strong typing

Consistent architecture

Reusable code

Clear naming

No warnings

No lint issues

No duplicated code

High accessibility

Production-ready patterns

Always optimize for these.

---

# Definition of Done

A feature is complete only if:

✓ UI completed

✓ Responsive

✓ Accessible

✓ Loading state

✓ Empty state

✓ Error state

✓ Mobile tested

✓ Build passes

✓ Lint passes

✓ TypeScript passes

✓ No console logs

✓ Proper animations

✓ Proper documentation

Otherwise

The feature is NOT complete.

---

# Final Principle

Every commit should improve the repository.

Never add technical debt.

Always leave the codebase cleaner than before.
