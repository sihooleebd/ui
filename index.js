(function () {
  var componentGroups = [
    {
      category: 'App Surfaces',
      names: [
        'app-shell', 'top-nav', 'side-nav', 'rail-nav', 'command-bar',
        'workspace-tabs', 'subnav-pills', 'split-layout', 'resizable-panels',
        'drawer', 'sheet', 'inspector-panel', 'properties-panel',
        'activity-stream', 'status-strip', 'footer'
      ]
    },
    {
      category: 'Data/Workflow',
      names: [
        'data-table-advanced', 'table-sticky-header', 'table-column-manager',
        'table-row-menu', 'kanban-board', 'board-card', 'list-view',
        'detail-view', 'audit-log', 'changelog-feed', 'metric-tile',
        'metric-trend', 'sparkline-row', 'calendar-heatmap', 'timeline-compact'
      ]
    },
    {
      category: 'Overlays/Advanced Forms',
      names: [
        'popover', 'tooltip', 'context-menu', 'notification-center',
        'toast-stack', 'bottom-sheet', 'command-palette', 'multi-select',
        'date-range-picker', 'time-picker', 'step-form', 'inline-edit',
        'password-strength', 'quick-actions-fab', 'shortcut-hint-bar'
      ]
    },
    {
      category: 'Forms',
      names: [
        'checkbox', 'combobox', 'date-picker', 'dropzone', 'filter-bar',
        'form-login', 'form-signup', 'input', 'input-group', 'otp', 'radio',
        'range', 'select', 'switch', 'tags-input', 'textarea'
      ]
    },
    {
      category: 'Controls',
      names: ['button', 'chip', 'segment', 'tabs', 'split-button']
    },
    {
      category: 'Data display',
      names: ['avatar', 'card', 'progress', 'skeleton', 'stats', 'table', 'timeline']
    },
    {
      category: 'Feedback',
      names: ['callout', 'toast', 'modal', 'empty']
    },
    {
      category: 'Navigation',
      names: ['breadcrumb', 'pagination', 'stepper']
    },
    {
      category: 'Disclosure',
      names: ['accordion']
    },
    {
      category: 'Overlays',
      names: ['dropdown', 'dropdown-profile', 'command-menu']
    }
  ];

  var descriptions = {
    'app-shell': 'Composable two-level shell for dashboard-grade applications.',
    'resizable-panels': 'Split view with drag handle and persistent panel proportions.',
    'drawer': 'Focus-trapped side panel with overlay dismissal behavior.',
    'sheet': 'Centered contextual sheet for dense object details.',
    'notification-center': 'Stacked system notifications with fast dismissal flow.',
    'command-palette': 'Keyboard-first action launcher with list navigation.',
    footer: 'Reusable application footer with brand, links, and copyright row.',
    'multi-select': 'Multi-value selection pattern with selected-chip summary.',
    'date-range-picker': 'Range calendar pattern with start/end state memory.',
    'time-picker': 'Incremental time controls for schedule editing.',
    'password-strength': 'Password field with real-time strength indicator.',
    'quick-actions-fab': 'Floating quick action trigger for high-frequency tasks.',
    'data-table-advanced': 'Dense tabular surface with controls and action slots.',
    'kanban-board': 'Workflow board for status-tracked items and handoffs.',
    'calendar-heatmap': 'Compact activity heatmap with intensity levels.',
    'timeline-compact': 'Minimal chronological events strip for activity summaries.'
  };

  var categoryDefaults = {
    'App Surfaces': 'Application surface component for layout scaffolding and workspace structure.',
    'Data/Workflow': 'Workflow and data-density component for operational monitoring and editing.',
    'Overlays/Advanced Forms': 'Interactive overlay or advanced form pattern with keyboard and focus handling.',
    Forms: 'Form-oriented component for input, validation flow, and data entry layout.',
    Controls: 'Interactive control pattern for actions, toggles, and compact switching.',
    'Data display': 'Display-focused component for dense dashboards and class data views.',
    Feedback: 'Status and system-feedback component for operational UI flows.',
    Navigation: 'Navigation component for movement across registry or app screens.',
    Disclosure: 'Collapsible disclosure pattern for compact, layered information.',
    Overlays: 'Layered menu or command surface shown on top of the current context.'
  };

  var groupOrder = componentGroups.map(function (group) {
    return group.category;
  });

  function createComponents() {
    var out = [];
    componentGroups.forEach(function (group) {
      group.names.forEach(function (name) {
        out.push({
          name: name,
          category: group.category,
          description: descriptions[name] || categoryDefaults[group.category]
        });
      });
    });
    return out;
  }

  var components = createComponents();

  var setupSnippet = [
    '<link rel="stylesheet" href="./styles/noir-ui.css">',
    '',
    '<body class="nu-theme">',
    '  <main class="nu-container">',
    '    <!-- app content -->',
    '  </main>',
    '',
    '  <script src="./scripts/components.js"></script>',
    '  <script>',
    '    window.noirComponents.init();',
    '  </script>',
    '</body>'
  ].join('\n');

  function escapeHTML(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function fallbackCopy(value, onSuccess, onFail) {
    try {
      var area = document.createElement('textarea');
      area.value = value;
      area.style.position = 'fixed';
      area.style.top = '-9999px';
      document.body.appendChild(area);
      area.select();
      var ok = document.execCommand('copy');
      area.parentNode.removeChild(area);
      if (ok) {
        onSuccess();
      } else if (onFail) {
        onFail();
      }
    } catch (error) {
      if (onFail) onFail();
    }
  }

  function copyText(value, onSuccess, onFail) {
    if (navigator.clipboard && window.isSecureContext && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(value).then(onSuccess).catch(function () {
        fallbackCopy(value, onSuccess, onFail);
      });
      return;
    }
    fallbackCopy(value, onSuccess, onFail);
  }

  function createCard(item) {
    var card = document.createElement('a');
    card.className = 'nu-registry-card';
    card.setAttribute('href', './pages/' + item.name + '.html');
    card.innerHTML =
      '<span class="nu-registry-kicker">' + item.category + '</span>' +
      '<h3 class="nu-registry-name">' + item.name + '</h3>' +
      '<p class="nu-registry-copy">' + item.description + '</p>' +
      '<p class="nu-help" style="margin: 0;">Click card to open page</p>';
    return card;
  }

  function renderRegistry(filterValue, activeCategory) {
    var filter = (filterValue || '').trim().toLowerCase();
    var selectedCategory = activeCategory || 'All';

    var filtered = components.filter(function (item) {
      var matchesText =
        !filter ||
        item.name.toLowerCase().indexOf(filter) !== -1 ||
        item.category.toLowerCase().indexOf(filter) !== -1 ||
        item.description.toLowerCase().indexOf(filter) !== -1;

      var matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      return matchesText && matchesCategory;
    });

    var root = document.getElementById('registryRoot');
    root.innerHTML = '';

    groupOrder.forEach(function (groupName) {
      var inGroup = filtered.filter(function (item) {
        return item.category === groupName;
      });

      if (!inGroup.length) return;

      var block = document.createElement('section');
      block.className = 'nu-registry-block';

      var title = document.createElement('p');
      title.className = 'nu-section-title';
      title.textContent = groupName;
      block.appendChild(title);

      var grid = document.createElement('div');
      grid.className = 'nu-registry-grid';
      inGroup.forEach(function (item) {
        grid.appendChild(createCard(item));
      });

      block.appendChild(grid);
      root.appendChild(block);
    });

    if (!root.children.length) {
      var empty = document.createElement('div');
      empty.className = 'nu-empty';
      empty.textContent = 'No components matched your search.';
      root.appendChild(empty);
    }
  }

  function renderCategoryFilters(activeCategory, onSelect) {
    var container = document.getElementById('registryFilters');
    if (!container) return;

    var categories = ['All'].concat(groupOrder);
    container.innerHTML = '';

    categories.forEach(function (category) {
      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'nu-btn nu-btn-sm' + (category === activeCategory ? ' is-active' : '');
      button.textContent = category;
      button.setAttribute('data-category', category);
      button.addEventListener('click', function () {
        onSelect(category);
      });
      container.appendChild(button);
    });
  }

  try {
    var setupCode = document.getElementById('setupCode');
    var copySetup = document.getElementById('copySetup');
    var setupStatus = document.getElementById('setupStatus');
    var search = document.getElementById('registrySearch');
    var countBadge = document.getElementById('componentCountBadge');
    var activeCategory = 'All';

    setupCode.innerHTML = escapeHTML(setupSnippet);
    countBadge.textContent = components.length + ' components';

    function updateView() {
      renderCategoryFilters(activeCategory, function (nextCategory) {
        activeCategory = nextCategory;
        updateView();
      });
      renderRegistry(search.value, activeCategory);
    }

    updateView();

    copySetup.addEventListener('click', function () {
      var button = copySetup;
      copyText(
        setupSnippet,
        function () {
          button.textContent = 'Copied';
          setupStatus.textContent = 'Copied';
          setTimeout(function () {
            button.textContent = 'Copy';
            setupStatus.textContent = '';
          }, 1200);
        },
        function () {
          button.textContent = 'Copy failed';
          setTimeout(function () {
            button.textContent = 'Copy';
          }, 1200);
        }
      );
    });

    search.addEventListener('input', updateView);
  } catch (error) {
    console.error('noir-ui registry init failed:', error);
    var root = document.getElementById('registryRoot');
    if (root && !root.children.length) {
      var fail = document.createElement('div');
      fail.className = 'nu-empty';
      fail.textContent = 'Registry failed to load. Check browser console.';
      root.appendChild(fail);
    }
  }
})();
