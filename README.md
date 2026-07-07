# VenueMind AI

> One AI Brain. Every Stadium Decision.

VenueMind AI is a production-quality GenAI-powered Stadium Operations Copilot designed for the FIFA World Cup 2026. The platform integrates a unified shared AI reasoning engine serving Fans, Volunteers, and the central Operations Team via distinct persona-specific prompt interfaces.

---

## 🛠️ Architecture & Tech Stack

This project is optimized for code quality, strict typing, security, accessibility, and AI evaluation metrics.

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org) with TypeScript
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com) with CSS custom properties
- **Animation**: [Framer Motion](https://www.framer.com/motion/)
- **Validation**: [Zod](https://zod.dev)
- **Linter & Formatter**: ESLint, Prettier, Husky, and lint-staged

---

## 📂 Project Structure

```text
src/
├── app/                  # Next.js Pages & Layouts
├── components/           # UI Components
│   ├── ai/               # AI reasoning and chat components
│   ├── cards/            # Reusable card representations
│   ├── dashboard/        # Operations metrics view
│   ├── incident/         # Incident reporting and view details
│   ├── layout/           # Structure components (Header, Sidebar)
│   ├── map/              # Leaflet or custom map component layout
│   ├── persona/          # Persona selection controls
│   ├── timeline/         # Operations incident log timeline
│   ├── common/           # Shared general components
│   ├── ui/               # Lower-level shadcn UI components
│   ├── providers/        # Global providers (App, Theme, Store, Motion)
│   ├── shared/           # Common views (Loading, Error, Empty, ErrorBoundary)
│   └── icons/            # Custom Lucide/svg wrappers
├── hooks/                # Custom React Hooks
├── lib/                  # Shared integrations (Zod validation, cn helper, logger)
├── services/             # Backend API communication wrappers
│   ├── ai/               # AI assistance queries
│   ├── incident/         # Incident actions endpoints
│   └── map/              # Map metrics endpoints
├── store/                # Zustand modular client state
├── types/                # Strict TypeScript declaration types
├── constants/            # Global application configs and color codes
├── utils/                # Small single-responsibility utility helpers
├── prompts/              # System, persona and template instructions for LLMs
├── styles/               # CSS and styles files
└── data/                 # Local structured data directories
public/
└── mock/                 # Mock JSON endpoints for off-grid operation
docs/                     # Architectural design drafts
```

---

## 🚀 Getting Started

1. **Install Dependencies**:

   ```bash
   npm install
   ```

2. **Prepare Environment variables**:

   ```bash
   cp .env.example .env.local
   ```

3. **Run the Development Server**:

   ```bash
   npm run dev
   ```

4. **Verify Standards**:
   ```bash
   npm run lint
   # and
   npm run build
   ```
