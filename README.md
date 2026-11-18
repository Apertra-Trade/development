# Apertra

**Open every market.**

Apertra is the operating system for cross-border commerce: a trade network and compliance platform that lets any business in Canada, the United States, Europe, Australia and New Zealand sign up and ship to, or import from, any of the other four regions on the same rails.

Live site: https://apertra-trade.github.io/development/

## What Apertra does

- **Instant landed-cost calculator:** full duty, freight, brokerage, insurance and FX cost before a shipment is booked, by product and corridor.
- **Compliance engine:** automated HS classification, document generation (commercial invoices, bills of lading, certificates of origin including CUSMA), and a compliance gatekeeper that flags label and regulatory blockers before goods move.
- **Trade Network:** verified exporters, importers and buyers in all five regions, matched across all 20 directed corridors, with full company profiles and product catalogues.
- **Freight, payments and escrow:** API-aggregated freight, embedded FX and escrow protection, so neither side has to trust a cold email.
- **Workspace:** shipments, products and HS codes, documents, payments and escrow, and the trade network in one logged-in dashboard, including a 5-step New Shipment flow.

## The mesh

Five regions, twenty directed corridors. A business joins in its home region and gains four destination markets in one account:

Canada, United States, Europe, Australia and New Zealand, each shipping to and importing from the other four, under CUSMA, CETA, CPTPP, CER, the NZ-EU FTA and other frameworks.

## Pricing

Hybrid, by design:

- **Joining the network is free** for everyone, with a verified company profile.
- **Buyers and importers: free membership, always.** They pay only inside a trade, through their share of escrow and FX in the landed cost.
- **Exporters and sellers:** free Starter tier, then Growth $299/mo, Scale $749/mo and Enterprise $1,500/mo, covering the compliance vault, HS library, unlimited documents, audit trail, multi-corridor access and Verified Supplier ranking.
- **Every trade:** a 1.25% transaction fee, embedded in FX, escrow and freight (0.75% FX and escrow combined, about 0.50% freight). Membership fees are credited against that month's transaction fees, so active traders are not charged twice.

## This repository

The Apertra site, served with GitHub Pages. It is a multi-page static site, black branding throughout (no green), with shared assets in `assets/` (`site.css`, `site.js`, and the extracted photography):

- `index.html` - Home: hero, working landed-cost calculator, how it works, and links to every section
- `product.html` - Product: the four frictions and the execution engine
- `network.html` - Network: the verified Trade Network, with company previews
- `corridors.html` - Corridors: the five-region mesh, all 20 directed corridors
- `pricing.html` - Pricing: the hybrid membership and per-trade model
- `market.html` - Market: sizing and the revenue model
- `assessment.html` - Assessment: an honest read on the opportunity and risks
- `workspace.html` - The logged-in workspace demo, reached through Sign in: overview, shipments, products and HS codes, documents, payments and escrow, the Trade Network, and the 5-step New Shipment wizard

## Status

Concept and product design stage. The workspace is a front-end demo with sample data; no real shipments, payments or customer data are processed.
