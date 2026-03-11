(function () {
  function trimTemplate(value) {
    const lines = value.replace(/^\n+|\n+$/g, '').split('\n');
    const indents = lines
      .filter((line) => line.trim().length > 0)
      .map((line) => line.match(/^\s*/)[0].length);
    const minIndent = indents.length ? Math.min.apply(null, indents) : 0;
    return lines.map((line) => line.slice(minIndent)).join('\n').trim();
  }

  function escapeHTML(value) {
    return value
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;');
  }

  function indentBlock(value, spaces) {
    const pad = ' '.repeat(spaces);
    return value
      .split('\n')
      .map((line) => (line.length ? pad + line : line))
      .join('\n');
  }

  async function copyText(value) {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(value);
      return;
    }

    const area = document.createElement('textarea');
    area.value = value;
    area.style.position = 'fixed';
    area.style.top = '-9999px';
    document.body.append(area);
    area.select();
    document.execCommand('copy');
    area.remove();
  }

  function buildUsage(snippetValue) {
    return [
      '<link rel="stylesheet" href="./styles/noir-ui.css">',
      '',
      '<body class="nu-theme">',
      '  <main class="nu-container">',
      indentBlock(snippetValue, 4),
      '  </main>',
      '',
      '  <script src="./scripts/components.js"><\/script>',
      '  <script>',
      '    window.noirComponents.init();',
      '  <\/script>',
      '</body>'
    ].join('\n');
  }

  function normalizeSnippet(value) {
    const next = String(value || '');
    if (next.trim().length) return next;
    return '<!-- empty snippet -->';
  }

  const root = document.querySelector('[data-component-page]');
  const template = document.querySelector('template[data-snippet]');
  if (!root || !template) return;

  const component = root.dataset.componentPage || 'component';
  const baseSnippet = trimTemplate(template.innerHTML);
  let currentSnippet = baseSnippet;

  const previewEl = document.querySelector('[data-preview]');
  const codeEl = document.querySelector('[data-code]');
  const usageEl = document.querySelector('[data-usage]');

  const copySnippetButton = document.querySelector('[data-copy-snippet]');
  const copyUsageButton = document.querySelector('[data-copy-usage]');
  const status = document.querySelector('[data-copy-status]');
  const tabRoot = document.querySelector('[data-view-tabs]');

  const liveEditor = document.querySelector('[data-live-editor]');
  const liveRunButton = document.querySelector('[data-live-run]');
  const liveResetButton = document.querySelector('[data-live-reset]');
  const liveStatus = document.querySelector('[data-live-status]');

  function setLiveStatus(text, timeout) {
    if (!liveStatus) return;
    liveStatus.textContent = text;
    if (timeout) {
      window.setTimeout(function () {
        if (liveStatus.textContent === text) liveStatus.textContent = '';
      }, timeout);
    }
  }

  function renderSnippet(nextSnippet) {
    const value = normalizeSnippet(nextSnippet);
    currentSnippet = value;

    if (previewEl) {
      previewEl.innerHTML = value;
      if (window.noirComponents && typeof window.noirComponents.init === 'function') {
        window.noirComponents.init(previewEl);
      }
    }

    if (codeEl) codeEl.innerHTML = escapeHTML(value);
    if (usageEl) usageEl.innerHTML = escapeHTML(buildUsage(value));
  }

  if (liveEditor) {
    liveEditor.value = baseSnippet;

    liveEditor.addEventListener('keydown', function (event) {
      if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
        event.preventDefault();
        renderSnippet(liveEditor.value);
        setLiveStatus('Applied', 1200);
      }
    });
  }

  if (liveRunButton && liveEditor) {
    liveRunButton.addEventListener('click', function () {
      renderSnippet(liveEditor.value);
      setLiveStatus('Applied', 1200);
    });
  }

  if (liveResetButton && liveEditor) {
    liveResetButton.addEventListener('click', function () {
      liveEditor.value = baseSnippet;
      renderSnippet(baseSnippet);
      setLiveStatus('Reset', 1200);
    });
  }

  renderSnippet(baseSnippet);

  const rawPathEl = document.querySelector('[data-raw-path]');
  if (rawPathEl) {
    const rawPath = '../components/' + component + '.html';
    rawPathEl.textContent = rawPath;
    rawPathEl.setAttribute('href', rawPath);
  }

  async function handleCopy(value, button) {
    try {
      await copyText(value);
      if (status) {
        status.textContent = 'Copied';
        window.setTimeout(function () {
          status.textContent = '';
        }, 1200);
      }
      if (button) {
        const old = button.textContent;
        button.textContent = 'Copied';
        window.setTimeout(function () {
          button.textContent = old;
        }, 1200);
      }
    } catch (error) {
      if (button) {
        const old = button.textContent;
        button.textContent = 'Copy failed';
        window.setTimeout(function () {
          button.textContent = old;
        }, 1400);
      }
    }
  }

  if (copySnippetButton) {
    copySnippetButton.addEventListener('click', function () {
      const value = liveEditor ? liveEditor.value : currentSnippet;
      handleCopy(value, copySnippetButton);
    });
  }

  if (copyUsageButton) {
    copyUsageButton.addEventListener('click', function () {
      const value = liveEditor ? normalizeSnippet(liveEditor.value) : currentSnippet;
      handleCopy(buildUsage(value), copyUsageButton);
    });
  }

  function setActivePane(name) {
    const paneName = name === 'code' || name === 'usage' ? name : 'preview';
    document.querySelectorAll('[data-pane]').forEach(function (pane) {
      pane.classList.toggle('nu-hidden', pane.dataset.pane !== paneName);
    });
    document.querySelectorAll('[data-view]').forEach(function (tab) {
      tab.classList.toggle('is-active', tab.dataset.view === paneName);
    });
  }

  if (tabRoot) {
    tabRoot.addEventListener('click', function (event) {
      const tab = event.target.closest('[data-view]');
      if (!tab) return;
      setActivePane(tab.dataset.view);
    });
  }

  setActivePane('preview');

  document.addEventListener('click', function (event) {
    const button = event.target.closest('[data-nu-toggle-group] button');
    if (!button) return;

    const group = button.closest('[data-nu-toggle-group]');
    if (!group) return;

    group.querySelectorAll('.is-active').forEach(function (element) {
      element.classList.remove('is-active');
    });

    button.classList.add('is-active');
  });
})();
