# Initial Technical Stack

## Purpose

This document records the initial implementation stack for `dl-graph-studio`.
It is the decision input for the app-shell issue and should prevent future
Phase 1 issues from re-deciding framework, language, graph canvas, styling,
package manager, and test/build tooling.

The product direction comes from `PRD.md`: `dl-graph-studio` is a local-first
desktop application for visual neural architecture prototyping. PyTorch is the
future execution target, while a graph-based JSON/DSL remains the canonical
internal representation.

## Decision Summary

Use a Tauri 2 desktop shell with a React, TypeScript, and Vite frontend.
Use React Flow (`@xyflow/react`) for the graph editor surface. Use Tailwind CSS
with local design tokens for styling. Use `pnpm` for JavaScript package
management. Use Vitest and Testing Library for unit/component coverage, and
Playwright for end-to-end UI flows once the app has user-visible behavior.

## Stack Choices

### App Framework

- **Desktop shell:** Tauri 2.
- **Frontend app:** React running through Vite.
- **Shell language:** Rust, limited to desktop integration and local process
  orchestration.
- **Runtime execution direction:** a future Python/PyTorch sidecar or local
  runtime process, invoked from the Tauri backend when runtime issues begin.

Rationale:

- The PRD calls for a desktop-first, local-first application rather than a
  browser-first educational site.
- Tauri keeps the desktop wrapper small and lets the frontend remain a normal
  web application.
- Tauri supports sidecar binaries, which fits the future need to run local
  Python/PyTorch execution without making PyTorch part of the UI layer.
- Rust should stay at the shell boundary. Product state, graph editing, and
  inspector UI should live in the TypeScript frontend until there is a concrete
  need to move behavior into the backend.

### Language

- **Primary UI language:** TypeScript.
- **UI framework language:** React with TSX.
- **Desktop shell language:** Rust, generated and maintained by Tauri.
- **Future ML runtime language:** Python with PyTorch.

Rationale:

- TypeScript gives the graph editor a typed data model for nodes, edges,
  parameters, validation results, and project persistence.
- React has strong ecosystem support for node-based editors and componentized
  inspector panels.
- Python should remain isolated to runtime execution so the frontend can stay
  fast, testable, and independent from ML environment setup.

### Graph And Canvas Approach

- **Graph editor library:** React Flow via `@xyflow/react`.
- **Canonical graph model:** project-owned TypeScript types that map to a
  JSON/DSL shape, not raw React Flow state and not PyTorch code.
- **React Flow role:** rendering, viewport, selection mechanics, handles, and
  edge interaction.
- **Application model role:** primitive/composite node definitions,
  parameters, validation state, persistence, and compiler inputs.

Rationale:

- The roadmap quickly needs empty canvas rendering, static nodes, selection,
  inspector behavior, parameter edits, and connections.
- React Flow already provides the low-level graph-editor primitives needed for
  those Phase 1 issues.
- Keeping a separate project model avoids locking persistence and future
  PyTorch compilation to a UI library's internal shape.

### Styling Approach

- **Styling system:** Tailwind CSS through the Vite plugin.
- **Design tokens:** CSS custom properties for product colors, spacing, borders,
  shadows, and typography decisions.
- **Component strategy:** local React components first; do not add a large UI
  component library until repeated UI patterns justify it.
- **Icon strategy:** use `lucide-react` when icon buttons or compact controls
  are needed.

Rationale:

- The UI should be minimal, readable, and graph-focused.
- Tailwind keeps early layout work fast while still allowing stable tokens for
  the broader `dl-playground` visual relationship.
- Avoiding a large component library keeps Phase 1 focused on editor behavior
  instead of adapting generic UI abstractions too early.

### Package Manager

- **Package manager:** `pnpm`.
- **Initial repository shape:** single app package.
- **Future workspace direction:** add a `pnpm` workspace only when there is a
  second real package, such as a shared graph schema package or runtime bridge.

Rationale:

- `pnpm` has strong dependency installation performance and workspace support.
- Starting as a single package keeps the app shell issue small.
- Delaying workspace setup avoids monorepo structure before there is an actual
  package boundary.

### Test And Build Tooling

- **Frontend dev/build:** Vite.
- **Type checking:** TypeScript compiler in no-emit mode.
- **Unit/component tests:** Vitest with Testing Library.
- **End-to-end UI tests:** Playwright, introduced when there is a meaningful
  user flow to verify.
- **Linting:** ESLint with TypeScript and React rules.
- **Formatting:** Prettier.
- **Desktop build:** Tauri CLI once the app shell exists.

Expected initial scripts for the app shell issue:

- `pnpm dev` starts the Vite development server.
- `pnpm tauri dev` starts the desktop shell in development mode.
- `pnpm build` type-checks and builds the frontend.
- `pnpm test` runs Vitest.
- `pnpm lint` runs ESLint.
- `pnpm format:check` checks formatting.

Rationale:

- Vite, Vitest, and React share the same frontend toolchain.
- TypeScript checks should be explicit instead of relying only on Vite's
  transpilation.
- Playwright is the right fit for verifying editor workflows once interactions
  exist, but it does not need to block the first app shell.

## Rejected Alternatives

### Electron

Electron would make Node integration straightforward, but it ships a larger
runtime than this project needs for the MVP. Tauri better matches the
local-first desktop requirement while keeping the UI web-based.

### Next.js

Next.js is strong for full-stack web applications, but this product is not a
server-rendered web app. The first implementation should optimize for a local
desktop editor with a client-side graph workspace.

### Custom Canvas From Scratch

A custom SVG/canvas graph editor would maximize control, but it would spend
early roadmap time rebuilding viewport, selection, handles, edges, and
connection behavior. React Flow provides those primitives while still allowing
custom node and edge rendering.

### Python-First Desktop UI

A Python UI stack would sit closer to PyTorch, but it would make the graph
editor, inspector, and modern desktop UI harder to build quickly. Python should
serve the runtime layer, not the primary UI layer.

## Phase 1 Implementation Guidance

- Keep product state in TypeScript and define project-owned graph types before
  persistence or compiler work depends on them.
- Treat React Flow state as an adapter layer around the project graph model.
- Keep Tauri backend code minimal until runtime execution or file-system
  integration requires it.
- Do not add PyTorch, training, model compilation, or Python runtime packaging
  during the app-shell or early canvas issues.
- Prefer narrow tests tied to each roadmap issue: render tests for UI state,
  model tests for graph transformations, and Playwright tests for complete
  editor flows once interactions exist.

## Reference Links

- Tauri 2: https://tauri.app/
- Tauri sidecars: https://tauri.app/develop/sidecar/
- Vite: https://vite.dev/
- React: https://react.dev/
- React Flow: https://reactflow.dev/
- Tailwind CSS Vite setup: https://tailwindcss.com/docs/installation
- pnpm: https://pnpm.io/
- Vitest: https://vitest.dev/
- Playwright: https://playwright.dev/
