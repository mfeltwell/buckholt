document.querySelectorAll(".nav-sidebar").forEach((sidebar) => {
  const primary = sidebar.querySelector(
    ":scope > .nav-sidebar-content > .nav-sidebar-body > .nav-sidebar-primary",
  );

  const panel = primary?.querySelector(":scope > .nav-sidebar-primary-panel");

  if (!panel) return;

  function measureNavigation() {
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
