// Menu selectable active class _____________________________________________________
(() => {
    // Utility: apply .active to the label that points at an input (by id)
    function setLabelActiveByInput(input, isActive) {
        if (!input || !input.id) return;
        const label = document.querySelector(`label.menu-item[for="${input.id}"]`);
        if (label) label.classList.toggle('active', !!isActive);
    }

    // Update .active classes when a single input changes
    function updateForInput(input) {
        if (!(input instanceof HTMLInputElement)) return;

        if (input.type === 'radio') {
        // Clear/set active across the whole radio group (same name)
        const name = input.name;
        if (!name) return;
        const group = document.querySelectorAll(
            `input.submenu-item-selectable[type="radio"][name="${CSS && CSS.escape ? CSS.escape(name) : name}"]`
        );
        group.forEach(r => setLabelActiveByInput(r, r.checked));
        } else if (input.type === 'checkbox') {
        setLabelActiveByInput(input, input.checked);
        }
    }

    // Initial sync for any pre-checked inputs
    document.querySelectorAll('input.submenu-item-selectable').forEach(updateForInput);

    // Event delegation: catch changes from any submenu selectable input
    document.addEventListener('change', (e) => {
        const input = e.target.closest('input.submenu-item-selectable');
        if (!input) return;
        updateForInput(input);
    });
})();



// Menu aria sync ___________________________________________________________________
document.addEventListener('DOMContentLoaded', () => {
    const esc = (s) => (window.CSS && CSS.escape) ? CSS.escape(s) : String(s).replace(/[^a-z0-9_\-]/gi,'_');
    const uid = (p) => `${p}-${Math.random().toString(36).slice(2,8)}`;
    const ensureId = (el, p) => (el.id ||= uid(p));

    // --- Top-level menu: aria-expanded mirrors .show on .menu-panel ---
    document.querySelectorAll('.menu').forEach(menu => {
        const panel  = menu.querySelector('.menu-panel');
        const toggle = menu.querySelector('.menu-toggle');
        if (!panel || !toggle) return;

        toggle.setAttribute('aria-controls', ensureId(panel, 'menu-panel'));
        const syncTop = () => toggle.setAttribute('aria-expanded', panel.classList.contains('show') ? 'true' : 'false');
        syncTop();
        new MutationObserver(syncTop).observe(panel, { attributes: true, attributeFilter: ['class'] });
    });

    // --- Submenus: keep selectable submenus open while interacting ---
document.querySelectorAll('.menu-body > li').forEach(li => {
    const toggle  = li.querySelector(':scope > .submenu-toggle');
    const submenu = li.querySelector(':scope > .submenu');
    if (!toggle || !submenu) return;

    const hasSelectableItems = !!submenu.querySelector('.submenu-item-selectable');

    toggle.setAttribute('aria-controls', ensureId(submenu, 'submenu'));

    function isInteractiveWithin() {
        return li.matches(':hover') || li.contains(document.activeElement);
    }

    function openSubmenu() {
        li.classList.add('submenu-open');
        submenu.classList.add('show');
        toggle.setAttribute('aria-expanded', 'true');
    }

    function closeSubmenu() {
        li.classList.remove('submenu-open');
        submenu.classList.remove('show');
        toggle.setAttribute('aria-expanded', 'false');
    }

    function syncSubmenuState() {
        if (li.classList.contains('submenu-pinned')) {
            openSubmenu();
            return;
        }
        if (isInteractiveWithin()) {
            openSubmenu();
        } else {
            closeSubmenu();
        }
    }

    // Hover/focus behavior
    li.addEventListener('mouseenter', openSubmenu);
    li.addEventListener('mouseleave', () => {
        if (!li.classList.contains('submenu-pinned')) closeSubmenu();
    });

    li.addEventListener('focusin', openSubmenu);
    li.addEventListener('focusout', () => {
        requestAnimationFrame(syncSubmenuState);
    });

    // Clicking submenu toggle opens it; selectable submenu gets pinned open
    toggle.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (hasSelectableItems) {
            li.classList.add('submenu-pinned');
            openSubmenu();
        } else {
            const isOpen = li.classList.contains('submenu-open');
            if (isOpen) {
                closeSubmenu();
            } else {
                openSubmenu();
            }
        }
    });

    // Clicking selectable items keeps submenu open
    submenu.addEventListener('click', (e) => {
        const selectable = e.target.closest('.submenu-item-selectable, label.menu-item[for]');
        if (!selectable || !hasSelectableItems) return;

        li.classList.add('submenu-pinned');
        openSubmenu();
        e.stopPropagation();
    });

    // Keyboard interaction on selectable items keeps submenu open
    submenu.addEventListener('keydown', (e) => {
        const onSelectable = e.target.closest('.submenu-item-selectable, label.menu-item[for]');
        if (!onSelectable || !hasSelectableItems) return;

        if (e.key === ' ' || e.key === 'Enter') {
            li.classList.add('submenu-pinned');
            openSubmenu();
            e.stopPropagation();
        }
    });

    // Clicking elsewhere in the same menu closes pinned submenu
    const rootMenu = li.closest('.menu');
    rootMenu?.addEventListener('click', (e) => {
        if (!li.contains(e.target)) {
            li.classList.remove('submenu-pinned');
            closeSubmenu();
        }
    });

    // When the top-level dropdown hides, reset submenu state
    const topPanel = li.closest('.dropdown-menu');
    if (topPanel) {
        topPanel.addEventListener('hide.bs.dropdown', () => {
            li.classList.remove('submenu-pinned');
            closeSubmenu();
        });
    }

    syncSubmenuState();
});

    // --- Selectable submenu items: keep aria-checked + .active in sync ---
    function syncSelectable(input) {
        const label = document.querySelector(`label.menu-item[for="${input.id}"]`);
        if (!label) return;

        // ensure role on label
        if (!label.hasAttribute('role')) {
        label.setAttribute('role', input.type === 'radio' ? 'menuitemradio' : 'menuitemcheckbox');
        }

        if (input.type === 'checkbox') {
        label.setAttribute('aria-checked', input.checked ? 'true' : 'false');
        label.classList.toggle('active', input.checked);
        return;
        }

        // radio: update whole group
        if (input.type === 'radio') {
        const name = input.name || uid('radio');
        document.querySelectorAll(`input.submenu-item-selectable[type="radio"][name="${esc(name)}"]`).forEach(r => {
            const l = document.querySelector(`label.menu-item[for="${r.id}"]`);
            if (l) {
            l.setAttribute('aria-checked', r.checked ? 'true' : 'false');
            l.classList.toggle('active', r.checked);
            }
        });
        }
    }

    // Ensure inputs have ids, then initial sync
    document.querySelectorAll('input.submenu-item-selectable').forEach(input => {
        if (!input.id) input.id = uid('sel');
        syncSelectable(input);
    });

    // React to user changes (mouse or keyboard)
    document.addEventListener('change', (e) => {
        const input = e.target.closest('input.submenu-item-selectable');
        if (input) syncSelectable(input);
    });

    // If labels are focusable and used with Enter/Space, re-sync on key press too
    document.addEventListener('keydown', (e) => {
        const label = e.target.closest('label.menu-item[for]');
        if (!label) return;
        if (e.key === 'Enter' || e.key === ' ') {
        // wait for the browser/your other handlers to toggle the input, then sync
        requestAnimationFrame(() => {
            const input = document.getElementById(label.getAttribute('for'));
            if (input) syncSelectable(input);
        });
        }
    });
});



// Make the menu at least the same width as the menu-toggle _________________________
// Ensure this runs after Bootstrap JS is loaded
(function () {
    function setMinWidth(toggle) {
        // Get Bootstrap dropdown instance and its menu element
        const dd = bootstrap.Dropdown.getOrCreateInstance(toggle);
        const menu = dd?._menu
        || document.getElementById(toggle.getAttribute('aria-controls'))
        || toggle.nextElementSibling;

        if (!menu) return;
        const w = Math.ceil(toggle.getBoundingClientRect().width);
        menu.style.minWidth = w + 'px';
    }

    // Before/after show to catch both initial and final layout
    document.addEventListener('show.bs.dropdown',  e => setMinWidth(e.target));
    document.addEventListener('shown.bs.dropdown', e => setMinWidth(e.target));

    // Keep width in sync while open (e.g., on resize)
    window.addEventListener('resize', () => {
        document.querySelectorAll('[data-bs-toggle="dropdown"][aria-expanded="true"]')
        .forEach(setMinWidth);
    });
})();
