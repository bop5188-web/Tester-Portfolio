(function () {
  var isWorkPage = document.body.classList.contains("page-work");
  var isHomePage = document.documentElement.classList.contains("page-home");

  /* --- Top chrome: nav + progress (hidden on Spline until scroll on home) --- */
  var topChrome = document.getElementById("topChrome");
  var spline = document.querySelector("spline-viewer");
  var scrollHint = document.querySelector(".scroll-into-work");

  /* Scroll hint fades after Spline; home nav/progress handled with case studies */
  if (topChrome && !isWorkPage && spline) {
    function updateScrollHint() {
      var pastSpline = spline.getBoundingClientRect().bottom < 64;
      if (scrollHint) {
        scrollHint.classList.toggle("is-past-spline", pastSpline);
      }
    }
    updateScrollHint();
    window.addEventListener("scroll", updateScrollHint, { passive: true });
    window.addEventListener("resize", updateScrollHint, { passive: true });
  } else if (topChrome && !isWorkPage && !spline) {
    if (scrollHint) {
      scrollHint.classList.add("is-past-spline");
    }
  } else if (topChrome && isWorkPage) {
    topChrome.classList.add("is-visible");
    topChrome.setAttribute("aria-hidden", "false");
  }

  /* --- Work page: mouse-follow multi-color orb platform --- */
  var workPlatform = document.getElementById("workPlatform");
  if (workPlatform && isWorkPage) {
    function setOrbFromEvent(e) {
      var r = workPlatform.getBoundingClientRect();
      if (r.width < 8 || r.height < 8) return;
      var px = (e.clientX - r.left) / r.width - 0.5;
      var py = (e.clientY - r.top) / r.height - 0.5;
      var nx = Math.max(-1, Math.min(1, px * 2));
      var ny = Math.max(-1, Math.min(1, py * 2));
      workPlatform.style.setProperty("--mx", nx.toFixed(4));
      workPlatform.style.setProperty("--my", ny.toFixed(4));
    }
    document.addEventListener("mousemove", setOrbFromEvent, { passive: true });
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
    var p = 0;

    if (isHomePage) {
      var snaps = document.querySelectorAll(".case-study-snap");
      var firstSnap = snaps[0];
      if (firstSnap && topChrome) {
        var firstTop = firstSnap.getBoundingClientRect().top;
        var showChrome = firstTop < vh * 0.88;
        topChrome.classList.toggle("is-visible", showChrome);
        topChrome.setAttribute("aria-hidden", showChrome ? "false" : "true");
      }

      if (snaps.length && firstSnap) {
        var start = firstSnap.offsetTop;
        var lastSnap = snaps[snaps.length - 1];
        var end = lastSnap.offsetTop + lastSnap.offsetHeight - vh;
        if (end <= start) end = start + 1;
        if (sy >= start) {
          p = (sy - start) / (end - start);
        } else {
          p = 0;
        }
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
    window.addEventListener("load", updateCaseScrollProgress);
    window.addEventListener("pageshow", function (e) {
      if (e.persisted) updateCaseScrollProgress();
    });
  }

  /* --- Home: snap dock — scroll to / focus each case study --- */
  var caseSnapDock = document.getElementById("caseSnapDock");
  var caseStudySnaps = document.querySelectorAll(".case-study-snap");
  var snapDockBtns = caseSnapDock
    ? caseSnapDock.querySelectorAll(".case-snap-dock__btn")
    : [];
  var prefersSnapReduce =
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function scrollToCaseSnapById(id) {
    var el = id ? document.getElementById(id) : null;
    if (!el) return;
    el.scrollIntoView({
      behavior: prefersSnapReduce ? "auto" : "smooth",
      block: "start",
    });
  }

  function updateCaseSnapDockActive() {
    if (!snapDockBtns.length || !caseStudySnaps.length) return;
    var vh = window.innerHeight;
    var targetY = vh * 0.38;
    var best = -1;
    var bestDist = Infinity;
    for (var i = 0; i < caseStudySnaps.length; i++) {
      var r = caseStudySnaps[i].getBoundingClientRect();
      if (r.bottom <= 0 || r.top >= vh) continue;
      var mid = (r.top + r.bottom) / 2;
      var dist = Math.abs(mid - targetY);
      if (dist < bestDist) {
        bestDist = dist;
        best = i;
      }
    }
    for (var j = 0; j < snapDockBtns.length; j++) {
      var on = j === best && best >= 0;
      snapDockBtns[j].classList.toggle("is-active", on);
      snapDockBtns[j].setAttribute("aria-current", on ? "true" : "false");
    }
  }

  if (isHomePage && caseSnapDock && snapDockBtns.length) {
    snapDockBtns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        scrollToCaseSnapById(btn.getAttribute("data-case-snap-target"));
      });
    });
    updateCaseSnapDockActive();
    window.addEventListener("scroll", updateCaseSnapDockActive, { passive: true });
    window.addEventListener("resize", updateCaseSnapDockActive, { passive: true });
    window.addEventListener("load", updateCaseSnapDockActive);
  }

  /* --- Home: gentle snap-assist (no hard lock) --- */
  if (isHomePage) {
    var projectsTitleStop = document.querySelector(".home-projects-title");
    var caseStops = Array.prototype.slice.call(
      document.querySelectorAll(".case-study-snap")
    );
    var snapStops = (projectsTitleStop ? [projectsTitleStop] : []).concat(caseStops);
    var snapAssistTimer = null;
    var snapAssistLock = false;
    var snapAssistMotionReduce =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function nearestSnapStop() {
      if (!snapStops.length) return null;
      var topOffset = topChrome && topChrome.classList.contains("is-visible") ? 66 : 0;
      var best = null;
      var bestDist = Infinity;
      for (var i = 0; i < snapStops.length; i++) {
        var r = snapStops[i].getBoundingClientRect();
        var dist = Math.abs(r.top - topOffset);
        if (dist < bestDist) {
          bestDist = dist;
          best = snapStops[i];
        }
      }
      return best;
    }

    function scheduleSnapAssist() {
      if (snapAssistLock || !snapStops.length) return;
      if (casePanel && !casePanel.hidden) return;
      if (snapAssistTimer) window.clearTimeout(snapAssistTimer);
      snapAssistTimer = window.setTimeout(function () {
        var target = nearestSnapStop();
        if (!target) return;
        var topOffset = topChrome && topChrome.classList.contains("is-visible") ? 66 : 0;
        var dist = Math.abs(target.getBoundingClientRect().top - topOffset);
        /* Only pull when close enough to avoid jumpy long-distance snaps */
        if (dist < window.innerHeight * 0.35) {
          snapAssistLock = true;
          target.scrollIntoView({
            behavior: snapAssistMotionReduce ? "auto" : "smooth",
            block: "start",
          });
          window.setTimeout(function () {
            snapAssistLock = false;
          }, snapAssistMotionReduce ? 100 : 520);
        }
      }, 120);
    }

    window.addEventListener("scroll", scheduleSnapAssist, { passive: true });
    window.addEventListener("resize", scheduleSnapAssist, { passive: true });
  }

  /* --- Home: case study panel (iframe) --- */
  var casePanel = document.getElementById("caseStudyPanel");
  var caseFrame = casePanel ? casePanel.querySelector(".case-study-panel__frame") : null;
  var caseHeading = document.getElementById("caseStudyPanelHeading");
  var lastFocusEl = null;

  function openCasePanel(url, title) {
    if (!casePanel || !caseFrame) return;
    lastFocusEl = document.activeElement;
    try {
      caseFrame.src = new URL(url, window.location.href).href;
    } catch (err) {
      caseFrame.src = url;
    }
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

  document.addEventListener("keydown", function (e) {
    if (!isHomePage || !snapDockBtns.length || !caseStudySnaps.length) return;
    if (casePanel && !casePanel.hidden) return;
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    var t = e.target;
    if (
      t &&
      t.closest &&
      t.closest("input, textarea, select, [contenteditable='true']")
    ) {
      return;
    }
    e.preventDefault();
    var active = -1;
    for (var i = 0; i < snapDockBtns.length; i++) {
      if (snapDockBtns[i].classList.contains("is-active")) {
        active = i;
        break;
      }
    }
    if (e.key === "ArrowUp") {
      if (active <= 0) {
        window.scrollTo({
          behavior: prefersSnapReduce ? "auto" : "smooth",
          top: 0,
        });
        return;
      }
      scrollToCaseSnapById(caseStudySnaps[active - 1].id);
      return;
    }
    if (active < 0) {
      scrollToCaseSnapById(caseStudySnaps[0].id);
      return;
    }
    if (active >= caseStudySnaps.length - 1) return;
    scrollToCaseSnapById(caseStudySnaps[active + 1].id);
  });

  /* --- Case study cursor (home slide buttons + work page cards) --- */
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
