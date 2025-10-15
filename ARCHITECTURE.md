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
│  │  • Home  • Gallery  • Map  • Profile  • Admin         │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                   API Routes                           │ │
│  │  • /api/sites  • /api/upload  • /api/auth            │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              3D Components (Client-Only)               │ │
│  │  • ModelViewer  • ARViewer  • PanoramaViewer          │ │
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

### Why Next.js 14 App Router?
- **Server Components**: Improved performance with RSC
- **Streaming**: Progressive loading of 3D content
- **SEO**: Server-side rendering for heritage site pages
- **File-based Routing**: Intuitive page structure
- **API Routes**: Built-in backend capabilities

### Why React 18.3.1 (Not React 19)?
- **Proven Stability**: Battle-tested with R3F 8.17.10
- **R3F Compatibility**: React 19 support in R3F is still experimental
- **Concurrent Features**: Already includes concurrent rendering
- **Ecosystem Support**: All libraries tested with React 18

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

### Why Prisma ORM?
- **Type Safety**: Auto-generated TypeScript types
- **Developer Experience**: Intuitive schema language
- **Migrations**: Database version control
- **Query Builder**: Type-safe queries
- **Studio**: Visual database browser

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
   - Geographic data (lat/lng)
   - Metadata (era, year, description)
   - Relations to assets, trivia, tags

2. **Asset**: Media files for sites
   - Polymorphic (3D models, panoramas, images)
   - R2 storage metadata
   - Processing status

3. **User**: Authentication and profiles
   - Role-based access (admin, moderator, user)
   - Favorites and quiz scores
   - Upload tracking

4. **TriviaQuestion/Answer**: Educational content
   - Difficulty levels
   - Explanations for learning
   - Score tracking

5. **Tag**: Categorization system
   - Many-to-many with sites
   - Slug for URLs

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

### RESTful Endpoints

```
GET    /api/sites              # List all sites (paginated)
GET    /api/sites/:id          # Get single site
POST   /api/sites              # Create site (admin)
PUT    /api/sites/:id          # Update site (admin)
DELETE /api/sites/:id          # Delete site (admin)

POST   /api/upload             # Upload asset
GET    /api/upload/presigned   # Get presigned URL

GET    /api/trivia/:siteId     # Get trivia for site
POST   /api/trivia/submit      # Submit quiz answer

POST   /api/favorites          # Add favorite
DELETE /api/favorites/:id      # Remove favorite
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

## Deployment Architecture

### Vercel Configuration
- **Region**: Auto (multi-region)
- **Framework**: Next.js 14
- **Node Version**: 18.x
- **Build Command**: `npm run build`
- **Output**: Standalone

### Environment Variables
- Stored in Vercel dashboard
- Separate for preview/production
- Validated at build time (@t3-oss/env-nextjs)

### CI/CD Pipeline
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

### Current (MVP)
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

### Deployment Checklist
- [ ] Environment variables set in Vercel
- [ ] Database migrations applied
- [ ] R2 bucket configured with CORS
- [ ] Google Maps API key activated
- [ ] Test AR/VR features on device
- [ ] Performance audit (Lighthouse)
- [ ] Security headers configured

---

**Last Updated**: October 2025  
**Version**: 1.0.0  
**Architecture Status**: MVP Phase
