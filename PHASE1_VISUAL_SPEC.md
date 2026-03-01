# Phase 1 Visual Specification

## Window Appearance

### Position
- **Location**: Top-center of primary monitor
- **Top margin**: 16px from screen edge
- **Horizontal**: Perfectly centered
- **Size**: 420px × 60px

### Background
- **Color**: `#1a1d24` (solid dark gray-blue)
- **Border radius**: 10px
- **Shadow**: Layered shadow for depth
  - Primary: `0 8px 32px rgba(0, 0, 0, 0.4)`
  - Secondary: `0 2px 8px rgba(0, 0, 0, 0.2)`

### Layout
```
┌─────────────────────────────────────────────────────────┐
│  [Extract Text]  [Capture Screen]  [Open Hub]          │
└─────────────────────────────────────────────────────────┘
```

## Button Specifications

### Common Properties
- **Height**: Auto (8px vertical padding)
- **Horizontal padding**: 16px
- **Border radius**: 6px
- **Font size**: 13px
- **Font weight**: 500 (medium)
- **Text color**: White (#ffffff)
- **Letter spacing**: 0.01em
- **Gap between buttons**: 8px

### Button Colors

#### Extract Text (Blue)
- **Base**: `linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)`
- **Hover**: `linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)`

#### Capture Screen (Purple)
- **Base**: `linear-gradient(135deg, #a855f7 0%, #9333ea 100%)`
- **Hover**: `linear-gradient(135deg, #9333ea 0%, #7e22ce 100%)`

#### Open Hub (Green)
- **Base**: `linear-gradient(135deg, #22c55e 0%, #16a34a 100%)`
- **Hover**: `linear-gradient(135deg, #16a34a 0%, #15803d 100%)`

### Button Interactions

#### Hover State
- **Transform**: `translateY(-1px)` (subtle lift)
- **Shadow**: `0 2px 6px rgba(0, 0, 0, 0.3)`
- **Transition**: 0.15s ease

#### Active State (Click)
- **Transform**: `translateY(0)` (returns to base)
- **Shadow**: `0 1px 2px rgba(0, 0, 0, 0.2)`

## Behavior

### Show/Hide
- **Show trigger**: Alt+Space (when hidden)
- **Hide triggers**:
  - Alt+Space (when visible)
  - Click outside window (blur/focus loss)
- **Animation**: Instant (no fade)

### Focus
- **On show**: Window receives focus automatically
- **On blur**: Window hides immediately

### Positioning
- **On launch**: Positioned at top-center
- **On show**: Maintains top-center position
- **Draggable**: No (decorations disabled)

## Design Inspiration

The design draws from:
- **macOS Spotlight**: Clean, minimal, top-center positioning
- **Raycast**: Modern button styling, subtle shadows
- **Modern UI principles**: Solid backgrounds, subtle gradients, good contrast

## Accessibility

- **Color contrast**: All buttons meet WCAG AA standards
- **Keyboard navigation**: Alt+Space global shortcut
- **Focus management**: Automatic focus on show
- **Visual feedback**: Clear hover and active states

## Technical Notes

- No transparency effects (solid background)
- No glassmorphism or backdrop blur
- Hardware-accelerated CSS transforms
- Minimal DOM structure for performance
- Always-on-top z-index handling via Tauri
