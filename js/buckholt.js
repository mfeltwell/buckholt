import './components/menu.js';
import './components/tag.js';
import './components/form.js';
import './components/card.js';
import './components/slider.js';
import './components/tabs.js';
import './components/table.js';
import './components/dropdown.js';

// Add class to Gutenberg group block ____________________________________________
if($('.wp-block-group').children().length > 0) {
    $('.wp-block-group > .wp-block-group__inner-container').addClass('page-panel');
}



// Accordion parent IDs __________________________________________________________
$(document).ready(function() {
    var parentId = $('.accordion-collapse').parents('.accordion').attr('id');

    if ($('.accordion').hasClass('single-expansion')) {
        $('#' + parentId + ' .accordion-collapse').attr('data-bs-parent', '#' + parentId);
    }
});



// Slick carousel ________________________________________________________________
$(document).ready(function(){
    $('.carousel-body').slick({
        infinite: true,
        slidesToShow: 2,
        slidesToScroll: 1,
        arrows: false, // using custom arrows - carousel indicators
        // fade: true,
        dots: true,
        respondTo: 'slider',
        autoplay: true,
        autoplaySpeed: 5000,
        responsive: [{
            breakpoint: 1024,
            settings: {
                slidesToShow: 2
            }
        },
        {
            breakpoint: 768,
            settings: {
                slidesToShow: 1
            }
        }]
    });

    $('.carousel-control-next').click(function() {
        $(this).parents('.carousel').find('.carousel-body').slick('slickNext');
    });

    $('.carousel-control-prev').click(function() {
        $(this).parents('.carousel').find('.carousel-body').slick('slickPrev');
    });

    $('.slick-dots').addClass('carousel-indicators');
    
    $(window).resize(function(){
        $('.slick-dots').addClass('carousel-indicators');
    })
});



// Build table of contents _______________________________________________________
$(document).ready(function () {
    var toc = document.getElementById("ToC");
    if (!toc) return;

    // Add header
    var tocHeader = document.createElement("h2");
    tocHeader.className = "toc-title title-01";
    tocHeader.innerText = "On this page";
    toc.appendChild(tocHeader);

    var tocList = document.createElement("ul");

    // Find headings inside .heading blocks
    $('.text-block h2, .text-block h3').each(function () {
        var $heading = $(this);
        var anchor = $heading.closest('.text-block').find('a.anchor[id]').first();

        if (anchor.length) {
            var tocListItem = document.createElement("li");
            tocListItem.className = $heading.prop('nodeName');

            var tocEntry = document.createElement("a");
            tocEntry.setAttribute("href", "#" + anchor.attr('id'));
            tocEntry.innerText = $heading.text().trim();

            tocListItem.appendChild(tocEntry);
            tocList.appendChild(tocListItem);
        }
    });

    toc.appendChild(tocList);
});



// Dos & donts ___________________________________________________________________
$(document).ready(function () {
    var dosinsert = '<span class="do-label label-02">Do:</span>',
        dontsinsert = '<span class="dont-label label-02">Don&#39;t:</span>';

        $('.card-do').before(dosinsert);
        $('.card-dont').before(dontsinsert);
});



// Set input states ______________________________________________________________
$(document).ready(function () {
    $('.state_disabled').find('.form-control').prop("disabled", true);
    $('.state_readonly').find('.form-control').prop("readonly", true);
    $('.state_disabled').find('.form-select').prop("disabled", true);
    $('.state_readonly').find('.form-select').prop("disabled", true);
    $('.state_readonly').find('.form-select').addClass("readonly");
    $('.state_disabled .dropdown').find('.dropdown-toggle').prop("disabled", true);
    $('.state_readonly .dropdown').find('.dropdown-toggle').prop("disabled", true);
    $('.state_readonly .dropdown').find('.dropdown-toggle').addClass("readonly");
    $('.state_readonly .dropdown').find('.dropdown-label').text("Option 1");

    $('.accordion.state_disabled').find('.accordion-button').prop("disabled", true);
});


// Get parent ID for innerblock text input and handle multi-inputs
$(document).ready(function () {
  // skip entirely if any .input contains a .dropdown (your original condition)
    if ($('.input').find('.dropdown, .form-slider').length === 0) {
        // Only run if at least one .input has a child with .form-control
        if ($('.input').has('.form-control').length > 0) {

        // Loop through only those .input elements that contain .form-control
        $('.input').has('.form-control').each(function () {
            var $inputWrapper = $(this);
            var $formControls = $inputWrapper.find('.form-control');
            var $formLabel = $inputWrapper.find('.form-label');

            if ($formControls.length === 0) return; // nothing to do

            // Grab current label for (if present) and normalize a base id
            var labelFor = $formLabel.attr('for') || '';
            // If labelFor ends with a -<number>, strip that so we can re-append indices
            var baseFromLabel = labelFor.replace(/-\d+$/, '');

            // If there is no usable labelFor, attempt to derive a base from the first input id
            var firstInputId = $formControls.first().attr('id') || '';
            var baseFromInput = firstInputId.replace(/-\d+$/, '');

            // Choose base id: prefer label, fall back to first input id
            var baseId = baseFromLabel || baseFromInput;

            // If we still don't have a base, fall back to a safe default (generate a unique base)
            if (!baseId) {
            // create a simple unique base using timestamp to avoid collisions
            baseId = 'input-' + Date.now();
            }
            // Iterate controls and assign new ids with -1, -2, ...
            $formControls.each(function (idx) {
            var i = idx + 1; // 1-based index
            var newId = baseId + '-' + i;

            // ensure the id is valid (no spaces)
            newId = newId.replace(/\s+/g, '-');

            $(this).attr('id', newId);

            // If this is the first input, update the label's for attribute
            if (i === 1 && $formLabel.length) {
                $formLabel.attr('for', newId);
            }
            });

        }); // end each .input
        }
    }
});

// Get parent ID for innerblock select input
$(document).ready(function () {
    // Only run if at least one .input has a child with .form-select
    if ($('.input').has('.form-select').length > 0) {
        // Loop through only those .input elements that contain .form-select
        $('.input').has('.form-select').each(function () {
            var $formSelect = $(this).find('.form-select');
            var $formLabel = $(this).find('.form-label');

            var inputID = $formSelect.attr('id');
            var labelID = $formLabel.attr('for');

            if (inputID && labelID) {
                var suffix = inputID.split('_').pop();
                var newID = labelID.concat('_', suffix);

                $formSelect.attr('id', newID);
                $formLabel.attr('for', newID);
            }
        });
    }
});

// Get parent ID for innerblock dropdown input
$(document).ready(function () {
    // Only run if at least one .input has a child with .dropdown
    if ($('.input').has('.dropdown').length > 0) {
        // Loop through only those .input elements that contain .dropdown
        $('.input').has('.dropdown').each(function () {
            var $toggle = $(this).find('.dropdown-toggle');
            var $formLabel = $(this).find('.form-label');
            var $menu = $(this).find('.dropdown-menu');

            var inputID = $toggle.attr('id');
            var labelID = $formLabel.attr('for');

            if (inputID && labelID) {
                var suffix = inputID.split('_').pop();
                var newID = labelID.concat('_', suffix);

                $toggle.attr('id', newID);
                $formLabel.attr('for', newID);
                $menu.attr('aria-labelledby', newID);
            }
        });
    }
});

// Colour swatch label contrast _____________________________________________________
$(document).ready(function() {
    function getContrastYIQ(hexColor) {
        hexColor = hexColor.replace('#', '');

        const r = parseInt(hexColor.substr(0, 2), 16);
        const g = parseInt(hexColor.substr(2, 2), 16);
        const b = parseInt(hexColor.substr(4, 2), 16);

        const yiq = (r * 299 + g * 587 + b * 114) / 1000;

        return yiq >= 128 ? '#1a1a1a' : '#fff';
    }

    $('.colour-grid-swatch').each(function() {
        const $swatch = $(this);
        const hex = $swatch.data('hex'); // Assume each swatch has a data-hex="#RRGGBB"
        const $label = $swatch.find('.colour-label');
        const $nameTag = $swatch.find('.colour-name');

        if (hex) {
            const contrastColour = getContrastYIQ(hex);
            $label.css('color', contrastColour);
            $nameTag.css('color', contrastColour);
        }
    });
});



// Live toast launch ________________________________________________________________
$(document).ready(function() {
    const toastTrigger = document.getElementById('liveToastBtn')
    const toastLiveExample = document.getElementById('liveToast')

    if (toastTrigger) {
    const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toastLiveExample)
    toastTrigger.addEventListener('click', () => {
        toastBootstrap.show()
    })
    }
});



// Icon details modal _______________________________________________________________
document.addEventListener('DOMContentLoaded', function () {
    const modalEl = document.getElementById('iconModal');
    if (!modalEl) return;

    const footerEl   = modalEl.querySelector('.modal-footer');
    const downloadEl = modalEl.querySelector('#iconModalDownload');

    modalEl.addEventListener('show.bs.modal', function (event) {
        const crate = (event.relatedTarget instanceof Element)
        ? event.relatedTarget.closest('.icon_crate[data-bs-target="#iconModal"]')
        : null;
        if (!crate) return;

        const title   = crate.dataset.title   || '';
        const faName  = crate.dataset.faName  || '';
        const style   = crate.dataset.style   || '';
        const unicode = crate.dataset.unicode || '';
        const cats    = crate.dataset.categories || '';
        const role    = crate.dataset.role   || '';
        const svgUrl  = crate.dataset.svg    || '';

        // Title
        const labelEl = modalEl.querySelector('#iconModalLabel');
        if (labelEl) labelEl.textContent = title;

        // Preview icon
        const preview = modalEl.querySelector('#iconModalPreview');
        if (preview) {
        preview.className = '';
        preview.classList.add(`fa-${style}`, `fa-${faName}`);
        preview.setAttribute('aria-hidden', 'true');
        }

        // Details
        const faEl   = modalEl.querySelector('#iconModalFA');
        const uniEl  = modalEl.querySelector('#iconModalUnicode');
        const catEl  = modalEl.querySelector('#iconModalCategories');
        const styEl  = modalEl.querySelector('#iconModalStyle');
        const roleEl = modalEl.querySelector('#iconModalRole');

        if (faEl)  faEl.textContent  = faName || '—';
        if (uniEl) uniEl.textContent = unicode || '—';
        if (catEl) catEl.textContent = cats || '—';
        if (styEl) styEl.textContent = style || '—';

        if (roleEl) {
        if (role) {
            roleEl.textContent = role;
            roleEl.classList.remove('d-none');
        } else {
            roleEl.classList.add('d-none');
        }
        }

        // Code snippet
        const codeEl = modalEl.querySelector('#iconModalCode');
        if (codeEl) {
        codeEl.textContent = `<i class="fa-${style} fa-${faName}"></i>`;
        }

        // Footer visibility + download wiring
        if (footerEl) {
        footerEl.classList.toggle('d-none', !svgUrl);
        }
        if (downloadEl) {
        if (svgUrl) {
            downloadEl.onclick = async function () {
            const filename = `${(title || faName || 'icon').trim().toLowerCase().replace(/\s+/g, '-')}.svg`;

            // Try to fetch and force the filename (works with same-origin or CORS-enabled files)
            try {
                const res = await fetch(svgUrl, { mode: 'cors' });
                if (!res.ok) throw new Error('Fetch failed');
                const blob = await res.blob();
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            } catch (err) {
                // Fallback: direct link (filename may be controlled by server/browser)
                const a = document.createElement('a');
                a.href = svgUrl;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            }
            };
        } else {
            downloadEl.onclick = null;
        }
        }
    });
});



// Prevent tooltips scroll to top of page on click __________________________________
// delegated handler — runs for current and future nodes
$(document).on('click', 'a[data-bs-toggle="tooltip"][href="#"]', function (e) {
  e.preventDefault(); // stop jump-to-top
  // keep any other behaviour (e.g. bootstrap tooltip) intact
});



// Sticky page nav __________________________________________________________________
jQuery(function($){
    var $nav = $('#page_nav');
    if (!$nav.length) return;

    var headerHeight = parseInt($nav.data('sticky-offset')) || 0;
    var start = 0;
    var ticking = false;

    // Function to recalc the trigger point
    function updateTrigger() {
        // offset().top relative to document
        start = $nav.offset().top - headerHeight;
    }

    function onScroll() {
        var scrollTop = $(window).scrollTop();

        if (scrollTop >= start) {
            if (!$nav.hasClass('is-stuck')) $nav.addClass('is-stuck');
        } else {
            if ($nav.hasClass('is-stuck')) $nav.removeClass('is-stuck');
        }
    }

    // Run once after DOM ready
    updateTrigger();
    onScroll();

    // Throttle scroll events for performance
    $(window).on('scroll', function(){
        if (!ticking) {
            window.requestAnimationFrame(function(){
                onScroll();
                ticking = false;
            });
            ticking = true;
        }
    });

    // Recalc on resize and after everything loads
    $(window).on('resize load', function(){
        updateTrigger();
        onScroll();
    });
});



// Collapse sidebar ______________________________________________________________
$('#sidebar .menu-btn, #sidebar .btn-search').click(function(){

    if($(this).parents('#sidebar').hasClass('collapsed')) {
        $(this).parents('#sidebar').removeClass('collapsed');
        if ($(this).parents('#sidebar').hasClass('submenu-open')){
        $('.nav-item .submenu_toggle').addClass('collapsed').attr('aria-expanded', 'false');
        }
    } else {
        $(this).parents('#sidebar').addClass('collapsed');
        $('.nav-item .submenu_toggle').addClass('collapsed');
    }

    if($(this).parents('#sidebar').hasClass('submenu-open')) {
        $(this).parents('#sidebar').removeClass('submenu-open');
    }

    $('.sub-menu.show').removeClass('show');
    $('.nav-item .submenu_toggle').removeClass('active');

    });

    // $('#sidebar .submenu_toggle').click(function(){
    //   if(!$('.submenu_toggle').hasClass('collapsed')){
    //     $(this).parents('#sidebar').removeClass('collapsed');
    //   }
    // });

    $('#sidebar .search_btn').click(function(){
    $(this).parents('#sidebar').removeClass('collapsed');
    $(this).parents('#sidebar').promise().done(function(){
        $('#sidebar .search input').focus();
    });
});

// Sidebar submenus ______________________________________________________________
$('#sidebar .submenu_toggle').click(function(){
    var was_open = localStorage.getItem('menu_was_open');

    if(!$('#sidebar .submenu_toggle').hasClass('active')) {
        if(!$('#sidebar').hasClass('collapsed')) {
            localStorage.setItem('menu_was_open', 'yes');
        } else {
            localStorage.setItem('menu_was_open', 'no');
        }
    }

    if($(this).parents('#sidebar').hasClass('submenu-open')) {

        if($(this).hasClass('active')) {
            $(this).removeClass('active');
            $(this).addClass('collapsed').attr('aria-expanded', 'false');

            if (was_open == 'yes'){
                $(this).parents('#sidebar').removeClass('collapsed submenu-open');
            } else if(was_open == 'no'){
                $(this).parents('#sidebar').removeClass('submenu-open');
            }

        } else {
            $('#sidebar .submenu_toggle').removeClass('active');
            $(this).removeClass('collapsed').attr('aria-expanded', 'true');
            $(this).addClass('active');
        }


    } else {

        $(this).parents('#sidebar').addClass('collapsed submenu-open');
        $(this).removeClass('collapsed').attr('aria-expanded', 'true');
        $(this).addClass('active');
    }
});



$('.submenu_close').click(function(){
    var was_open = localStorage.getItem('menu_was_open');

    $('#sidebar .submenu_toggle').removeClass('active');

    if($(this).parents('#sidebar').hasClass('submenu-open')) {

        if (was_open == 'yes'){
            $(this).parents('#sidebar').removeClass('collapsed submenu-open');
        } else if(was_open == 'no'){
            $(this).parents('#sidebar').removeClass('submenu-open');
        }

        $(this).removeClass('active');
        $(this).addClass('collapsed').attr('aria-expanded', 'false');

    } else {

        $(this).parents('#sidebar').addClass('collapsed submenu-open');
        $(this).removeClass('collapsed').attr('aria-expanded', 'true');
        $(this).addClass('active');

    }

});


// Sidebar: Open current submenu on page load ___________________________________
$(document).ready(function() {
    const $sidebar = $('#sidebar');
    const $currentItem = $sidebar.find('.current-menu-item');
    const $ancestor = $currentItem.closest('.menu-item-has-children');

    if ($currentItem.length && $ancestor.length) {
        // 1️⃣ Sidebar should match visual state:
        // collapsed width, but submenu panel open
        $sidebar.addClass('collapsed submenu-open');

        // 2️⃣ Find submenu toggle and submenu
        const $toggle = $ancestor.children('.submenu_toggle');
        const $submenu = $ancestor.children('.sub-menu');

        // 3️⃣ Apply all necessary classes and aria attributes
        $ancestor
            .addClass('current-menu-ancestor current-menu-parent')
            .removeClass('collapsed');

        $toggle
            .addClass('active')
            .removeClass('collapsed')
            .attr('aria-expanded', 'true');

        $submenu
            .addClass('show')
            .find('.submenu_close')
            .removeClass('collapsed')
            .attr('aria-expanded', 'true');

        // 4️⃣ Highlight the current item
        $currentItem.children('a').addClass('active');

        // 5️⃣ Optional scroll into view for long menus
        const sidebarBody = $sidebar.find('.sidebar_body');
        if (sidebarBody.length) {
            const offsetTop = $currentItem.position().top;
            const viewHeight = sidebarBody.height();
            if (offsetTop > viewHeight * 0.75) {
                sidebarBody.animate({ scrollTop: offsetTop - viewHeight / 3 }, 400);
            }
        }
    }
});



// Copy anchor link urls ________________________________________________________
document.addEventListener('DOMContentLoaded', () => {
    // --- FLIP helpers --------------------------------------------------------
    function getToastPositions(container) {
        const positions = new Map();
        container.querySelectorAll('.toast').forEach(el => {
            const rect = el.getBoundingClientRect();
            positions.set(el, rect.top);
        });
        return positions;
    }

    function playReorderAnimation(container, prevPositions) {
        if (!prevPositions) return;

        container.querySelectorAll('.toast').forEach(el => {
            const prevTop = prevPositions.get(el);
            if (prevTop == null) return;

            const rect = el.getBoundingClientRect();
            const newTop = rect.top;
            const dy = prevTop - newTop; // FLIP: old - new

            if (!dy) return;

            // Start visually from the old position
            el.style.transform = `translateY(${dy}px)`;

            requestAnimationFrame(() => {
                // Animate into the new position (CSS handles transition)
                el.style.transform = '';
            });
        });
    }

    // --- Find or create the real toast container ----------------------------
    function getRealToastContainer() {
        // Find a toast-container that is NOT an example
        let container = Array.from(document.querySelectorAll('.toast-container'))
            .find(c => !c.classList.contains('toast-examples'));

        // If none found (or only examples exist), create a new one
        if (!container) {
            container = document.createElement('div');
            container.className = 'toast-container';
            document.body.appendChild(container);
        }

        return container;
    }

    // --- Show toast ----------------------------------------------------------
    function showToast(message, type = 'success') {
        const container = getRealToastContainer();

        // BEFORE insert
        const prevPositions = getToastPositions(container);

        const toastEl = document.createElement('div');
        toastEl.className = `toast fade toast-${type}`;
        toastEl.setAttribute('role', 'alert');
        toastEl.setAttribute('aria-live', 'assertive');
        toastEl.setAttribute('aria-atomic', 'true');
        toastEl.innerHTML = `
            <div class="toast-content">
                <span class="toast-icon">
                    <i class="fa-solid fa-circle-check" aria-hidden="true"></i>
                </span>
                <div class="toast-body">
                    <div class="toast-message">
                        <h6>${message}</h6>
                    </div>
                </div>
            </div>
        `;

        // Newest toast at the TOP
        container.insertBefore(toastEl, container.firstChild);

        // AFTER layout changes, animate to new positions
        requestAnimationFrame(() => {
            playReorderAnimation(container, prevPositions);
        });

        const bsToast = new bootstrap.Toast(toastEl, {
            autohide: true,
            delay: 5000
        });

        toastEl.addEventListener('hidden.bs.toast', () => {
            const prevPositionsOnHide = getToastPositions(container);

            toastEl.remove();

            requestAnimationFrame(() => {
                playReorderAnimation(container, prevPositionsOnHide);
            });
        });

        bsToast.show();
    }

    // --- Anchor link click handler ------------------------------------------
    document.querySelectorAll('.anchor-link').forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();

            const baseUrl = window.location.href.split('#')[0];
            const hash = this.getAttribute('href').startsWith('#')
                ? this.getAttribute('href')
                : '#' + this.getAttribute('href');

            const fullUrl = baseUrl + hash;

            const textarea = document.createElement('textarea');
            textarea.value = fullUrl;
            document.body.appendChild(textarea);
            textarea.select();
            try {
                document.execCommand('copy');
            } catch (err) {
                console.error('Copy failed:', err);
            }
            document.body.removeChild(textarea);

            showToast('URL copied');
        });
    });
});


// Hide/reveal nested inputs _______________________________________________________
document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".trigger-question").forEach((triggerQuestion) => {
        const responseGroup = triggerQuestion.querySelector(".response-btn-input");
        const yesInput = responseGroup?.querySelector('input[id$="-yes"]');
        const nestedInputs = triggerQuestion.nextElementSibling;

        if (
        !responseGroup ||
        !yesInput ||
        !nestedInputs ||
        !nestedInputs.classList.contains("nested-inputs")
        ) {
        return;
        }

        function toggleNestedInputs() {
        nestedInputs.style.display = yesInput.checked ? "flex" : "none";
        }

        // Select yes by default
        yesInput.checked = true;

        // Set initial visibility
        toggleNestedInputs();

        // Update on radio change
        responseGroup.querySelectorAll('input[type="radio"]').forEach((radio) => {
        radio.addEventListener("change", toggleNestedInputs);
        });
    });
});


// Theme switcher ________________________________________________________________
document.addEventListener("DOMContentLoaded", () => {
    const themeSwitch = document.querySelector("#theme-switch .form-check-input");
    const html = document.documentElement;

    if (!themeSwitch) return;

    const currentTheme = html.getAttribute("data-bs-theme") || "buckholt";

    themeSwitch.checked = currentTheme === "dark";

    themeSwitch.addEventListener("change", () => {
        const theme = themeSwitch.checked ? "dark" : "buckholt";

        html.setAttribute("data-bs-theme", theme);
        localStorage.setItem("theme", theme);
    });
});