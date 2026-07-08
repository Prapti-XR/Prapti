# Prompt 06 — Content Pipeline: adding a heritage site becomes a 10-minute job

**Phase 1 of `ROADMAP.md`. Paste this into a fresh Claude Code session in this repo. Written to be executable by any capable model — the `.claude/skills/prapti-*` skills auto-load and are your operating manual.**

---

You are the content-infrastructure engineer on **Prapti**, a heritage discovery platform. Today, adding one heritage site takes an admin through multiple disconnected forms plus a hand-edited upload script. Your job: make site creation fast, validated, and possible for non-developers.

## Step 0 — Load context (do not skip)

1. `ROADMAP.md` Phase 1 — the goal and definition of done.
2. `.claude/skills/prapti-ground-rules/SKILL.md` and `prapti-data-model/SKILL.md` — constraints and the schema. Key facts you must respect: `Asset.fileSize` is BigInt (`serializeBigInt()` on API responses), R2 keys are `sites/{siteId}/{assetType}/{timestamp}-{filename}`, `relationMode="prisma"`.
3. Existing code to reuse, not reinvent: `src/lib/upload.ts` (R2 upload helpers), `scripts/upload-assets.ts` (per-asset upload + its exported `uploadDirectory()`), `prisma/seed.ts`, `docs/example-data/` (the `data.json` shape with `siteRef` linking), `src/app/admin/sites/new/page.tsx` and `src/app/admin/upload/page.tsx` (the current split forms), `POST /api/admin/sites` and `POST /api/upload` (the current endpoints).

## Build 1 — Bulk import script

`scripts/import-sites.ts`, run with `npx tsx scripts/import-sites.ts <folder>`:

- Folder convention (document it in the script header): `<folder>/data.json` (sites + trivia + tags, same shape as `docs/example-data/data.json`) plus `<folder>/assets/<siteRef>/` holding `.glb`, panorama `.jpg`, and photo files.
- Creates/updates sites idempotently (upsert by a stable slug id, like the existing `sonda-fort`), uploads assets to R2 via `src/lib/upload.ts` helpers, writes `Asset` rows with correct `type`, `storageKey`, `storageUrl`, metadata, links trivia and tags.
- Dry-run mode (`--dry-run`) that prints the plan without touching DB/R2. Clear per-item ✓/✗ output and a final summary.
- **DB mutations need user consent** — say so in the output header and require an explicit `--yes` flag.

## Build 2 — Admin "Add a Site" wizard

Replace the split experience with one guided flow at `src/app/admin/sites/new` (keep the route):

- Steps: **Details** (name, location picker w/ lat-lng, era, year) → **Story** (description, cultural context, historical facts with a "source" line, visiting info) → **Media** (drag-drop: photos, one GLB, one 360° panorama — client-side validation: GLB magic bytes/extension, image aspect ≈ 2:1 for panoramas, size caps with clear errors) → **Trivia** (optional, add N questions) → **Review & Publish** (summary + `isPublished` toggle).
- Reuse `POST /api/admin/sites` + `POST /api/upload`; extend them only if a field is missing (respect `{ success, data | error }`, role gates, `serializeBigInt` — see `prapti-api-routes` skill).
- Upload progress bars; failure of one asset must not lose the rest of the wizard state.
- Design system rules apply (`prapti-design-system` skill): heritage tokens only, `font-serif` headings, 44px targets, focus rings, loading/error states.

## Build 3 — Authoring template for researchers

`docs/CONTENT_TEMPLATE.md`: a copy-paste template for one site (all fields with guidance + a filled example from a seeded site), and instructions for handing it to a developer or feeding it to the import script. State the sourcing rule: **every historical claim needs a source; no invented history.**

## Verify (evidence, not assertion — `prapti-verification` skill)

- `npm run type-check`, `npm run lint`, `npm run build` — clean.
- Dry-run the import script against `docs/example-data/` and paste the output.
- Drive the wizard in the dev server: create a draft site end-to-end (use a `test-` slug; delete it afterwards or leave unpublished and say so).
- Confirm every new/changed API route returns 401 unauthenticated, 403 for `USER` role.

## Definition of Done

- [ ] `import-sites.ts` dry-runs cleanly against `docs/example-data/` and documents its folder convention.
- [ ] Wizard: a site with photos + GLB + panorama + trivia can be created in one flow, ≤ 10 minutes.
- [ ] `docs/CONTENT_TEMPLATE.md` exists with a filled example.
- [ ] Verification gate output pasted. No version-lock violations.
