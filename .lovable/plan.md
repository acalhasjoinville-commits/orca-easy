
# OrçaCalhas — MVP Implementation Plan

## Overview
A mobile-first SaaS web app for gutter/flashing installation professionals to automate complex job quotes on-site. Built with React, Tailwind CSS, and shadcn/ui components.

## Design System
- **Primary colors**: Navy blue (`#1e3a5f`) for trust/engineering feel
- **Accent color**: Orange (`#f97316`) for CTAs and construction-industry vibe
- **Mobile-first** layout with bottom navigation bar
- Clean, card-based UI optimized for outdoor/on-site use (large touch targets, readable fonts)

## Data Layer
All data stored in **localStorage** for the MVP (no backend needed initially). Four configurable tables plus a saved quotes list:

1. **Motor 1 — Raw Material by Kilo** (material, density, price/kg)
2. **Motor 2 — Supplier Pricing** (material, thickness, cut width, price/linear meter)
3. **Insumos — Consumables** (name, unit cost)
4. **Receitas de Serviço — Service Recipes** (service name, support divisor, PU divisor, rivet multiplier, difficulty multipliers)
5. **Saved Quotes** (client name, service, measurements, calculated values, date)

All tables pre-seeded with realistic sample data so the app works out of the box.

## Screen 1 — Dashboard
- Summary cards showing recent quotes (client name, service, final value, date)
- Empty state with guidance for first-time users
- Floating Action Button (FAB) "**+ Novo Orçamento**" in orange

## Screen 2 — Novo Orçamento (Step-by-step Wizard)
A 5-step wizard with progress indicator at the top:

- **Step 1 — Cliente**: Client name input
- **Step 2 — Serviço**: Dropdown populated from Service Recipes table
- **Step 3 — Medidas e Material**: Numeric inputs for total meters, thickness (mm), cut width (mm). Material dropdown. Toggle switch for "Fabricar (Motor 1)" vs "Comprar Dobrado (Motor 2)"
- **Step 4 — Dificuldade**: Quick-select buttons for Easy (2.6×), Medium (3.5×), Difficult (4.6×)
- **Step 5 — Resumo**: 
  - Cost breakdown visible to the professional (material cost, consumables breakdown with editable quantities, total cost)
  - Final sale price prominently displayed
  - "**Gerar Proposta**" button to save the quote

All calculations run live using the engine rules specified (Motor 1 weight formula, Motor 2 direct lookup, consumable quantities from recipe, difficulty multiplier).

## Screen 3 — Configurações (Settings CRUD)
- Tabbed interface with 4 tabs (one per data table)
- Each tab shows a list of entries with inline edit/delete
- "Add new" button per tab with a simple form dialog
- Pre-populated with sample data (Alumínio at 2.7 g/cm³ / R$37.50/kg, standard consumable prices, sample service recipes)

## Navigation
- Bottom navigation bar with 3 tabs: **Dashboard** | **Orçamento** | **Configurações**
- Icons + labels for each tab

## Calculation Engine
A utility module implementing:
- Motor 1: `weightPerMeter = (thickness × cutWidth × 100 × density) / 100000` → `costPerMeter = weightPerMeter × pricePerKg`
- Motor 2: Direct price lookup from supplier table
- Consumables: `ceil(meters / divisor)` for supports & PU, `ceil(meters × multiplier)` for rivets
- Final: `(materialCost + consumablesCost) × difficultyFactor`
