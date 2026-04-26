# dl-graph-studio

A local-first desktop application for visually prototyping, composing, and training deep learning architectures through hierarchical neural graphs.

## Product Definition

See [PRD.md](PRD.md) for the official product requirements document.

## Development

This project uses the stack documented in
[docs/architecture/technical-stack.md](docs/architecture/technical-stack.md).

Install dependencies:

```sh
pnpm install
```

Start the frontend development server:

```sh
pnpm dev
```

Start the Tauri desktop shell:

```sh
pnpm tauri dev
```

Run checks:

```sh
pnpm test
pnpm build
pnpm lint
pnpm format:check
```

## Roadmap Workflow

- [Agent roadmap workflow design](docs/superpowers/specs/2026-04-26-agent-roadmap-workflow-design.md)
- [Roadmap process](docs/roadmap/roadmap-process.md)

## Architecture

- [Initial technical stack](docs/architecture/technical-stack.md)

## License

Copyright 2026 Eric Dominguez Morales.

This project is licensed under the Apache License 2.0. See [LICENSE](LICENSE).
