document.querySelectorAll(".nav-sidebar").forEach((sidebar) => {
  const primary = sidebar.querySelector(
    ":scope > .nav-sidebar-content > .nav-sidebar-body > .nav-sidebar-primary",
  );

  const panel = primary?.querySelector(":scope > .nav-sidebar-primary-panel");

  if (!panel) return;

  const toggle = sidebar.querySelector(
    ":scope > .nav-sidebar-content > .nav-sidebar-header > [data-nav-sidebar-toggle]",
  );

  const content = sidebar.querySelector(":scope > .nav-sidebar-content");
  const originalContentWidth = content.style.width;

  const primaryBody = panel.querySelector(":scope > .nav-sidebar-primary-body");

  const originalPrimaryBodyWidth = primaryBody.style.width;

  let sidebarAnimation;
  let primaryAnimation;

  toggle?.addEventListener("click", () => {
    // Capture the current width, including any animation in progress.
    const startWidth = sidebar.getBoundingClientRect().width;
    const startPrimaryWidth = panel.getBoundingClientRect().width;

    sidebarAnimation?.cancel();
    primaryAnimation?.cancel();
    content.style.width = originalContentWidth;
    primaryBody.style.width = originalPrimaryBodyWidth;

    // Apply the new state.
    const collapsed = sidebar.classList.toggle("is-collapsed");

    sidebar
      .querySelector(".nav-sidebar-header .user-meta")
      ?.classList.toggle("user-meta-compact", collapsed);

    sidebar
      .querySelector(".nav-sidebar-header .avatar")
      ?.classList.toggle("avatar-sm", collapsed);

    toggle.setAttribute("aria-expanded", String(!collapsed));
    toggle.setAttribute(
      "aria-label",
      collapsed ? "Expand sidebar" : "Collapse sidebar",
    );

    if (!collapsed) {
      measureNavigation();
    }

    // Measure the sidebar at its new natural size.
    const endWidth = sidebar.getBoundingClientRect().width;
    const endPrimaryWidth = panel.getBoundingClientRect().width;
    const contentWidth = content.getBoundingClientRect().width;
    const primaryBodyWidth = primaryBody.getBoundingClientRect().width;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    // Keep the contents at their final width to prevent rewrapping.
    content.style.width = `${contentWidth}px`;
    primaryBody.style.width = `${primaryBodyWidth}px`;

    primaryAnimation = panel.animate(
      [{ width: `${startPrimaryWidth}px` }, { width: `${endPrimaryWidth}px` }],
      {
        duration: 200,
        easing: "ease-in-out",
      },
    );

    sidebarAnimation = sidebar.animate(
      [
        {
          width: `${startWidth}px`,
          overflow: "hidden",
        },
        {
          width: `${endWidth}px`,
          overflow: "hidden",
        },
      ],
      {
        duration: 200,
        easing: "ease-in-out",
      },
    );

    sidebarAnimation.onfinish = () => {
      content.style.width = originalContentWidth;
      primaryBody.style.width = originalPrimaryBodyWidth;
      sidebarAnimation = undefined;
    };
  });

  function measureNavigation() {
    if (sidebar.classList.contains("is-collapsed")) return;

    const probe = panel.cloneNode(true);

    // Avoid duplicate IDs and interactive measurement content.
    probe.removeAttribute("id");
    probe.querySelectorAll("[id]").forEach((element) => {
      element.removeAttribute("id");
    });

    probe.inert = true;
    probe.setAttribute("aria-hidden", "true");

    Object.assign(probe.style, {
      position: "absolute",
      inset: "auto",
      top: "0",
      left: "0",
      width: "max-content",
      minWidth: "0",
      maxWidth: "none",
      height: "auto",
      minHeight: "0",
      maxHeight: "none",
      visibility: "hidden",
      pointerEvents: "none",
      transition: "none",
    });

    const expanded = probe.querySelector(
      ":scope > .nav-sidebar-primary-body > .nav-sidebar-primary-expanded",
    );

    const compact = probe.querySelector(
      ":scope > .nav-sidebar-primary-body > .nav-sidebar-primary-compact",
    );

    if (!expanded || !compact) return;

    primary.append(probe);

    function measure(
      view,
      otherView,
      paddingY,
      paddingX,
      width = "max-content",
    ) {
      probe.style.width = width;

      view.style.width = width === "max-content" ? "max-content" : "100%";
      view.style.display = "block";
      otherView.style.display = "none";

      probe.style.padding = `var(${paddingY}) var(${paddingX})`;

      const bounds = probe.getBoundingClientRect();

      return {
        width: bounds.width,
        height: bounds.height,
        contentWidth: view.getBoundingClientRect().width,
      };
    }

    // Replace this prefix if your compiled CSS uses one, e.g. "bh-".
    const prefix = "";

    const fullSize = measure(
      expanded,
      compact,
      `--${prefix}nav-sidebar-primary-padding-y`,
      `--${prefix}nav-sidebar-primary-padding-x`,
      `${primary.parentElement.clientWidth}px`,
    );

    const compactSize = measure(
      compact,
      expanded,
      `--${prefix}nav-sidebar-primary-padding-y-collapsed`,
      `--${prefix}nav-sidebar-primary-padding-x-collapsed`,
    );

    probe.remove();

    primary.style.setProperty(
      "--nav-sidebar-measured-compact-width",
      `${Math.ceil(compactSize.width)}px`,
    );

    primary.style.setProperty(
      "--nav-sidebar-measured-expanded-content-width",
      `${fullSize.contentWidth}px`,
    );

    primary.style.setProperty(
      "--nav-sidebar-measured-height",
      `${Math.ceil(Math.max(fullSize.height, compactSize.height))}px`,
    );
  }

  measureNavigation();

  window.addEventListener("resize", measureNavigation);
  document.fonts.ready.then(measureNavigation);

  // Applications can request a fresh measurement after changing content.
  sidebar.addEventListener("nav-sidebar:refresh", measureNavigation);
});
