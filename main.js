(function () {
  var isWorkPage = document.body.classList.contains("page-work");
  var isHomePage = document.documentElement.classList.contains("page-home");

  /* --- Top chrome: nav + progress (hidden on Spline until scroll on home) --- */
  var topChrome = document.getElementById("topChrome");
  var spline = document.querySelector("spline-viewer");
  var scrollHint = document.querySelector(".scroll-into-work");

  if (topChrome && !isWorkPage && spline) {
    function updateTopChrome() {
      var pastSpline = spline.getBoundingClientRect().bottom < 64;
      topChrome.classList.toggle("is-visible", pastSpline);
      topChrome.setAttribute("aria-hidden", pastSpline ? "false" : "true");
      if (scrollHint) {
        scrollHint.classList.toggle("is-past-spline", pastSpline);
      }
    }
    updateTopChrome();
    window.addEventListener("scroll", updateTopChrome, { passive: true });
    window.addEventListener("resize", updateTopChrome, { passive: true });
  } else if (topChrome && isWorkPage) {
    topChrome.classList.add("is-visible");
    topChrome.setAttribute("aria-hidden", "false");
  }

  /* --- Home / name → smooth scroll to top when already on homepage --- */
  function isHomeUrl() {
    var p = window.location.pathname || "";
    var h = window.location.href || "";
    return (
      /index\.html$/i.test(p) ||
      p === "/" ||
      p === "" ||
      /index\.html([?#]|$)/i.test(h)
    );
  }

  document
    .querySelectorAll(".js-home-top, [data-home-link]")
    .forEach(function (el) {
      el.addEventListener("click", function (e) {
        if (!isHomeUrl()) return;
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    });

  /* --- Progress bar fill --- */
  var caseTrack = document.getElementById("caseScrollTrack");
  var caseFill = document.getElementById("caseScrollFill");
  var caseRail = caseTrack ? caseTrack.querySelector(".case-scroll-track__rail") : null;

  function updateCaseScrollProgress() {
    if (!caseTrack || !caseFill) return;

    var sy = window.scrollY;
    var vh = window.innerHeight;
    var doc = document.documentElement;
    var maxScroll = Math.max(0, doc.scrollHeight - vh);
    var p = 0;

    if (isWorkPage) {
      var mainEl = document.getElementById("workMain");
      if (mainEl) {
        var top = mainEl.getBoundingClientRect().top + sy;
        var bottom = mainEl.getBoundingClientRect().bottom + sy;
        var range = bottom - vh - top;
        if (range <= 0) range = 1;
        p = (sy - top) / range;
      }
    } else if (isHomePage) {
      var startEl = document.querySelector(".home-below");
      var endEl = document.querySelector(".site-footer");
      if (startEl && endEl) {
        var start = startEl.offsetTop;
        var end = endEl.offsetTop + endEl.offsetHeight - vh;
        if (end <= start) {
          end = start + 1;
        }
        p = (sy - start) / (end - start);
      }
    }

    p = Math.max(0, Math.min(1, p));
    var pct = Math.round(p * 100);
    caseFill.style.width = pct + "%";
    if (caseRail) {
      caseRail.setAttribute("aria-valuenow", String(pct));
    }
  }

  if (caseTrack && caseFill) {
    updateCaseScrollProgress();
    window.addEventListener("scroll", updateCaseScrollProgress, { passive: true });
    window.addEventListener("resize", updateCaseScrollProgress, { passive: true });
  }

  /* --- Home: case study panel (iframe) --- */
  var casePanel = document.getElementById("caseStudyPanel");
  var caseFrame = casePanel ? casePanel.querySelector(".case-study-panel__frame") : null;
  var caseHeading = document.getElementById("caseStudyPanelHeading");
  var lastFocusEl = null;

  function openCasePanel(url, title) {
    if (!casePanel || !caseFrame) return;
    lastFocusEl = document.activeElement;
    caseFrame.src = url;
    if (caseHeading && title) {
      caseHeading.textContent = title;
    }
    casePanel.hidden = false;
    casePanel.setAttribute("aria-hidden", "false");
    document.body.classList.add("case-study-panel-is-open");
    var closeBtn = casePanel.querySelector("[data-close-case-panel].case-study-panel__close");
    if (closeBtn) {
      closeBtn.focus();
    }
  }

  function closeCasePanel() {
    if (!casePanel || !caseFrame) return;
    caseFrame.src = "about:blank";
    casePanel.hidden = true;
    casePanel.setAttribute("aria-hidden", "true");
    document.body.classList.remove("case-study-panel-is-open");
    if (lastFocusEl && typeof lastFocusEl.focus === "function") {
      lastFocusEl.focus();
    }
    lastFocusEl = null;
  }

  document.querySelectorAll(".case-study-slide__hit").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var url = btn.getAttribute("data-case-url");
      var title = btn.getAttribute("data-case-title") || "";
      if (url) openCasePanel(url, title);
    });
  });

  if (casePanel) {
    casePanel.querySelectorAll("[data-close-case-panel]").forEach(function (el) {
      el.addEventListener("click", function () {
        closeCasePanel();
      });
    });
  }

  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    if (!casePanel || casePanel.hidden) return;
    closeCasePanel();
  });

  /* --- Case study cursor (work page mini cards + home slide buttons) --- */
  var cursorEl = document.getElementById("caseStudyCursor");
  var hits = document.querySelectorAll(".case-hit, .work-mini-card");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
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
