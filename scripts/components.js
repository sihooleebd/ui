(function () {
  var INIT_ATTR = 'data-nu-init';

  function toArray(nodeList) {
    return Array.prototype.slice.call(nodeList || []);
  }

  function qsa(root, selector) {
    return toArray((root || document).querySelectorAll(selector));
  }

  function closest(node, selector) {
    if (!node) return null;
    if (node.closest) return node.closest(selector);
    var cur = node;
    while (cur) {
      if (cur.matches && cur.matches(selector)) return cur;
      cur = cur.parentElement;
    }
    return null;
  }

  function createId(prefix) {
    return prefix + '-' + Math.random().toString(36).slice(2, 9);
  }

  function getFocusable(container) {
    return qsa(
      container,
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    ).filter(function (el) {
      return el.offsetParent !== null || el === document.activeElement;
    });
  }

  function trapFocus(container, event) {
    if (event.key !== 'Tab') return;
    var focusable = getFocusable(container);
    if (!focusable.length) return;
    var first = focusable[0];
    var last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function wireDismissable(root, opts) {
    var trigger = root.querySelector(opts.triggerSelector || '[data-nu-trigger]');
    var panel = root.querySelector(opts.panelSelector || '[data-nu-panel]');
    var closeButtons = qsa(root, '[data-nu-close]');
    var overlay = root.querySelector('[data-nu-overlay]');
    var openClass = opts.openClass || 'is-open';
    var focusTrap = !!opts.focusTrap;

    if (!trigger || !panel) return;

    if (!panel.id) panel.id = createId('nu-panel');
    trigger.setAttribute('aria-controls', panel.id);
    trigger.setAttribute('aria-expanded', 'false');

    function setOpen(next) {
      root.classList.toggle(openClass, next);
      trigger.setAttribute('aria-expanded', next ? 'true' : 'false');
      if (next) {
        var focusable = getFocusable(panel);
        if (focusable[0]) focusable[0].focus();
      } else {
        trigger.focus();
      }
    }

    function onDocClick(event) {
      if (!root.classList.contains(openClass)) return;
      var inside = closest(event.target, '[data-nu-dismissable]') === root;
      if (!inside) setOpen(false);
    }

    function onRootKeydown(event) {
      if (!root.classList.contains(openClass)) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        setOpen(false);
        return;
      }
      if (focusTrap) {
        trapFocus(panel, event);
      }
    }

    trigger.addEventListener('click', function () {
      setOpen(!root.classList.contains(openClass));
    });

    closeButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        setOpen(false);
      });
    });

    if (overlay) {
      overlay.addEventListener('click', function () {
        setOpen(false);
      });
    }

    document.addEventListener('click', onDocClick);
    root.addEventListener('keydown', onRootKeydown);
  }

  function initPopover(root) {
    qsa(root, '[data-nu-popover]').forEach(function (el) {
      if (el.getAttribute(INIT_ATTR)) return;
      el.setAttribute(INIT_ATTR, 'true');
      el.setAttribute('data-nu-dismissable', '');
      wireDismissable(el, { openClass: 'is-open' });
    });
  }

  function initTooltip(root) {
    qsa(root, '[data-nu-tooltip]').forEach(function (el) {
      if (el.getAttribute(INIT_ATTR)) return;
      el.setAttribute(INIT_ATTR, 'true');

      var trigger = el.querySelector('[data-nu-trigger]');
      var panel = el.querySelector('[data-nu-panel]');
      if (!trigger || !panel) return;

      function show() {
        el.classList.add('is-open');
      }

      function hide() {
        el.classList.remove('is-open');
      }

      trigger.addEventListener('mouseenter', show);
      trigger.addEventListener('mouseleave', hide);
      trigger.addEventListener('focus', show);
      trigger.addEventListener('blur', hide);
    });
  }

  function initContextMenu(root) {
    qsa(root, '[data-nu-context-menu]').forEach(function (el) {
      if (el.getAttribute(INIT_ATTR)) return;
      el.setAttribute(INIT_ATTR, 'true');

      var area = el.querySelector('[data-nu-area]');
      var panel = el.querySelector('[data-nu-panel]');
      if (!area || !panel) return;

      function close() {
        el.classList.remove('is-open');
      }

      area.addEventListener('contextmenu', function (event) {
        event.preventDefault();
        panel.style.left = event.clientX + 'px';
        panel.style.top = event.clientY + 'px';
        el.classList.add('is-open');
      });

      document.addEventListener('click', function (event) {
        if (!el.classList.contains('is-open')) return;
        if (!closest(event.target, '[data-nu-context-menu]')) close();
      });

      document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') close();
      });
    });
  }

  function initRowMenu(root) {
    qsa(root, '[data-nu-row-menu]').forEach(function (el) {
      if (el.getAttribute(INIT_ATTR + '-rm')) return;
      el.setAttribute(INIT_ATTR + '-rm', 'true');

      var trigger = el.querySelector('[data-nu-trigger]');
      var menu = el.querySelector('[data-nu-menu]');
      if (!trigger || !menu) return;

      function setOpen(next) {
        el.classList.toggle('is-open', next);
        trigger.setAttribute('aria-expanded', next ? 'true' : 'false');
      }

      trigger.setAttribute('aria-expanded', 'false');

      trigger.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        setOpen(!el.classList.contains('is-open'));
      });

      qsa(el, '[role="menuitem"]').forEach(function (item) {
        item.addEventListener('click', function () {
          setOpen(false);
        });
      });

      document.addEventListener('click', function (event) {
        if (!el.classList.contains('is-open')) return;
        if (!closest(event.target, '[data-nu-row-menu]')) {
          setOpen(false);
        }
      });

      document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape' && el.classList.contains('is-open')) {
          setOpen(false);
        }
      });
    });
  }

  function initDrawerLike(root) {
    qsa(root, '[data-nu-drawer], [data-nu-sheet], [data-nu-bottom-sheet], [data-nu-notification-center], [data-nu-command-palette], [data-nu-fab]').forEach(function (el) {
      if (el.getAttribute(INIT_ATTR)) return;
      el.setAttribute(INIT_ATTR, 'true');
      el.setAttribute('data-nu-dismissable', '');

      var shouldTrap = el.hasAttribute('data-nu-drawer') || el.hasAttribute('data-nu-command-palette');
      wireDismissable(el, {
        openClass: 'is-open',
        focusTrap: shouldTrap,
        triggerSelector: '[data-nu-open], [data-nu-trigger]',
        panelSelector: '[data-nu-panel]'
      });
    });
  }

  function initResizable(root) {
    qsa(root, '[data-nu-resizable]').forEach(function (el) {
      if (el.getAttribute(INIT_ATTR)) return;
      el.setAttribute(INIT_ATTR, 'true');

      var handle = el.querySelector('[data-nu-handle]');
      if (!handle) return;

      var startX = 0;
      var startWidth = 0;
      var dragging = false;

      function onMove(event) {
        if (!dragging) return;
        var next = startWidth + (event.clientX - startX);
        var min = 180;
        var max = Math.max(min + 80, el.clientWidth - 180);
        next = Math.min(max, Math.max(min, next));
        el.style.gridTemplateColumns = next + 'px 8px minmax(0,1fr)';
      }

      function onUp() {
        dragging = false;
        document.body.classList.remove('nu-resizing');
      }

      handle.addEventListener('mousedown', function (event) {
        event.preventDefault();
        dragging = true;
        startX = event.clientX;
        startWidth = el.querySelector('[data-nu-panel-a]')
          ? el.querySelector('[data-nu-panel-a]').getBoundingClientRect().width
          : 260;
        document.body.classList.add('nu-resizing');
      });

      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    });
  }

  function initCommandPalette(root) {
    qsa(root, '[data-nu-command-palette]').forEach(function (el) {
      if (el.getAttribute(INIT_ATTR + '-cp')) return;
      el.setAttribute(INIT_ATTR + '-cp', 'true');

      var input = el.querySelector('[data-nu-input]');
      var items = qsa(el, '[data-nu-item]');
      if (!input || !items.length) return;

      var active = 0;

      function setActive(index) {
        active = Math.max(0, Math.min(items.length - 1, index));
        items.forEach(function (item, i) {
          item.classList.toggle('is-active', i === active);
          item.setAttribute('aria-selected', i === active ? 'true' : 'false');
        });
      }

      setActive(0);

      input.addEventListener('keydown', function (event) {
        if (event.key === 'ArrowDown') {
          event.preventDefault();
          setActive(active + 1);
        } else if (event.key === 'ArrowUp') {
          event.preventDefault();
          setActive(active - 1);
        } else if (event.key === 'Enter') {
          event.preventDefault();
          if (items[active]) items[active].click();
        }
      });

      items.forEach(function (item, i) {
        item.addEventListener('mouseenter', function () {
          setActive(i);
        });
      });
    });
  }

  function initMultiSelect(root) {
    qsa(root, '[data-nu-multi-select]').forEach(function (el) {
      if (el.getAttribute(INIT_ATTR + '-ms')) return;
      el.setAttribute(INIT_ATTR + '-ms', 'true');

      var valueEl = el.querySelector('[data-nu-value]');
      var chipsEl = el.querySelector('[data-nu-chips]');
      var options = qsa(el, '[data-nu-option]');

      function getOptionValue(option) {
        return option.getAttribute('data-nu-option') || option.textContent || '';
      }

      function render() {
        var selected = options.filter(function (op) {
          return op.classList.contains('is-selected');
        });

        var deduped = [];
        var seen = Object.create(null);

        selected.forEach(function (op) {
          var key = getOptionValue(op).trim();
          if (!key || seen[key]) return;
          seen[key] = true;
          deduped.push(key);
        });

        if (valueEl) valueEl.textContent = deduped.length ? deduped.length + ' selected' : 'Select options';

        if (chipsEl) {
          chipsEl.replaceChildren();

          if (!deduped.length) {
            var empty = document.createElement('span');
            empty.className = 'nu-help';
            empty.textContent = 'No selection';
            chipsEl.appendChild(empty);
            return;
          }

          deduped.forEach(function (label) {
            var tag = document.createElement('span');
            tag.className = 'nu-multi-tag';
            tag.textContent = label;
            chipsEl.appendChild(tag);
          });
        }
      }

      options.forEach(function (op) {
        op.setAttribute('aria-selected', op.classList.contains('is-selected') ? 'true' : 'false');

        op.addEventListener('click', function () {
          op.classList.toggle('is-selected');
          op.setAttribute('aria-selected', op.classList.contains('is-selected') ? 'true' : 'false');
          render();
        });
      });

      render();
    });
  }

  function initDateRange(root) {
    qsa(root, '[data-nu-date-range]').forEach(function (el) {
      if (el.getAttribute(INIT_ATTR + '-dr')) return;
      el.setAttribute(INIT_ATTR + '-dr', 'true');

      var output = el.querySelector('[data-nu-output]');
      var days = qsa(el, '[data-nu-day]');
      var start = null;
      var end = null;

      function render() {
        days.forEach(function (day) {
          var n = Number(day.getAttribute('data-nu-day'));
          var active = start && end && n >= start && n <= end;
          day.classList.toggle('is-active', !!active);
        });
        if (output) {
          if (!start) output.textContent = 'No range';
          else if (!end) output.textContent = 'Start: ' + start;
          else output.textContent = start + ' - ' + end;
        }
      }

      days.forEach(function (day) {
        day.addEventListener('click', function () {
          var n = Number(day.getAttribute('data-nu-day'));
          if (!start || (start && end)) {
            start = n;
            end = null;
          } else if (n < start) {
            end = start;
            start = n;
          } else {
            end = n;
          }
          render();
        });
      });

      render();
    });
  }

  function initTimePicker(root) {
    qsa(root, '[data-nu-time-picker]').forEach(function (el) {
      if (el.getAttribute(INIT_ATTR + '-tp')) return;
      el.setAttribute(INIT_ATTR + '-tp', 'true');

      var hour = Number(el.getAttribute('data-hour') || 9);
      var minute = Number(el.getAttribute('data-minute') || 0);
      var output = el.querySelector('[data-nu-output]');

      function render() {
        if (!output) return;
        var hh = String((hour + 24) % 24).padStart(2, '0');
        var mm = String((minute + 60) % 60).padStart(2, '0');
        output.textContent = hh + ':' + mm;
      }

      function bind(selector, fn) {
        var btn = el.querySelector(selector);
        if (!btn) return;
        btn.addEventListener('click', function () {
          fn();
          render();
        });
      }

      bind('[data-nu-hour-inc]', function () { hour += 1; });
      bind('[data-nu-hour-dec]', function () { hour -= 1; });
      bind('[data-nu-minute-inc]', function () { minute += 5; });
      bind('[data-nu-minute-dec]', function () { minute -= 5; });
      render();
    });
  }

  function initStepForm(root) {
    qsa(root, '[data-nu-step-form]').forEach(function (el) {
      if (el.getAttribute(INIT_ATTR + '-sf')) return;
      el.setAttribute(INIT_ATTR + '-sf', 'true');

      var steps = qsa(el, '[data-nu-step]');
      var idx = 0;

      function render() {
        steps.forEach(function (step, i) {
          step.classList.toggle('nu-hidden', i !== idx);
        });
      }

      qsa(el, '[data-nu-next]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          idx = Math.min(steps.length - 1, idx + 1);
          render();
        });
      });

      qsa(el, '[data-nu-prev]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          idx = Math.max(0, idx - 1);
          render();
        });
      });

      render();
    });
  }

  function initInlineEdit(root) {
    qsa(root, '[data-nu-inline-edit]').forEach(function (el) {
      if (el.getAttribute(INIT_ATTR + '-ie')) return;
      el.setAttribute(INIT_ATTR + '-ie', 'true');

      var display = el.querySelector('[data-nu-display]');
      var input = el.querySelector('[data-nu-input]');
      var edit = el.querySelector('[data-nu-edit]');
      var save = el.querySelector('[data-nu-save]');
      var cancel = el.querySelector('[data-nu-cancel]');

      if (!display || !input || !edit) return;

      var prev = input.value;

      function setMode(editing) {
        el.classList.toggle('is-editing', editing);
        if (editing) input.focus();
      }

      edit.addEventListener('click', function () {
        prev = input.value;
        setMode(true);
      });

      if (save) {
        save.addEventListener('click', function () {
          display.textContent = input.value || prev;
          setMode(false);
        });
      }

      if (cancel) {
        cancel.addEventListener('click', function () {
          input.value = prev;
          setMode(false);
        });
      }
    });
  }

  function initPasswordStrength(root) {
    qsa(root, '[data-nu-password-strength]').forEach(function (el) {
      if (el.getAttribute(INIT_ATTR + '-ps')) return;
      el.setAttribute(INIT_ATTR + '-ps', 'true');

      var input = el.querySelector('[data-nu-input]');
      var bar = el.querySelector('[data-nu-bar]');
      var label = el.querySelector('[data-nu-label]');
      if (!input || !bar || !label) return;

      function score(value) {
        var s = 0;
        if (value.length >= 8) s += 1;
        if (/[A-Z]/.test(value)) s += 1;
        if (/[0-9]/.test(value)) s += 1;
        if (/[^A-Za-z0-9]/.test(value)) s += 1;
        return s;
      }

      function render() {
        var s = score(input.value);
        var pct = (s / 4) * 100;
        bar.style.width = pct + '%';
        label.textContent = ['Weak', 'Weak', 'Fair', 'Good', 'Strong'][s];
      }

      input.addEventListener('input', render);
      render();
    });
  }

  function initToastStack(root) {
    qsa(root, '[data-nu-toast-stack]').forEach(function (el) {
      if (el.getAttribute(INIT_ATTR + '-ts')) return;
      el.setAttribute(INIT_ATTR + '-ts', 'true');

      var stack = el.querySelector('[data-nu-stack]');
      var add = el.querySelector('[data-nu-add]');
      if (!stack || !add) return;

      function bindDismiss(scope) {
        qsa(scope, '[data-nu-dismiss]').forEach(function (btn) {
          btn.addEventListener('click', function () {
            var item = closest(btn, '[data-nu-toast]');
            if (item && item.parentNode) item.parentNode.removeChild(item);
          });
        });
      }

      add.addEventListener('click', function () {
        var item = document.createElement('div');
        item.className = 'nu-toast';
        item.setAttribute('data-nu-toast', '');
        item.innerHTML =
          '<div><div class="nu-toast-title">Saved</div><div class="nu-toast-copy">Changes were synced.</div></div>' +
          '<button class="nu-btn nu-btn-sm" type="button" data-nu-dismiss>Dismiss</button>';
        stack.insertBefore(item, stack.firstChild);
        bindDismiss(item);
      });

      bindDismiss(el);
    });
  }

  function initShortcutHint(root) {
    qsa(root, '[data-nu-shortcut-hint]').forEach(function (el) {
      if (el.getAttribute(INIT_ATTR + '-sh')) return;
      el.setAttribute(INIT_ATTR + '-sh', 'true');

      var output = el.querySelector('[data-nu-last-key]');
      if (!output) return;

      document.addEventListener('keydown', function (event) {
        if (event.target && /input|textarea/i.test(event.target.tagName)) return;
        output.textContent = event.key;
      });
    });
  }

  function init(root) {
    var scope = root || document;
    initPopover(scope);
    initTooltip(scope);
    initContextMenu(scope);
    initRowMenu(scope);
    initDrawerLike(scope);
    initResizable(scope);
    initCommandPalette(scope);
    initMultiSelect(scope);
    initDateRange(scope);
    initTimePicker(scope);
    initStepForm(scope);
    initInlineEdit(scope);
    initPasswordStrength(scope);
    initToastStack(scope);
    initShortcutHint(scope);
  }

  window.noirComponents = {
    init: init
  };
})();
