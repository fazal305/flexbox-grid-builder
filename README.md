# Flexbox/Grid Builder

An interactive, browser-based visual layout designer for CSS Flexbox and
CSS Grid, with live preview, real-time HTML/CSS code generation, saved
layouts, an export center, and a fully dynamic, user-customizable theme.

## Live Links

- GitHub Repository: [fazal305/flexbox-grid-builder](https://github.com/fazal305/flexbox-grid-builder)
- Live Demo: [https://fazal305.github.io/flexbox-grid-builder/](https://fazal305.github.io/flexbox-grid-builder/)

## Overview

Flexbox/Grid Builder is a local-first, multi-page browser application for visually designing real CSS layouts. It gives users a professional builder interface with editable state, live-rendered preview canvases, saved layout management, clean HTML/CSS generation, and export-ready files.

The app is built without frameworks or build tools, making it easy to open directly in the browser while still demonstrating enterprise frontend architecture, shared utilities, page-specific modules, dynamic UI rendering, and persistent workspace state.

## Pages

- Dashboard: workspace stats, recent activity, quick actions, and live mini previews.
- Flexbox Builder: visual Flexbox editor with container controls, item controls, presets, save, reset, and generated HTML/CSS.
- Grid Builder: visual CSS Grid editor with track controls, placement controls, template-area painting, presets, save, reset, and generated HTML/CSS.
- Saved Layouts: searchable and filterable saved layout library with preview, open, duplicate, rename, delete, and export actions.
- Export Center: source picker, iframe preview, class prefix control, minify option, combined/separate output, copy, and download tools.
- Settings: live theme customizer, theme presets, transition speed, compact sidebar, workspace import/export, demo reset, and localStorage reset.

## Features

- Multi-page browser application with one HTML file per major module.
- Shared sidebar/navigation across all pages.
- Smooth shared page-transition overlay with delayed loader fallback.
- Fully dynamic theme system powered by localStorage and CSS custom properties.
- Live Flexbox preview driven by editable state.
- Live CSS Grid preview driven by editable state.
- Data-driven presets that populate the same state used by manual editing.
- Unlimited user-managed flex items and grid tracks.
- Generated HTML and CSS that reflect the exact current layout.
- Saved layouts with live mini previews rendered from real config.
- Search and filtering by name, type, and tags.
- Export center with iframe-based exact preview.
- Copy-to-clipboard and Blob file download support.
- Workspace import/export as JSON.
- Demo data seeded automatically on first load.
- Responsive layout for desktop and mobile.

## Technologies Used

- HTML5
- CSS3 (custom properties / dynamic theming)
- Bootstrap 5
- jQuery
- Vanilla JavaScript
- LocalStorage
- Blob API
- Clipboard API

## Learning Outcomes

- Build a complete multi-page frontend application without a bundler.
- Structure shared and page-specific JavaScript modules.
- Use localStorage as a persistent source of truth.
- Generate real CSS Flexbox and Grid code from dynamic state.
- Render live previews from configuration objects.
- Design reusable UI patterns with shared CSS and Bootstrap.
- Implement a runtime theme system with CSS custom properties.
- Create smooth page transitions across normal browser navigation.
- Build search, filter, duplicate, rename, delete, import, export, and download workflows.

## Architecture Notes

The application uses a no-build, multi-page frontend architecture. Each major product area has its own HTML file, page-specific CSS file, and page-specific JavaScript file, while shared behavior lives in `styles.css` and `js/shared.js`.

Shared JavaScript utilities handle workspace loading and saving, localStorage seeding, activity logs, theme application, sidebar rendering, status messages, downloads, clipboard actions, layout code generation, mini previews, and the page-transition overlay. Page modules focus only on the behavior for their own screen.

The workspace model is stored in localStorage and contains app settings, theme tokens, current builder drafts, saved layouts, and activity logs. Demo data is seeded automatically when no workspace exists.

The theme system is fully dynamic. CSS files reference custom properties such as `var(--bg)`, `var(--card)`, `var(--text)`, and `var(--primary)`. Actual theme values are stored in `workspace.theme` and written to `:root` at runtime by `applyThemeSettings()`.

Flexbox and Grid builders are config-driven. Item counts, track counts, template areas, presets, and generated code all come from state objects rather than fixed markup. Presets are plain data objects that populate the same editable state used by manual controls.

Real-time HTML/CSS code generation is centralized in shared functions. Export options can adjust class prefixes and minification, and the Export Center renders an iframe using the same generated HTML and CSS that users copy or download.

The page-transition system is shared across all pages. It injects a full-screen overlay, fades content in on load, intercepts internal navigation, enforces a minimum transition duration, and shows a loader automatically when the transition lasts longer than expected.

The project is intentionally framework-free and build-free. It runs locally by opening `index.html` and uses Bootstrap and jQuery through CDNs only.

## Folder Structure

```text
flexbox-grid-builder/
  index.html
  flexbox-builder.html
  grid-builder.html
  saved-layouts.html
  export.html
  settings.html

  styles.css

  css/
    dashboard.css
    flexbox-builder.css
    grid-builder.css
    saved-layouts.css
    export.css
    settings.css

  js/
    shared.js
    dashboard.js
    flexbox-builder.js
    grid-builder.js
    saved-layouts.js
    export.js
    settings.js

  README.md
  LICENSE
  .gitignore
```

How To Run Locally
git clone https://github.com/fazal305/flexbox-grid-builder.git
cd flexbox-grid-builder
Open index.html directly in your browser.
No package install, build step, or local server is required.
How To Use
Open index.html to view the Dashboard.
Use Flexbox Builder to adjust container properties and item settings.
Save the Flexbox layout with a name and optional tags.
Use Grid Builder to add/remove tracks, place items, and paint template areas.
Save the Grid layout with a name and optional tags.
Open Saved Layouts to search, filter, duplicate, rename, delete, or reopen layouts.
Open Export Center to choose a saved layout or draft, preview it, copy code, or download files.
Open Settings to customize theme tokens, transition speed, compact sidebar mode, and workspace data.
Sample Workflow
Build a flexbox layout using the visual controls.
Save it as a named layout.
Build a grid layout using the visual controls.
Save it as a named layout.
Open the Export Center and export both as HTML + CSS.
Customize the app's theme in Settings and see it apply instantly.
