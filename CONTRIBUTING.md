# Contributing to noir-ui

Thanks for contributing.

## Scope

- Keep `ui/` independent from the parent project.
- Prefer copy-paste friendly HTML/CSS/JS with no framework dependency.

## Setup

1. Work inside `ui/`.
2. Edit snippets in `components/*.html`.
3. Regenerate docs pages:

```bash
./scripts/generate-pages.sh
```

## Component Rules

- Use `nu-` prefixed classes.
- For interactive components, expose a root hook using `data-nu-<component>`.
- Follow shared runtime API:

```html
<script src="./scripts/components.js"></script>
<script>
  window.noirComponents.init();
</script>
```

## Accessibility Baseline

- Keyboard operation must work.
- Overlay components must support `Escape` and outside click close.
- Add sensible ARIA labels/roles for dialogs, menus, and inputs.

## Registry / Docs Consistency

When adding or renaming a component, update all of the following:

- `components/*.html`
- `index.js` registry list/category metadata
- `scripts/generate-pages.sh` category mapping
- `README.md` category section

Then regenerate pages and verify counts match:

```bash
ls components/*.html | wc -l
ls pages/*.html | wc -l
```

## Pull Request Checklist

- Component preview renders correctly.
- Snippet tab matches raw component source.
- Integration tab includes shared runtime initialization.
- No mismatch between component file list and registry.
