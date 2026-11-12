<div align="center">

<img src="packages/desktop/build/icon.png" alt="Hbox" width="128" height="128" />

# Hbox

**The AI coding workspace — desktop, browser, and terminal in one.**

Hbox is an open AI coding workbench: an Electron desktop app, a browser client, and a terminal Agent (TUI + CLI) sharing the same backend, runtime, and UI system. This repository contains the full source for the clients, backend services, shared UI, and the Agent CLI & runtime.

[简体中文 (README.zh-CN.md)](README.zh-CN.md) · English

[![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%E2%89%A5%2024-brightgreen.svg)](mise.toml)
[![pnpm](https://img.shields.io/badge/pnpm-10.33-orange.svg)](pnpm-workspace.yaml)
[![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6.svg)](tsconfig.base.json)
[![Release](https://img.shields.io/badge/release-v1.0.2-success.svg)](https://github.com/TSCSAM/hbox/releases/tag/v1.0.2)
[![Download](https://img.shields.io/badge/download-Windows%20installer-0078D6.svg)](https://github.com/TSCSAM/hbox/releases/download/v1.0.2/Hbox-1.0.2-win-x64.exe)

</div>

---

## 📦 Download (Windows)

The latest Windows build is available as a GitHub Release:

| Asset | Version | Size | Published |
| --- | --- | --- | --- |
| [Hbox-1.0.2-win-x64.exe](https://github.com/TSCSAM/hbox/releases/download/v1.0.2/Hbox-1.0.2-win-x64.exe) | 1.0.2 | ≈ 189 MB | 2026-11-06 |

SHA-512 checksum (`latest.yml`):

```text
fs079O7HnCfu0WNSp1irG4iF+7homPRUfuLQS6yLmIUh+g/GjNTEIcQd+rAtVqOHRhfTVA5n7vRMWV78sQYp5w==
```

> **Note:** locally built installers are not code-signed, so Windows SmartScreen may show a warning on first run. Choose "Run anyway" after verifying the checksum.

## ✨ Highlights

- **Three surfaces, one runtime** — the same Agent and backend power the desktop app, the web UI (`hbox --web`), and an interactive TUI, with a unified `hbox` command for the CLI distribution.
- **Full Agent platform** — skills, hooks, MCP servers, agents, and a plugin marketplace with builtin / CDN / personal sources, including UI plugins that extend the app itself.
- **Multi-provider model access** — pluggable provider layer (`packages/provider`, `packages/provider-node`) with OpenAI-compatible and Anthropic adapters, driven by the AI SDK.
- **Remote workspaces** — connect remote projects over SSH/WSL; desktop runtime assets are uploaded to the remote side via SFTP.
- **Polished, token-driven UI** — a documented design system ([DESIGN.md](DESIGN.md)) with light/dark themes, Lucide iconography, and an accessibility-first component set on React 19 + Zustand + Tailwind.
- **Engineering-grade governance** — architecture policy enforcement, DB schema contracts, stale-doc checks, affected-test selection, and sharded E2E runs ([architecture-policy.yaml](architecture-policy.yaml), [AGENTS.md](AGENTS.md)).
- **Persistence & sessions** — SQLite-backed session storage with schema-contract tests and migration tooling.

## 🧭 Repository Structure

| Directory | Responsibility |
| --- | --- |
| `packages/desktop` | Electron Main, Host, Renderer, and desktop packaging |
| `packages/web` | Web client |
| `packages/server` | HTTP / WebSocket services and remote connections |
| `packages/hbox-server-cli` | Standalone server startup and process management |
| `packages/ui` | Shared React components, hooks, and Zustand state |
| `packages/services` | Business services and persistence |
| `packages/shared`, `packages/rpc`, `packages/client` | Shared protocols and types, RPC framework, and Agent client SDK |
| `packages/provider`, `packages/provider-node` | Common provider capabilities and Node implementations |
| `apps/hbox-cli` | Agent CLI, TUI, runtime, and tools |
| `scripts`, `config`, `third-party` | Build and maintenance scripts, built-in configuration, and third-party notice materials |

## 🚀 Getting Started

Requires Git, Node.js **24.14.0**, and pnpm **10.33.2** (see [mise.toml](mise.toml) for tool versions). Run all commands from the repository root.

```bash
pnpm bootstrap
```

`pnpm bootstrap` installs workspace dependencies, prepares local desktop runtime assets, and runs `build:bootstrap`. The Agent CLI and runtime source live in [apps/hbox-cli/](apps/hbox-cli/) as a regular directory — no submodules required.

### Development

```bash
# Desktop app (Electron) — production service configuration
pnpm dev:desktop

# Desktop app — test environment
pnpm dev:desktop:test

# Web + backend together (http://localhost:5173 → http://localhost:3030)
pnpm dev:web
```

Set `HBOX_DATA_BASE_DIR` for an isolated development data directory.

### CLI distribution

```bash
# Terminal UI by default
hbox

# Web interface in the browser
hbox --web --workspace /path/to/project --port 3030 --no-open
```

Web mode listens on `127.0.0.1`, auto-selects a free port, and opens the browser. LAN access with `--host 0.0.0.0` generates an access-token URL automatically; control it with `--token` / `--no-token`.

### Packaging

```bash
# Desktop installer (output: packages/desktop/dist/)
pnpm bundle:desktop -- --os win --arch x64

# CLI distribution (output: dist/hbox/)
pnpm build:hbox --base-url https://downloads.example.com/hbox/
```

See [README.en.md](README.en.md) for the complete development, configuration, and packaging guide.

## 📚 Documentation

- [AGENTS.md](AGENTS.md) — agent principles and repository conventions
- [DESIGN.md](DESIGN.md) — the Hbox design system (colors, typography, components)
- [UI_PLUGIN.md](UI_PLUGIN.en.md) — UI plugin capabilities, APIs, and debugging
- [NOTICE.md](NOTICE.md) — feature scope, maintenance policy, and third-party notices
- [apps/hbox-cli/docs/usage/](apps/hbox-cli/docs/usage/README.md) — CLI usage guide

## 📄 License

This project is licensed under [Apache-2.0](LICENSE). Third-party license information is collected in [NOTICE.md](NOTICE.md) and [THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md). Hbox is based on the upstream Hbox project; see [NOTICE.md](NOTICE.md) for details.
