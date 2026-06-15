---
name: Technical Intelligence Narrative
colors:
  surface: '#10131a'
  surface-dim: '#10131a'
  surface-bright: '#363941'
  surface-container-lowest: '#0b0e15'
  surface-container-low: '#191b23'
  surface-container: '#1d2027'
  surface-container-high: '#272a31'
  surface-container-highest: '#32353c'
  on-surface: '#e1e2ec'
  on-surface-variant: '#c2c6d6'
  inverse-surface: '#e1e2ec'
  inverse-on-surface: '#2e3038'
  outline: '#8c909f'
  outline-variant: '#424754'
  surface-tint: '#adc6ff'
  primary: '#adc6ff'
  on-primary: '#002e6a'
  primary-container: '#4d8eff'
  on-primary-container: '#00285d'
  inverse-primary: '#005ac2'
  secondary: '#4edea3'
  on-secondary: '#003824'
  secondary-container: '#00a572'
  on-secondary-container: '#00311f'
  tertiary: '#ffb786'
  on-tertiary: '#502400'
  tertiary-container: '#df7412'
  on-tertiary-container: '#461f00'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#d8e2ff'
  primary-fixed-dim: '#adc6ff'
  on-primary-fixed: '#001a42'
  on-primary-fixed-variant: '#004395'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#ffdcc6'
  tertiary-fixed-dim: '#ffb786'
  on-tertiary-fixed: '#311400'
  on-tertiary-fixed-variant: '#723600'
  background: '#10131a'
  on-background: '#e1e2ec'
  surface-variant: '#32353c'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-md:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  mono-data:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  container-padding: 24px
  gutter: 16px
  component-gap: 12px
  margin-page: 32px
---

## Brand & Style
The design system is engineered for high-performance technical environments where data density must coexist with immediate legibility. The brand personality is authoritative, precise, and sophisticated—evoking a sense of "mission control" for technical support operations.

The visual style employs a **Modern Corporate** foundation enhanced by **Subtle Glassmorphism**. By using translucent layers and refined backdrop blurs, the interface creates a clear sense of depth without distracting the user from critical KPIs. The aesthetic relies on high-contrast accents against a deep, monochromatic base to direct attention toward system health and urgent action items.

## Colors
This design system utilizes a "Deep Navy" palette to minimize eye strain during extended monitoring sessions. The background is a solid dark slate, while UI containers use a slightly lighter, translucent variant to create layering.

- **Primary:** A vibrant electric blue used for primary actions and data highlights.
- **Semantic Accents:** Status colors are high-chroma to ensure they "pop" against the dark background. Success green, warning amber, and critical red are reserved for state-driven indicators and alerts.
- **Data Viz Palette:** A curated secondary spectrum (Teal, Indigo, Violet) provides clear differentiation in complex charts while maintaining a professional harmony.
- **Neutral:** A range of grays with slight blue undertones (Cool Grays) used for text hierarchies and borders.

## Typography
The typography system prioritizes clarity and information hierarchy. **Inter** is the primary typeface, chosen for its exceptional legibility on digital screens.

- **Display Levels:** Used for massive KPI numbers. These use bold weights and tighter letter spacing to command immediate attention.
- **Labels:** Secondary metadata and category headers utilize uppercase styling with increased tracking to differentiate them from actionable data.
- **Monospaced Data:** For technical values, timestamps, and ticket IDs, a monospaced font (JetBrains Mono) is used to ensure character alignment and a "technical" feel.
- **Mobile Scaling:** Headlines scale down by approximately 20% on mobile devices to preserve screen real estate while maintaining the bold, data-first hierarchy.

## Layout & Spacing
The layout follows a **Fluid Grid** model with a standard 12-column structure for desktop. To maintain high information density without clutter, the system uses a strict 8px spacing rhythm.

- **Dashboard Layout:** Components are housed in "Tiles" that span varying column widths (e.g., 3-cols for small KPIs, 6-cols for charts, 12-cols for tables).
- **Safe Margins:** A 32px page margin provides "breathing room" around the edges of the screen, focusing the eye on the central dashboard.
- **Responsive Behavior:** 
  - **Desktop:** 12 columns, 24px gutters.
  - **Tablet:** 8 columns, 16px gutters.
  - **Mobile:** 4 columns, 12px gutters. Elements stack vertically, and display-tier typography scales down.

## Elevation & Depth
Depth is created through **Tonal Layering** and **Glassmorphism** rather than traditional heavy shadows.

- **Layer 0 (Base):** Deep Slate/Navy background (#0F172A).
- **Layer 1 (Cards):** Surface color with 80% opacity and a 16px backdrop blur. A subtle 1px border (10% white) defines the perimeter.
- **Layer 2 (Modals/Popovers):** Higher opacity, increased backdrop blur (32px), and a soft, wide ambient shadow (0px 20px 40px rgba(0,0,0,0.4)) to lift the element above the dashboard.
- **Interaction:** Hovering over a card increases the border brightness and slightly lifts the element using a subtle translation (-2px Y-axis).

## Shapes
The shape language is modern and approachable, utilizing a **Rounded** (0.5rem) base.

- **Small Components (Buttons, Inputs):** 8px (0.5rem) corner radius.
- **Large Containers (Cards, Tiles):** 16px (1rem) corner radius for a softer, premium technical aesthetic.
- **Status Indicators:** Small dots or "pills" use full rounding (999px) to contrast against the structured grid of the tiles.

## Components
Consistent component styling ensures the dashboard remains intuitive despite its complexity.

- **Cards/Tiles:** The core layout unit. Features a semi-transparent background, 1px subtle border, and internal padding of 24px.
- **Buttons:** 
  - *Primary:* Solid blue background with white text.
  - *Ghost:* Transparent background with a 1px border; used for secondary actions.
- **Data Visualizations:** Charts use "Glow" effects on lines and bars. Grid lines are kept at very low contrast (5% white) to avoid visual noise.
- **KPI Metrics:** Combine a `label-caps` top-aligned text with a `display-md` value and a colored "trend" arrow (green/red) for quick status checks.
- **Input Fields:** Darker than the surface color, with 1px borders that glow primary blue when focused.
- **Status Badges:** Small, pill-shaped chips with low-opacity background fills of the status color and high-opacity text (e.g., Critical = Red fill at 15%, Red text at 100%).