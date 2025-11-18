# Card Components

Comprehensive card component library for the Prapti Heritage Platform, built with heritage theme colors and glassmorphism effects.

## 🎨 Design Philosophy

All card components follow the Prapti heritage design system:
- **Colors**: Heritage primary (#FEC683), secondary (#8B4513), accent (#96ADC8)
- **Glass Effects**: Backdrop blur with opacity for modern look
- **Responsive**: Mobile-first approach
- **Accessibility**: Semantic HTML and proper ARIA attributes

---

## 📦 Components

### 1. **Card** (Base Component)
Flexible foundation for all card variations.

```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components';

<Card variant="glass" hover padding="lg">
  <CardHeader>
    <CardTitle as="h2">Heritage Site</CardTitle>
    <CardDescription>Ancient temple from 850 CE</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Your content */}
  </CardContent>
  <CardFooter>
    {/* Actions */}
  </CardFooter>
</Card>
```

**Props:**
- `variant`: 'default' | 'glass' | 'elevated' | 'bordered'
- `hover`: boolean - Enable hover effects
- `padding`: 'none' | 'sm' | 'md' | 'lg'

---

### 2. **SiteCard**
Display heritage site information with thumbnail and features.

```tsx
import { SiteCard } from '@/components';

<SiteCard
  id="sonda-fort"
  name="Sonda Fort"
  location="Sonda, Karnataka"
  description="Ancient hill fort from the Vijayanagara period"
  thumbnail="/images/sonda-fort.jpg"
  category="Fort"
  yearBuilt={1500}
  tags={['fort', 'medieval', 'vijayanagara']}
  hasModel
  hasPanorama
  hasAR
/>
```

**Features:**
- Thumbnail with fallback icon
- Category and year badges
- Location with icon
- Feature indicators (3D, 360°, AR)
- Clickable link to site detail page

---

### 3. **ModelCard**
Display 3D model previews with heritage styling.

```tsx
import { ModelCard } from '@/components';

<ModelCard
  id="sahasralinga"
  name="Sahasralinga"
  location="Sirsi, Karnataka"
  description="Riverbed with thousands of carved Shiva lingas"
  era="Ancient"
  yearBuilt={900}
  tags={['temple', 'pilgrimage', 'ancient']}
  onClick={() => handleModelClick()}
/>
```

**Features:**
- 3D icon with gradient background
- Era badge (e.g., "Ancient • 900")
- Location display
- AR ready indicator
- Click handler for modal/navigation

---

### 4. **ImageCard**
Display 360° panoramic image previews.

```tsx
import { ImageCard } from '@/components';

<ImageCard
  id="panorama-1"
  name="Sonda Fort - Main View"
  location="Sonda, Karnataka"
  description="360° view of the historic Sonda Fort"
  imageUrl="/360-images/sonda-fort.jpg"
  capturedYear={2024}
  site="Sonda Fort"
  onClick={() => handlePanoramaClick()}
/>
```

**Features:**
- Dark heritage-themed background
- 360° badge
- Image icon with gradient
- Capture year display
- Click handler for panorama viewer

---

### 5. **StatCard**
Display statistics and metrics with icons.

```tsx
import { StatCard } from '@/components';

<StatCard
  label="Total Sites"
  value="24"
  icon="🏛️"
  variant="primary"
  trend={{ value: 12, isPositive: true }}
/>
```

**Props:**
- `label`: string
- `value`: string | number
- `icon`: string (emoji) | React.ReactNode
- `variant`: 'default' | 'primary' | 'secondary' | 'accent'
- `trend`: { value: number, isPositive: boolean } (optional)

**Features:**
- Large value display
- Icon background with heritage colors
- Optional trend indicator with arrow
- Hover effects

---

### 6. **ActionCard**
Interactive card for admin actions or navigation.

```tsx
import { ActionCard } from '@/components';

<ActionCard
  title="Add New Site"
  description="Upload a new heritage site with details"
  icon="🏛️"
  variant="primary"
  onClick={() => handleAction()}
  // OR
  href="/admin/upload"
/>
```

**Props:**
- `title`: string
- `description`: string
- `icon`: string | React.ReactNode
- `variant`: 'default' | 'primary' | 'glass'
- `onClick`: () => void (optional)
- `href`: string (optional)
- `disabled`: boolean

**Features:**
- Large icon with gradient background
- Gradient overlay on hover
- Arrow indicator
- Can be button or link

---

### 7. **ActivityItem**
Display activity log entries or notifications.

```tsx
import { ActivityItem } from '@/components';

<ActivityItem
  title="New site added"
  description="Sonda Fort heritage site was added"
  timestamp="2 hours ago"
  iconBg="success"
  icon={<YourIconComponent />}
  // OR with avatar
  avatar="/avatars/user.jpg"
  userName="Admin User"
  onClick={() => handleActivityClick()}
/>
```

**Props:**
- `title`: string
- `description`: string (optional)
- `timestamp`: string
- `icon`: React.ReactNode (optional)
- `iconBg`: 'default' | 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error'
- `avatar`: string (optional)
- `userName`: string (optional)
- `onClick`: () => void (optional)

**Features:**
- Icon or avatar display
- Colored icon backgrounds
- Optional click handler
- Hover effects
- Timestamp display

---

### 8. **FeatureCard**
Display key features on landing or about pages.

```tsx
import { FeatureCard } from '@/components';

<FeatureCard
  title="3D Exploration"
  description="Explore heritage sites in stunning 3D with interactive models"
  variant="glass"
  icon={
    <svg className="w-8 h-8">
      {/* Your SVG */}
    </svg>
  }
/>
```

**Props:**
- `title`: string
- `description`: string
- `icon`: React.ReactNode (optional)
- `variant`: 'default' | 'glass' | 'elevated'

**Features:**
- Centered layout
- Icon with gradient background
- Hover scale effect
- Perfect for feature grids

---

## 🎨 Theme Integration

All cards use the heritage color palette:

```css
/* Primary Actions & Highlights */
heritage-primary: #FEC683

/* Heritage & Tradition */
heritage-secondary: #8B4513

/* Complementary Accents */
heritage-accent: #96ADC8

/* Text & Dark Elements */
heritage-dark: #3E2723

/* Backgrounds & Light */
heritage-light: #DAE0F2
```

### Glass Effects
```css
/* Light glassmorphism */
bg-white/70 backdrop-blur-xl border-gray-200/50

/* Dark glassmorphism */
bg-gray-900/70 backdrop-blur-xl border-gray-700/50
```

---

## 📱 Responsive Design

All cards are mobile-first and fully responsive:

- **Mobile (< 640px)**: Single column, touch-friendly
- **Tablet (640px - 1024px)**: 2-column grids
- **Desktop (> 1024px)**: 3-4 column grids

```tsx
{/* Example Grid Layout */}
<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
  <ModelCard {...props} />
  <ModelCard {...props} />
  <ModelCard {...props} />
</div>
```

---

## ♿ Accessibility

- Semantic HTML structure
- Proper heading hierarchy
- Keyboard navigation support
- Touch-friendly targets (min 44px)
- Color contrast WCAG AA compliant
- Screen reader friendly

---

## 🚀 Usage Examples

### Admin Dashboard Stats
```tsx
<section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
  <StatCard label="Total Sites" value="24" icon="🏛️" variant="primary" />
  <StatCard label="3D Models" value="18" icon="📦" variant="secondary" />
  <StatCard label="360° Images" value="32" icon="🖼️" variant="accent" />
  <StatCard label="Active Users" value="156" icon="👥" variant="default" />
</section>
```

### Model Gallery
```tsx
<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
  {models.map((model) => (
    <ModelCard
      key={model.id}
      {...model}
      onClick={() => openModelViewer(model)}
    />
  ))}
</div>
```

### Activity Feed
```tsx
<div className="divide-y divide-gray-100">
  {activities.map((activity) => (
    <ActivityItem
      key={activity.id}
      {...activity}
      onClick={() => viewActivity(activity)}
    />
  ))}
</div>
```

---

## 📂 File Structure

```
src/components/cards/
├── Card.tsx              # Base card component
├── ModelCard.tsx         # 3D model preview card
├── ImageCard.tsx         # 360° image preview card
├── StatCard.tsx          # Statistics display card
├── ActionCard.tsx        # Interactive action card
├── ActivityItem.tsx      # Activity log item
├── FeatureCard.tsx       # Feature highlight card
├── index.ts              # Export barrel
└── README.md             # This file
```

---

## 🔄 Migration Guide

If you have inline card components, migrate them like this:

**Before:**
```tsx
function OldCard({ data }) {
  return (
    <div className="bg-white p-6 rounded-lg border">
      <h3>{data.title}</h3>
      <p>{data.description}</p>
    </div>
  );
}
```

**After:**
```tsx
import { Card, CardHeader, CardTitle, CardDescription } from '@/components';

function NewCard({ data }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{data.title}</CardTitle>
        <CardDescription>{data.description}</CardDescription>
      </CardHeader>
    </Card>
  );
}
```


