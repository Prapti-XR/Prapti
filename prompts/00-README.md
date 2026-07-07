# prompts/ — The Fable Operating Kit

This folder holds ready-to-run prompts for **Fable** (Claude Fable 5) to take Prapti to a working, beautiful state — and then to leave behind a reusable operating manual so cheaper models (and future you) can keep it running.

## How to run

1. Open a Fable session in this repo.
2. Paste one prompt file's contents (or say: *"Follow `prompts/01-make-it-work.md`"*).
3. Run them **in order** — each assumes the previous one is done.

## The prompts

| # | File | Goal | Output |
|---|------|------|--------|
| 1 | `01-make-it-work.md` | Make the app fully working & deployable | Fixes across `src/`, a defect log |
| 2 | `02-beautiful-ui.md` | Elevate the UI on the existing heritage design system | UI changes across `src/app` + `src/components` |
| 3 | `05-vr-model-in-panorama.md` | Build the immersive VR view: 3D model centered inside its 360° environment | New `ImmersiveViewer` + entry point |
| 4 | `03-system-dev-feature.md` | Systematize the dev-feature workflow to ~20 min of your involvement per cycle | Reusable artifacts in `system/` |
| 5 | `04-skill-library.md` | Distill everything into an auto-loading operating manual | Skills in `.claude/skills/` |

> Prompts are numbered by creation order (`05` is the newest), but **run them in the # order above**: 01 → 02 → 05 → 03 → 04.

## Before you start

- Fable should read **`goals.md`** (repo root) and **`CLAUDE.md`** first — they define the goals and the non-negotiable ground rules.
- `system/` and `.claude/skills/` begin as placeholders; prompts 3 and 4 populate them.
- There is **no test suite** — verification is `npm run type-check`, `npm run lint`, `npm run build`, and driving the app.

_Last updated: 2026-07-07_
