
# MediCompare — Medicine Price Comparison SaaS App

## Overview
A premium, responsive medicine price comparison web app with a healthcare tech aesthetic, dark/light mode, and rich interactive features — all built with mock data.

## Design System
- **Light mode**: White/slate-50 backgrounds, Medical Teal (`hsl(180, 70%, 35%)`) as primary
- **Dark mode**: Rich slate-900 backgrounds, neon-teal accents
- **Typography**: Inter font, high-contrast for medical data readability
- **Radius & spacing**: Rounded-xl cards, generous padding, glassmorphism header

## Pages & Components

### 1. Sticky Glassmorphism Header
- Logo "MediCompare" (left)
- Compact search bar (appears on scroll past hero)
- Dark/Light toggle (Sun/Moon icons), Wishlist heart icon with badge count, Login/Sign Up pill buttons (right)
- Mobile: hamburger menu

### 2. Hero Section (Landing `/`)
- Bold headline: "Find the Best Prices for Your Prescriptions"
- Subheadline about comparing prices & setting alerts
- Large centered search bar with icon and search button
- Subtle background gradient/pattern

### 3. Search Results Page (`/search`)
- **Sidebar Filters** (collapsible accordions):
  - Sort by price (low→high, high→low)
  - In-stock toggle
  - Pharmacy checkboxes (PharmEasy, Netmeds, 1mg, Apollo, MedPlus)
  - Price range slider
  - On mobile: slide-out drawer triggered by filter button
- **Results Grid** (medicine cards):
  - Medicine name, dosage, manufacturer
  - Mini price table from 3 pharmacies, lowest highlighted green
  - Heart (wishlist) and Bell (price alert) icon buttons
  - "View Deal" primary button
  - Realistic mock data (~12 medicines)

### 4. Auth Modals (Login / Sign Up)
- Centered dialog modals triggered from header buttons
- Email + password fields, forgot password link
- "Continue with Google" social button (UI only)
- Toggle between login/signup within modal

### 5. User Dashboard (`/dashboard`)
- Tabs: "My Wishlist" and "Price Alerts"
- Wishlist tab: saved medicine cards with remove option
- Price Alerts tab: tracked medicines showing target price vs current price, with status badges
- Mock logged-in state via local state (no real auth)

### 6. Interactions & Polish
- Toast notifications for wishlist add/remove and price alert set
- Smooth hover transitions on cards and buttons
- Dark/light mode toggle with smooth transition
- Fully mobile-responsive layout
- All data is realistic mock/placeholder data

### 7. State Management
- React context for theme (dark/light), wishlist, and price alerts
- Local state only — no backend needed for this phase
