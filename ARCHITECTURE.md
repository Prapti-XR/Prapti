# Prapti Architecture Documentation

## System Architecture Overview

Prapti follows a modern, cloud-native architecture optimized for AR/VR content delivery with serverless components.

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Browser    │  │    Mobile    │  │   VR/AR      │      │
│  │   (Desktop)  │  │   (Safari/   │  │  Headsets    │      │
│  │              │  │   Chrome)    │  │              │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    NEXT.JS APP (VERCEL)                      │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              App Router Pages (SSR/SSG)                │ │
│  │  • Home (/)  • About  • Map  • Models  • Images       │ │
│  │  • Site Detail (/site/[id])  • Profile  • Admin       │ │
│  │  • Auth (Sign In/Sign Up)  • Trivia  • Docs          │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                   API Routes                           │ │
│  │  • /api/auth/*  • /api/sites  • /api/upload          │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              3D Components (Client-Only)               │ │
│  │  • ModelViewer  • ARViewer  • PanoramaViewer          │ │
│  │  • ThreeErrorBoundary                                  │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                 UI Components                          │ │
│  │  • Navbar  • Footer  • Button  • Search               │ │
│  │  • SiteCard                                            │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
            │                    │                    │
            ↓                    ↓                    ↓
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  Neon PostgreSQL │  │  Cloudflare R2   │  │  Google Maps API │
│   (Database)     │  │   (3D Assets)    │  │  (Geolocation)   │
│                  │  │                  │  │                  │
│  • Sites Data    │  │  • 3D Models     │  │  • Site Search   │
│  • User Accounts │  │  • Panoramas     │  │  • Coordinates   │
│  • Trivia        │  │  • Images        │  │                  │
└──────────────────┘  └──────────────────┘  └──────────────────┘
```

## Technology Stack Decisions

### Why Next.js 14.2.33 App Router?
- **Server Components**: Improved performance with RSC
- **Streaming**: Progressive loading of 3D content
- **SEO**: Server-side rendering for heritage site pages
- **File-based Routing**: Intuitive page structure
- **API Routes**: Built-in backend capabilities
- **Stability**: v14 is stable and production-ready

### Why React 18.3.1?
- **Proven Stability**: Battle-tested with R3F ecosystem
- **R3F Compatibility**: Full compatibility with @react-three/fiber 8.17.10
- **Concurrent Features**: Supports concurrent rendering and transitions
- **Ecosystem Support**: All 3D libraries fully tested with React 18
- **WebXR Support**: Stable with @react-three/xr 6.6.26

### Why React Three Fiber 8.17.10?
- **Declarative 3D**: React patterns for Three.js
- **Performance**: Automatic optimization and disposal
- **Hooks**: Access to Three.js features via React hooks
- **Ecosystem**: Large collection of helpers (@react-three/drei)

### Why Neon PostgreSQL?
- **Serverless**: Auto-scaling, pay-per-use
- **Free Tier**: 0.5GB storage for development
- **Prisma Compatible**: Full ORM support
- **Low Latency**: Fast connection pooling
- **Branch Database**: Git-like database branching

### Why Cloudflare R2?
- **S3 Compatible**: Standard API, easy migration
- **No Egress Fees**: Unlike S3, no bandwidth charges
- **Free Tier**: 10GB storage, 1M reads/month
- **Fast CDN**: Cloudflare's global network
- **Cost Effective**: 10x cheaper than S3

### Why Prisma ORM 5.22.0?
- **Type Safety**: Auto-generated TypeScript types
- **Developer Experience**: Intuitive schema language
- **Migrations**: Database version control
- **Query Builder**: Type-safe queries
- **Studio**: Visual database browser
- **NextAuth Integration**: Seamless with @next-auth/prisma-adapter

## Data Flow Architecture

### 3D Asset Upload Flow

```
User (Admin) → Upload Form → API Route → Validation
                                            ↓
                                    Generate R2 Key
                                            ↓
                                    Upload to R2
                                            ↓
                                    Create Asset Record
                                            ↓
                                    Save to Database
                                            ↓
                                    Return Public URL
```

### 3D Model Viewing Flow

```
User → Site Page → Fetch Site Data (SSR)
                        ↓
                   Get Asset URLs
                        ↓
                   Load ModelViewer (Client)
                        ↓
                   Fetch .glb from R2
                        ↓
                   Parse with Three.js
                        ↓
                   Render in Canvas
                        ↓
                   Enable AR Button (WebXR)
```

### Map Search Flow

```
User → Map Page → Google Maps API
                        ↓
                   Display Heritage Sites
                        ↓
                   Click Marker
                        ↓
                   Fetch Site Details
                        ↓
                   Show Preview Card
                        ↓
                   Navigate to Site Page
```

## Database Schema Design

### Core Entities

1. **HeritageSite**: Main entity for cultural sites
   - Geographic data (latitude/longitude)
   - Location metadata (country, city, location string)
   - Historical context (era, yearBuilt, culturalContext, historicalFacts)
   - Visitor information (visitingInfo, accessibility)
   - Status flags (isPublished, isFeatured, viewCount)
   - Relations to assets, trivia, tags, favorites

2. **Asset**: Media files with rich metadata
   - Type enumeration (MODEL_3D, PANORAMA_360, PANORAMA_180, IMAGE, THUMBNAIL, VIDEO)
   - R2 storage integration (storageKey, storageUrl, fileSize, mimeType)
   - 3D model specifics (format, polygonCount, textureCount)
   - Panorama specifics (isPanorama, panoramaType)
   - Image metadata (width, height)
   - Attribution and licensing (attribution, license)
   - Status tracking (isProcessed, isPublic, downloadCount)
   - Relations to site and uploader

3. **User**: Authentication and profiles
   - Email/password or OAuth authentication
   - Role-based access (USER, ADMIN, MODERATOR)
   - Profile data (name, image, emailVerified)
   - Relations to accounts, sessions, favorites, scores, uploads

4. **Account/Session**: NextAuth integration
   - OAuth provider management (google, github, etc.)
   - Token storage (refresh_token, access_token, id_token)
   - Session management with expiry

5. **TriviaQuestion/Answer**: Educational content
   - Questions linked to specific sites
   - Difficulty levels (EASY, MEDIUM, HARD)
   - Multiple answers per question
   - Explanations for learning
   - Score tracking per user

6. **FavoriteSite**: User favorites
   - Many-to-many between users and sites
   - Timestamp for when favorited
   - Unique constraint per user-site pair

7. **Tag/SiteTag**: Categorization system
   - Tags with name and slug
   - Many-to-many relationship with sites
   - Used for filtering and search

8. **SiteView**: Analytics tracking
   - View count per site
   - User agent and country tracking
   - Timestamp for time-series analysis

9. **VerificationToken**: Email verification
   - Token-based email verification
   - Expiry management

## Component Architecture

### Layout Components
```
RootLayout
├── Navbar (client)
│   ├── Logo
│   ├── Navigation Links
│   └── User Menu
├── Page Content
└── Footer (client)
```

### 3D Component Pattern
```typescript
// Page (Server Component)
export default function ModelPage() {
  const site = await fetchSite(); // Server-side data fetch
  
  return <DynamicModelViewer site={site} />;
}

// Dynamic Import (avoid SSR)
const DynamicModelViewer = dynamic(
  () => import('@/components/3d/ModelViewer'),
  { ssr: false, loading: () => <Loader /> }
);

// ModelViewer (Client Component)
'use client';
export function ModelViewer({ site }) {
  return (
    <ThreeErrorBoundary>
      <Canvas>
        <Model url={site.modelUrl} />
      </Canvas>
    </ThreeErrorBoundary>
  );
}
```

## API Design

### Current API Routes

```
/api/auth/[...nextauth]         # NextAuth authentication endpoints
/api/auth/register              # User registration
/api/sites                      # Heritage sites CRUD operations
/api/upload                     # Asset upload to Cloudflare R2
```

### Planned API Routes

```
GET    /api/sites              # List all sites (paginated)
GET    /api/sites/:id          # Get single site
POST   /api/sites              # Create site (admin)
PUT    /api/sites/:id          # Update site (admin)
DELETE /api/sites/:id          # Delete site (admin)

POST   /api/upload             # Upload asset to R2
GET    /api/upload/presigned   # Get presigned URL for direct upload

GET    /api/trivia/:siteId     # Get trivia for site
POST   /api/trivia/submit      # Submit quiz answer

POST   /api/favorites          # Add favorite site
DELETE /api/favorites/:id      # Remove favorite
GET    /api/favorites          # Get user favorites

GET    /api/analytics/:siteId  # Get site analytics
POST   /api/analytics/view     # Track site view
```

## Performance Optimization

### 3D Asset Optimization
1. **Model Compression**: Use Draco compression for .glb files
2. **Texture Optimization**: WebP format, power-of-2 sizes
3. **Level of Detail (LOD)**: Multiple quality versions
4. **Progressive Loading**: Load low-res first, upgrade
5. **Asset Caching**: Browser and CDN caching

### Frontend Optimization
1. **Code Splitting**: Dynamic imports for 3D components
2. **Image Optimization**: Next.js Image component
3. **Font Optimization**: Google Fonts with display swap
4. **Bundle Analysis**: Monitor bundle sizes
5. **React Suspense**: Streaming SSR

### Database Optimization
1. **Indexes**: On frequently queried fields
2. **Connection Pooling**: Neon connection pooling
3. **Query Optimization**: Prisma query batching
4. **Caching**: Redis for session/API cache (future)

## Security Architecture

### Authentication
- NextAuth with credential provider
- Bcrypt password hashing
- JWT session tokens
- Role-based access control (RBAC)

### API Security
- Rate limiting (Vercel built-in)
- Input validation (Zod schemas)
- CORS configuration
- Environment variable protection

### Asset Security
- Presigned URLs for uploads
- Content-Type validation
- File size limits
- Virus scanning (future)

## Deployment Architecture (Planned)

### Current Status: Not Yet Deployed
- Running on local development server (localhost:3000)
- No production deployment
- No CI/CD pipeline configured
- Environment variables in `.env.local` (not connected to external services)

### Planned Vercel Configuration
- **Region**: Auto (multi-region)
- **Framework**: Next.js 14
- **Node Version**: 18.x
- **Build Command**: `npm run build`
- **Output**: Standalone

### Planned Environment Variables
- Will be stored in Vercel dashboard
- Separate for preview/production
- Validated at build time (@t3-oss/env-nextjs)

### Future CI/CD Pipeline
```
Push to GitHub → Vercel Build → Type Check → Lint → Build → Deploy
                                    ↓
                              Run Prisma Generate
                                    ↓
                              Validate Env Vars
                                    ↓
                              Build Next.js
                                    ↓
                              Deploy to Edge
```

## Scalability Considerations

### Current (Development)
- **Environment**: Local development only
- **Users**: Development/testing only
- **Sites**: 3 sample heritage sites (mock data)
- **Assets**: Sample 3D models and panoramas in /public
- **Database**: Not yet configured (schema ready)
- **Storage**: Local files in /public (R2 not connected yet)

### Planned (MVP)
- **Users**: 1,000 concurrent
- **Sites**: 100 heritage sites
- **Assets**: 500 3D models, 1,000 panoramas
- **Database**: 0.5GB Neon free tier
- **Storage**: 10GB R2 free tier

### Future Growth
- **Horizontal Scaling**: Vercel auto-scales
- **Database**: Upgrade to Neon paid tier (auto-scaling)
- **CDN**: R2 auto-scales globally
- **Caching**: Add Redis for hot data
- **Search**: Elasticsearch for advanced search

## Mobile & AR/VR Support

### Progressive Web App (PWA)
- Service worker for offline support
- Manifest.json for installability
- Push notifications (future)

### WebXR Implementation
- Device detection (mobile, headset)
- Controller support (6DOF)
- Hand tracking (Quest 3+)
- Spatial audio (future)

### Mobile Optimization
- Touch controls for 3D models
- Gyroscope for panoramas
- AR.js for marker-based AR
- WebXR Device API for native AR

## Monitoring & Analytics

### Performance Monitoring
- Vercel Analytics (built-in)
- Web Vitals tracking
- 3D rendering FPS monitoring
- Asset load times

### Error Tracking
- Console error logging
- Error boundaries for 3D
- API error responses
- Database query errors

### User Analytics
- Page views per site
- 3D model engagement
- AR session duration
- Quiz completion rates

## Future Architecture Enhancements

1. **Microservices**: Separate 3D processing service
2. **GraphQL**: Replace REST API for flexible queries
3. **Real-time**: WebSocket for multiplayer trivia
4. **AI/ML**: AI-generated site descriptions
5. **Blockchain**: NFT certificates for heritage supporters
6. **Video Streaming**: Live heritage site tours

## Development Workflow

### Local Development
```bash
# Setup
npm install
cp .env.example .env
npm run db:push

# Development
npm run dev           # Start Next.js
npm run db:studio     # Open Prisma Studio

# Quality Checks
npm run type-check    # TypeScript
npm run lint          # ESLint
```

### Pre-Deployment Checklist (Future)
- [ ] Connect to Neon PostgreSQL database
- [ ] Configure Cloudflare R2 storage
- [ ] Run database migrations with real data
- [ ] Upload actual 3D models and panoramas to R2
- [ ] Set up Google Maps API key
- [ ] Configure OAuth providers (Google, etc.)
- [ ] Set environment variables in Vercel
- [ ] Test all features on staging environment
- [ ] Test AR/VR features on mobile device
- [ ] Performance audit (Lighthouse)
- [ ] Security headers configured
- [ ] Error monitoring setup (Sentry, etc.)

## Current Implementation Status

### ✅ Completed Features

**Core Infrastructure:**
- Next.js 14.2.33 with App Router
- TypeScript 5.6.3 configuration
- Tailwind CSS 3.4.14 styling
- Prisma 5.22.0 ORM with Neon PostgreSQL
- NextAuth 4.24.7 authentication

**3D/XR Components:**
- ModelViewer (React Three Fiber 8.17.10)
- ARViewer (WebXR with @react-three/xr 6.6.26)
- PanoramaViewer (360° image viewing)
- ThreeErrorBoundary for error handling
- Dynamic imports for SSR compatibility

**Pages:**
- Home page (/)
- About page
- Models gallery page (/models)
- 360 Images gallery page (/images)
- Site detail page (/site/[id]) with 3D, Panorama, and AR viewers
- Map page (/map)
- Authentication pages (Sign In/Sign Up)
- Profile page
- Admin page
- Documentation page
- Trivia page

**API Routes:**
- `/api/auth/[...nextauth]` - NextAuth endpoints
- `/api/auth/register` - User registration
- `/api/sites` - Heritage sites management
- `/api/upload` - Asset upload to Cloudflare R2

**UI Components:**
- Navbar with navigation
- Footer
- Button component with variants
- Search component
- SiteCard component

**Database Schema:**
- Complete Prisma schema with 12 models
- User authentication and authorization
- Heritage site management
- Asset storage metadata
- Trivia system
- Favorites and tagging
- Analytics tracking

**Storage & Assets:**
- Cloudflare R2 SDK integration (@aws-sdk/client-s3) - Code ready, not connected
- S3-compatible presigned URL logic implemented
- Support for 3D models (.glb/.gltf) - Currently using /public/models
- 360° panorama images - Currently using /public/360-images
- Regular images and thumbnails
- **Note**: Currently serving from local /public folder, R2 not connected

**Security:**
- NextAuth configuration ready (not fully connected)
- Bcrypt password hashing implemented
- Role-based access control schema (USER, ADMIN, MODERATOR) defined
- CORS configuration for mobile testing
- Environment variable validation with @t3-oss/env-nextjs
- **Note**: Using mock data, authentication not fully functional

### 🚧 In Progress / To Be Connected

**Backend Connections Needed:**
- Connect to Neon PostgreSQL database (schema ready, not connected)
- Connect to Cloudflare R2 storage (SDK ready, not configured)
- Configure NextAuth with real OAuth providers
- Set up Google Maps API integration

**Features to Implement:**
- Trivia game functionality
- User profile management
- Admin dashboard features
- Asset upload UI with R2 integration
- Real data management (currently using mock data)
- Database CRUD operations through API routes

### 📋 Planned Features

- Advanced search and filtering
- User-generated content
- Social features (comments, ratings)
- Multi-language support
- Progressive Web App (PWA)
- Offline support
- Push notifications
- Video streaming
- AI-generated descriptions
- Real-time collaborative features

## Current Tech Stack

**Framework & Core:**
- Next.js: 14.2.33
- React: 18.3.1
- TypeScript: 5.6.3
- Node.js: >=18.17.0

**3D & XR:**
- Three.js: 0.169.0
- @react-three/fiber: 8.17.10
- @react-three/drei: 9.115.0
- @react-three/xr: 6.6.26

**Database & Auth:**
- Prisma: 5.22.0
- @prisma/client: 5.22.0
- NextAuth: 4.24.7
- @next-auth/prisma-adapter: 1.0.7
- bcryptjs: 2.4.3

**Storage:**
- @aws-sdk/client-s3: 3.665.0
- @aws-sdk/s3-request-presigner: 3.665.0

**Styling:**
- Tailwind CSS: 3.4.14
- @tailwindcss/typography: 0.5.15
- class-variance-authority: 0.7.1
- clsx: 2.1.1
- tailwind-merge: 2.5.4

**Utilities:**
- Zod: 3.23.8 (validation)
- Zustand: 5.0.1 (state management)
- @t3-oss/env-nextjs: 0.11.1 (env validation)

---

**Last Updated**: November 11, 2025  
**Version**: 0.1.0 (Pre-release)  
**Development Phase**: Frontend Development with Basic Backend  
**Status**: Local Development - Not Yet Deployed  
**Project**: Prapti Heritage AR/VR Platform
