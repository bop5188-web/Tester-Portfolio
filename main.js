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

  /* --- Case study scroll progress bar (first case → last case = 0–100%) --- */
  var caseTrack = document.getElementById("caseScrollTrack");
  var caseFill = document.getElementById("caseScrollFill");
  var caseRail = caseTrack ? caseTrack.querySelector(".case-scroll-track__rail") : null;
  var caseStatus = document.getElementById("caseScrollStatus");
  var casePanels = document.querySelectorAll(".case-panel");

  if (caseTrack && caseFill && casePanels.length) {
    function updateCaseScrollProgress() {
      var sy = window.scrollY;
      var vh = window.innerHeight;
      var first = casePanels[0];
      var last = casePanels[casePanels.length - 1];
      var firstTop = first.getBoundingClientRect().top + sy;
      var lastBottom = last.getBoundingClientRect().bottom + sy;
      var rangeEnd = lastBottom - vh;
      if (rangeEnd <= firstTop) {
        rangeEnd = firstTop + 1;
      }

      /* Bar appears when the first case study enters the viewport (below Spline / intro) */
      var firstTopViewport = first.getBoundingClientRect().top;
      var show = firstTopViewport < vh * 0.72;

      caseTrack.classList.toggle("is-visible", show);
      caseTrack.setAttribute("aria-hidden", show ? "false" : "true");

      var p = (sy - firstTop) / (rangeEnd - firstTop);
      p = Math.max(0, Math.min(1, p));
      var pct = Math.round(p * 100);
      caseFill.style.width = pct + "%";
      if (caseRail) {
        caseRail.setAttribute("aria-valuenow", String(pct));
      }
      if (caseStatus) {
        caseStatus.textContent = pct + "% complete";
      }
    }

    updateCaseScrollProgress();
    window.addEventListener("scroll", updateCaseScrollProgress, {
      passive: true,
    });
    window.addEventListener("resize", updateCaseScrollProgress, {
      passive: true,
    });
  }

  /* --- Case study links: circle + arrow follows pointer (fine pointer only) --- */
  var cursorEl = document.getElementById("caseStudyCursor");
  var hits = document.querySelectorAll(".case-hit");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)")
    .matches;
  var finePointer = window.matchMedia("(pointer: fine)").matches;

  if (cursorEl && hits.length && !reduceMotion && finePointer) {
    function place(e) {
      cursorEl.style.left = e.clientX + "px";
      cursorEl.style.top = e.clientY + "px";
    }

    function onEnter(e) {
      place(e);
      cursorEl.classList.add("is-visible");
    }

    function onMove(e) {
      place(e);
    }

    function onLeave() {
      cursorEl.classList.remove("is-visible");
    }

    hits.forEach(function (hit) {
      hit.addEventListener("mouseenter", onEnter);
      hit.addEventListener("mousemove", onMove);
      hit.addEventListener("mouseleave", onLeave);
    });
  }
})();
