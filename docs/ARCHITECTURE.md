# VenueMind AI Architecture

Version: 1.0

Status: Source of Truth

---

# Purpose

This document defines the complete software architecture of VenueMind AI.

It is the single source of truth for how the application must be built.

Every feature, component, API, store, service, and prompt must follow the rules defined in this document.

Whenever implementation decisions conflict with this document, this document takes priority.

---

# Scope

This document defines

- Application architecture
- Folder ownership
- Component boundaries
- State management
- AI reasoning architecture
- Service layer
- Prompt architecture
- Data flow
- Security boundaries
- Performance principles
- Accessibility principles
- Engineering conventions

This document intentionally does NOT define

- UI styling
- Feature details
- User flow
- Prompt wording

Those are covered by their respective documents.

---

# Vision

VenueMind AI is a real-time GenAI Stadium Operations Copilot built for FIFA World Cup 2026.

Unlike a chatbot, VenueMind AI acts as a shared operational intelligence layer.

One AI brain supports multiple personas.

Examples

- Fan
- Volunteer
- Operations Team
- Security Staff
- Accessibility Staff

Each persona receives different reasoning while sharing the same AI engine.

---

# Architecture Principles

The project follows these principles.

## 1. Single Responsibility

Every file has one responsibility.

Every folder has one responsibility.

Every component has one responsibility.

No component should solve multiple unrelated problems.

---

## 2. Composition over Complexity

Large components must be composed from small reusable components.

Avoid large monolithic files.

---

## 3. AI First

AI is a system capability.

Not a page.

Not a widget.

Every feature should be capable of requesting AI reasoning through the shared AI layer.

---

## 4. Modular Design

Every feature is isolated.

No feature should tightly depend on another.

Communication happens through

- services
- stores
- typed interfaces

Never through direct imports of unrelated components.

---

## 5. Type Safety

Every object must have explicit TypeScript types.

No implicit any.

No unknown data enters the UI without validation.

---

# High Level Architecture

Application

↓

Presentation Layer

↓

Feature Components

↓

State Management

↓

Service Layer

↓

AI Layer

↓

External APIs

---

# Folder Responsibilities

## app/

Routing only.

Never place business logic here.

Never place AI logic here.

Never place calculations here.

---

## components/

Contains visual building blocks.

Components must never directly call external APIs.

Components communicate through services and stores.

---

### components/dashboard

Dashboard layout

Workspace

Widgets

Overview

---

### components/cards

Decision cards

Incident cards

Information cards

Recommendation cards

---

### components/map

Interactive stadium map

Navigation overlays

Crowd visualization

---

### components/incident

Incident timeline

Incident details

Priority indicators

---

### components/persona

Persona selector

Persona badges

Persona information

---

### components/ai

AI conversation

Reasoning output

Generated recommendations

Context panels

---

### components/shared

Reusable UI

Loading

Error

Empty

Skeleton

---

### components/providers

Application providers

Never place feature logic here.

---

# Services

The service layer owns all external communication.

Components never call APIs directly.

Current services

Assistant Service

Incident Service

Map Service

Future services

Weather

Transportation

Translation

Notifications

Analytics

---

# Store Architecture

Stores own application state.

Stores never call UI.

Stores never render components.

Stores expose actions.

Stores expose selectors.

Current modules

Persona Store

Incident Store

Assistant Store

UI Store

Future modules

Notification Store

Transportation Store

Settings Store

Accessibility Store

---

# AI Reasoning Architecture

VenueMind AI uses one shared reasoning engine.

Every persona shares the same AI.

Different prompts.

Different context.

Same reasoning pipeline.

Reasoning pipeline

User Context

↓

Persona

↓

System Prompt

↓

Current Incident

↓

Map Context

↓

Conversation History

↓

AI Response

---

The AI layer never directly updates UI.

The AI returns structured responses.

The UI decides how to render them.

---

# Prompt Architecture

Prompts are separated from implementation.

System Prompt

Persona Prompt

Prompt Templates

No prompts should be hardcoded inside React components.

---

# Data Flow

User Interaction

↓

Store Action

↓

Service

↓

AI / External API

↓

Validation

↓

Store Update

↓

Component Render

Never bypass this flow.

---

# Validation

Every external response must pass Zod validation.

No raw API response enters the application.

Validation occurs inside the service layer.

---

# Error Handling

Every service returns predictable errors.

Never throw unknown objects.

Expected errors

Network

Validation

Timeout

Unauthorized

Unavailable Service

Rate Limit

Unknown

---

# Logging

Use logger.ts.

Never use console.log.

Development

debug

info

warn

error

Production

warn

error

Only.

---

# Security

Never expose secrets.

Never trust client input.

Validate every external payload.

Never store API keys in the browser.

Environment variables are accessed only through env.ts.

---

# Accessibility

Keyboard first.

Screen reader friendly.

Semantic HTML.

Visible focus.

Reduced motion support.

Minimum touch targets

44px

Color contrast

WCAG AA minimum.

---

# Performance

Lazy load heavy components.

Lazy load AI modules.

Avoid unnecessary rerenders.

Memoize expensive computations.

Prefer derived state over duplicated state.

Keep bundle size small.

---

# Naming Conventions

Components

PascalCase

Stores

camelCase

Hooks

useSomething

Types

PascalCase

Constants

UPPER_CASE

Folders

lowercase

---

# Component Rules

One component.

One purpose.

Maximum readability.

Avoid deeply nested JSX.

Extract repeated UI.

Never duplicate business logic.

---

# API Rules

Every endpoint returns

Success

or

Typed Error

Never return inconsistent objects.

---

# Future Expansion

Architecture should support

Weather APIs

Transport APIs

IoT Sensors

Camera Feeds

Voice Assistant

Push Notifications

Analytics

without restructuring the application.

---

# Non Goals

This project is not

A CRUD dashboard

A traditional chatbot

A monolithic React application

A collection of disconnected pages

---

# Definition of Done

A feature is considered complete only if

✓ Strict TypeScript passes

✓ ESLint passes

✓ Build passes

✓ Uses existing architecture

✓ Uses typed interfaces

✓ Uses services

✓ Uses stores

✓ Accessible

✓ Responsive

✓ No duplicated logic

✓ No console.log

✓ No hardcoded prompts

✓ No business logic inside components

✓ Zod validation used where required

✓ Performance considered

✓ Folder ownership respected

Only then is the feature considered complete.

---

# Final Rule

Architecture is the highest priority engineering document.

Every future implementation must follow this document before introducing new code.

When uncertain, prefer consistency over convenience.
