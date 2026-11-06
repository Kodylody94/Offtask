# Off Task: Podcast Business Plan & Planner

A specialized mobile-first web application designed to guide beginner podcasters through the growth and development of the "Off Task" podcast—a show exploring the intersection of sociology, psychology, and hot topics. This app transforms a complex business plan into an interactive, actionable roadmap.

> [!IMPORTANT]
> This plan focuses on a **Mobile-First Web App (React/Vite)** approach, prioritizing thumb-zone ergonomics and offline-first persistence using browser Local Storage. All content strategies rely on **Free Tools** and **Professional-Grade Accessibility**.

- **Project Choice**: Off Task Podcast Business Plan & Planner (Confirmed)
- **Platform**: Mobile-First Web App (Confirmed)
- **Primary Theme**: Sociology, Psychology, and Hot Topics (Confirmed)

## 1. Overview & Core Concept

- **What It Does**: Provides a structured, 4-phase business plan (Foundation, Production, Launch, Scaling) with interactive checklists, template drafts, and a resource library of free tools.
- **Target Audience**: Beginner podcasters looking for a professional-grade startup plan without high entry costs.
- **Key Value**: Democratizes high-end podcast strategy by breaking it down into "beginner-friendly" weekly actions.

## 2. User Experience & Visual Design

- **Key User Flows**:
  1. **Brand Dashboard**: View the high-level mission and core "Off Task" hooks.
  2. **Weekly Roadmap**: Progress through 4 key phases with interactive task tracking.
  3. **Resource Vault**: One-tap access to free tools for recording, editing, and distribution.
  4. **Growth Lab**: Interactive templates for social media outreach and sponsorship pitches.

- **Visual Identity & Theme**:
  - **Aesthetic Direction**: *Intellectual Minimalist*. High-contrast typography with a "modern editorial" feel, reflecting the sociology/psychology theme.
  - **Color Palette**: 
    - `Background`: Soft Off-White (`#FDFCFB`)
    - `Primary`: Deep Ink Blue (`#1A2B3C`)
    - `Accent`: Terracotta Orange (`#E67E22`) for call-to-actions.
  - **Typography**: 
    - `Display`: *Plus Jakarta Sans* (Bold for headers)
    - `Body`: *Manrope* (Clean, legible for long-form planning)

- **Interactive Feedback**:
  - Motion-driven page transitions using `framer-motion`.
  - Tactile haptic-style feedback on task completion.
  - Progress rings for each phase.

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Persistence Strategy**
  - *Chosen Approach*: **Browser Local Storage**.
  - *Why*: Provides immediate offline-first capability and zero-cost infrastructure. Perfect for a personal planner.
- **Decision 2: Content Delivery**
  - *Chosen Approach*: **Single Page Application (SPA) with View Transitions**.
  - *Why*: Ensures the "App-like" feel on mobile browsers without the overhead of complex routing.

## 4. Technical Architecture & Data Strategy

```text
┌─────────────────────────────────────────────────────────┐
│                   Mobile-First UI (React)               │
│  ┌───────────────┐  ┌────────────────┐  ┌────────────┐  │
│  │ Top Nav Bar   │  │  Main Viewport │  │ Bottom Nav │  │
│  └───────────────┘  └───────┬────────┘  └────────────┘  │
└─────────────────────────────┼───────────────────────────┘
                              ▼
                    ┌───────────────────┐
                    │   State Manager   │
                    │ (Context / Hooks) │
                    └─────────┬─────────┘
                              ▼
                    ┌───────────────────┐
                    │   Local Storage   │
                    │   (Persistence)   │
                    └───────────────────┘
```

### Data Model & State
- `Phase`: { id, title, description, tasks: Task[] }
- `Task`: { id, text, completed, resourceLink? }
- `BrandPlan`: { mission, hooks, audiencePersona, toolStack }

### Growth & Monetization Strategies (Built-in Content)
- **Phase 1 (Foundation)**: Identifying the "Why". Researching sociological trends. Setting up Spotify for Podcasters (Free).
- **Phase 2 (Production)**: Recording with Audacity (Free). Designing in Canva (Free).
- **Phase 3 (Acquisition)**: The "Shorts-First" strategy. Leveraging TikTok and IG Reels for discovery.
- **Phase 4 (Sponsorship)**: Building the "Media Kit". Direct outreach strategies for niche psychology/sociology brands.

---
*Plan created on 2026-11-06. Ready for execution upon approval.*
