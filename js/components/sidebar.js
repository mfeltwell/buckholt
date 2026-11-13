document.querySelectorAll(".sidebar").forEach((sidebar) => {
  const content = sidebar.querySelector(":scope > .sidebar-content");
  const header = content?.querySelector(":scope > .sidebar-header");
  const body = content?.querySelector(":scope > .sidebar-body");
  const primary = body?.querySelector(":scope > .sidebar-primary");
  const secondary = body?.querySelector(":scope > .sidebar-secondary");
  const toggle = header?.querySelector("[data-sidebar-toggle]");

  if (!primary) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const animations = new Map();
  const primaryBody = primary.querySelector(
    ":scope > .sidebar-primary-panel > .sidebar-primary-body",
  );

  function animateLayout(changeState) {
    const elements = [sidebar, primary, secondary].filter(Boolean);

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
    if (primaryBody && before[1] !== after[1]) {
      const width = `${primaryBody.getBoundingClientRect().width}px`;
      const frame = { width, boxSizing: "border-box" };

      const hold = primaryBody.animate([frame, frame], {
        duration: 200,
      });

      animations.set(primaryBody, hold);

      hold.onfinish = () => {
        if (animations.get(primaryBody) === hold) {
          animations.delete(primaryBody);
        }
      };
    }

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
    if (sidebar.classList.contains("is-collapsed")) return;
    if (primary.classList.contains("is-open")) return;

    animateLayout(() => {
      primary.classList.add("is-open");
    });

    // The compact opener is now hidden. Keep keyboard focus in the primary.
    primary
      .querySelector(".sidebar-primary-expanded .nav-tree-button")
      ?.focus({ preventScroll: true });
  });

  toggle?.addEventListener("click", () => {
    animateLayout(() => {
      const collapsed = sidebar.classList.toggle("is-collapsed");

      header
        .querySelector(".user-meta")
        ?.classList.toggle("user-meta-compact", collapsed);

      header.querySelector(".avatar")?.classList.toggle("avatar-sm", collapsed);

      toggle.setAttribute("aria-expanded", String(!collapsed));
      toggle.setAttribute(
        "aria-label",
        collapsed ? "Expand sidebar" : "Collapse sidebar",
      );
    });
  });
});
