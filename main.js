(function () {
  /* --- Case study panels: slide in on scroll --- */
  var panels = document.querySelectorAll(".case-panel[data-reveal]");
  if (!panels.length || !("IntersectionObserver" in window)) {
    panels.forEach(function (el) {
      el.classList.add("is-visible");
    });
  } else {
    var panelObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
          }
        });
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.08 }
    );
    panels.forEach(function (el) {
      panelObserver.observe(el);
    });
  }

  /* --- Header + scroll hint (homepage with Spline) --- */
  var header = document.querySelector(".site-header");
  var spline = document.querySelector("spline-viewer");
  var scrollHint = document.querySelector(".scroll-into-work");

  if (header && spline) {
    function updateHeader() {
      var bottom = spline.getBoundingClientRect().bottom;
      var pastHero = bottom < 72;
      header.classList.toggle("site-header--visible", pastHero);
      header.classList.toggle("site-header--light", pastHero);
      if (scrollHint) {
        scrollHint.classList.toggle("is-past-spline", pastHero);
      }
    }
    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });
    window.addEventListener("resize", updateHeader, { passive: true });
  }

  /* --- Custom cursor (fine pointers, no reduced motion) --- */
  var cursorEl = document.querySelector("[data-cursor]");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)")
    .matches;
  var finePointer = window.matchMedia("(pointer: fine)").matches;

  if (!cursorEl || reduceMotion || !finePointer) {
    return;
  }

  document.body.classList.add("is-custom-cursor");
  cursorEl.classList.add("is-active");

  var cx = 0;
  var cy = 0;
  var tx = 0;
  var ty = 0;
  var hoverSelector =
    "a, button, input, textarea, select, [role='button'], .case-hit";

  function tick() {
    cx += (tx - cx) * 0.18;
    cy += (ty - cy) * 0.18;
    cursorEl.style.transform =
      "translate3d(" + cx + "px," + cy + "px,0) translate(-50%,-50%)";
    requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);

  window.addEventListener(
    "mousemove",
    function (e) {
      tx = e.clientX;
      ty = e.clientY;
      var over = e.target.closest ? e.target.closest(hoverSelector) : null;
      cursorEl.classList.toggle("is-hover", !!over);
    },
    { passive: true }
  );
})();
