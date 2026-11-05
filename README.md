# OmniBrand Studio ✦ Multi-Tenant AI Social Media Automation Platform

OmniBrand Studio is an enterprise-grade, multi-tenant AI social media automation platform designed for parent holding companies and brand conglomerates (e.g., luxury conglomerates, holding media groups, multi-brand incubators) to orchestrate, synthesize, quality-gate, and schedule on-brand social media campaigns across multiple child companies and digital distribution channels.

---

## 🏛 Multi-Tenant Data Hierarchy

```
Organization (Parent Holding Company)
 │   • ID, Name, Plan (STARTER | PRO | ENTERPRISE), Replicate / OpenAI / Ayrshare API Keys
 │
 ├── Subsidiary / Child Brand 1 (e.g. Lumina Creative Labs)
 │    ├── Brand Tone, Hex Colors, Logo, Tone Directives, Target Audience
 │    ├── Connected Social Accounts (Instagram, LinkedIn, X, Facebook, Pinterest)
 │    └── Scheduled & Published Posts
 │
 ├── Subsidiary / Child Brand 2 (e.g. Apex Capital & DeFi)
 │    ├── Brand Tone, Hex Colors, Logo, Tone Directives, Target Audience
 │    ├── Connected Social Accounts (LinkedIn, X)
 │    └── Scheduled & Published Posts
 │
 └── Subsidiary / Child Brand N...
```

---

## 🚀 End-to-End Stepper Workflow (5 Steps)

### Step 1: Subsidiary Selector
- Switch between child companies under the parent organization.
- Inspect brand identity metadata: primary/secondary/accent color swatches, active social account status badges, and brand tone guidelines.

### Step 2: Target Platform Selection
- Toggle target distribution channels: **Instagram**, **LinkedIn**, **X (Twitter)**, **Facebook**, **Pinterest**.
- Dynamic aspect-ratio matrix automatically linked to the selected platform:
  - **1:1 Square** (1080×1080) — Optimal for Instagram Feed & Facebook
  - **16:9 Landscape** (1920×1080) — Optimal for LinkedIn & X (Twitter)
  - **4:5 Portrait** (1080×1350) — High-impact mobile portrait for Instagram & Pinterest
  - **9:16 Vertical** (1080×1920) — Optimal for Stories & Reels

### Step 3: Prompt & AI Generation Engine
- High-fidelity prompt engineering studio with real-time character counters.
- **"Enhance with Brand Tone" Switch**: Injects child company aesthetic guidelines, lighting parameters, chromatic accents, and photographic styles into the diffusion prompt.
- **Model Selector**:
  - `Flux.1 Pro`: State-of-the-art prompt fidelity & micro-surface caustics
  - `DALL-E 3`: Deep semantic coherence & illustrative composition
  - `SDXL Turbo`: Sub-second inference for rapid draft cycles
- AI Caption Generator and Hashtag manager tailored to the chosen brand voice.

### Step 4: Preview & Approval Gate (The Core Step)
- **Pixel-Accurate Native Previews**:
  - **Instagram Post Card**: Verified header, aspect ratio container, interactive heart/bookmark/comment bar, like counters, formatted captions with hashtags.
  - **LinkedIn Feed Card**: Author avatar, company tagline, "Promoted • 1d" indicator, expandable copy, reactions bar (👍 ❤️ 💡), comment count.
  - **X (Twitter) Tweet Card**: Circular avatar, verified badge, tweet copy, rounded media container, metrics, retweet/reply/like engagement bar.
- **Dual Approval Gate**:
  - **"Reject / Regenerate"**: Opens revision drawer with feedback input (e.g., *"Make lighting warmer"*, *"Soften background contrast"*), re-runs diffusion with history revision comparison.
  - **"Approve & Schedule"**: Unlocks the scheduling gateway.

### Step 5: Scheduling & Connectors
- Date & time picker with global timezone selector (ET, PT, GMT, SGT, IST, UTC).
- **"Post Immediately"** vs. **"Schedule for Later"** mode.
- High-engagement algorithmic presets (*"Tomorrow Morning 9:00 AM"*, *"Peak B2B Thursday 10:00 AM"*).
- **Ayrshare & Buffer API Connector Dispatcher**: Interactive payload inspector displaying live JSON payloads formatted to publisher API specifications.
- Confetti celebration upon scheduling with direct transition to the **Content Calendar**.

---

## 🛠 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS, Dark/Light Mode, Custom Glassmorphism
- **Icons**: Lucide Icons
- **State Management**: Zustand
- **Database & ORM**: Prisma ORM with PostgreSQL Schema
- **Generative AI Engines**: Replicate API (Flux / SDXL) / OpenAI DALL-E 3 Gateway
- **Social Connectors**: Ayrshare & Buffer API Formatters

---

## 📦 Project Structure

```
├── prisma/
│   └── schema.prisma            # PostgreSQL multi-tenant schema
├── src/
│   ├── app/
│   │   ├── api/                 # Next.js App Router API endpoints
│   │   │   ├── subsidiaries/    # GET, POST subsidiaries
│   │   │   ├── posts/           # GET, POST, DELETE scheduled posts
│   │   │   ├── generate-image/  # AI image synthesis endpoint
│   │   │   ├── generate-caption/# Semantic copy generation
│   │   │   └── schedule/        # Social connector dispatch endpoint
│   │   ├── globals.css          # Theme variables & glassmorphism styles
│   │   ├── layout.tsx           # Root metadata & html wrapper
│   │   └── page.tsx             # Studio master controller & tab router
│   ├── components/
│   │   ├── Header.tsx           # Org badge, subsidiary switcher, theme toggle
│   │   ├── StepperNav.tsx       # 5-step interactive workflow bar
│   │   ├── Step1BrandSelector.tsx # Step 1: Subsidiary visual selector
│   │   ├── Step2PlatformSelector.tsx # Step 2: Distribution & aspect ratios
│   │   ├── Step3PromptStudio.tsx# Step 3: Prompt composer & diffusion engine
│   │   ├── Step4PostPreview.tsx # Step 4: Native mockups & approval gate
│   │   ├── Step5SchedulePublish.tsx # Step 5: Ayrshare/Buffer scheduler
│   │   ├── ContentCalendar.tsx  # Campaign history & telemetry calendar
│   │   ├── BrandKitManager.tsx  # Subsidiary creation & color manager
│   │   └── SettingsModal.tsx    # API key configuration & diagnostics
│   ├── lib/
│   │   ├── ai-engine.ts         # Brand tone injector & procedural visuals
│   │   ├── mock-data.ts         # Seed data for holding group & brands
│   │   ├── social-connectors.ts # Ayrshare & Buffer API formatters
│   │   ├── store.ts             # Zustand centralized workflow store
│   │   └── utils.ts             # Tailwind class merging & formatters
│   └── types/
│       └── index.ts             # Full TypeScript interfaces & types
```

---

## 🏃 Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Generate Prisma Client**:
   ```bash
   npx prisma generate
   ```

3. **Run Development Server**:
   ```bash
   npm run dev
   ```

4. **Build for Production**:
   ```bash
   npm run build
   npm start
   ```

Open [http://localhost:3000](http://localhost:3000) to access the OmniBrand Studio workspace.

