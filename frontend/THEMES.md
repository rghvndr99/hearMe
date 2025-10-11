# HearMe Theme System

## Overview
HearMe features a comprehensive theme system with 5 beautiful color schemes designed to support different moods and preferences for mental health and wellness.

## Available Themes

### 1. **Dark Mode** (Default)
**Theme ID:** `dark`  
**Style:** Neo Expressionist  
**Best For:** Evening use, reduced eye strain, modern aesthetic

**Colors:**
- Brand: `#F76B1C` (Vibrant Orange)
- Background: `#0A0A0F` (Deep Dark)
- Primary Text: `#FFF8E7` (Warm White)
- Accent Gradients: Purple to Orange

**Mood:** Bold, creative, expressive

---

### 2. **Light Mode**
**Theme ID:** `light`  
**Style:** Soft & Warm  
**Best For:** Daytime use, bright environments, accessibility

**Colors:**
- Brand: `#F76B1C` (Vibrant Orange)
- Background: `#FDFBF7` (Soft Cream)
- Primary Text: `#1A1A1A` (Dark Gray)
- Accent Gradients: Purple to Orange

**Mood:** Calm, welcoming, approachable

---

### 3. **Ocean**
**Theme ID:** `ocean`  
**Style:** Cool & Calming  
**Best For:** Stress relief, meditation, relaxation

**Colors:**
- Brand: `#00D4FF` (Bright Cyan)
- Background: `#0A1628` (Deep Ocean Blue)
- Primary Text: `#E0F7FF` (Light Cyan)
- Accent Gradients: Deep Blue to Cyan

**Mood:** Peaceful, serene, flowing

---

### 4. **Forest**
**Theme ID:** `forest`  
**Style:** Natural & Grounding  
**Best For:** Focus, grounding exercises, nature connection

**Colors:**
- Brand: `#7CB342` (Fresh Green)
- Background: `#0F1A0F` (Deep Forest)
- Primary Text: `#E8F5E9` (Light Mint)
- Accent Gradients: Dark Green to Lime

**Mood:** Grounded, natural, balanced

---

### 5. **Sunset**
**Theme ID:** `sunset`  
**Style:** Warm & Energetic  
**Best For:** Motivation, creativity, positive energy

**Colors:**
- Brand: `#FF6B35` (Warm Orange)
- Background: `#1A0F0A` (Deep Warm Brown)
- Primary Text: `#FFF4E6` (Warm Cream)
- Accent Gradients: Deep Orange to Bright Orange

**Mood:** Energetic, warm, inspiring

---

## How to Use

### User Interface
Users can switch themes using the **Theme Toggle** button in the header navigation:
1. Click the theme icon/button in the header
2. Select from the dropdown menu
3. Theme preference is saved automatically in localStorage

### Programmatic Usage

#### Set Theme via JavaScript
```javascript
// Set theme
document.documentElement.setAttribute('data-theme', 'ocean');
localStorage.setItem('hm-theme', 'ocean');
```

#### Get Current Theme
```javascript
const currentTheme = localStorage.getItem('hm-theme') || 'dark';
```

#### Available Theme IDs
- `dark` - Default Dark Mode
- `light` - Light Mode
- `ocean` - Ocean Theme
- `forest` - Forest Theme
- `sunset` - Sunset Theme

---

## CSS Variables

All themes use the same CSS variable names, making it easy to maintain consistency:

### Color Variables
```css
--hm-color-brand          /* Primary brand color */
--hm-color-bg             /* Main background */
--hm-color-text-primary   /* Primary text color */
--hm-color-text-muted     /* Muted text */
--hm-color-text-secondary /* Secondary text */
--hm-color-text-tertiary  /* Tertiary text */
--hm-color-placeholder    /* Placeholder text */
```

### Gradient Variables
```css
--hm-gradient-cta         /* CTA button gradient */
--hm-gradient-cta-hover   /* CTA hover gradient */
--hm-gradient-bg-pink     /* Background gradient (pink/brand) */
--hm-gradient-bg-blue     /* Background gradient (blue) */
--hm-gradient-bg-orange   /* Background gradient (orange/accent) */
```

### Glass Morphism Variables
```css
--hm-border-glass         /* Glass border color */
--hm-border-glass-soft    /* Softer glass border */
--hm-bg-glass             /* Glass background */
--hm-bg-glass-light       /* Lighter glass background */
--hm-bg-glass-strong      /* Stronger glass background */
```

### Other Variables
```css
--hm-header-bg            /* Header background */
--hm-border-outline       /* Outline border color */
--hm-hover-bg             /* Hover background */
```

---

## Utility Classes

### Glass Cards
```css
.hm-glass-card        /* Standard glass card with hover */
.hm-glass-card-light  /* Lighter glass card */
.hm-glass-card-soft   /* Softer borders, less blur */
```

### Form Inputs
```css
.hm-input             /* Form input with focus states */
```

### Background Gradients
```css
.hm-bg-gradient-pink    /* Pink/brand gradient background */
.hm-bg-gradient-blue    /* Blue gradient background */
.hm-bg-gradient-orange  /* Orange/accent gradient background */
```

### Borders & Hover
```css
.hm-border-top        /* Top border with glass effect */
.hm-border-outline    /* Outline border */
.hm-hover-bg          /* Hover background effect */
```

### Brand Color
```css
.hm-brand             /* Brand color text */
```

---

## Creating Custom Themes

To add a new theme, add a new `[data-theme="your-theme"]` block in `frontend/src/styles.css`:

```css
[data-theme="your-theme"]{
  /* Brand Colors */
  --hm-color-brand: #YOUR_COLOR;
  --hm-color-bg: #YOUR_BG;
  --hm-color-text-primary: #YOUR_TEXT;
  /* ... add all other variables */
}
```

Then add the theme to the `themes` array in `frontend/src/components/ThemeToggle.jsx`:

```javascript
{
  id: 'your-theme',
  name: 'Your Theme Name',
  icon: YourIcon,
  description: 'Your Description',
}
```

---

## Accessibility

All themes are designed with accessibility in mind:
- ✅ WCAG AA contrast ratios for text
- ✅ Clear focus states for keyboard navigation
- ✅ Consistent color semantics across themes
- ✅ Support for reduced motion preferences (via framer-motion)

---

## Browser Support

The theme system uses modern CSS features:
- CSS Custom Properties (CSS Variables)
- `data-*` attributes
- `backdrop-filter` (with `-webkit-` prefix for Safari)

**Supported Browsers:**
- Chrome/Edge 88+
- Firefox 85+
- Safari 14+
- Opera 74+

---

## Performance

- Themes switch instantly with no page reload
- CSS variables enable real-time theme updates
- Theme preference persists across sessions via localStorage
- No JavaScript required for theme rendering (only for switching)

---

## Future Enhancements

Potential additions:
- [ ] Auto theme based on time of day
- [ ] System preference detection (prefers-color-scheme)
- [ ] Custom theme builder
- [ ] Theme preview before applying
- [ ] Accessibility mode (high contrast)
- [ ] Reduced motion theme variant

---

## Support

For theme-related issues or suggestions, please open an issue on GitHub or contact the development team.

