# Charting Platform – ICC Dashboard

## Overview
This project provides a modular trading analytics platform with ICC dashboards for strategy-specific setups, alert routing, and data visualization. It integrates market data via Polygon API and supports CSV/JSON exports for compliance and review.

## Features
- **Navigation**: Navbar for switching between dashboards
- **Dashboards**:
  - DefaultDashboard – filter and display setups
  - MomentumEdge, TrendEdge, WarriorEdge – strategy-specific dashboards
  - ICCPage – categorized setups
  - ICCTracker – track setups with filtering options
  - TestHarness – routing verification
- **Components**:
  - SetupExport – export setups to CSV
  - SetupFeed & SetupReview – display setups
  - Tag – visual representation of tags
- **Utilities**:
  - Validation & normalization of setup data
  - Generate test setups and handle malformed entries
  - Export utilities for CSV/JSON
- **API Integration**:
  - Polygon API for market data

## Tech Stack
- React + TypeScript
- Modular components and pages
- Responsive CSS for dashboard layout
- GitHub for version control and collaboration

## Business Goal
The ICC Dashboard is designed to provide resilient, modular trading analytics with centralized alert routing, setup tracking, and compliance-ready exports. By segmenting dashboards (MomentumEdge, TrendEdge, WarriorEdge) and integrating market data APIs, the platform ensures no setups are missed and provides professional-grade tools for traders and analysts.

## File Structure
public/ index.html src/ components/ Navbar.tsx SetupExport.tsx SetupFeed.tsx SetupReview.tsx Tag.tsx pages/ DefaultDashboard.tsx ICCPage.tsx ICCTracker.tsx MomentumEdge.tsx TrendEdge.tsx WarriorEdge.tsx TestHarness.tsx utils/ validation.ts normalization.ts testSetups.ts exportUtils.ts api/ polygon.ts types/ iccTypes.ts README.md package.json tsconfig.json