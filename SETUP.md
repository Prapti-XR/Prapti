# Prapti - Quick Setup Guide

## 📋 Complete Project Structure Created

Your Prapti project has been successfully scaffolded with a production-ready architecture!

### ✅ What's Been Created

```
Prapti/
├── 📁 src/
│   ├── 📁 app/                     # Next.js 14 App Router
│   │   ├── layout.tsx              # Root layout with fonts
│   │   ├── page.tsx                # Home page
│   │   ├── 📁 models/              # 3D model gallery
│   │   ├── 📁 images/              # 360° panoramas
│   │   ├── 📁 map/                 # Google Maps integration
│   │   ├── 📁 trivia/              # Educational games
│   │   ├── 📁 about/               # Project info
│   │   ├── 📁 profile/             # User profiles
│   │   ├── 📁 admin/               # Admin dashboard
│   │   ├── 📁 auth/signup/         # Authentication
│   │   ├── 📁 site/[id]/           # Dynamic site pages
│   │   └── 📁 api/                 # API routes
│   │       ├── sites/route.ts
│   │       └── upload/route.ts
│   ├── 📁 components/              # React components
│   │   ├── 📁 3d/                  # 3D/AR viewers
│   │   │   ├── ModelViewer.tsx
│   │   │   ├── ARViewer.tsx
│   │   │   └── PanoramaViewer.tsx
│   │   ├── 📁 layout/
│   │   │   ├── Navbar.tsx
│   │   │   └── Footer.tsx
│   │   ├── 📁 site/
│   │   │   └── SiteCard.tsx
│   │   └── 📁 error/
│   │       └── ThreeErrorBoundary.tsx
│   ├── 📁 lib/                     # Utilities
│   │   ├── prisma.ts               # Database client
│   │   ├── r2.ts                   # R2 storage client
│   │   ├── upload.ts               # Upload utilities
│   │   └── utils.ts                # Helper functions
│   ├── 📁 hooks/                   # Custom React hooks
│   ├── 📁 types/                   # TypeScript types
│   ├── 📁 styles/
│   │   └── globals.css             # Tailwind styles
│   └── env.ts                      # Environment validation
├── 📁 prisma/
│   ├── schema.prisma               # Database schema ✨
│   └── seed.ts                     # Seed script
├── 📁 public/
│   ├── manifest.json               # PWA manifest
│   ├── 📁 icons/                   # PWA icons (placeholder)
│   └── 📁 models/                  # Local 3D models (placeholder)
├── 📄 Configuration Files
│   ├── package.json                # Dependencies ✨
│   ├── tsconfig.json               # TypeScript config
│   ├── next.config.js              # Next.js config
│   ├── tailwind.config.js          # Tailwind config
│   ├── postcss.config.js           # PostCSS config
│   ├── .eslintrc.json              # ESLint rules
│   ├── .prettierrc                 # Prettier config
│   ├── .gitignore                  # Git ignore rules
│   ├── .env.example                # Environment template
│   └── vercel.json                 # Vercel deployment
├── 📄 Documentation
│   ├── README.md                   # Complete project docs ✨
│   └── ARCHITECTURE.md             # Architecture guide ✨
└── 📁 .vscode/
    ├── settings.json               # VS Code settings
    └── extensions.json             # Recommended extensions
```

## 🚀 Next Steps

### 1. Install Dependencies

```bash
npm install
```

This will install all required packages:
- Next.js 14.2.15
- React 18.3.1
- Three.js 0.169.0
- React Three Fiber 8.17.10
- Prisma 5.22.0
- AWS SDK (for R2)
- And all other dependencies

### 2. Set Up Environment Variables

```bash
# Copy the example file
cp .env.example .env

# Then edit .env with your actual credentials
```

**Required Credentials:**

#### 1. **Neon PostgreSQL Database** (Free Tier - Required)

1. Go to https://neon.tech and sign up
2. Click **"Create a project"**
3. Enter project name (e.g., "prapti")
4. Select a region close to you
5. Click **"Create project"**
6. On the dashboard, find **"Connection string"**
7. Copy the connection string (looks like `postgresql://user:password@ep-xxx.neon.tech/neondb`)
8. In your `.env.local` file, update:
   ```env
   DATABASE_URL="your-connection-string-here"
   DIRECT_URL="your-connection-string-here"
   ```

**⚠️ Important:** Make sure to use the **pooled connection string** for `DATABASE_URL`

#### 2. **Google OAuth** (Free - Required for Google Sign-In)

1. Go to https://console.cloud.google.com
2. Create a new project or select existing one
3. Click **"APIs & Services"** → **"Credentials"**
4. Click **"Create Credentials"** → **"OAuth client ID"**
5. If prompted, configure the **OAuth consent screen**:
   - Choose **"External"** user type
   - Fill in app name: "Prapti"
   - Add your email as support email
   - Add authorized domain: `localhost` (for development)
   - Save and continue
6. Back to **Create OAuth client ID**:
   - Application type: **"Web application"**
   - Name: "Prapti Web Client"
   - **Authorized JavaScript origins**: `http://localhost:3000`
   - **Authorized redirect URIs**: `http://localhost:3000/api/auth/callback/google`
   - Click **"Create"**
7. Copy the **Client ID** and **Client Secret**
8. In your `.env.local` file, add:
   ```env
   GOOGLE_CLIENT_ID="your-client-id-here"
   GOOGLE_CLIENT_SECRET="your-client-secret-here"
   ```

#### 3. **Google Maps API** (Free - $200/month credit)

1. In the same Google Cloud Console project
2. Go to **"APIs & Services"** → **"Library"**
3. Search for **"Maps JavaScript API"**
4. Click **"Enable"**
5. Go to **"Credentials"** → **"Create Credentials"** → **"API Key"**
6. Copy the API key
7. (Optional) Click **"Restrict Key"** to secure it:
   - API restrictions: Select **"Maps JavaScript API"**
   - Website restrictions: Add `localhost:3000/*` for development
8. In your `.env.local` file, add:
   ```env
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="your-maps-api-key-here"
   ```

#### 4. **Cloudflare R2 Storage** (Free Tier - Optional for now)

1. Sign up at https://cloudflare.com
2. Go to **R2 Object Storage** in the dashboard
3. Click **"Create bucket"**
4. Name it `prapti-assets`
5. Go to **"Manage R2 API Tokens"**
6. Click **"Create API token"**
7. Select **"Edit"** permissions for your bucket
8. Copy the **Access Key ID** and **Secret Access Key**
9. Copy your **Account ID** from the R2 overview page
10. In your `.env.local` file, add:
    ```env
    R2_ACCOUNT_ID="your-account-id"
    R2_ACCESS_KEY_ID="your-access-key"
    R2_SECRET_ACCESS_KEY="your-secret-key"
    R2_BUCKET_NAME="prapti-assets"
    R2_PUBLIC_URL="https://pub-xxxxxxxxxxxxxxxxxxxx.r2.dev"
    ```

#### 5. **Generate NextAuth Secret** (Required)

Run this command to generate a secure secret:

```bash
# On Windows (PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))

# On Linux/Mac
openssl rand -base64 32
```

Add to `.env.local`:
```env
NEXTAUTH_SECRET="your-generated-secret-here"
NEXTAUTH_URL="http://localhost:3000"
```

#### 6. **Complete .env.local Example**

Your `.env.local` should look like this:

```env
# Database (Required)
DATABASE_URL="postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require"
DIRECT_URL="postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require"

# NextAuth (Required)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-generated-secret"

# Google OAuth (Required)
GOOGLE_CLIENT_ID="xxx.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-xxx"

# Google Maps (Required)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="AIzaSyXXX"

# Cloudflare R2 (Optional - for production)
R2_ACCOUNT_ID="your-account-id"
R2_ACCESS_KEY_ID="your-access-key"
R2_SECRET_ACCESS_KEY="your-secret-key"
R2_BUCKET_NAME="prapti-assets"
R2_PUBLIC_URL="https://pub-xxx.r2.dev"

# App Config
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_APP_NAME="Prapti"
```

### 3. Set Up Database

```bash
# Generate Prisma Client
npx prisma generate

# Push schema to database (creates tables)
npm run db:push

# Seed database with sample data
npm run db:seed

# (Optional) Open Prisma Studio to view data
npm run db:studio
```

### 4. Run Development Server

```bash
npm run dev
```

Visit http://localhost:3000 to see your app! 🎉

### 5. Verify Installation

Check that everything works:

- [ ] Home page loads
- [ ] No TypeScript errors (run `npm run type-check`)
- [ ] Database connection successful
- [ ] All pages accessible

## 📚 Key Files to Understand

### Configuration Files

1. **`package.json`** - All dependencies with exact versions
2. **`prisma/schema.prisma`** - Complete database schema
3. **`next.config.js`** - Next.js with Three.js webpack config
4. **`src/env.ts`** - Type-safe environment variables

### Core Files

1. **`src/app/layout.tsx`** - Root layout with fonts
2. **`src/lib/prisma.ts`** - Database client singleton
3. **`src/lib/r2.ts`** - Cloudflare R2 storage client
4. **`src/components/error/ThreeErrorBoundary.tsx`** - Error handling

## 🎨 Frontend Development (Next Phase)

The architecture is ready! Now you can:

1. **Design the UI/UX**
   - Create design system/component library
   - Implement responsive layouts
   - Add animations and transitions

2. **Build Components**
   - Implement Navbar with navigation
   - Create SiteCard for gallery views
   - Build ModelViewer for 3D content
   - Implement AR/VR experiences

3. **Add Features**
   - User authentication flows
   - 3D model upload system
   - Map-based site discovery
   - Trivia game mechanics

## 🔍 Important Notes

### About TypeScript Errors

You'll see some TypeScript errors until you run `npm install`. This is normal! The errors are because:
- Packages aren't installed yet
- Prisma client needs to be generated

**After running `npm install` and `npx prisma generate`, all errors will be resolved.**

### About 3D Components

All 3D components (ModelViewer, ARViewer, PanoramaViewer) are marked as `'use client'` and should be dynamically imported to avoid SSR issues:

```typescript
import dynamic from 'next/dynamic';

const ModelViewer = dynamic(
  () => import('@/components/3d/ModelViewer'),
  { ssr: false }
);
```

### Version Compatibility

**Critical:** Do NOT upgrade to React 19 or incompatible R3F versions!

Current stack is battle-tested and stable:
- React 18.3.1 ✅
- @react-three/fiber 8.17.10 ✅
- Three.js 0.169.0 ✅

## 📖 Documentation

- **README.md** - Complete project overview and setup
- **ARCHITECTURE.md** - Detailed architecture documentation
- **Prisma Schema** - Database structure in `prisma/schema.prisma`

## 🆘 Troubleshooting

### "Cannot find module" errors
```bash
npm install
```

### "Prisma Client not found"
```bash
npx prisma generate
```

### Port 3000 already in use
```bash
# Kill the process or use a different port
npm run dev -- -p 3001
```

### Database connection fails
- Check `.env` file has correct DATABASE_URL
- Verify Neon database is running
- Check network connection

## 🎯 MVP Features to Implement Next

1. **Home Page** - Landing with featured sites
2. **Site Gallery** - Browse heritage sites
3. **3D Viewer** - Display 3D models
4. **Map Integration** - Google Maps with site markers
5. **Basic Auth** - User signup/login
6. **Admin Panel** - Site management

## 🌐 Deployment (When Ready)

```bash
# Build for production
npm run build

# Test production build locally
npm start

# Deploy to Vercel (from GitHub)
# 1. Push to GitHub
# 2. Import in Vercel
# 3. Add environment variables
# 4. Deploy!
```

## 💡 Best Practices

1. **Always use TypeScript strict mode** ✓ Already configured
2. **Dynamic import 3D components** ✓ Prevents SSR issues
3. **Use Prisma for all DB queries** ✓ Type-safe
4. **Validate env vars at startup** ✓ Using @t3-oss/env-nextjs
5. **Handle errors with boundaries** ✓ ThreeErrorBoundary ready

## 📞 Support

- Check ARCHITECTURE.md for system design details
- Review Prisma schema for database structure
- See package.json for all available scripts

---

**Project Status**: ✅ Architecture Complete  
**Next Phase**: Frontend Implementation  
**Ready for**: Styling, UI/UX, Feature Development  

Good luck building Prapti! 🏛️✨
