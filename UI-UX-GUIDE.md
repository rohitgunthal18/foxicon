# Complete Guide: Using UI UX Pro Max + Framer Motion in Claude Code

## 🎯 Overview

This guide shows you how to combine **UI UX Pro Max** (design intelligence) with **Framer Motion** (animations) to build professional, animated web designs using Claude Code.

---

## 📦 What's Installed

### UI UX Pro Max Skills (Global)
Located at: `C:\Users\rohit\.claude\skills\`

Available skills:
- **ui-ux-pro-max** - Main design intelligence (67 UI styles, 161 industry rules)
- **design-system** - Generate complete design systems
- **ui-styling** - UI styling guidance
- **brand** - Brand identity design
- **banner-design** - Banner creation
- **design** - General design assistance
- **slides** - Presentation design

### Framer Motion
A React animation library you'll install via npm for animations.

---

## 🚀 Step-by-Step Usage Guide

### Step 1: Understanding Auto-Activation

**Claude Code automatically activates UI UX Pro Max** when you request UI/UX work. You don't need slash commands - just chat naturally!

#### Examples:
```
✅ Build a landing page for my SaaS product
✅ Create a dashboard for healthcare analytics
✅ Design a portfolio website with animations
✅ Make a mobile app UI for e-commerce
```

The skill will automatically:
1. Generate a complete design system
2. Recommend colors, typography, and styles
3. Provide stack-specific code
4. Include best practices and accessibility

---

### Step 2: Basic Web Design Workflow

#### Example 1: Simple Landing Page

**Prompt:**
```
Build a modern landing page for a wellness spa using Next.js and Tailwind CSS
```

**What Happens:**
1. UI UX Pro Max analyzes "wellness spa"
2. Generates design system with:
   - Soft UI style
   - Calming color palette (soft pinks, sage green)
   - Elegant typography (Cormorant Garamond)
   - Hero-centric layout pattern
3. Claude generates complete code with proper colors and spacing

---

### Step 3: Adding Framer Motion Animations

#### Example 2: Landing Page with Animations

**Prompt:**
```
Build a modern landing page for a SaaS product using Next.js, Tailwind CSS, and Framer Motion.
Add smooth scroll animations and interactive hover effects.
```

**What Happens:**
1. UI UX Pro Max provides design system
2. Claude installs Framer Motion: `npm install framer-motion`
3. Code includes animated components:
   - Fade-in on scroll
   - Smooth page transitions
   - Interactive buttons
   - Parallax effects

---

### Step 4: Advanced Combined Workflow

#### Example 3: Full Dashboard with Animations

**Complete Prompt:**
```
Build a healthcare analytics dashboard using:
- Next.js 14 with App Router
- Tailwind CSS
- Framer Motion for animations
- shadcn/ui components

Requirements:
- Clean, professional design
- Animated chart transitions
- Smooth page navigation
- Accessible and responsive
- Dark mode support
```

**What UI UX Pro Max Provides:**
- Healthcare-appropriate design system
- Professional color palette
- Data visualization guidelines
- Accessibility standards
- Component structure

**What Framer Motion Adds:**
- Chart entry animations
- Page transitions
- Micro-interactions
- Loading states
- Gesture-based interactions

---

## 🎨 Design System Generation

### Generate Custom Design System

**Option 1: Automatic (Recommended)**
Just describe your project and Claude will auto-generate:

```
I'm building a fintech banking app. Generate a complete design system.
```

**Option 2: Manual Command**
Use Python script directly:

```bash
python3 C:\Users\rohit\.claude\skills\ui-ux-pro-max\scripts\search.py "fintech banking" --design-system -p "MyBankApp"
```

**Option 3: Persist Design System**
Save for reuse across sessions:

```bash
python3 C:\Users\rohit\.claude\skills\ui-ux-pro-max\scripts\search.py "SaaS dashboard" --design-system --persist -p "MyApp"
```

This creates:
```
design-system/
├── MASTER.md           # Global design rules
└── pages/
    └── dashboard.md    # Page-specific overrides
```

---

## 💡 Practical Examples

### Example A: Animated Hero Section

**Prompt:**
```
Create a hero section for a tech startup with:
- Gradient background
- Animated text reveal
- Floating elements
- CTA button with hover effects
Use Next.js, Tailwind, and Framer Motion
```

**Result:**
- UI UX Pro Max: Modern gradient palette, typography, spacing
- Framer Motion: Text stagger animation, floating particles, button springs

---

### Example B: Interactive Pricing Cards

**Prompt:**
```
Design pricing cards for a SaaS product with:
- 3 tiers (Starter, Pro, Enterprise)
- Hover scale effects
- Animated feature lists
- Smooth transitions
```

**Result:**
- UI UX Pro Max: Card layout, pricing structure, color scheme
- Framer Motion: Scale on hover, staggered list animations

---

### Example C: Animated Dashboard

**Prompt:**
```
Build a data dashboard with:
- Animated charts (bar, line, pie)
- Sidebar navigation with transitions
- Card flip animations for stats
- Loading skeletons
```

**Result:**
- UI UX Pro Max: Chart types, data viz guidelines, dashboard layout
- Framer Motion: Chart entry animations, page transitions, skeleton loaders

---

## 🔧 Common Animation Patterns

### 1. Fade In on Scroll
```javascript
<motion.div
  initial={{ opacity: 0, y: 20 }}
  whileInView={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6 }}
>
  Content
</motion.div>
```

### 2. Stagger Children
```javascript
<motion.div
  variants={{
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }}
>
  {items.map(...)}
</motion.div>
```

### 3. Page Transitions
```javascript
<motion.div
  initial={{ opacity: 0, x: -20 }}
  animate={{ opacity: 1, x: 0 }}
  exit={{ opacity: 0, x: 20 }}
>
  Page content
</motion.div>
```

---

## 📋 Best Practices Checklist

### Design (UI UX Pro Max handles this)
- ✅ Proper color contrast (4.5:1 minimum)
- ✅ Responsive breakpoints (375px, 768px, 1024px, 1440px)
- ✅ Accessible focus states
- ✅ Consistent spacing and typography
- ✅ No emoji as icons (use SVG)

### Animations (Your responsibility with Framer Motion)
- ✅ Respect `prefers-reduced-motion`
- ✅ Keep animations under 300ms for UI feedback
- ✅ Use 600ms+ for storytelling animations
- ✅ Avoid animating expensive properties (use transform/opacity)
- ✅ Add loading states for async content

---

## 🎯 Quick Reference: Common Prompts

### Starting a New Project
```
Build a [product type] using Next.js, Tailwind CSS, and Framer Motion.
Make it modern, accessible, and animated.
```

### Adding Features
```
Add an animated [component name] to the [page name] with [specific requirements]
```

### Styling Adjustments
```
Update the color scheme to be more [adjective] and add smooth transitions
```

### Animation Requests
```
Add scroll-triggered animations to the [section name] with staggered children
```

---

## 🔄 Workflow Summary

1. **Describe your project** → UI UX Pro Max auto-activates
2. **Design system generated** → Colors, typography, layout
3. **Mention Framer Motion** → Animations included
4. **Review & iterate** → Ask for adjustments
5. **Build & deploy** → Professional animated website

---

## 🆘 Troubleshooting

### Skill Not Activating?
- Make sure you mention UI/UX keywords (build, design, create, landing page, dashboard)
- Try: "Use the ui-ux-pro-max skill to design..."

### Need Different Style?
```
Use [style name] style instead (e.g., "Use glassmorphism style instead")
```

### Want Specific Colors?
```
Use this color palette: Primary #HEX, Secondary #HEX...
```

### Animations Too Fast/Slow?
```
Make the animations slower/faster (adjust transition durations)
```

---

## 📚 Additional Resources

- **UI UX Pro Max Styles:** 67 styles including Glassmorphism, Neumorphism, Brutalism
- **Color Palettes:** 161 industry-specific palettes
- **Typography:** 57 curated font pairings with Google Fonts
- **Tech Stacks:** Support for React, Next.js, Vue, Svelte, React Native, Flutter, and more
- **Framer Motion Docs:** https://www.framer.com/motion/

---

## 🎓 Learning Path

### Beginner
1. Start with simple landing pages
2. Add basic fade-in animations
3. Experiment with different UI styles

### Intermediate
4. Build multi-page applications
5. Implement page transitions
6. Create reusable animated components

### Advanced
7. Build complex dashboards
8. Create custom animation variants
9. Optimize performance with layout animations

---

## ✨ Pro Tips

1. **Let the skill do the design work** - Focus your prompts on functionality and features
2. **Be specific about animations** - "Fade in on scroll" is better than "make it animated"
3. **Combine skills naturally** - Just mention both in one prompt
4. **Iterate quickly** - Ask for adjustments instead of rewriting from scratch
5. **Save design systems** - Use `--persist` flag for consistent multi-page projects

---

**Ready to build? Try this starter prompt:**

```
Build a modern SaaS landing page for [your product] using Next.js 14, 
Tailwind CSS, and Framer Motion. Include an animated hero section, 
feature cards with hover effects, pricing table, and testimonials. 
Make it professional, accessible, and mobile-responsive.
```

Happy designing! 🚀
