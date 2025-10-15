# Prapti - Heritage AR/VR Platform

<div align="center">
  <h3>🏛️ Preserve Cultural Heritage Through Immersive Technology</h3>
  <p>Experience historical sites and cultural landmarks through AR/VR</p>
</div>

## 🌟 Overview

Prapti is a cutting-edge Heritage AR/VR platform that brings historical sites, monuments, and cultural landmarks to life through immersive technology. Our mission is to preserve cultural heritage and make it accessible to worldwide audiences through WebXR experiences.

## 🎯 Features

- **3D Model Viewer**: Interactive 3D models of heritage sites with AR capabilities
- **360° Panoramas**: Immersive panoramic experiences of cultural landmarks
- **Map Discovery**: Google Maps integration for exploring heritage sites globally
- **Educational Trivia**: Cultural education games and quizzes
- **User Profiles**: Save favorite sites and track learning progress
- **Admin Dashboard**: Content management for heritage site data

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14.2.15 (App Router)
- **UI Library**: React 18.3.1
- **Language**: TypeScript 5.6.3
- **Styling**: Tailwind CSS 3.4.14

### 3D/XR Technologies
- **3D Rendering**: Three.js 0.169.0
- **React Integration**: @react-three/fiber 8.17.10
- **3D Helpers**: @react-three/drei 9.115.0
- **WebXR Support**: @react-three/xr 6.6.26

### Backend & Database
- **Database**: Neon PostgreSQL (serverless)
- **ORM**: Prisma 5.22.0
- **Authentication**: NextAuth v5

### Cloud Services
- **Storage**: Cloudflare R2 (S3-compatible)
- **Maps**: Google Maps Platform API
- **Deployment**: Vercel

## 📁 Project Structure

```
prapti/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (auth)/
│   │   │   └── signup/
│   │   ├── admin/              # Admin dashboard
│   │   ├── api/                # API routes
│   │   ├── about/              # About page
│   │   ├── images/             # 360° panoramas
│   │   ├── map/                # Map search
│   │   ├── models/             # 3D model gallery
│   │   ├── profile/            # User profile
│   │   ├── site/[id]/          # Individual site pages
│   │   ├── trivia/             # Educational games
│   │   ├── layout.tsx          # Root layout
│   │   └── page.tsx            # Home page
│   ├── components/             # React components
│   │   ├── 3d/                 # 3D viewers (AR, models, panoramas)
│   │   ├── error/              # Error boundaries
│   │   ├── layout/             # Layout components (navbar, footer)
│   │   └── site/               # Site-related components
│   ├── lib/                    # Utilities and configurations
│   │   ├── prisma.ts           # Prisma client
│   │   ├── r2.ts               # R2 storage client
│   │   ├── upload.ts           # Upload utilities
│   │   └── utils.ts            # Helper functions
│   ├── hooks/                  # Custom React hooks
│   ├── types/                  # TypeScript type definitions
│   ├── styles/                 # Global styles
│   └── env.ts                  # Environment variable validation
├── prisma/
│   ├── schema.prisma           # Database schema
│   └── seed.ts                 # Database seed script
├── public/                     # Static assets
│   ├── icons/                  # PWA icons
│   └── manifest.json           # PWA manifest
├── .env.example                # Environment variables template
├── next.config.js              # Next.js configuration
├── tailwind.config.js          # Tailwind CSS configuration
├── tsconfig.json               # TypeScript configuration
└── package.json                # Dependencies and scripts
```

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18.17.0
- npm >= 9.0.0
- PostgreSQL database (Neon recommended)
- Cloudflare R2 bucket
- Google Maps API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Prapti-XR/Prapti.git
   cd Prapti
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Fill in your credentials in `.env`:
   - Neon PostgreSQL connection strings
   - Cloudflare R2 credentials
   - Google Maps API key
   - NextAuth secret

4. **Set up the database**
   ```bash
   npm run db:push
   npm run db:seed
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📜 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript compiler checks
- `npm run db:push` - Push Prisma schema to database
- `npm run db:studio` - Open Prisma Studio
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed database with sample data

## 🗄️ Database Schema

### Core Models

- **HeritageSite**: Heritage sites with location, description, and metadata
- **Asset**: 3D models, panoramas, and images linked to sites
- **User**: User accounts with authentication
- **TriviaQuestion/Answer**: Educational content
- **FavoriteSite**: User's saved sites
- **Tag**: Categorization tags for sites

See `prisma/schema.prisma` for the complete schema.

## 🔐 Environment Variables

Required environment variables (see `.env.example`):

- `DATABASE_URL` - Neon PostgreSQL connection string
- `DIRECT_URL` - Neon direct connection string
- `R2_ACCOUNT_ID` - Cloudflare account ID
- `R2_ACCESS_KEY_ID` - R2 access key
- `R2_SECRET_ACCESS_KEY` - R2 secret key
- `R2_BUCKET_NAME` - R2 bucket name
- `R2_PUBLIC_URL` - R2 public URL
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` - Google Maps API key
- `NEXTAUTH_SECRET` - NextAuth secret (generate with `openssl rand -base64 32`)
- `NEXT_PUBLIC_APP_URL` - Application URL

## 🎨 Development Guidelines

### Component Guidelines

1. **SSR Considerations**: Use dynamic imports for 3D components
   ```typescript
   const ModelViewer = dynamic(() => import('@/components/3d/ModelViewer'), {
     ssr: false,
   });
   ```

2. **Error Boundaries**: Wrap 3D components with `ThreeErrorBoundary`

3. **TypeScript**: Use strict mode, define proper types

4. **Performance**: Optimize 3D assets, target 60fps on mobile

### Code Quality

- Use TypeScript strict mode
- Follow Next.js 14 App Router patterns
- Implement proper error handling
- Add loading states for async operations
- Include accessibility features (ARIA labels, keyboard navigation)

## 🌍 Deployment

### Vercel Deployment

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

The app will automatically build and deploy on every push to the main branch.

## 📊 Free Tier Limits

- **Neon**: 0.5GB storage, 3GB data transfer
- **Cloudflare R2**: 10GB storage, 1M read requests/month
- **Google Maps**: $200/month free credit
- **Vercel**: Unlimited bandwidth, 100GB hours

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Heritage site data providers
- Open-source 3D model contributors
- Cultural preservation organizations

## 📞 Contact

- **GitHub**: [@Prapti-XR](https://github.com/Prapti-XR)
- **Email**: contact@prapti.app

---

<div align="center">
  Made with ❤️ for cultural preservation
</div>

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

