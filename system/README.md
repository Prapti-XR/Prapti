# system/ — Reusable Dev-Workflow Artifacts

**This folder is currently a placeholder.** It gets populated when you run
[`prompts/03-system-dev-feature.md`](../prompts/03-system-dev-feature.md) with Fable.

## What lands here

Prompt 03 redesigns the Prapti dev-feature workflow (spec → build → type-check/lint →
review → merge) into a system targeting **~20 minutes of your involvement per cycle**.
For every step that can be automated or templated, Fable builds the actual artifact here —
for example:

- `feature-spec-template.md` — the brief you fill in per feature
- `build-checklist.md` — enforces the `CLAUDE.md` ground rules
- `verify.sh` — one command wrapping `type-check` + `lint` + `build`
- `self-review-prompt.md` — the model reviews its own diff
- `commit-and-pr-checklist.md` — pre-merge gate
- `cycle-tracker.md` — log of cycles vs. the ~20-min target

(Exact set is decided by prompt 03 based on the real workflow.)

## Then what

Once this folder is filled, running [`prompts/04-skill-library.md`](../prompts/04-skill-library.md)
distills these artifacts — plus `goals.md`, `docs/`, and `CLAUDE.md` — into auto-loading
skills under `.claude/skills/`.

_Last updated: 2026-07-07_
