# Prompt 04 — Write the Operating Manual as a Skill Library

**Paste this to Fable in a fresh session in this repo. Run last, after 01–03.**

---

You are the smartest person ever to work on **Prapti**, and you retire tomorrow. Cheaper, less capable AI models — and future me — must be able to run and improve everything in this repo without you, at the standard you hold today.

Your final task: create the operating manual as a **skill library under `.claude/skills/`**.

## Read EVERYTHING first

- `goals.md` (repo root)
- `CLAUDE.md` (repo root)
- **all** of `docs/` (design system, schema, authentication, security, scaling, deployment, components, xr, backend)
- **all** of `system/` (the artifacts built by prompt 03)
- `prisma/schema.prisma` and the `src/` layout as needed to ground your claims

> Note: this project has no `context/` folder — the equivalent context lives in `docs/` and `CLAUDE.md`. Treat those as ground truth.

## Create 6–12 skills

Each skill is a folder `.claude/skills/<name>/` containing a `SKILL.md` with YAML frontmatter — a `name` and a **trigger-rich `description` stating exactly when the skill should load** (frontmatter format matches the existing skills in this environment). Cover, at minimum:

- **How each `system/` artifact is run**, step by step, with what "done correctly" looks like.
- **The quality bar**, taught through real examples in this repo — point at actual files/pages that meet the bar, and (if any exist or the user names them) why weaker attempts fell short.
- **Voice & style rules**, with real excerpts (e.g. the heritage tone in `docs/DESIGN_SYSTEM.md`, the API response shape `{ success, data | error }`, the commit convention).
- **Failure archaeology** — everything already tried and rejected. Seed this from `CLAUDE.md` and `docs/` (e.g. *React 19 rejected because R3F 8.17 needs React 18*; *raw `process.env` rejected in favor of `@/env`*). Only include items you can trace to a file or to my direct answer.
- **Decision rules & non-negotiables, each with its reason** — seed from `CLAUDE.md`: version locks (why), `serializeBigInt` on API responses (BigInt won't JSON-serialize), `ssr:false` + `ThreeErrorBoundary` for 3D (Three.js breaks under SSR), `relationMode="prisma"` (no DB FKs → indexes matter), `@/env` over `process.env`.
- **How to verify facts and claims before anything ships** — the `type-check` / `lint` / `build` gate, driving the app, and tracing every claim to a repo file.
- **The plan of action for the hardest open problem** in this project. Identify it from what you've read (a candidate: real 3D/360 asset delivery from R2 with CORS + performance on mobile — confirm against `docs/` before asserting). State the plan; label any part that is inference.

## RULES

- **Audience: a capable model or person with ZERO context.** Define every term. Use checklists and templates.
- **GROUND TRUTH ONLY.** Every claim traces to a file in this repo or to my direct answers. **Label inference as inference.** Never invent my history, metrics, or preferences — a wrong manual is worse than no manual.
- Each skill states **when NOT to use it**.
- **Date-stamp** anything that will go stale, and end each skill with a one-line **"How to re-verify this."**
- Write **ONLY** inside `.claude/skills/`. Everything else is read-only.

## When done

Review the full set for factual errors, contradictions, and anything a zero-context reader couldn't follow. Fix what you find. Then give me:
1. **The inventory** — each skill with a one-line description.
2. **What remains uncertain** — the open questions and unverified claims.

## Why this format matters

Skills in `.claude/skills/` load automatically. Next week, on a cheaper model, I say *"review this script"* and Claude silently pulls up the quality-bar manual you wrote and follows it. No copy-pasting, no re-explaining. The folder remembers so I don't have to.
