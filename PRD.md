# dl-graph-studio - Initial PRD

> Complementary product inside the broader `dl-playground` ecosystem.
>
> `dl-playground` is a web-based educational platform for teaching deep learning concepts through interactive visualizations.
>
> `dl-graph-studio` is a more advanced, local-first desktop application for visually prototyping real neural architectures and executing them locally.

---

## 1. Document Status

- **Type:** Initial PRD
- **Status:** Draft v0.2
- **Language:** English
- **Primary use:** Product definition to guide implementation with an AI coding agent
- **Scope:** MVP-first, with explicit future directions
- **Relationship to parent project:** `dl-graph-studio` is a complementary advanced tool within `dl-playground`

---

## 2. Executive Summary

dl-graph-studio is a desktop application for visually building, exploring, modifying, and executing neural network architectures through hierarchical graph-based components.

It extends the broader mission of `dl-playground`.

- **dl-playground** teaches deep learning concepts visually.
- **dl-graph-studio** enables users to prototype real architectures visually and run them locally.

The interaction model is inspired by tools such as n8n:

- users compose models from **primitive** and **composite** components,
- composite components can be opened and edited as **subgraphs**,
- user-defined components can be saved, versioned, and reused,
- the resulting model can be trained directly inside the application through a basic local training loop.

The MVP is focused on:

- **individual researchers**,
- **architecture-first prototyping**,
- **local execution**,
- **PyTorch as the runtime**,
- **desktop-first UX**,
- and **hierarchical composition** down to the **neuron primitive**.

dl-graph-studio is not meant to replace `dl-playground`. It complements it by covering the advanced end of the spectrum: from concept learning to real architecture prototyping.

---

## 3. Product Context

### 3.1 Parent product: dl-playground

`dl-playground` is a web educational platform designed to teach deep learning concepts through interactive visualizations.

Its purpose is pedagogical:

- help users understand concepts,
- visualize how deep learning works,
- make abstract mechanisms easier to grasp.

### 3.2 Complementary product: dl-graph-studio

dl-graph-studio serves a different but related purpose.

Its purpose is practical and advanced:

- prototype real neural architectures,
- compose models visually,
- inspect and modify internal structure,
- execute models locally,
- experiment rapidly without leaving the tool.

### 3.3 Relationship between both products

The two products should feel related, but not identical.

Suggested product framing:

- `dl-playground` = educational, exploratory, concept-driven, browser-based
- `dl-graph-studio` = advanced, architecture-driven, execution-oriented, desktop-based

dl-graph-studio should inherit the spirit of visual clarity from `dl-playground`, but it should optimize for real prototyping rather than teaching.

---

## 4. Product Vision

Enable researchers to prototype, inspect, modify, and train neural architectures visually with the same fluidity that developers use node-based tools to prototype workflows.

dl-graph-studio should make it possible to:

1. build a modern architecture visually,
2. open any composite block and inspect its internals,
3. customize and save reusable components,
4. train the resulting model locally without leaving the application.

Long-term, dl-graph-studio may evolve into a broader visual deep learning IDE, but the first version should stay strongly focused on architecture prototyping.

---

## 5. Problem Statement

Defining neural architectures directly in code is powerful, but for fast experimentation it introduces friction:

- visual intuition is weaker than in a graph editor,
- complex models are harder to inspect hierarchically,
- experimentation requires switching between design, code, execution, and debugging,
- reusable building blocks remain code artifacts rather than first-class visual objects.

Researchers need a tool that lets them:

- prototype architectures more intuitively,
- understand complex models more easily,
- reuse custom components,
- run experiments directly in the same environment.

The key problem dl-graph-studio solves is not “how to teach deep learning”, but “how to make neural architecture prototyping more intuitive, hierarchical, and executable.”

---

## 6. Target User

### Primary user

**Individual AI researcher**

Typical traits:

- technically comfortable with neural-network concepts,
- wants faster architecture iteration,
- values clean visual reasoning,
- often experiments locally,
- may not want to write code for every architecture iteration.

### Secondary users later

- ML engineers
- advanced students
- technical experimenters

### Domain priorities

1. NLP
2. Audio
3. Multimodal
4. Vision

The product should remain general-purpose rather than domain-specific.

---

## 7. Core Value Proposition

dl-graph-studio should provide:

- **visual intuition** for neural architecture design,
- **faster prototyping** than building everything directly in code,
- **hierarchical understanding** of complex models,
- **component reuse** through user-defined building blocks,
- **in-app local execution** through a built-in training flow.

A user should feel that the tool is:

- intuitive,
- minimal,
- flexible,
- immediately useful for prototyping.

The strongest promise is:

> Build real neural architectures visually, inspect them hierarchically, reuse your own components, and run them locally without leaving the app.

---

## 8. Product Principles

1. **Visual first**  
   Architectures should be understandable from the canvas.

2. **Hierarchy as a first-class concept**  
   Composite components are editable and explorable, not just opaque containers.

3. **Minimal but expressive UI**  
   The interface should remain clean and low-noise.

4. **Research-first speed**  
   The shortest path from idea to trained prototype matters more than feature breadth.

5. **Desktop and local first**  
   The MVP should run locally as a desktop application.

6. **Composable reuse**  
   User-defined components must be savable, reusable, and versionable.

7. **Safe-by-default graph editing**  
   Invalid graph edits should be blocked before execution, with clear feedback.

8. **Complement, not duplicate, dl-playground**  
   dl-graph-studio should target advanced prototyping use cases rather than educational concept demos.

---

## 9. Goals

### MVP goals

- Build neural architectures visually from primitives and composite blocks.
- Support hierarchical drill-down into composite components.
- Use **neuron** as the foundational primitive in the conceptual model.
- Allow creation and reuse of user-defined custom components.
- Train the resulting model locally from inside the app using a predefined training loop.
- Make it possible, through sufficiently expressive primitives and built-ins, to construct a modern architecture such as a Transformer.

### Post-MVP goals

- richer built-in components,
- external model import as reusable components,
- editable code for primitives/components,
- better dataset ingestion,
- richer training configuration,
- evaluation workflows,
- profiling/debug views,
- optional interoperability with other parts of `dl-playground`.

---

## 10. Non-Goals for MVP

The MVP should **not** try to solve all of the following:

- team collaboration,
- cloud or distributed training,
- advanced experiment tracking,
- W&B / MLflow integrations,
- production deployment/export pipelines,
- code editing for primitives,
- hierarchical reconstruction of imported external models,
- educational/tutorial authoring,
- web-first delivery.

The MVP is not a replacement for `dl-playground` lessons or concept visualizers.

---

## 11. Product Differentiation

dl-graph-studio is differentiated by the combination of:

1. **hierarchical editable components**,
2. **component creation and reuse from primitives**,
3. **desktop-first local execution**,
4. **visual-first prototyping of real models**,
5. **a clean node-based UX inspired by tools like n8n**.

Compared with educational visual tools, dl-graph-studio targets real architecture construction.

Compared with code-only workflows, dl-graph-studio provides stronger visual intuition and hierarchy.

Compared with general workflow editors, dl-graph-studio models trainable computational structures rather than generic automation flows.

---

## 12. Conceptual Model

dl-graph-studio is built around three kinds of entities.

### 12.1 Primitive components

The smallest units exposed by the system.

For the MVP, the conceptual foundation is the **neuron primitive**.

Primitives should have editable parameters, but **not editable source code** in the MVP.

### 12.2 Composite components

Reusable components made from other primitives and/or composite components.

Examples:

- feed-forward block
- attention block
- multi-head attention block
- encoder block
- transformer layer

A composite component behaves as:

- a **single reusable node** from the outside,
- an **editable subgraph** when opened.

### 12.3 User-defined components

Custom components created by the user and stored in a reusable library.

These should support:

- save
- reuse
- versioning
- dependency pinning to specific component versions

---

## 13. Interaction Model

### 13.1 Main canvas behavior

The primary interaction model should follow these rules:

- **single click** on a node opens the side panel / inspector,
- **double click** on a composite node enters its internal subgraph view,
- each view shows only the components relevant at that hierarchy level,
- composite nodes appear as single summarized units from the outside,
- the UI indicates whether a node is primitive or composite.

### 13.2 Side panel / inspector

The inspector should allow the user to:

- edit parameters,
- inspect metadata,
- inspect input/output constraints,
- save reusable components when relevant.

### 13.3 Hierarchical navigation

The canvas should support moving across nested graph levels.

MVP recommendation:

- use **double click** to enter,
- use a **breadcrumb header** to move back up.

This preserves hierarchy while keeping the canvas clean.

---

## 14. Visual UX Requirements

The UI should be:

- minimal,
- readable,
- low-noise,
- focused on graph comprehension.

### UX requirements

- avoid overcrowding the main canvas,
- keep parameter editing outside the main graph in a side panel,
- keep outer views abstract and uncluttered,
- reveal internals only when the user intentionally enters a component,
- preserve a visual language coherent with the broader `dl-playground` ecosystem while making dl-graph-studio feel more advanced.

---

## 15. Functional Requirements

### 15.1 Architecture authoring

The system must allow the user to:

- add primitive components,
- connect components visually,
- create composite components,
- open and edit composite internals,
- create custom reusable components,
- save those components to a personal library,
- version those custom components.

### 15.2 Graph validation

Before run, the system must:

- block invalid connections,
- validate blocking structural issues,
- provide a clear reason when an action is invalid.

Validation should optimize for good DX.

### 15.3 Training execution

The system must provide a **Run** action that:

- compiles the current visual architecture into an executable PyTorch model,
- launches a basic local training loop,
- uses an example dataset in the MVP,
- displays basic run progress and metrics.

### 15.4 Reuse

The system must allow:

- saving custom components,
- loading them later,
- reusing them inside other models,
- pinning dependencies to specific versions.

### 15.5 Import/export

For MVP:

- **internal project persistence is required**,
- **external model import is not required**,
- **code export is optional and may be deferred**,
- **code-view UI is not required**.

Post-MVP:

- import external models/components as black-box nodes,
- later consider hierarchical reconstruction.

---

## 16. MVP Training Recommendation

For the MVP, training should be **basic but real**.

### Recommendation

Do **not** make loss, optimizer, scheduler, and dataloaders fully visual in the MVP.

Instead, use a **template-based training configuration**:

- task template selection, such as classification or sequence modeling,
- example datasets bundled by default,
- default optimizer/loss selected automatically per template,
- a small advanced settings section for:
  - learning rate
  - batch size
  - epochs

### Rationale

This keeps the MVP aligned with the core goal:

- architecture-first prototyping,
- minimal UI complexity,
- immediate local execution without building the full training-pipeline layer too early.

---

## 17. Technical Direction

### 17.1 Runtime

- **Primary framework:** PyTorch
- **Execution mode:** local
- **Primary target environment:** desktop application

### 17.2 Product shape

Recommended product shape:

- **desktop app first**,
- local-first,
- with optional future interoperability or embedding within the broader `dl-playground` ecosystem.

The delivery model should favor the experience of a native working tool over that of a browser-first educational product.

### 17.3 Internal representation

Recommendation:

Use a **graph-based JSON/DSL as the canonical internal representation**, not raw PyTorch code.

Then compile that representation into PyTorch at runtime.

#### Why

A canonical graph format is better for:

- hierarchical editing,
- validation,
- versioning,
- persistence,
- future import/export,
- AI-assisted manipulation.

PyTorch should be the execution target, not the source of truth.

### 17.4 Desktop architecture direction

This PRD does not hard-lock the implementation stack, but the product should be treated as a true desktop application.

A practical implementation may use a desktop shell plus a local runtime, as long as the final user experience is:

- local-first,
- desktop-native in packaging,
- capable of running models on the user’s own machine.

---

## 18. Suggested MVP System Model

### 18.1 Core subsystems

1. **Graph Editor**
   - node creation
   - connections
   - hierarchy navigation
   - parameter editing

2. **Component Registry**
   - primitive definitions
   - built-in composite blocks
   - user-defined custom components
   - version metadata

3. **Validator**
   - structural validation
   - compatibility checks for blocking issues

4. **Compiler**
   - graph/DSL → PyTorch model

5. **Execution Engine**
   - local training loop
   - example dataset integration
   - metrics/log stream

6. **Persistence Layer**
   - project save/load
   - component library storage
   - version tracking

---

## 19. Initial Primitive Strategy

The MVP must be expressive enough that a user can, in principle, build a Transformer-like architecture from sufficiently well-defined primitives.

### Important note

Although the conceptual foundation is the **neuron**, implementation should remain pragmatic.

Recommendation:

- keep **neuron** as the lowest exposed primitive,
- also provide a useful set of built-in higher-order primitives and composites so users are not forced to build every model neuron-by-neuron.

### Examples of built-in units for MVP

- neuron
- activation primitives
- dense/linear-style structures derived from primitives
- normalization building blocks
- attention-related built-ins needed to make Transformer assembly realistic

This preserves the philosophy without making the product impractical.

---

## 20. User Stories

### Architecture authoring

- As a researcher, I want to build a neural architecture visually so I can prototype faster.
- As a researcher, I want to inspect the internals of a composite block so I can understand complex models.
- As a researcher, I want to modify a subcomponent and see that reflected in the parent component.

### Reuse

- As a researcher, I want to save a custom component so I can reuse it in future experiments.
- As a researcher, I want my custom components to have versions so older projects remain stable.

### Execution

- As a researcher, I want to click Run and train the model locally without leaving the app.
- As a researcher, I want to see basic training metrics while the model runs.

### Safety

- As a researcher, I want invalid graph edits to be blocked early with clear feedback.

### Ecosystem fit

- As a user of `dl-playground`, I want dl-graph-studio to feel like the advanced practical companion to the educational platform.

---

## 21. MVP Scope

### In scope

- visual graph editing
- primitive + composite components
- hierarchical navigation
- component inspector side panel
- custom reusable components
- component versioning basics
- graph validation for blocking issues
- local execution
- basic predefined training loop
- example datasets
- basic metrics/log output
- project persistence
- desktop packaging and local storage

### Out of scope

- collaboration
- cloud training
- advanced metric dashboards
- external experiment trackers
- primitive code editing
- external model import
- inline composite expansion in the outer canvas
- generated code panel
- dataset management UI beyond simple bundled examples
- educational lesson authoring

---

## 22. Roadmap

### Phase 1 — Core architecture editor

- desktop app shell
- graph canvas
- primitive nodes
- composite nodes
- single-click inspector
- double-click drill-down
- breadcrumb navigation
- project save/load

### Phase 2 — Reusable component system

- save custom components
- personal component library
- versioning
- dependency pinning

### Phase 3 — Basic local execution

- graph compilation to PyTorch
- example datasets
- template-based training configuration
- Run button
- basic metrics/logs

### Phase 4 — Practical architecture depth

- richer built-in blocks
- practical primitives for modern architectures
- Transformer demo flow

### Phase 5 — Post-MVP extensions

- import external models/components as black-box nodes
- code editing for primitives/components
- richer dataset support
- evaluation workflows
- export options
- profiling/debug views
- future bridges with `dl-playground`

---

## 23. Open Questions

These questions should remain explicit for future iterations.

1. How literal should the neuron primitive be in the actual implementation?
2. Which exact built-in primitives/composites are required to make Transformer construction practical in the MVP?
3. Which training templates should ship first?
4. Which desktop stack is most appropriate for the local-first architecture?
5. Should code export be included earlier than planned?
6. How much validation beyond blocking issues is worth adding in the MVP?
7. How should component version conflicts be surfaced in the UI?
8. At what point should external model import move into scope?
9. How closely should dl-graph-studio visually align with `dl-playground` branding and design language?

---

## 24. Risks

### Product risk

If the tool forces users to work too close to the neuron level without strong higher-level abstractions, it may become theoretically flexible but practically slow.

### UX risk

Hierarchy can become confusing if navigation is not extremely clear.

### Technical risk

A graph built from very low-level primitives may be hard to compile into efficient PyTorch representations unless the compiler is designed carefully.

### Scope risk

Trying to cover architecture authoring, training, datasets, and platform integration too early may overcomplicate the MVP.

### Product-line risk

If dl-graph-studio overlaps too heavily with `dl-playground`, the differentiation between the two products may become unclear.

---

## 25. Recommended Product Decisions

These are recommended defaults based on the current idea.

### Decision 1 — Canonical format

Use **JSON/DSL graph** as the source of truth.

### Decision 2 — Runtime

Use **PyTorch** for model compilation and local execution.

### Decision 3 — MVP training model

Use **template-based training**, not fully visual training graphs.

### Decision 4 — UX entry model

- single click → edit in side panel
- double click → enter subgraph
- breadcrumb → navigate upward

### Decision 5 — Versioning model

Use pinned component versions so older projects remain stable.

### Decision 6 — Product shape

Ship as a **desktop app first**, local-first by default.

### Decision 7 — Parent ecosystem fit

Position dl-graph-studio as the advanced architecture prototyping companion to `dl-playground`, not as its replacement.

---

## 26. Acceptance Criteria for MVP

The MVP is successful if a user can:

1. open the desktop app locally,
2. create a model visually from primitives and composites,
3. double-click into composite blocks and edit their internals,
4. save a custom component and reuse it later,
5. run validation and get clear feedback on invalid structures,
6. click Run and start a basic local training job,
7. observe basic metrics/logs,
8. save and reopen the project.

Stretch acceptance criterion:

- build a simplified Transformer-like architecture using the available primitives/composites.

---

## 27. One-Sentence Product Definition

dl-graph-studio is a local-first desktop application inside the `dl-playground` ecosystem where users visually build, inspect, reuse, and train hierarchical neural architectures through editable graph-based components.
