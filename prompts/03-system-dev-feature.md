# Prompt 03 — Systematize the Dev-Feature Workflow

**Paste this to Fable in a fresh session in this repo. Run after 01 and 02.**

---

Take **my dev-feature workflow on Prapti** — the repeating cycle of *spec → build → type-check/lint → self-review → commit/merge* — and redesign it as a system with a target of **~20 minutes of my involvement per cycle**. The rest should run on templates, checklists, and scripts that a capable model executes.

First, read `goals.md`, `CLAUDE.md`, and skim `docs/`. All artifacts you build go into the `system/` folder.

## 1. Map the current process, step by step

Lay out the actual cycle for shipping one feature in this repo, using the commands and conventions in `CLAUDE.md` (`npm run type-check`, `npm run lint`, `npm run build`, `db:*`, path aliases, the ground rules). For **each step**, mark it:

- **automate** — a script or model can do it end-to-end,
- **template** — repeatable if I have a fill-in-the-blank artifact,
- **keep human** — needs my judgment (scope decisions, design trade-offs, final approval).

Show this as a table.

## 2. Design the new system — and BUILD each piece now

For every step marked **automate** or **template**, build the actual artifact and save it as a file in `system/`. Don't describe it — create it. Fit the tool to the step; likely pieces include:

- `system/feature-spec-template.md` — the fill-in brief I complete in a few minutes (problem, scope, affected files, acceptance criteria, out-of-scope).
- `system/build-checklist.md` — the model's build checklist enforcing the CLAUDE.md ground rules (version locks, `serializeBigInt`, `ssr:false` for 3D, `@/env`, `relationMode` indexes).
- `system/verify.sh` (or `system/verify.md` if a script isn't appropriate) — one command that runs `type-check` + `lint` + `build` and reports pass/fail clearly.
- `system/self-review-prompt.md` — a review prompt the model runs on its own diff before handing back (correctness + simplification + adherence to the design system).
- `system/commit-and-pr-checklist.md` — commit-message convention and the pre-merge gate.
- `system/cycle-tracker.md` — a lightweight log of cycles (feature, date, my minutes, outcome) so we can see whether we're actually hitting ~20 min.

Add, drop, or rename pieces to fit the real workflow — the list above is a starting point, not a mandate. Each file must be usable by a zero-context model: define terms, give concrete examples from this repo.

## 3. Walk me through one full cycle, end to end

Pick a **real, small feature** you can justify from this repo (e.g. adding a filter to `/api/sites`, a new field surfaced on `site/[id]`, or a `loading.tsx` polish). Run the whole new system on it in front of me — fill the spec template, execute the build checklist, run verify, run self-review, produce the commit — so I can see the ~20-minute involvement boundary in practice.

Where you must make a judgment call about my preferences, **check `docs/` and `CLAUDE.md` first**; only ask me if those genuinely don't answer it.

## Definition of Done

- [ ] Step-1 map is a table with every step marked automate/template/keep-human.
- [ ] Every automate/template step has a real, committed file in `system/`.
- [ ] Each `system/` file is usable by a zero-context model (terms defined, repo-specific examples).
- [ ] One real cycle walked end-to-end using those artifacts.
- [ ] `system/README.md` updated to index the artifacts and state the ~20-min target.
