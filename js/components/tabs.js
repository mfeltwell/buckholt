const $ = window.jQuery;

// Scrollable tabs ______________________________________________________________
document.addEventListener("DOMContentLoaded", function () {
  const tabContainers = document.querySelectorAll(".tab-items");

  tabContainers.forEach(function (container) {
    const scroller = container.querySelector(".tab-items-scroll");
    const btnLeft = container.querySelector(".tab-scroll-left");
    const btnRight = container.querySelector(".tab-scroll-right");

    if (!scroller || !btnLeft || !btnRight) return;

    function updateButtons() {
      const maxScrollLeft = scroller.scrollWidth - scroller.clientWidth;

      // Is there any overflow at all?
      const hasOverflow = maxScrollLeft > 0;
      container.classList.toggle("has-overflow", hasOverflow);

      // Left side overflow?
      const atStart = scroller.scrollLeft <= 0;
      // Right side overflow?
      const atEnd = scroller.scrollLeft >= maxScrollLeft - 1;

      btnLeft.disabled = atStart;
      btnRight.disabled = atEnd;
    }

    function scrollByAmount(direction) {
      const amount = scroller.clientWidth * 0.6; // 60% of visible width
      scroller.scrollBy({
        left: direction * amount,
        behavior: "smooth",
      });
    }

    btnLeft.addEventListener("click", function () {
      scrollByAmount(-1);
    });

    btnRight.addEventListener("click", function () {
      scrollByAmount(1);
    });

    scroller.querySelectorAll(".nav-link").forEach(function (tab) {
      tab.addEventListener("shown.bs.tab", function () {
        const nav = tab.closest(".nav");
        const navStyles = nav ? window.getComputedStyle(nav) : null;
        const navPaddingLeft = navStyles
          ? parseFloat(navStyles.paddingLeft) || 0
          : 0;

        const tabLeft =
          tab.getBoundingClientRect().left -
          scroller.getBoundingClientRect().left +
          scroller.scrollLeft -
          navPaddingLeft;

        scroller.scrollTo({
          left: tabLeft,
          behavior: "smooth",
        });
      });
    });

    scroller.addEventListener("scroll", updateButtons);
    window.addEventListener("resize", updateButtons);

    // Initial state
    updateButtons();
  });
});
