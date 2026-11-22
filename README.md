# B2B Automotive Storefront & Fleet Quote Engine

A configurable, config-driven B2B storefront and structured request-for-quotation (RFQ) platform for automotive and commercial fleet-equipment businesses. It replaces retail shopping-cart checkout and unstructured email or telephone quoting with deterministic vehicle fitment checking, tiered volume pricing, and multi-stage fleet quote intake. Built on a shared React, TypeScript, and Express engine, a single storefront platform can be themed and populated for multiple automotive commercial verticals.

All storefronts in this repository are demonstration implementations populated with sample catalogue and fitment data; they are not live client deployments.

## Demonstration storefronts

All four storefronts run on the same application engine and differ only in configuration and visual presentation:

| Demo | Segment it represents | Catalogue prefix | Presentation theme |
| :--- | :--- | :--- | :--- |
| **01 · Astrateq Gadgets** | Flagship commercial fleet hardware distributor | `AST` | Dark navy/charcoal with amber primary CTA and cyan fitment/informational accents |
| **02 · NorthLink Telematics** | Corporate fleet telematics & connectivity procurement | `NLT` | Light enterprise slate/white with navy accents and amber conversion CTAs |
| **03 · VoltDepot Systems** | EV depot charging & electrical infrastructure | `VDS` | Dark charcoal/forest with lime-green accents |
| **04 · TrueNorth Upfitting** | Multi-location commercial vehicle upfitting network | `TNU` | Dark industrial charcoal with orange accents and amber hero quote CTA |

## Core capabilities

- **Multi-SKU fleet quote drawer**: Replaces retail checkout with a persistent quote list supporting per-SKU quantity adjustments and optional service add-ons.
- **Volume tier pricing**: Displays indicative CAD pricing across `1–9 Units`, `10–49 Units`, and formal-quote framing for `50+ Units` without rendering a payment step.
- **Progressive vehicle & fleet fitment intake**: Captures year, make, model, and vehicle class as discrete vehicle groups with per-group vehicle count, power source, and installation preference.
- **Deterministic fitment states**: Distinguishes `Verified` fitment from `Requires engineering / harness verification`, automatically downgrading even a verified matrix entry when the buyer selects an unknown power source.
- **Segment-specific intake variants**: Captures corporate telematics scope (NorthLink), EV charging bays and electrical service readiness (VoltDepot), and regional Canadian bay hub and trade use (TrueNorth).
- **Inline Spec Assist copilot**: Rule-based specification assistant that answers strictly from the active storefront catalogue and compatibility matrix while citing the matched SKUs.
- **Commercial policies section**: Presents demonstration Shipping, Returns & RMA, Warranty, Privacy, and Terms & Conditions summaries with full modal views.
- **Single-file rebranding**: Drives branding, navigation, catalogue SKUs, tier rates, compatibility rules, and quote routing from declarative TypeScript configuration.

## Architecture

A single configuration layer (`src/data/clientConfig.ts` and `src/data/storefronts.ts`) acts as the authoritative source of truth for brand identity, catalogue SKUs, CAD tier pricing, technical specifications, compatibility matrix entries, and quote routing. Every UI surface — product cards, specification modals, the fitment finder, the three-step quote drawer, and the Spec Assist engine — reads directly from that configuration so displayed `"From"` prices, volume tier rates, drawer totals, and Spec Assist citations cannot disagree.

Three hard rules are enforced by design:

1. **Checkout is disabled**: The platform collects structured fleet RFQs (`POST /api/rfq` or a configured webhook) rather than processing payments or orders.
2. **Strict fitment verification**: No vehicle pairing is marked verified unless an exact matching entry in the compatibility matrix is marked `verified` and the power source is known.
3. **Indicative pricing framing**: All published unit rates are presented as indicative `"From"` prices in CAD subject to formal fleet quotation.

## Design system

- **Themes**: Supports dark charcoal (`#171A1D` family / dark surface variants) and light enterprise themes (`NorthLink Telematics`) via per-storefront theme token objects.
- **Primary conversion rule**: Uses one filled primary call-to-action per view for the quote action in the brand conversion accent, while secondary browse actions remain dark or outlined links.
- **Informational accents**: Reserves cyan on the flagship theme for vehicle fitment status, technical tags, and informational states rather than conversion buttons.
- **Product-card grammar**: Standardises every hardware card around SKU identifier, category label, 3-column `POWER` / `INTERFACE` / `RATING` specification cells, `From` CAD tier price, volume-tier note, `Add to quote` action, and `View specs & tiers` modal trigger.

## Rebranding a deployment

Follow these steps to configure a new client storefront from the shared configuration:

1. **Set brand tokens**: Update brand name, logo asset, header navigation, contact placeholders, and colour theme tokens in the storefront configuration.
2. **Replace the catalogue**: Replace the demonstration SKUs (up to a maximum of 15 SKUs) with client-supplied hardware products, technical specifications, unit labels, and verified CAD tier prices.
3. **Load the compatibility matrix**: Populate the matrix with the client's verified vehicle year/make/model/class pairings, harness recommendations, and verification notes.
4. **Set the quote destination**: Configure the client's intake webhook URL (`webhookUrl`) or backend RFQ endpoint for structured JSON payload delivery.
5. **Replace policy texts**: Replace all five demonstration policy summaries and full texts with the client's actual shipping, RMA, warranty, privacy, and commercial terms.

All product, pricing, and fitment data in a live deployment must be supplied and attested by the client; demonstration data in this repository must never be carried into a production storefront.

## Demonstration-data notice

Every product name, SKU/part number, CAD price, technical specification, and vehicle fitment pairing across the four demonstration storefronts is sample data created solely for demonstration. Contact details use `.example` email domains and `555` telephone numbers. Nothing in this repository represents a real customer, endorsement, manufacturer certification, hardware availability guarantee, or commercial business result.

## Project structure

- `src/components/StorefrontSwitcher.tsx` — Top switcher bar toggling between the four branded storefront demos (`?store=`).
- `src/components/Header.tsx` & `src/components/HeroSection.tsx` — Storefront-specific navigation bar, branded hero banner, and workflow entry sections.
- `src/components/CategoryShowcase.tsx` & `src/components/HardwareCatalog.tsx` — Category filter cards, searchable hardware grid, and `View specs & tiers` (`ProductSpecsModal.tsx`) triggers.
- `src/components/FitmentFinder.tsx` — Four-field vehicle selector checking the compatibility matrix and attaching vehicle groups to the quote.
- `src/components/QuoteDrawer.tsx` — Three-step RFQ intake drawer (`Deployment & Hardware`, `Contact Details`, `Review & Submit`) with CAD tier calculations.
- `src/components/ProcessSection.tsx` — Three-step procurement and deployment workflow overview tailored to each vertical.
- `src/components/SpecAssistSection.tsx` & `src/utils/specAssistEngine.ts` — Rule-based inline catalog and fitment copilot with SKU citation output.
- `src/components/PoliciesSection.tsx` & `src/components/PolicyModal.tsx` — Sample commercial policy summary cards and full-text dialog.
- `src/data/clientConfig.ts` & `src/data/storefronts.ts` — Central configuration, product catalogues, theme tokens, compatibility matrix, and strict per-storefront SKU helpers.
- `server.ts` — Express server serving the Vite app and handling demonstration `POST /api/rfq` submissions.

## Status and limitations

This repository is at a prototype and demonstration stage. It does not include live inventory lookup, ERP/CRM synchronization, payment processing, or production third-party integrations, and RFQ submissions made in the demonstration storefronts do not reach a real commercial supplier.
