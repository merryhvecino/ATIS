# 🎨 Itinerary Details: Visual Guide

## Overview
This guide shows exactly what travelers see when they click "View Details" on any itinerary.

---

## 📱 Complete Journey View

```
╔═══════════════════════════════════════════════════════════════╗
║  1  ~22 min  • 0 transfers  [84% reliable]                   ║
║  🚶 Walk to stop → Bus NX1 → Walk                            ║
║  🚶 0.4 km walk  |  bus, walk                                ║
║                                                                ║
║  [📄 Export PDF]  [🔄 Suggest alternative]  [▼ Hide Details] ║
╠═══════════════════════════════════════════════════════════════╣
║                                                                ║
║  ┌──────────────────── JOURNEY SUMMARY ─────────────────────┐ ║
║  │                                                           │ ║
║  │  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌──────────┐│ ║
║  │  │💵 Fare    │ │🌱 CO₂     │ │⏱️ Depart  │ │👥 Crowd  ││ ║
║  │  │           │ │           │ │           │ │          ││ ║
║  │  │ $2.50 NZD │ │  1.1 kg   │ │ In 3 min  │ │ ●●○○ Low ││ ║
║  │  └───────────┘ └───────────┘ └───────────┘ └──────────┘│ ║
║  │                                                           │ ║
║  │  ┌───────────┐ ┌───────────┐                            │ ║
║  │  │♿ Access  │ │🔌 Charge  │                            │ ║
║  │  │           │ │           │                            │ ║
║  │  │  ✓ Yes    │ │ Available │                            │ ║
║  │  └───────────┘ └───────────┘                            │ ║
║  └───────────────────────────────────────────────────────────┘ ║
║                                                                ║
║  ┌──────────── 📍 STEP-BY-STEP JOURNEY ────────────┐        ║
║  │                                                   │        ║
║  │  ┌─────┐                                         │        ║
║  │  │ 🚶  │  Walk to stop                           │        ║
║  │  └─────┘  📏 Distance: 0.20 km                   │        ║
║  │     │     ⏱️ Duration: ~2 min                     │        ║
║  │     │     [🗺️ View Walking Route]                │        ║
║  │     │                                             │        ║
║  │  ┌─────┐                                         │        ║
║  │  │ 🚌  │  Bus NX1                                │        ║
║  │  └─────┘  ┌────────────────────────────────────┐│        ║
║  │     │     │  [NX1] Bus Route                   ││        ║
║  │     │     │  🚏 From: Stop #1000 - Start Point ││        ║
║  │     │     │  🎯 To: Stop #1050 - End Point     ││        ║
║  │     │     │  ⏱️ Next: 3, 8, 15 min             ││        ║
║  │     │     │  🪑 Platform/Bay: Bay 1            ││        ║
║  │     │     │  🎫 Zone: Zone 1                   ││        ║
║  │     │     │  👥 Load: Light                    ││        ║
║  │     │     │  ♿ Low-floor, wheelchair access   ││        ║
║  │     │     └────────────────────────────────────┘│        ║
║  │     │     [🚏 View Stop] [📍 Track] [🔔 Remind]│        ║
║  │     │                                             │        ║
║  │  ┌─────┐                                         │        ║
║  │  │ 🚶  │  Walk                                   │        ║
║  │  └─────┘  📏 Distance: 0.20 km                   │        ║
║  │           ⏱️ Duration: ~2 min                     │        ║
║  │           [🗺️ View Walking Route]                │        ║
║  └───────────────────────────────────────────────────┘        ║
║                                                                ║
║  ┌──────────── 💡 TRAVEL TIPS ───────────────┐               ║
║  │                                             │               ║
║  │  • Allow 5 extra minutes for delays        │               ║
║  │  • Have AT HOP card ready before boarding  │               ║
║  │  • Check real-time updates before leaving  │               ║
║  └─────────────────────────────────────────────┘               ║
╚═══════════════════════════════════════════════════════════════╝
```

---

## 🎨 Visual Elements Breakdown

### 1. Journey Summary Cards (Top Grid)

```
┌───────────────┐
│ 💵 Fare       │  ← Gray label text
│               │
│  $2.50 NZD    │  ← Large, bold value
└───────────────┘
   ↑
Frosted glass card
with subtle border
```

**Features:**
- 6 cards in responsive grid
- Frosted glass background
- Large, bold numbers
- Icon + label format
- Auto-collapses on mobile to 2 columns

---

### 2. Step Icons & Timeline

```
    ┌─────┐
    │ 🚶  │  ← Circular icon (green for walk)
    └─────┘
       │    ← Connecting line
       │
    ┌─────┐
    │ 🚌  │  ← Circular icon (blue for bus)
    └─────┘
       │
       │
    ┌─────┐
    │ 🚶  │  ← Circular icon (green for walk)
    └─────┘
```

**Color Scheme:**
- 🚶 **Walk:** Green gradient (#10b981 → #059669)
- 🚌 **Bus:** Blue gradient (#3b82f6 → #2563eb)
- 🚆 **Train:** Purple gradient (#8b5cf6 → #7c3aed)
- ⛴️ **Ferry:** Cyan gradient (#06b6d4 → #0891b2)
- 🚴 **Bike:** Orange gradient (#f59e0b → #d97706)

---

### 3. Route Number Badge

```
┌─────────────────────────────────┐
│  [NX1] Bus Route               │
│   ↑                             │
│   Blue badge with white text    │
└─────────────────────────────────┘
```

**Variations:**
- **Bus:** Blue background (#3b82f6)
- **Train:** Purple background (#8b5cf6)
- **Ferry:** Cyan background (#06b6d4)

---

### 4. Stop Information Panel

```
┌──────────────────────────────────────┐
│ 🚏 From: Stop #1000 - Start Point   │  ← Departure stop
│ 🎯 To: Stop #1050 - End Point       │  ← Arrival stop
│ ⏱️ Next: 3, 8, 15 min               │  ← Real-time departures
│ 🪑 Platform/Bay: Bay 1               │  ← Boarding location
│ 🎫 Zone: Zone 1                      │  ← Fare zone
│ 👥 Load: Light                       │  ← Current crowding
│ ♿ Low-floor, wheelchair accessible   │  ← Features
└──────────────────────────────────────┘
   ↑
Light background box with rounded corners
```

---

### 5. Interactive Buttons

```
┌──────────────┐ ┌─────────────┐ ┌──────────────┐
│🚏 View Stop  │ │📍 Track    │ │🔔 Set Remind │
└──────────────┘ └─────────────┘ └──────────────┘
      ↑               ↑                  ↑
   Standard       Standard          Standard
    button         button            button
```

**Hover States:**
- Slight background color change
- Cursor becomes pointer
- Subtle scale up (1.02x)

---

### 6. Walking Details

```
┌─────────────────────────────────┐
│ 📏 Distance: 0.20 km            │
│ ⏱️ Duration: ~2 min              │
│                                  │
│ ┌─────────────────────────────┐ │
│ │ 🗺️ View Walking Route      │ │  ← Green button
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

**Walking Route Button:**
- Green gradient background
- White text
- Map icon
- Opens interactive map view

---

### 7. Travel Tips Section

```
┌────────────────────────────────────────┐
│ 💡 Travel Tips                         │  ← Blue left border
├────────────────────────────────────────┤
│ • Allow 5 extra minutes for delays    │
│ • Have AT HOP card ready              │
│ • Transfers free within 30 minutes    │  ← Conditional
│ • Route includes stairs - consider... │  ← If stairs
│ • Check real-time updates             │
└────────────────────────────────────────┘
   ↑
Blue background tint with border accent
```

---

## 📊 Responsive Layouts

### Desktop (> 1024px)
```
┌─────┬─────┬─────┬─────┬─────┬─────┐
│Fare │ CO₂ │Dep. │Crowd│Acc. │Chrg.│  ← 6 columns
└─────┴─────┴─────┴─────┴─────┴─────┘

    Icon ─┐  ┌─ Details (side by side)
          │  │
       🚶 │  │ Walk to stop
          │  │ Distance, duration, button
          │  │
```

### Tablet (768px - 1024px)
```
┌─────┬─────┬─────┐
│Fare │ CO₂ │Dep. │  ← 3 columns
├─────┼─────┼─────┤
│Crowd│Acc. │Chrg.│
└─────┴─────┴─────┘

Same step layout as desktop
```

### Mobile (< 768px)
```
┌─────┬─────┐
│Fare │ CO₂ │  ← 2 columns
├─────┼─────┤
│Dep. │Crowd│
├─────┼─────┤
│Acc. │Chrg.│
└─────┴─────┘

   Icon
     ↓
  Details
 (stacked)
```

---

## 🎯 Real-World Examples

### Example 1: Simple Bus Journey

```
╔════════════════════════════════════════════════╗
║ 1  ~15 min  • 0 transfers  [90% reliable]    ║
║ 🚶 Walk → Bus 243 → Walk                     ║
╠════════════════════════════════════════════════╣
║ SUMMARY: $2.50 | 0.8kg CO₂ | In 5min | Light ║
║                                                ║
║ STEP 1: 🚶 Walk to stop                       ║
║   📏 0.15 km  ⏱️ 2 min  [🗺️ View Route]      ║
║                                                ║
║ STEP 2: 🚌 Bus 243                            ║
║   🚏 From: Stop #1234 - Queen St             ║
║   🎯 To: Stop #5678 - Ponsonby Rd            ║
║   ⏱️ Next: 5, 12, 19 min                     ║
║   🪑 Bay 3  🎫 Zone 1  👥 Light              ║
║   [View Stop] [Track] [Remind]               ║
║                                                ║
║ STEP 3: 🚶 Walk                               ║
║   📏 0.10 km  ⏱️ 1 min  [🗺️ View Route]      ║
╚════════════════════════════════════════════════╝
```

---

### Example 2: Multi-Modal Journey

```
╔════════════════════════════════════════════════╗
║ 2  ~35 min  • 1 transfer  [88% reliable]     ║
║ 🚶 Walk → Bus 82 → Train → Walk              ║
╠════════════════════════════════════════════════╣
║ SUMMARY: $3.00 | 1.8kg CO₂ | In 3min | Mod.  ║
║                                                ║
║ STEP 1: 🚶 Walk (2 min, 0.18 km)             ║
║                                                ║
║ STEP 2: 🚌 Bus 82                             ║
║   [82] Bus Route                              ║
║   🚏 From: Stop #2000  🎯 To: Stop #2050     ║
║   ⏱️ Next: 3, 9, 18 min                      ║
║   🪑 Bay 2  🎫 Zone 1  👥 Moderate           ║
║                                                ║
║ STEP 3: 🚆 Train Southern                     ║
║   [Southern] Train Line                       ║
║   🚏 From: Stop #3000  🎯 To: Stop #3050     ║
║   ⏱️ Next: 8, 18, 28 min                     ║
║   🪑 Platform 1  🎫 Zone 2  🚃 3-car         ║
║                                                ║
║ STEP 4: 🚶 Walk (3 min, 0.22 km)             ║
║                                                ║
║ 💡 Transfers free within 30 minutes          ║
╚════════════════════════════════════════════════╝
```

---

### Example 3: Accessible Journey (with Stairs Warning)

```
╔════════════════════════════════════════════════╗
║ 3  ~28 min  • 1 transfer  [85% reliable]     ║
║ 🚶 Walk → Train → Bus → Walk                 ║
╠════════════════════════════════════════════════╣
║ $3.00 | 1.4kg CO₂ | In 7min | ⚠️ Stairs      ║
║                                                ║
║ ... journey steps ...                         ║
║                                                ║
║ 💡 TRAVEL TIPS:                               ║
║ • Allow 5 extra minutes for delays           ║
║ • Have AT HOP card ready                     ║
║ • Transfers free within 30 minutes           ║
║ • ⚠️ Route includes stairs - consider        ║
║   accessibility needs. Use elevator at       ║
║   Britomart Station (Platform 2).            ║
╚════════════════════════════════════════════════╝
```

---

## 🎨 Color Palette Reference

### Background Colors
```css
Main details panel: 
  linear-gradient(135deg, 
    rgba(102, 126, 234, 0.05) 0%, 
    rgba(118, 75, 162, 0.05) 100%)

Summary cards:
  rgba(255, 255, 255, 0.05)

Stop info panel:
  rgba(255, 255, 255, 0.05)

Travel tips:
  rgba(59, 130, 246, 0.1)
```

### Text Colors
```css
Primary text: white
Secondary text: rgba(255, 255, 255, 0.7)
Muted text: rgba(255, 255, 255, 0.6)
Links/buttons: #667eea (primary color)
Success (on-time): #10b981
Warning (delays): #f59e0b
Error (cancelled): #ef4444
```

### Border Colors
```css
Panel border: rgba(102, 126, 234, 0.2)
Card border: rgba(255, 255, 255, 0.1)
Dashed divider: rgba(255, 255, 255, 0.1)
Left accent: #3b82f6 (blue)
```

---

## 📱 Touch Targets

All interactive elements meet accessibility standards:

### Button Sizes
```
Minimum touch target: 44px x 44px
Recommended: 48px x 48px
Desktop buttons: varies, but always > 32px height
Mobile buttons: 44px minimum height
```

### Spacing
```
Between cards: 12px
Between buttons: 8px
Section padding: 20px
Mobile padding: 16px
```

---

## 🎯 Animation & Transitions

### Expand/Collapse
```css
transition: max-height 0.3s ease-out,
            opacity 0.3s ease;
```

### Button Hover
```css
transition: all 0.2s ease;
transform: scale(1.02);
```

### Card Hover
```css
transition: box-shadow 0.3s ease;
box-shadow: 0 8px 24px rgba(0,0,0,0.15);
```

---

## ✨ Special Features Visualization

### Crowding Indicator
```
●●●● Full   (All circles filled)
●●●○ Busy   (3 of 4 filled)
●●○○ Moderate (2 of 4 filled)
●○○○ Light  (1 of 4 filled)
○○○○ Empty  (No circles filled)
```

### Real-Time Departures
```
⏱️ Next Departure: 3, 8, 15 min
                  ↑  ↑  ↑
               First Second Third
            (color: green if < 5min)
```

### Zone Display
```
🎫 Zone: Zone 1        (Single zone)
🎫 Zone: Zone 1-2      (Cross-zone)
🎫 Zone: Zone 2-3      (Cross-zone)
```

---

## 🎉 Conclusion

The visual design creates a **clear, professional, information-rich experience** that guides travelers through every step of their journey with confidence.

The use of **color coding**, **icons**, **responsive grids**, and **interactive elements** makes complex journey information **easy to understand** at a glance.

---

**Last Updated**: November 3, 2025  
**Design System**: ATIS v2.5  
**Status**: ✅ Production Ready

