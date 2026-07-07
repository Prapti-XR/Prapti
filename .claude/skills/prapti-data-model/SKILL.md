---
name: prapti-data-model
description: Use when editing prisma/schema.prisma, writing Prisma queries, seeding data, or reasoning about Prapti's domain model — sites, assets, contributions/reviews, trivia, users/roles. Explains relationMode="prisma" implications, the BigInt field, the contribution (GitHub-PR-style) workflow, and asset approval lifecycles.
---

# Prapti Data Model

_Last verified: 2026-07-07 against `prisma/schema.prisma` (399 lines) and `docs/schema/schema_explanation.md`. Database: Neon Postgres via Prisma 5.22._

## The two structural facts that change how you work

1. **`relationMode = "prisma"`** — the ORM enforces referential integrity; Postgres has **no FK constraints**. Consequences: (a) the many `@@index` declarations are what make joins/filters fast — never delete them, and add one for any new relation-ish column you filter on; (b) "cascade deletes" are Prisma-level behavior (HeritageSite → its Assets/TriviaQuestions/FavoriteSites/SiteTags; User → FavoriteSites/TriviaScores; per `docs/schema/schema_explanation.md`), so raw SQL bypassing Prisma can orphan rows.
2. **`Asset.fileSize` is `BigInt`** — JSON-serialization throws. Every API response containing assets goes through `serializeBigInt()` (see `prapti-api-routes`).

## Domain map

- **User** — `role: UserRole` enum `USER → CONTRIBUTOR → MODERATOR → ADMIN`. NextAuth adapter models (`Account`, `Session`, `VerificationToken`) live alongside.
- **HeritageSite** — the core entity: name/description/location, `latitude`/`longitude` (map queries), `era`, `yearBuilt`, rich text fields (`culturalContext`, `historicalFacts`, `visitingInfo`, `accessibility`), flags `isPublished`/`isFeatured`, relations to assets/trivia/tags/favorites.
- **Asset** — typed by `AssetType`: `MODEL_3D`, `PANORAMA_360`, `PANORAMA_180`, `IMAGE`, `THUMBNAIL`, `VIDEO`. Storage: `storageKey` (R2 key `sites/{siteId}/{assetType}/{timestamp}-{filename}`) + `storageUrl` (public URL — this is the field the UI reads). Own approval lifecycle: `AssetStatus` `PENDING → APPROVED/REJECTED/ARCHIVED`, plus `isProcessed`, `isPublic`, attribution/license fields, and 3D metadata (`format`, `polygonCount`, `textureCount`) / panorama metadata (`isPanorama`, `panoramaType`, `width`, `height`).
- **Contribution** — the GitHub-PR analog for non-admin content: flexible `contributionData Json` payload, `ContributionType` (`NEW_SITE`, `EDIT_SITE`, `ADD_ASSET`, `ADD_TRIVIA`, `EDIT_TRIVIA`, `FIX_INFO`, `TRANSLATION`), `ContributionStatus` (`DRAFT → PENDING → UNDER_REVIEW → APPROVED/REJECTED → MERGED`). **Review** — one per reviewer per contribution — drives approval; approved contributions merge into `HeritageSite`/`Asset`. Admin UI: `src/app/admin/contributions/page.tsx`; API: `/api/admin/contributions` (PATCH status), `/api/contributions/[id]/review`.
- **Trivia** — `TriviaQuestion` (difficulty `EASY/MEDIUM/HARD`, category) with `TriviaAnswer`s and `TriviaScore`s, site-scoped. Consumed by `/api/trivia` and `src/app/trivia/page.tsx`.
- **FavoriteSite**, **Tag**/**SiteTag** (many-to-many), analytics models — see `docs/schema/schema_explanation.md` for the full ERD.

## Working rules

- Prefer type-safe Prisma queries over raw SQL (source: `CLAUDE.md`).
- `src/lib/prisma.ts` is a singleton with a global cache (dev connection exhaustion) and a `$use` middleware translating Prisma error codes (P1001 unreachable, P1002 timeout, pool exhaustion…) into user-friendly messages — don't instantiate new `PrismaClient`s.
- Schema changes: `npm run db:push` (dev, no migration files) or `npm run db:migrate`; both **mutate the shared Neon DB — get user consent first**. `npm run db:seed` runs `prisma/seed.ts` with `tsx`; sample content lives in `docs/example-data/` (sites, `.glb` models, 360° images, `data.json` with temporary `siteRef` linking). Real seeded IDs are human-readable slugs (e.g. site id `sonda-fort`).
- Bulk asset upload script: `npx tsx scripts/upload-assets.ts` (needs `R2_*` env vars; exports a reusable `uploadDirectory()`).

## When NOT to use this skill

Pure UI styling, or API route mechanics that don't touch the schema (status codes, response shape → `prapti-api-routes`).

**How to re-verify this:** read `prisma/schema.prisma` (grep `relationMode`, `BigInt`, `enum`) and cross-check lifecycles against `docs/schema/schema_explanation.md`.
