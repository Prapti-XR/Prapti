# Prapti

## Overview

In order to create immersive augmented reality (AR) and virtual reality (VR) experiences for historical sites, monuments, and cultural landmarks, competitors are invited to participate in the Heritage AR/VR Challenge hackathon. This hackathon's goal is to employ technology in creative ways to protect, inform, and involve guests with historical and cultural assets. The creation of apps, games, or narratives that highlight the value, diversity, and beauty of historical places, monuments, and cultural landmarks around the globe will be accomplished by participants using AR and VR technology.

***

## Features

- **AR/VR Model Viewing**: Intuitive web-based viewer with real-time WebXR support.
- **360° Image Support**: Fully interactive panorama explorer.
- **Asset Management**: Upload, store, and serve large media files via Cloudflare R2.
- **Database \& Metadata**: Store model info, metadata, and user data using Neon PostgreSQL, Prisma ORM.
- **Production-Ready**: Minimal bugs, optimized for performance and scalability.
- **DevOps Friendly**: Continuous deployment on Vercel/GitHub.

***

## Tech Stack

| Dependency | Version | Purpose |
| :-- | :-- | :-- |
| next | 14.2.15 | Next.js framework (App Router, LTS) |
| react | 18.3.1 | React core library |
| react-dom | 18.3.1 | React DOM renderer |
| @react-three/fiber | 8.17.10 | React renderer for Three.js |
| @react-three/xr | 6.6.26 | WebXR for React Three Fiber |
| @react-three/drei | 9.115.0 | Drei helper components |
| three | 0.169.0 | Three.js 3D engine |
| typescript | 5.6.3 | Type checking |
| @neondatabase/serverless | 0.10.1 | Neon PostgreSQL driver |
| prisma | 5.22.0 | Prisma ORM |
| @prisma/client | 5.22.0 | Prisma DB client |
| @aws-sdk/client-s3 | 3.665.0 | S3 SDK (Cloudflare R2 compatible) |


***
## Frontend:
- Next.js 14 with App Router (LTS, stable, SSR/ISR ready)
- React 18.3.1 (backwards-compatible, best with R3F v8.17.x)
- React Three Fiber v8.17.10 for declarative Three.js integration
- @react-three/drei v9.115.0 for 3D utility helpers
- @react-three/xr v6.6.26 for WebXR (AR/VR support, React 18 compatibility)
- three.js 0.169.0 (aligned with fiber/drei)
- TypeScript 5.6.3 for compile-time type safety
- Google Maps API
*** 

## Backend & Storage:
- Neon PostgreSQL — serverless DB, 0.5GB free tier, URL in env, use with connection pooling to avoid cold start slowness
- Prisma ORM (5.22.0/core + @prisma/client 5.22.0) — type-safe, schema-driven Postgres access, all queries/types/migrations centrally defined
- Cloudflare R2 — object storage (S3 API compatible), 10GB free, no egress fees, use AWS S3 SDK v3 (3.665.0), configure endpoint, keys, bucket name in env; recommend retry/fallback logic for reliability

***

## Notes to keep
- Keep Next.js 14.2.x with React 18.3.1, not React 19, for stable support with R3F 8.17+
- All peer dependencies (three, fiber, drei, xr) locked to mutually compatible minor versions to prevent build/runtime mismatches
- Only fetch from backend in server components, pass to client for interactivity
- Use dynamic imports to keep 3D dependencies client-side where possible
- Watch out for SSR build pitfalls with Three.js, disable SSR on pure 3D components if necessary
- Use Prisma’s auto-complete/typesafety—never raw SQL unless necessary
- Set up CORS in Neon/R2 to match Vercel frontend
- R2 and Neon have rare outages (maintenance, network events), so build in retries/fallbacks for uploads/access
- Vercel seamlessly handles CI/CD for frontend; push to repo triggers deployment and TypeScript/Prisma checks
- Neon’s serverless model means cold start latency if DB unused—hit with a “keep alive” job if needed for ultra-fast UX

