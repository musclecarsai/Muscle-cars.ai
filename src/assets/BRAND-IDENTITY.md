# MuscleCars.ai — Brand Identity System

## Brand Essence
**High-performance. Mechanical authority. Collector-grade prestige.**
MuscleCars.ai is the definitive digital marketplace for serious muscle car enthusiasts. Our visual language reflects raw power, precision engineering, and investment-grade quality.

---

## Color Palette

### Primary Colors
| Color | Hex | Usage |
|-------|-----|-------|
| **Charcoal Black** | `#1A1A1A` | Main backgrounds, primary surfaces |
| **Dark Steel** | `#2D2D2D` | Card backgrounds, secondary surfaces |
| **Racing Red** | `#D42020` | Primary accent, CTAs, pricing highlights |
| **Gold** | `#C9A84C` | Premium tier badges, pro features, micro-transactions |

### Secondary Colors
| Color | Hex | Usage |
|-------|-----|-------|
| **Titanium Silver** | `#B0B0B0` | Secondary text, icons |
| **Carbon Fiber** | `#222222` | Dark cards, hover states |
| **Amber Glow** | `#FF8C00` | Warning/inspection badges, boost indicators |
| **Emerald Green** | `#1B8A4B` | Verification badges, sold indicators |
| **Deep Blue** | `#1A3A6B` | VIN/history report accents |

### Text Colors
- **Primary Text**: `#FFFFFF` (on dark) / `#1A1A1A` (on light)
- **Secondary Text**: `#9CA3AF` (on dark) / `#6B7280` (on light)
- **Muted Text**: `#6B7280` (on dark) / `#9CA3AF` (on light)

---

## Typography

### Headings
- **Font**: "Oswald" or "Bebas Neue" (bold, condensed, aggressive)
- **Weight**: 600-700
- **Letter Spacing**: 0.5-1px (tight for headings)
- **Case**: UPPERCASE for section titles, title-case for article headings

### Body Text
- **Font**: "Inter" or "Roboto" (clean, readable sans-serif)
- **Weight**: 400 (regular), 500 (medium), 600 (semi-bold)
- **Line Height**: 1.5-1.75

### Accent / Labels
- **Font**: "JetBrains Mono" or "Fira Code" (monospace for technical data)
- **Usage**: Price tags, VIN numbers, mileage, technical specs

---

## Logo Usage
- **Full Logo**: Horizontal lockup with car silhouette mark + "MUSCLECARS.AI" in bold condensed type
- **Icon Mark**: Simplified muscle car profile (side view) — use standalone for favicon, app icon
- **Color Variations**: White-on-dark (primary), Black-on-light (secondary), Gold (premium variant)

---

## Visual Language

### Imagery Style
- **Photography**: Dark, moody, dramatic studio lighting. Rim lighting on vehicles. High contrast.
- **Backgrounds**: Gradients from charcoal to near-black, subtle carbon fiber or metal brush textures
- **Effects**: Glassmorphism for locked/pro overlays, subtle noise/grain textures on dark surfaces

### Icons
- **Style**: Solid, bold, filled icons with rounded corners (not line icons)
- **Size**: 24px (inline), 48px (cards), 64px (feature badges)
- **Color**: Single color on backgrounds — use Titanium Silver or Racing Red

### Motion / Animation
- **Hover**: Subtle lift (2px translateY + box shadow increase)
- **Loading**: Pulsing amber glow or tire-tread progress bars
- **Transitions**: 300ms ease-out curves
- **CTA Buttons**: Slight scale on hover (1.02), micro-shimmer effect on premium CTAs

---

## Component Design Guidelines

### Cards (Car Listings)
- Dark Steel (`#2D2D2D`) background
- 1px top border in Racing Red
- 12px border radius
- Image spans full top with 12/12/0/0 radius
- Status badge top-left corner (Available = Green, Sold = Red gradient)
- Price bottom-right in Gold

### Buttons
| Variant | Style |
|---------|-------|
| **Primary CTA** | Racing Red fill, white text, 8px radius, 14px/48px height |
| **Premium/Pro** | Gold fill, charcoal text, 8px radius, subtle shimmer |
| **Secondary** | Dark Steel fill, 1px Titanium Silver border, silver text |
| **Micro-transaction** | Gold border, transparent fill, gold text, pill-shaped |

### Locked/Pro Overlay
- Frosted glass backdrop (backdrop-filter: blur(8px))
- Dark overlay at 60% opacity
- Gold lock icon centered
- "PRO" badge pill in Gold
- Upgrade CTA button below
- Blurred preview of content behind overlay (blur: 4px on parent)

### Navigation
- Fixed top bar, Charcoal background
- Logo left, nav links center, user menu right
- Active link: Racing Red underline (2px)
- Premium tier users get a Gold border indicator on avatar

---

## eBook Design (Muscle Car Guides)
- **Cover**: Full-bleed image, overlay gradient from bottom (black 60% to transparent)
- **Title**: White, Oswald Bold, letter-spaced, bottom-third placement
- **Subtitle**: Titanium Silver, Inter Light, below title
- **Series Badge**: Top-right corner, Gold pill with "GUIDE #1" numbering
- **Spine**: Charcoal with vertical Gold text (for print)

### Three Titles
1. **American Icons** — Red/Black theme, car silhouette, "The Complete Collector's Handbook"
2. **Engine Mastery** — Orange/Black theme, V8 engine detail, "Build, Tune, Dominate"
3. **Investment Grade** — Emerald/Charcoal theme, showroom setting, "Valuation, Authentication, Portfolio Growth"

---

## Micro-transaction Badge System (Garage Shop)
Each micro-transaction has a consistent card design:
- Square card (1:1 aspect ratio)
- Dark Steel background
- Colored accent border top (2px, color varies by category)
- Icon centered top half
- Title below icon in bold condensed
- Price in Gold at bottom
- "BUY NOW" pill button below

### Category Accent Colors
| Feature | Accent Color |
|---------|-------------|
| Listing Boost | Racing Red |
| VIN Report | Deep Blue |
| AI Photo Suite | Amber Glow |
| Verified Inspection | Gold |
| Single Valuation | Emerald Green |
| Portfolio Export | Emerald Green |
| Premium eBooks | Gold |

---

## File Inventory

### eBook Covers
| File | Title | Theme |
|------|-------|-------|
| `assets/ebook-covers/guide-american-icons.png` | American Icons | Red/Black |
| `assets/ebook-covers/guide-engine-mastery.png` | Engine Mastery | Orange/Black |
| `assets/ebook-covers/guide-investment-grade.png` | Investment Grade | Emerald/Charcoal |

### Car Placeholder Images
| File | Vehicle | Color |
|------|---------|-------|
| `assets/car-placeholders/camaro-zl1.png` | 2023 Camaro ZL1 | Metallic Blue |
| `assets/car-placeholders/challenger-hellcat.png` | 2023 Challenger SRT Hellcat | Black/Red Stripes |
| `assets/car-placeholders/mustang-dark-horse.png` | 2024 Mustang Dark Horse | Carbonized Gray |

### Garage Shop Banners
| File | Feature | Category |
|------|---------|----------|
| `assets/garage-shop/listing-boost-banner.png` | Listing Boost ($7.99) | Promotion |
| `assets/garage-shop/vin-report-banner.png` | VIN History Report ($24.99) | Research |
| `assets/garage-shop/ai-photo-suite-banner.png` | AI Photo Suite ($19.99) | Enhancement |
| `assets/garage-shop/verified-inspection-banner.png` | Verified Inspection ($199.00) | Trust |
| `assets/garage-shop/valuation-banner.png` | Single Valuation ($9.99) | Financial |
| `assets/garage-shop/portfolio-export-banner.png` | Portfolio Export ($12.99) | Financial |

### Portfolio Mockup
| File | Description |
|------|-------------|
| `assets/portfolio-mockup/locked-pro-state.png` | Locked/Pro upgrade screen with glassmorphism overlay |

---

*This brand system should be implemented in the site's Tailwind config as custom theme extensions (@theme in app.css or tailwind.config).*