# Prompt 10 — Community: contributions at scale

**Phase 5 of `ROADMAP.md`. Run last — needs the content pipeline (06), discovery surface (07), and a trusted review flow.**

---

You are the community engineer on **Prapti**. The schema already models a GitHub-style contribution workflow (`Contribution` → `Review` → merge); your job is to give it a real UX so external contributors can propose hidden heritage places and moderators can approve them — no developer involved.

## Step 0 — Load context

1. `.claude/skills/prapti-data-model/SKILL.md` — the `Contribution` lifecycle (`DRAFT → PENDING → UNDER_REVIEW → APPROVED/REJECTED → MERGED`), types (`NEW_SITE`, `ADD_ASSET`, `EDIT_SITE`, `ADD_TRIVIA`, `FIX_INFO`, …), and the `Review` model. `prapti-api-routes` + `prapti-auth` for gating (`CONTRIBUTOR` role and up can submit; `MODERATOR`/`ADMIN` review).
2. **Verify before building:** read `src/app/api/admin/contributions/route.ts` and `/api/contributions/*` — as of 2026-07-07 "merge" was only a status change (`MERGED`), with no code writing approved `contributionData` into `HeritageSite`/`Asset` rows. Confirm this gap; closing it is the heart of this prompt.

## Build

1. **"Suggest a Place" flow** (public, auth required): `src/app/contribute/` — a scaled-down version of the admin wizard (Prompt 06) writing a `Contribution` with `type: NEW_SITE` and the site payload in `contributionData` (photos may upload to R2 under a `contributions/` key prefix, `isPublic: false` until merged). Also per-site "Suggest an edit" (`EDIT_SITE`) and "Add photos" (`ADD_ASSET`) entry points on `site/[id]`.
2. **Contributor dashboard:** on `/profile`, list own contributions with status badges (`Badge` component, status→variant mapping already in `admin/contributions`), rejection reasons visible.
3. **Reviewer upgrade** in `src/app/admin/contributions`: expand a contribution to see its full proposed content; for `EDIT_SITE`, a side-by-side (current vs. proposed) field diff; approve/reject with reason (exists) — and a **real merge**: a transaction that writes the approved `contributionData` into `HeritageSite`/`Asset`/trivia rows, links `contributionId` on created assets, then sets `MERGED`. Idempotent; partial failure rolls back.
4. **Recognition:** "Contributed by" credit on site pages (from asset `attribution`/contribution author), and a simple contributors list ranked by merged count (`_count.contributions` exists in `/api/admin/users` — build a public, privacy-safe variant: name only, opt-out respected if a field exists; otherwise show name only and note the inference).
5. **Safety:** all historical claims in contributions require a `source` field in the payload (enforce in validation); moderators see it during review. Rate-limit contribution creation modestly (per-user count per day) at the API layer.

## Verify

- Gate clean (`prapti-verification`). Role matrix proven with curl/fetch: `USER` (403 on submit if CONTRIBUTOR-gated — check the intended policy in code and state it), `CONTRIBUTOR` submit 201, `MODERATOR` review 200, merge → site appears via `/api/sites` and on the map; non-moderator merge attempt → 403.
- Full loop driven in the dev server with a test contributor account (clean up test rows afterwards; DB writes need user consent).
- BigInt rule on every new endpoint returning assets.

## Definition of Done

- [ ] Suggest-a-place / suggest-an-edit / add-photos flows live and role-gated.
- [ ] Contributor status tracking on profile; reviewer diff view.
- [ ] Merge actually creates/updates site + asset rows transactionally.
- [ ] Credits visible on merged sites; source required for historical claims.
- [ ] Verification gate + role-matrix evidence pasted.
