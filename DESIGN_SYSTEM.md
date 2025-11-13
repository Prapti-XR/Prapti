# Prapti Design System

> **Last Updated:** November 13, 2025  
> **Version:** 1.0  
> **Theme:** Heritage & Cultural Elegance with Modern Minimalism

This document defines the complete design system for the Prapti heritage AR/VR platform. All components, pages, and features should follow these guidelines.

---

## 🎨 Color Palette

Our color system reflects heritage warmth combined with modern sophistication.

### Primary Colors

#### Heritage Primary - `#FEC683`
- **Usage:** Primary actions, CTAs, accents, highlights
- **Name:** Warm Golden Yellow
- **Represents:** Cultural richness, warmth, invitation
- **Tailwind:** `heritage-primary`
- **Examples:** Primary buttons, active states, links, badges

#### Heritage Secondary - `#8B4513`
- **Usage:** Secondary actions, supporting elements
- **Name:** Saddle Brown
- **Represents:** Heritage, tradition, earthiness
- **Tailwind:** `heritage-secondary`
- **Examples:** Secondary buttons, borders, icons

#### Heritage Accent - `#96ADC8`
- **Usage:** Complementary accents, calm highlights
- **Name:** Soft Blue-Gray
- **Represents:** Serenity, trust, balance
- **Tailwind:** `heritage-accent`
- **Examples:** Info badges, subtle backgrounds, accent buttons

### Neutral Colors

#### Heritage Dark - `#3E2723`
- **Usage:** Text, headings, dark elements
- **Name:** Dark Brown
- **Represents:** Elegance, readability, depth
- **Tailwind:** `heritage-dark`
- **Examples:** Body text, headings, icons, dark UI elements

#### Heritage Light - `#DAE0F2`
- **Usage:** Backgrounds, subtle fills, containers
- **Name:** Light Blue-Gray
- **Represents:** Cleanliness, space, breathability
- **Tailwind:** `heritage-light`
- **Examples:** Page backgrounds, card backgrounds, hover states

### Color Usage Guidelines

```typescript
// Buttons
Primary Action → heritage-primary (#FEC683)
Secondary Action → heritage-secondary (#8B4513)
Tertiary/Accent → heritage-accent (#96ADC8)

// Text
Headings → heritage-dark (#3E2723)
Body Text → heritage-dark (#3E2723)
Muted Text → heritage-dark with 70% opacity

// Backgrounds
Page Background → white or heritage-light (#DAE0F2)
Card Background → white
Hover States → heritage-light with 20-50% opacity

// Borders
Subtle → heritage-light with 20-30% opacity
Prominent → heritage-dark with 20% opacity
```

---

## 📝 Typography

Typography combines heritage elegance with modern readability.

### Font Families

#### Playfair Display (Serif) - Headings
- **Usage:** All headings (H1-H6), display text, logo
- **Characteristics:** Elegant, high-contrast, heritage feel
- **Variable:** `--font-playfair`
- **Tailwind:** `font-serif`
- **Weights:**
  - **700 (Bold):** H1, H2, Logo
  - **600 (SemiBold):** H3, H4, H5, H6

#### Inter (Sans-serif) - Body
- **Usage:** Body text, labels, UI elements
- **Characteristics:** Clean, modern, highly legible
- **Variable:** `--font-inter`
- **Tailwind:** `font-sans`
- **Weights:**
  - **400 (Regular):** Body text, paragraphs
  - **500 (Medium):** Labels, captions, buttons
  - **600 (SemiBold):** Emphasized text, subheadings

### Type Scale

```typescript
// Headings (Playfair Display)
H1: text-5xl md:text-6xl lg:text-7xl, font-bold (700), tracking-tight
H2: text-4xl md:text-5xl lg:text-6xl, font-bold (700), tracking-tight
H3: text-3xl md:text-4xl, font-semibold (600), tracking-tight
H4: text-2xl md:text-3xl, font-semibold (600)
H5: text-xl md:text-2xl, font-semibold (600)
H6: text-lg md:text-xl, font-semibold (600)

// Body Text (Inter)
Large: text-lg md:text-xl, font-normal (400), leading-relaxed
Base: text-base, font-normal (400), leading-relaxed
Small: text-sm, font-normal (400), leading-normal
XSmall: text-xs, font-normal (400), leading-normal

// Labels & UI (Inter)
Label: text-sm md:text-base, font-medium (500)
Button: text-base md:text-lg, font-medium (500)
Caption: text-xs md:text-sm, font-medium (500)
```

### Typography Usage Examples

```tsx
// Headings
<h1 className="font-serif text-5xl md:text-6xl font-bold text-heritage-dark tracking-tight">
  Main Heading
</h1>

<h2 className="font-serif text-4xl md:text-5xl font-bold text-heritage-dark tracking-tight">
  Section Heading
</h2>

<h3 className="font-serif text-3xl md:text-4xl font-semibold text-heritage-dark">
  Subsection
</h3>

// Body Text
<p className="font-sans text-base md:text-lg text-heritage-dark leading-relaxed">
  This is body text that is easy to read and properly spaced.
</p>

// Labels
<label className="font-sans text-sm md:text-base font-medium text-heritage-dark">
  Form Label
</label>
```

---

## 🧩 Spacing System

Based on 4px increments for consistency and harmony.

### Scale
```typescript
xs:   4px  → space-1
sm:   8px  → space-2
md:   16px → space-4
lg:   24px → space-6
xl:   32px → space-8
2xl:  48px → space-12
3xl:  64px → space-16
4xl:  96px → space-24
```

### Usage Guidelines
- **Component Padding:** `sm` (8px) to `lg` (24px)
- **Section Spacing:** `2xl` (48px) to `3xl` (64px)
- **Page Margins:** `xl` (32px) to `2xl` (48px)
- **Gap Between Elements:** `md` (16px) to `lg` (24px)

---

## 🎯 Component Principles

### Design Philosophy

1. **Minimalist**
   - Clean, uncluttered interfaces
   - Generous white space
   - Focus on content

2. **Heritage-Inspired**
   - Warm, earthy tones
   - Elegant serif headings
   - Cultural respect in visuals

3. **Breathable**
   - Ample spacing between elements
   - Light, airy layouts
   - Avoid visual crowding

4. **Soft & Calm**
   - Subtle shadows (not harsh)
   - Smooth transitions
   - Gentle hover states

### Shadow System

```css
/* Soft, subtle shadows for minimalist feel */
shadow-sm:   0 1px 2px rgba(0, 0, 0, 0.05)
shadow:      0 1px 3px rgba(0, 0, 0, 0.1)
shadow-md:   0 4px 6px rgba(0, 0, 0, 0.07)
shadow-lg:   0 10px 15px rgba(0, 0, 0, 0.1)
shadow-xl:   0 20px 25px rgba(0, 0, 0, 0.1)
```

### Border Radius

```css
/* Soft, friendly curves */
rounded-md:   6px  → Small elements
rounded-lg:   8px  → Buttons, inputs
rounded-xl:   12px → Cards, containers
rounded-2xl:  16px → Large containers
rounded-full: 9999px → Pills, badges, icon buttons
```

---

## 🔘 Button Styles

### Variants

#### Primary
```tsx
<button className="bg-heritage-primary text-heritage-dark font-semibold 
                   px-6 py-3 rounded-lg shadow-sm hover:shadow-md 
                   hover:bg-heritage-primary/90 transition-all">
  Primary Action
</button>
```

#### Secondary
```tsx
<button className="bg-heritage-secondary text-white font-semibold 
                   px-6 py-3 rounded-lg shadow-sm hover:shadow-md 
                   hover:bg-heritage-secondary/90 transition-all">
  Secondary Action
</button>
```

#### Accent
```tsx
<button className="bg-heritage-accent text-white font-semibold 
                   px-6 py-3 rounded-lg shadow-sm hover:shadow-md 
                   hover:bg-heritage-accent/90 transition-all">
  Accent Action
</button>
```

#### Ghost
```tsx
<button className="bg-transparent text-heritage-dark font-medium 
                   px-6 py-3 rounded-lg hover:bg-heritage-light/50 
                   hover:text-heritage-primary transition-all">
  Ghost Button
</button>
```

#### Outline
```tsx
<button className="bg-transparent border-2 border-heritage-dark 
                   text-heritage-dark font-medium px-6 py-3 rounded-lg 
                   hover:bg-heritage-dark hover:text-white transition-all">
  Outline Button
</button>
```

### Sizes
- **Small:** `h-9 px-4 text-sm`
- **Medium:** `h-11 px-6 text-base`
- **Large:** `h-12 px-8 text-base md:text-lg`
- **XLarge:** `h-14 px-10 text-lg md:text-xl`

---

## 📦 Card Styles

```tsx
<div className="bg-white rounded-xl shadow-sm p-6 
                hover:shadow-md transition-shadow 
                border border-heritage-light/20">
  Card Content
</div>
```

### Card Variants
- **Default:** White background, subtle shadow
- **Elevated:** Increased shadow on hover
- **Interactive:** Cursor pointer, scale on hover
- **Outlined:** Border instead of shadow

---

## 🎨 Component Color Applications

### Navigation
- **Navbar Background:** White with soft shadow
- **Active Link:** `heritage-primary`
- **Hover Link:** `heritage-dark` → `heritage-primary`

### Footer
- **Background:** White
- **Border:** `heritage-light/30`
- **Link Hover:** `heritage-primary`
- **Icon Hover:** `heritage-primary` with `heritage-light/20` background

### Forms
- **Input Border:** `heritage-light` with 40% opacity
- **Input Focus:** `heritage-primary` border, ring
- **Label:** `heritage-dark` with medium weight
- **Error:** Red (#DC2626)
- **Success:** Green (#059669)

### Badges & Tags
- **Primary Badge:** `heritage-primary` background, `heritage-dark` text
- **Secondary Badge:** `heritage-secondary` background, white text
- **Info Badge:** `heritage-accent` background, white text
- **Neutral Badge:** `heritage-light` background, `heritage-dark` text

---

## ♿ Accessibility

### Color Contrast
- All text must meet WCAG AA standards (4.5:1 for normal text, 3:1 for large text)
- `heritage-dark` (#3E2723) on white: **12.5:1** ✅
- `heritage-primary` (#FEC683) on `heritage-dark`: **5.2:1** ✅
- White on `heritage-secondary` (#8B4513): **6.2:1** ✅

### Interactive Elements
- Minimum tap target: **44px × 44px**
- Focus indicators: 2px ring with `heritage-primary`
- Keyboard navigation support required
- Screen reader friendly labels

---

## 📱 Responsive Design

### Breakpoints
```typescript
sm:  640px  → Tablet portrait
md:  768px  → Tablet landscape
lg:  1024px → Desktop
xl:  1280px → Large desktop
```

### Mobile-First Approach
Always design for mobile first, then enhance for larger screens.

```tsx
// Mobile-first example
<div className="text-base md:text-lg lg:text-xl">
  Responsive Text
</div>
```

---

## 🌈 Gradient Usage (Sparingly)

Use gradients subtly for backgrounds, not primary UI elements.

```css
/* Subtle background gradient */
bg-gradient-to-br from-white via-heritage-light/30 to-heritage-light/50
```

---

## ✨ Animation & Transitions

### Transition Durations
```css
Fast:   100-150ms → Micro-interactions
Normal: 200-300ms → Standard transitions
Slow:   400-500ms → Page transitions
```

### Common Transitions
```css
transition-colors duration-200   → Color changes
transition-all duration-200      → Multiple properties
transition-shadow duration-200   → Shadow changes
transition-transform duration-200 → Scale, translate
```

### Hover Effects
- **Buttons:** Shadow increase, slight color shift
- **Cards:** Shadow elevation
- **Links:** Color change to `heritage-primary`
- **Icons:** Scale slightly, color shift

---

## 📋 Component Checklist Reference

See `UI_COMPONENTS_CHECKLIST.md` for the complete list of components to build.

### Priority Order
1. ✅ Foundation (buttons, inputs, badges)
2. 🚧 Cards & Content (site cards, stat cards)
3. ⏳ Forms & Filters
4. ⏳ Navigation & Layout
5. ⏳ Feedback & Overlays
6. ⏳ Advanced Components

---

## 🎯 Usage Examples

### Page Header
```tsx
<header className="pt-24 md:pt-32 pb-12 md:pb-16 px-4 md:px-6 bg-white">
  <div className="max-w-4xl mx-auto">
    <h1 className="font-serif text-5xl md:text-6xl font-bold text-heritage-dark tracking-tight mb-6">
      Page Title
    </h1>
    <p className="font-sans text-lg md:text-xl text-heritage-dark/70 leading-relaxed">
      Page description goes here
    </p>
  </div>
</header>
```

### Section
```tsx
<section className="py-16 md:py-24 px-4 md:px-6 bg-heritage-light/30">
  <div className="max-w-6xl mx-auto">
    <h2 className="font-serif text-4xl md:text-5xl font-bold text-heritage-dark mb-8">
      Section Title
    </h2>
    {/* Section content */}
  </div>
</section>
```

### Card Grid
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {items.map(item => (
    <div key={item.id} className="bg-white rounded-xl shadow-sm p-6 
                                  hover:shadow-md transition-shadow 
                                  border border-heritage-light/20">
      {/* Card content */}
    </div>
  ))}
</div>
```

---

## 🔄 Version History

- **v1.1** (Nov 13, 2025) - Updated primary color for better contrast
  - Updated primary: #FEC683 (Lighter Warm Golden Yellow)
  - Improved WCAG contrast ratio to 5.2:1
- **v1.0** (Nov 13, 2025) - Initial design system with new color palette
  - Updated primary: #FEC683 (Warm Golden Yellow)
  - Updated secondary: #8B4513 (Saddle Brown)
  - Updated accent: #96ADC8 (Soft Blue-Gray)
  - Updated light: #DAE0F2 (Light Blue-Gray)
  - Refined typography weights and usage
  - Established minimalist, heritage-inspired principles

---

## 📚 Resources

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Playfair Display Font](https://fonts.google.com/specimen/Playfair+Display)
- [Inter Font](https://fonts.google.com/specimen/Inter)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Color Contrast Checker](https://webaim.org/resources/contrastchecker/)

---

**Maintained by:** Prapti-XR Team  
**Questions?** Refer to this document or consult the team lead.
