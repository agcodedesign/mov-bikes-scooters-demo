# MOV Landing Page Implementation Plan

> **For agentic workers:** Execute tasks in this session with scoped parallel asset/review missions. User approved implementation from the completed Penpot model and explicitly requested parallel-agents.

**Goal:** Implement only the MOV LP in Astro, faithfully using Vitrine Virtual's current layout and supplied imagery, organized as WebP, and validate desktop/tablet/mobile.

**Architecture:** Static Astro HTML with scoped section components, shared tokens and a reusable button. Native JavaScript handles menu, informational dialogs and email validation; no React hydration is necessary for this scope. Media has explicit dimensions and responsive WebP variants.

**Tech Stack:** Astro, TypeScript, CSS, Sharp for a repeatable image pipeline, Playwright and Axe for local QA.

**Spec:** Current Penpot file `124ca123-b2be-80ce-8008-e7cf8fe4b54e` (Vitrine Virtual), desktop board `50083b59-c3fd-8059-8008-f0bf18fe5c1b`, Tablet and Mobile pages; snapshot in `docs/design/penpot-desktop.json`.

## Global Constraints

- Only LP; do not implement admin, database, checkout or internal catalog routes.
- Preserve MOV logos, Manrope and colors `#E7E7E7`, `#FFA300`, `#17221D`, `#424A44`, `#F7F7F4`.
- Source assets: `D:\AG-DESIGN\AG_OPERACOES\01_CLIENTES\BIKECELL\ASSETS`; preserve originals; all delivered raster imagery in WebP.
- Use current desktop imagery to fill responsive slots, with hero 1 in tablet as recorded in Penpot. Adapt crop on small screens without stretching vehicles.
- No invented price, autonomy, specification, review, business channel or successful submission.
- Record corrections to obvious spelling errors (Inicio/Sooters) and omission of design-only placeholder annotations.

## Review Focus

- Narrow 320 px screens, long subtitles and integrated email input must not overflow or clip.
- Category/CTA links must have meaningful local destinations while the scope is one page.
- Menu must close with Escape and selection, expose expanded state and restore focus.
- Newsletter validates empty/invalid values; unconfigured integration must never claim successful subscription or send an email in a URL.
- Photos must match Penpot roles and preserve proportions; lazy images load while scrolling and no resource returns 404.

## Task 1: Source and media preparation

Files: `docs/design/penpot-desktop.json`, `scripts/prepare-assets.mjs`, `public/images/{brand,hero,products,editorial,lifestyle,newsletter}`, `docs/assets-manifest.json`.

- [x] Inspect Penpot desktop, responsive boards, colors, copy and images through MCP.
- [x] Independently inventory all 16 local source files and inspect their composition.
- [x] Generate descriptive WebP assets and responsive sizes without changing originals.
- [x] Verify dimensions, sizes and role/source mapping in manifest.

## Task 2: Static landing implementation

Files: `package.json`, `astro.config.mjs`, `tsconfig.json`, `src/layouts/BaseLayout.astro`, `src/styles/{tokens,global}.css`, `src/components/{ui,layout,sections}`, `src/pages/index.astro`, `src/config/site.ts`.

Interfaces: Button takes href or dialog target, label/slot and variant. ResponsiveImage takes base source, widths, dimensions, alt, sizes and priority. Config contains optional confirmed channels and newsletter endpoint (empty by default).

- [x] Build semantic HTML, tokens, metadata, local Manrope and shared primitives.
- [x] Implement Header/Hero/Brand/Benefits/Showcase/Editorial/Experience/Testimonials/Newsletter/Footer faithfully to source.
- [x] Use current product name V8 Pro S only; omit technical annotations overlapping product card. Preserve empty reviews section without fictitious people.
- [x] Anchor category links locally; show truthful contact/privac​​y information when channels or service are absent.
- [x] Implement integrated white email field, orange button and arrow, validation and honest unavailable state.

## Task 3: Rendered QA and handoff

Files: `scripts/qa.mjs`, `artifacts/qa`, `docs/04-implementation-handoff.md`, `README.md`.

- [x] Run Astro check/build and browser scenarios at 320, 390, 768, 1024, 1440 and 1920 px.
- [x] Exercise menu, keyboard, dialogs, local anchors, newsletter empty/invalid/valid/unavailable and privacy behavior.
- [x] Check overflow, images, console/network, metadata, accessible names, contrast and reduced motion.
- [x] Capture desktop/tablet/mobile and compare composition with Penpot export.
- [x] Independent final code/interaction review, fix actionable findings and rerun relevant checks.
- [x] Document run commands, media map, local QA evidence and outstanding external integrations. No deployment requested.

## Execution ledger

- 2026-11-16: User explicitly approved Penpot model and requested Astro implementation; no new design approval needed. Original folder contains documentation only, no existing application or git repository.
- Ruling: CSS and native scripts instead of React/Tailwind runtime for this bounded static LP; reduces dependencies while preserving appearance and behavior. Future app stack remains a separate phase.
- Ruling: contact/newsletter backend and actual commercial channels are unprovided; preserve the interface and report unavailable honestly rather than simulate success.

