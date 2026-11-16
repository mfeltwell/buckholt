document.querySelectorAll(".sidebar").forEach((sidebar) => {
  const content = sidebar.querySelector(":scope > .sidebar-content");
  const header = content?.querySelector(":scope > .sidebar-header");
  const body = content?.querySelector(":scope > .sidebar-body");
  const primary = body?.querySelector(":scope > .sidebar-primary");
  const secondary = body?.querySelector(":scope > .sidebar-secondary");
  const toggle = header?.querySelector("[data-sidebar-toggle]");
  const container = sidebar.parentElement?.matches(".sidebar-container")
    ? sidebar.parentElement
    : null;

  if (!primary) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const animations = new Map();
  const primaryBody = primary.querySelector(
    ":scope > .sidebar-primary-panel > .sidebar-primary-body",
  );
  const secondaryHeader = secondary?.querySelector(
    ":scope > .sidebar-secondary-header",
  );

  const secondaryBody = secondary?.querySelector(
    ":scope > .sidebar-secondary-body",
  );

  function syncHeader() {
    const collapsed = sidebar.classList.contains("is-collapsed");

    header
      ?.querySelector(".user-meta")
      ?.classList.toggle("user-meta-compact", collapsed);

    header?.querySelector(".avatar")?.classList.toggle("avatar-sm", collapsed);

    toggle?.setAttribute("aria-expanded", String(!collapsed));
    toggle?.setAttribute(
      "aria-label",
      collapsed ? "Expand sidebar" : "Collapse sidebar",
    );
  }

  syncHeader();

  function animateLayout(changeState) {
    const elements = [sidebar, primary, secondary, container].filter(Boolean);

    // Capture the visible widths, including any animation already in progress.
    const before = elements.map((el) => el.getBoundingClientRect().width);

    for (const animation of animations.values()) {
      animation.cancel();
    }
    animations.clear();

    // Apply the state, then let CSS calculate the final content-based widths.
    changeState();

    if (reducedMotion.matches) return;

    const after = elements.map((el) => el.getBoundingClientRect().width);

    // Hold the navigation at its final width while the card opens or closes.
    // Hold panel content at its final width during the animation.
    [
      [primaryBody, 1],
      [secondaryHeader, 2],
      [secondaryBody, 2],
    ].forEach(([element, index]) => {
      if (!element || !after[index] || before[index] === after[index]) return;

      const width = `${element.getBoundingClientRect().width}px`;
      const frame = { width, boxSizing: "border-box" };

      const hold = element.animate([frame, frame], {
        duration: 200,
      });

      animations.set(element, hold);

      hold.onfinish = () => {
        if (animations.get(element) === hold) {
          animations.delete(element);
        }
      };
    });

    elements.forEach((el, index) => {
      const from = before[index];
      const to = after[index];

      if (!from || !to || Math.abs(from - to) < 1) return;

      // Temporarily release the final size limits so the primary can animate
      // from its compact rail width, which is smaller than the 14rem minimum.
      const frame = (width) => ({
        boxSizing: "border-box",
        width: `${width}px`,
        minWidth: "0",
        maxWidth: "none",
        overflow: "hidden",
      });

      const animation = el.animate([frame(from), frame(to)], {
        duration: 200,
        easing: "ease-in-out",
      });

      animations.set(el, animation);
      animation.onfinish = () => {
        if (animations.get(el) === animation) animations.delete(el);
      };
    });
  }

  primary.addEventListener("click", (event) => {
    const opener = event.target.closest("button[data-sidebar-primary-open]");
    if (!opener || !primary.contains(opener)) return;
    if (
      primary.classList.contains("is-open") &&
      !sidebar.classList.contains("is-collapsed")
    )
      return;

    animateLayout(() => {
      sidebar.classList.remove("is-collapsed");
      primary.classList.add("is-open");
      syncHeader();
    });

    // The compact opener is now hidden. Keep keyboard focus in the primary.
    primary
      .querySelector(".sidebar-primary-expanded .nav-tree-button")
      ?.focus({ preventScroll: true });
  });

  toggle?.addEventListener("click", () => {
    animateLayout(() => {
      const collapsed = sidebar.classList.toggle("is-collapsed");

      if (collapsed) {
        primary.classList.remove("is-open");
      }

      syncHeader();
    });
  });
});
