# RWA DEX Design System

## Core Principles

- Minimal, clean design
- No AI-generated look
- Reference: Uniswap, Hiro.so style

---

## Color Palette

### Base Colors

| Name | Hex | Usage |
|------|-----|-------|
| Background | `#000000` | Page background |
| Foreground | `#f5f5f5` | Primary text, buttons |
| Card | `#111111` | Card backgrounds |
| Secondary | `#191919` | Input backgrounds, hover states |
| Border | `#222222` | Borders, dividers |
| Muted | `#8b8b8b` | Secondary text, labels |

### Usage Rules

- **Primary buttons**: `bg-foreground text-background`
- **Secondary buttons**: `bg-secondary` or `variant="outline"`
- **Text**: `text-foreground` (primary), `text-muted-foreground` (secondary)
- **Error states only**: `bg-red-500` (e.g., "Wrong network")

### Prohibited

- No gradients (`gradient-*` classes)
- No colored accents (`green-500`, `yellow-500`, `blue-500`)
- No colored badges or status indicators

---

## Typography

### Font Family

- **SUIT** (Korean/English)
- Fallback: system fonts

### Font Sizes

| Element | Class | Size |
|---------|-------|------|
| Page title | `text-xl font-semibold` | 20px |
| Section title | `text-lg font-medium` | 18px |
| Body | `text-sm` | 14px |
| Label | `text-xs` | 12px |
| Small | `text-[10px]` | 10px |

---

## Spacing

### Standard Gaps

- `gap-1` (4px): Tight grouping
- `gap-2` (8px): Related elements
- `gap-3` (12px): Button groups
- `gap-4` (16px): Section spacing
- `gap-6` (24px): Major sections

### Padding

- Cards: `p-4`
- Inputs: `p-4`
- Buttons: `px-4 py-2` or `h-8 px-4`

---

## Components

### Buttons

```tsx
// Primary
<Button className="bg-foreground text-background hover:bg-foreground/90">
  Action
</Button>

// Secondary
<Button variant="outline">
  Cancel
</Button>

// Small
<Button size="sm" className="bg-foreground text-background hover:bg-foreground/90">
  Trade
</Button>
```

### Cards

```tsx
<Card className="bg-card border-border/50">
  <CardContent className="p-4">
    ...
  </CardContent>
</Card>

// Glass effect
<div className="glass-card rounded-xl p-4">
  ...
</div>
```

### Inputs

```tsx
<Input
  className="bg-secondary border-0 rounded-xl"
  placeholder="0"
/>
```

### Progress Bars

```tsx
<div className="h-1.5 bg-secondary rounded-full overflow-hidden">
  <div
    className="h-full bg-foreground/80 rounded-full"
    style={{ width: '75%' }}
  />
</div>
```

### Status Indicators

```tsx
// Connection status (simple dot)
<div className="h-1.5 w-1.5 rounded-full bg-foreground" />

// Text-based status (no colored badges)
<span className="text-xs text-muted-foreground">Pending</span>
```

---

## Border Radius

| Element | Class |
|---------|-------|
| Cards | `rounded-xl` or `rounded-2xl` |
| Buttons | `rounded-lg` or `rounded-xl` |
| Inputs | `rounded-xl` |
| Small elements | `rounded-md` |
| Pills/Tags | `rounded-full` |

---

## Charts (Recharts)

### Colors

- Line/Bar fill: `#f5f5f5`
- Reference lines: `#333333`
- Axis text: `#8b8b8b`

### Custom Tooltip

```tsx
function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#191919] border border-[#222222] rounded-lg px-3 py-2 text-xs">
        <div className="text-muted-foreground mb-1">{label}</div>
        <div className="text-foreground font-medium">{payload[0].value}</div>
      </div>
    );
  }
  return null;
}
```

### Pie/Donut Charts

- Always set `label={false}` and `labelLine={false}`
- Use custom tooltip for hover info

---

## Layout

### Header

- Height: `h-14`
- Position: `fixed top-0`
- Background: `bg-background/60 backdrop-blur-md`

### Page Container

```tsx
<main className="pt-20 pb-12 px-4">
  <div className="max-w-5xl mx-auto">
    ...
  </div>
</main>
```

### Swap Card

- Max width: `max-w-[420px]`
- Centered: `mx-auto`

---

## Animations

### Allowed

- `transition-colors`: Button hovers
- `animate-spin`: Loading spinners

### Prohibited

- Complex animations
- Gradient animations
- Bounce/pulse effects

---

## Do's and Don'ts

### Do

- Use monochrome color scheme
- Keep spacing consistent
- Use subtle borders (`border-border/50`)
- Prefer text over badges for status

### Don't

- Use colored badges (yellow, green, blue)
- Use gradients anywhere
- Use emojis
- Over-decorate with shadows or effects
- Add unnecessary visual complexity
