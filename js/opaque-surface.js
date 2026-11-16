/* Reusable solid-colour surfaces. Load once with defer. */
(() => {
  "use strict";

  if (window.DSOpaqueSurfaces) {
    window.DSOpaqueSurfaces.refresh();
    return;
  }

  const selector = "[data-opaque-surface]";
  const property = "--ds-opaque-surface-colour";
  const managed = new Map();
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 1;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  let pending = null;
  let stopped = false;

  function readColour(value) {
    // Preserve fractional alpha without an 8-bit canvas round trip.
    const rgb = value.match(/^rgba?\((.*)\)$/i);
    if (rgb) {
      const parts = rgb[1].trim().split(/[\s,/]+/);
      const channel = (part) =>
        parseFloat(part) * (part.endsWith("%") ? 2.55 : 1);
      const alpha =
        parts[3] === undefined
          ? 1
          : parseFloat(parts[3]) / (parts[3].endsWith("%") ? 100 : 1);
      return [...parts.slice(0, 3).map(channel), alpha];
    }

    // Convert other browser-supported CSS colours to sRGB.
    context.clearRect(0, 0, 1, 1);
    context.fillStyle = value;
    context.fillRect(0, 0, 1, 1);
    const [r, g, b, a] = context.getImageData(0, 0, 1, 1).data;
    return [r, g, b, a / 255];
  }

  function composite(foreground, background) {
    const alpha = foreground[3];
    return [
      foreground[0] * alpha + background[0] * (1 - alpha),
      foreground[1] * alpha + background[1] * (1 - alpha),
      foreground[2] * alpha + background[2] * (1 - alpha),
      1,
    ];
  }

  function restore(element, previous) {
    // Do not overwrite a value changed by another script after ours.
    if (element.style.getPropertyValue(property) !== previous.applied) return;
    if (previous.value) {
      element.style.setProperty(property, previous.value, previous.priority);
    } else {
      element.style.removeProperty(property);
    }
  }

  function update() {
    pending = null;
    if (stopped) return;

    const elements = Array.from(document.querySelectorAll(selector));
    const active = new Set(elements);
    for (const [element, previous] of managed) {
      if (!active.has(element)) {
        restore(element, previous);
        managed.delete(element);
      }
    }
    if (!elements.length) return;

    // Canvas is the browser's system page colour when all ancestors are clear.
    const pageColour = readColour("Canvas");
    const cache = new Map();
    function effectiveColour(element) {
      if (!element) return pageColour;
      if (cache.has(element)) return cache.get(element);
      const own = readColour(getComputedStyle(element).backgroundColor);
      const result =
        own[3] === 1
          ? own
          : composite(own, effectiveColour(element.parentElement));
      cache.set(element, result);
      return result;
    }

    // Read all colours before writing styles. Original background-color stays intact.
    const results = elements.map((element) => {
      const colour = effectiveColour(element);
      return [element, `rgb(${colour.slice(0, 3).map(Math.round).join(", ")})`];
    });

    for (const [element, colour] of results) {
      if (!managed.has(element)) {
        managed.set(element, {
          value: element.style.getPropertyValue(property),
          priority: element.style.getPropertyPriority(property),
          applied: null,
        });
      }
      managed.get(element).applied = colour;
      // Avoid an endless MutationObserver loop from our own style updates.
      if (element.style.getPropertyValue(property) !== colour) {
        element.style.setProperty(property, colour);
      }
    }
  }

  function refresh() {
    if (!stopped && pending === null) pending = requestAnimationFrame(update);
  }

  const observer = new MutationObserver(refresh);
  observer.observe(document.documentElement, {
    subtree: true,
    childList: true,
    attributes: true,
    characterData: true,
  });

  const scheme = matchMedia("(prefers-color-scheme: dark)");
  scheme.addEventListener("change", refresh);
  window.addEventListener("resize", refresh);
  window.addEventListener("load", refresh);
  document.addEventListener("load", refresh, true);
  document.addEventListener("pointerover", refresh, true);
  document.addEventListener("pointerout", refresh, true);
  document.addEventListener("focusin", refresh);
  document.addEventListener("focusout", refresh);
  document.addEventListener("transitionend", refresh, true);
  document.addEventListener("animationend", refresh, true);

  window.DSOpaqueSurfaces = {
    refresh,
    destroy() {
      stopped = true;
      observer.disconnect();
      if (pending !== null) cancelAnimationFrame(pending);
      scheme.removeEventListener("change", refresh);
      window.removeEventListener("resize", refresh);
      window.removeEventListener("load", refresh);
      document.removeEventListener("load", refresh, true);
      document.removeEventListener("pointerover", refresh, true);
      document.removeEventListener("pointerout", refresh, true);
      document.removeEventListener("focusin", refresh);
      document.removeEventListener("focusout", refresh);
      document.removeEventListener("transitionend", refresh, true);
      document.removeEventListener("animationend", refresh, true);
      for (const [element, previous] of managed) restore(element, previous);
      managed.clear();
      delete window.DSOpaqueSurfaces;
    },
  };

  refresh();
})();
