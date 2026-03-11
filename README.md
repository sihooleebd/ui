# noir-ui

Standalone copy-paste component library.

This `ui` directory is intentionally independent from the rest of the repo.
Use it as a separate package/repo root.

## Project Docs

- `README`: `./README.md`
- `Contributing`: `./CONTRIBUTING.md`
- `License`: `./LICENSE`

## Quick Start

```html
<link rel="stylesheet" href="./styles/noir-ui.css">

<body class="nu-theme">
  <main class="nu-container">
    <!-- component snippet -->
  </main>

  <script src="./scripts/components.js"></script>
  <script>
    window.noirComponents.init();
  </script>
</body>
```

## Runtime API

- `window.noirComponents.init(root?)`
- `root` default: `document`
- Re-run `init` after dynamically injecting snippet markup.

## Project Layout

- `index.html`: landing page
- `registry.html`: searchable registry with category filters
- `index.js`: registry data + rendering + search/filter logic
- `components/*.html`: raw copy-paste snippets (`85` files)
- `pages/*.html`: generated per-component docs pages (`85` files)
- `pages/page.js`: shared docs-page runtime (preview/snippet/integration tabs)
- `scripts/components.js`: shared component interaction runtime
- `scripts/generate-pages.sh`: regenerate all `pages/*.html`
- `styles/noir-ui.css`: design tokens + component styles
- `styles/landing.css`: landing-specific styles

## Categories (85)

- `App Surfaces (16)`: `app-shell`, `top-nav`, `side-nav`, `rail-nav`, `command-bar`, `workspace-tabs`, `subnav-pills`, `split-layout`, `resizable-panels`, `drawer`, `sheet`, `inspector-panel`, `properties-panel`, `activity-stream`, `status-strip`, `footer`
- `Data/Workflow (15)`: `data-table-advanced`, `table-sticky-header`, `table-column-manager`, `table-row-menu`, `kanban-board`, `board-card`, `list-view`, `detail-view`, `audit-log`, `changelog-feed`, `metric-tile`, `metric-trend`, `sparkline-row`, `calendar-heatmap`, `timeline-compact`
- `Overlays/Advanced Forms (15)`: `popover`, `tooltip`, `context-menu`, `notification-center`, `toast-stack`, `bottom-sheet`, `command-palette`, `multi-select`, `date-range-picker`, `time-picker`, `step-form`, `inline-edit`, `password-strength`, `quick-actions-fab`, `shortcut-hint-bar`
- `Forms (16)`: `checkbox`, `combobox`, `date-picker`, `dropzone`, `filter-bar`, `form-login`, `form-signup`, `input`, `input-group`, `otp`, `radio`, `range`, `select`, `switch`, `tags-input`, `textarea`
- `Controls (5)`: `button`, `chip`, `segment`, `tabs`, `split-button`
- `Data display (7)`: `avatar`, `card`, `progress`, `skeleton`, `stats`, `table`, `timeline`
- `Feedback (4)`: `callout`, `toast`, `modal`, `empty`
- `Navigation (3)`: `breadcrumb`, `pagination`, `stepper`
- `Disclosure (1)`: `accordion`
- `Overlays (3)`: `dropdown`, `dropdown-profile`, `command-menu`

## Regeneration

Run from `ui/`:

```bash
./scripts/generate-pages.sh
```

## Accessibility Baseline

- Keyboard focus order for interactive controls
- Escape/outside-click close behavior on overlay surfaces
- Focus trap for `drawer` and `command-palette`
- ARIA labels/roles included in advanced components

## Notes

- Vanilla HTML/CSS/JS only
- No external framework dependency
- `nu-` prefix is reserved for library classes
