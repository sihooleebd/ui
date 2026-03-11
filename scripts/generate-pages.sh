#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
COMP_DIR="$ROOT_DIR/components"
PAGE_DIR="$ROOT_DIR/pages"

mkdir -p "$PAGE_DIR"

components=()
while IFS= read -r line; do
  components+=("$line")
done < <(cd "$COMP_DIR" && ls *.html | sed 's/\.html$//' | sort)

for idx in "${!components[@]}"; do
  name="${components[$idx]}"
  prev=""
  next=""

  if [ "$idx" -gt 0 ]; then
    prev="${components[$((idx - 1))]}"
  fi

  if [ "$idx" -lt "$(( ${#components[@]} - 1 ))" ]; then
    next="${components[$((idx + 1))]}"
  fi

  category="Primitive"
  description="Reusable noir-ui component."

  case "$name" in
    app-shell|top-nav|side-nav|rail-nav|command-bar|workspace-tabs|subnav-pills|split-layout|resizable-panels|drawer|sheet|inspector-panel|properties-panel|activity-stream|status-strip|footer)
      category="App Surfaces"
      description="Application surface component for layout scaffolding and workspace structure."
      ;;
    data-table-advanced|table-sticky-header|table-column-manager|table-row-menu|kanban-board|board-card|list-view|detail-view|audit-log|changelog-feed|metric-tile|metric-trend|sparkline-row|calendar-heatmap|timeline-compact)
      category="Data/Workflow"
      description="Workflow and data-density component for operational monitoring and editing."
      ;;
    popover|tooltip|context-menu|notification-center|toast-stack|bottom-sheet|command-palette|multi-select|date-range-picker|time-picker|step-form|inline-edit|password-strength|quick-actions-fab|shortcut-hint-bar)
      category="Overlays/Advanced Forms"
      description="Interactive overlay or advanced form pattern with keyboard and focus handling."
      ;;
    form-login|form-signup|input-group|select|textarea|checkbox|switch|radio|range|dropzone|combobox|tags-input|otp|date-picker|filter-bar|input)
      category="Forms"
      description="Form-oriented component for input, validation flow, and data entry layout."
      ;;
    button|chip|segment|tabs|split-button)
      category="Controls"
      description="Interactive control pattern for actions, toggles, and compact switching."
      ;;
    stats|card|table|avatar|progress|skeleton|timeline)
      category="Data display"
      description="Display-focused component for dense dashboards and class data views."
      ;;
    callout|toast|modal|empty)
      category="Feedback"
      description="Status and system-feedback component for operational UI flows."
      ;;
    breadcrumb|pagination|stepper)
      category="Navigation"
      description="Navigation component for movement across registry or app screens."
      ;;
    accordion)
      category="Disclosure"
      description="Collapsible disclosure pattern for compact, layered information."
      ;;
    dropdown|dropdown-profile|command-menu)
      category="Overlays"
      description="Layered menu or command surface shown on top of the current context."
      ;;
  esac

  out="$PAGE_DIR/${name}.html"

  {
    cat <<PAGE_HEAD
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>noir-ui / ${name}</title>
  <link rel="stylesheet" href="../styles/noir-ui.css">
</head>
<body class="nu-theme">
  <main class="nu-container nu-page-shell" data-component-page="${name}" style="padding: 32px 0 56px;">
    <header class="nu-page-top">
      <nav class="nu-breadcrumb" aria-label="Breadcrumb">
        <a href="../registry.html">Registry</a>
        <span class="nu-crumb-sep">/</span>
        <span>${name}</span>
      </nav>
      <h1 class="nu-headline" style="margin: 0;">${name}</h1>
      <p class="nu-subtitle">${description}</p>
      <div class="nu-row">
        <span class="nu-badge">${category}</span>
        <span class="nu-badge">Copy-paste</span>
        <span class="nu-badge">noir-ui</span>
      </div>
      <div class="nu-row">
        <a class="nu-btn nu-btn-sm" href="../registry.html">All Components</a>
        <a class="nu-btn nu-btn-sm" href="../components/${name}.html">Raw Snippet</a>
PAGE_HEAD

    if [ -n "$prev" ]; then
      cat <<PAGE_PREV
        <a class="nu-btn nu-btn-sm" href="./${prev}.html">Prev: ${prev}</a>
PAGE_PREV
    fi

    if [ -n "$next" ]; then
      cat <<PAGE_NEXT
        <a class="nu-btn nu-btn-sm" href="./${next}.html">Next: ${next}</a>
PAGE_NEXT
    fi

    cat <<'PAGE_MID'
      </div>
    </header>

    <div class="nu-page-grid">
      <section class="nu-page-main">
        <div class="nu-segment nu-page-view" data-view-tabs>
          <button class="nu-btn is-active" type="button" data-view="preview">Preview</button>
          <button class="nu-btn" type="button" data-view="code">Snippet</button>
          <button class="nu-btn" type="button" data-view="usage">Integration</button>
        </div>

        <article class="nu-doc-card" data-pane="preview">
          <header class="nu-doc-head">
            <h3 class="nu-doc-title">Preview</h3>
            <div class="nu-row">
              <span class="nu-page-status" data-copy-status></span>
              <button class="nu-btn nu-btn-sm" type="button" data-copy-snippet>Copy Snippet</button>
            </div>
          </header>
          <div class="nu-doc-preview" data-preview></div>
          <div class="nu-live-editor">
            <header class="nu-live-editor-head">
              <h4 class="nu-live-editor-title">Live Editor</h4>
              <div class="nu-row">
                <span class="nu-help" data-live-status></span>
                <button class="nu-btn nu-btn-sm" type="button" data-live-run>Run</button>
                <button class="nu-btn nu-btn-sm" type="button" data-live-reset>Reset</button>
              </div>
            </header>
            <textarea class="nu-live-textarea" data-live-editor spellcheck="false" aria-label="Live HTML editor"></textarea>
          </div>
        </article>

        <article class="nu-doc-card nu-hidden" data-pane="code">
          <header class="nu-doc-head">
            <h3 class="nu-doc-title">Snippet</h3>
            <a class="nu-doc-path" href="#" data-raw-path></a>
          </header>
          <pre class="nu-doc-code" data-code></pre>
        </article>

        <article class="nu-doc-card nu-hidden" data-pane="usage">
          <header class="nu-doc-head">
            <h3 class="nu-doc-title">Integration</h3>
            <button class="nu-btn nu-btn-sm" type="button" data-copy-usage>Copy Usage</button>
          </header>
          <pre class="nu-doc-code" data-usage></pre>
        </article>
      </section>

      <aside class="nu-page-side">
        <article class="nu-doc-card">
          <header class="nu-doc-head">
            <h3 class="nu-doc-title">View Modes</h3>
          </header>
          <div class="nu-doc-preview">
            <div class="nu-stack">
              <p class="nu-help" style="margin: 0;">`Preview`: rendered component output.</p>
              <p class="nu-help" style="margin: 0;">`Snippet`: exact copy-paste HTML.</p>
              <p class="nu-help" style="margin: 0;">`Integration`: shell + snippet + runtime init.</p>
            </div>
          </div>
        </article>

        <article class="nu-doc-card">
          <header class="nu-doc-head">
            <h3 class="nu-doc-title">Registry</h3>
          </header>
          <div class="nu-doc-preview nu-stack">
            <a class="nu-btn nu-btn-sm" href="../registry.html">Back to registry</a>
            <p class="nu-help" style="margin: 0;">Each page keeps preview, raw snippet, and copy-ready usage in one place.</p>
          </div>
        </article>
      </aside>
    </div>

    <template data-snippet>
PAGE_MID

    cat "$COMP_DIR/${name}.html"

    cat <<'PAGE_TAIL'
    </template>
  </main>

  <script src="../scripts/components.js"></script>
  <script src="./page.js"></script>
</body>
</html>
PAGE_TAIL
  } > "$out"
done

echo "Generated ${#components[@]} component pages in $PAGE_DIR"
