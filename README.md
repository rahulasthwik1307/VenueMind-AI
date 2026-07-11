<div align="center">

# 🏟️ VenueMind AI

### AI-Powered Stadium Operations Command Center

**Built for the FIFA World Cup 2026 — Smart Stadiums & Tournament Operations Challenge**

_One AI reasoning engine. Every operational decision, in real time._

[![Live Demo](https://img.shields.io/badge/Live%20Demo-venue--mind--ai.vercel.app-0f5132?style=for-the-badge&logo=vercel)](https://venue-mind-ai.vercel.app/)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![Groq](https://img.shields.io/badge/Groq-Llama%203.3%2070B-orange?style=flat-square)](https://groq.com)
[![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](#license)

[Live Demo](https://venue-mind-ai.vercel.app/) · [Features](#-key-features) · [Architecture](#-system-architecture) · [Getting Started](#-getting-started)

</div>

---

## 📖 Overview

VenueMind AI is a real-time operations intelligence platform built for the people who actually run a FIFA World Cup stadium — not the fans in the seats, but the operators watching the incident queue, the analysts triaging risk, the teams deciding what happens in the next five minutes.

Most hackathon submissions for this challenge default to a consumer-facing fan app. VenueMind AI deliberately does not. The challenge brief scopes the problem as _"fans, organizers, volunteers, **or** venue staff"_ — an _or_, not an _and_. VenueMind AI takes that seriously: one persona, one deep, production-quality product, rather than four shallow ones.

The result is a Digital Twin–centered command console where a live-simulated stadium feeds a real Groq/Llama-powered reasoning engine, and every operational surface — incident management, crowd/transport/emergency/accessibility monitoring, a full AI command center, and a historical operations log — shares that same underlying intelligence.

> **This is not a chatbot bolted onto a dashboard.** The AI is the decision-support layer running underneath the entire product.

---

## 🎯 The Problem

Running a World Cup stadium means absorbing a constant stream of operational signals — crowd density shifting at a gate, a medical call, a transport delay, an accessibility request — and making the right call fast, often with incomplete information, across multiple simultaneous domains.

Existing stadium tech is largely **monitoring-first**: dashboards that show data but don't reason about it. Very little of it is **decision-support-first** — actively interpreting a situation, predicting risk, and recommending a specific, justified next action.

## ✅ Our Solution

VenueMind AI closes that gap with a single, shared AI reasoning engine that:

- Interprets live (simulated) telemetry and incident data
- Predicts operational risk before it escalates
- Recommends specific, tactical responses with confidence scoring
- Explains _why_ — every AI output includes situation context, expected risk, and reasoning, never a black-box answer
- Feeds every action back into a persistent operational timeline, so nothing the AI or an operator does happens in isolation

---

## ✨ Key Features

### 🗺️ Interactive Stadium Digital Twin

A custom-built, layered React SVG stadium — not a generic map — with live incident markers, crowd density visualization, gate/route overlays, and zone-level drill-down, styled to feel like a genuine SOC/mission-control interface.

### 🧠 AI Command Center

A dual-mode reasoning console: **structured mode** (select an incident, zone, or operational domain for a full AI briefing) and **free-form mode** (ask any operational question in natural language). Every response is schema-validated, confidence-scored, and dispatchable directly into the operations timeline. Powered by Groq running Llama 3.3 70B.

### 🚨 Live Incident Management Console

A full incident command queue with multi-select bulk actions, AI-assisted consolidated briefings across multiple incidents, per-incident AI situation intelligence with tactical recommendations, and a complete inline lifecycle timeline per incident.

### 🎯 Domain Intelligence Lens Pages

Dedicated operational views for **Crowd Monitoring**, **Transport**, **Emergency**, and **Accessibility** — each bound to live telemetry, each with a domain-scoped "Ask AI" console, and Accessibility additionally featuring a Tactical Accessibility Dispatch Tool that generates structured, step-by-step accommodation routing.

### 🌐 Multilingual AI Output

AI-generated responses (situation summaries, tactical recommendations, dispatch briefings) can be returned in English, Spanish, French, Portuguese, or Hindi — critical for a tournament with multinational staff and volunteer teams.

### 📋 Global Operations Timeline

A complete, phase-grouped chronological log of every detection, AI analysis, dispatch, and resolution across the session — the operational "flight recorder," with activity density visualization and full filtering.

### ⚙️ Live Simulation Engine

A realistic, phase-driven match simulation (pre-match → first half → halftime → second half → post-match) generating live telemetry, incidents, weather, and crowd events — providing a fully functional, demonstrable environment without requiring real stadium IoT infrastructure.

---

---

## 🏗️ System Architecture

VenueMind AI is built on strict separation of concerns, with one shared AI reasoning pipeline underneath every feature:

```text
User Interaction
        ↓
Zustand Store (state)
        ↓
Service Layer (business logic)
        ↓
Context Builder (assembles incident/zone/domain/telemetry context)
        ↓
Server-side API Route (/api/assistant)
        ↓
Groq (Llama 3.3 70B) — structured JSON output
        ↓
Zod Schema Validation
        ↓
Store Update
        ↓
Component Render
```

**Key architectural decisions:**

- **One AI brain, many entry points** — the Digital Twin's AI panel, the AI Command Center, every lens page's Domain Copilot, and Live Incidents' consolidated briefing all funnel through the same context builder and reasoning pipeline, not separate implementations.
- **No database** — the app is intentionally stateless and simulation-driven, with all "live" data coming from an in-memory simulation engine. This keeps the architecture small, auditable, and removes an entire class of security surface, while remaining structured to swap in real IoT/telemetry feeds without a rewrite.
- **Server-only AI calls** — the Groq API key is never exposed client-side; every AI request is proxied through a Next.js API route with input validation and schema-enforced output.
- **Type-safe throughout** — strict TypeScript, Zod validation on every AI response before it reaches the UI, with no `any` usage.

---

## 🧰 Technology Stack

| Layer                  | Technology                                                            |
| ---------------------- | --------------------------------------------------------------------- |
| Framework              | [Next.js 16](https://nextjs.org) (App Router)                         |
| Language               | TypeScript (strict mode)                                              |
| State Management       | [Zustand](https://github.com/pmndrs/zustand)                          |
| Styling                | [Tailwind CSS v4](https://tailwindcss.com) with CSS custom properties |
| Animation              | [Framer Motion](https://www.framer.com/motion/)                       |
| Digital Twin Rendering | Custom React SVG + `react-zoom-pan-pinch`                             |
| AI Inference           | [Groq](https://groq.com) — Llama 3.3 70B                              |
| Validation             | [Zod](https://zod.dev)                                                |
| Icons                  | [Lucide React](https://lucide.dev)                                    |
| Testing                | Vitest                                                                |
| Linting/Formatting     | ESLint, Prettier                                                      |
| Deployment             | Vercel                                                                |

---

## 📂 Project Structure

```text
src/
├── app/                      # Next.js routes (App Router)
│   ├── (marketing)/          # Landing page (no app shell)
│   ├── (app)/                # Operational console (AppShell-wrapped)
│   │   ├── dashboard/
│   │   ├── incidents/
│   │   ├── ai-command/
│   │   ├── map/
│   │   ├── crowd/ transport/ emergency/ accessibility/
│   │   ├── timeline/
│   │   └── settings/
│   └── api/assistant/        # Server-side Groq proxy route
├── components/
│   ├── digitalTwin/          # Stadium SVG, layers, panels
│   ├── incident/             # Incident table, drawer, timeline
│   ├── ai/                   # AI Command Center, response cards
│   ├── operations/           # Dashboard widgets
│   ├── layout/                # AppShell, sidebar, header, right panel
│   └── shared/                # Loading/Error/Empty states, UI primitives
├── services/
│   ├── ai/                    # Context builder, assistant service
│   └── simulation/            # Phase-driven scenario engine
├── store/modules/             # Zustand stores (incident, assistant, ui, digitalTwin)
├── prompts/                   # System prompt, persona prompt, templates
├── schemas/                   # Zod validation schemas
├── types/                     # Shared TypeScript types
└── constants/                 # Config, routes, mock data
docs/                          # Architecture, design, engineering, testing docs
```

---

## 🎯 Challenge Alignment

The FIFA World Cup 2026 Smart Stadiums & Tournament Operations challenge scopes its target audience as _"fans, organizers, volunteers, or venue staff"_ — deliberately an inclusive **or**, not a requirement to cover all four.

**VenueMind AI targets venue staff and operations management, deliberately and entirely.** Rather than building shallow features across four personas, this project goes deep on one — because a stadium operations manager making a crowd-crush call in real time needs a fundamentally different tool than a fan looking for their seat.

Within that scope, VenueMind AI directly addresses:

| Challenge Pillar               | How VenueMind AI Addresses It                                                |
| ------------------------------ | ---------------------------------------------------------------------------- |
| **Operational Intelligence**   | AI Command Center, per-domain Copilots, incident situation intelligence      |
| **Real-Time Decision Support** | Structured AI briefings with confidence scoring and tactical recommendations |
| **Crowd Management**           | Digital Twin density visualization, Crowd Monitoring lens page               |
| **Accessibility**              | Tactical Accessibility Dispatch Tool with AI-generated routing               |
| **Multilingual Assistance**    | AI response language selector (EN/ES/FR/PT/HI)                               |
| **Transportation**             | Transport lens page with live transit telemetry and AI-scoped queries        |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- A free [Groq API key](https://console.groq.com)

### Installation

```bash
# Clone the repository
git clone https://github.com/rahulasthwik1307/VenueMind-AI.git
cd VenueMind-AI

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env.local
# then add your GROQ_API_KEY to .env.local

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you'll land on the landing page; click **Enter Command Center** to access the operations console.

### Verification

```bash
npm run lint      # ESLint — must pass with 0 warnings
npm run build      # Production build check
npm run test:run   # Vitest unit test suite
```

---

## 🌐 Live Demo

**[venue-mind-ai.vercel.app →](https://venue-mind-ai.vercel.app/)**

> All stadium telemetry, incidents, and match events are generated by a live simulation engine — this is intentional, not a limitation. AI reasoning (Groq/Llama 3.3 70B) is fully live and real; the underlying operational data is simulated to provide a complete, demonstrable environment without requiring real stadium IoT infrastructure. The architecture is designed to swap in live sensor/telemetry feeds without restructuring the application.

## ♿ Accessibility & Engineering Standards

- WCAG AA contrast throughout, both light and dark themes
- Full keyboard operability across every interactive surface (tables, dropdowns, dialogs, drawers)
- `aria-live` regions for dynamic AI response content
- `prefers-reduced-motion` respected across all animations
- Strict TypeScript, Zod-validated AI I/O, zero `console.log` in production paths
- Unit-tested business logic (context building, schema validation, filtering, store actions)

---

<div align="center">

**Built by [Rahul Asthwik](https://github.com/rahulasthwik1307)**

[GitHub](https://github.com/rahulasthwik1307) · [LinkedIn](https://www.linkedin.com/in/rahul-asthwik-sunki/)

_FIFA World Cup 2026 — Smart Stadiums & Tournament Operations Challenge_

</div>
