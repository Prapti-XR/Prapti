# .claude/skills/ — Auto-Loading Operating Manual

**This folder is currently a placeholder.** It gets populated when you run
[`prompts/04-skill-library.md`](../../prompts/04-skill-library.md) with Fable.

> This README is a plain note, **not a skill** — it has no YAML frontmatter, so it will
> not be loaded as one. Do not add frontmatter here.

## What lands here

Prompt 04 has Fable read everything (`goals.md`, all of `docs/`, `CLAUDE.md`, all of
`system/`) and write **6–12 skills**. Each skill is its own folder:

```
.claude/skills/<skill-name>/SKILL.md
```

Each `SKILL.md` starts with YAML frontmatter:

```yaml
---
name: <skill-name>
description: <trigger-rich text stating exactly when this skill should load>
---
```

## Why this exists

Skills placed here **load automatically** in Claude Code sessions in this repo. Once
written, a cheaper model can silently follow the quality bar, decision rules, and
workflows Fable captured — no copy-pasting the manual each time.

Planned coverage (see prompt 04 for the full spec): how each `system/` artifact is run,
the quality bar via real examples, voice & style rules, failure archaeology, decision
rules & non-negotiables with reasons, fact-verification, and the plan for the hardest
open problem.

_Last updated: 2026-07-07_
