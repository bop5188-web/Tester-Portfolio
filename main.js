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

  /* --- Home: depth-tunnel project cards (scroll past posters) --- */
  if (isHomePage && caseStudySnaps.length) {
    var depthReduce =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var depthRaf = 0;

    function updateCaseDepthTunnel() {
      depthRaf = 0;
      if (depthReduce) {
        for (var r = 0; r < caseStudySnaps.length; r++) {
          var settled = caseStudySnaps[r];
          var settledSlide = settled.querySelector(".case-study-slide");
          settled.classList.add("is-in-focus", "is-near");
          settled.style.zIndex = "";
          if (!settledSlide) continue;
          settledSlide.style.setProperty("--depth-s", "1");
          settledSlide.style.setProperty("--depth-o", "1");
          settledSlide.style.setProperty("--depth-z", "0px");
          settledSlide.style.setProperty("--depth-y", "0px");
          settledSlide.style.setProperty("--depth-blur", "0px");
        }
        return;
      }

      var vh = window.innerHeight || 1;
      var focusY = vh * 0.46;
      var bestFocus = -1;
      var bestI = -1;
      var focuses = [];

      for (var i = 0; i < caseStudySnaps.length; i++) {
        var snap = caseStudySnaps[i];
        var slide = snap.querySelector(".case-study-slide");
        if (!slide) {
          focuses[i] = 0;
          continue;
        }

        var rect = snap.getBoundingClientRect();
        var mid = rect.top + rect.height * 0.5;
        /* + below focus, − above (already walked past) */
        var t = (mid - focusY) / vh;
        var focus = Math.exp(-0.5 * Math.pow(t / 0.36, 2));
        focuses[i] = focus;

        var scale = 0.72 + focus * 0.3;
        var opacity = 0.16 + focus * 0.84;
        var blur = (1 - focus) * 7.2;
        var depthZ = -340 * (1 - focus);
        /* Enter from further down the hallway; exit slightly upward */
        var depthY = t * 16;

        slide.style.setProperty("--depth-s", scale.toFixed(3));
        slide.style.setProperty("--depth-o", opacity.toFixed(3));
        slide.style.setProperty("--depth-z", depthZ.toFixed(1) + "px");
        slide.style.setProperty("--depth-y", depthY.toFixed(2) + "vh");
        slide.style.setProperty("--depth-blur", blur.toFixed(2) + "px");
        snap.style.zIndex = String(Math.round(focus * 40));

        if (focus > bestFocus) {
          bestFocus = focus;
          bestI = i;
        }
      }

      for (var j = 0; j < caseStudySnaps.length; j++) {
        caseStudySnaps[j].classList.toggle(
          "is-in-focus",
          j === bestI && bestFocus > 0.55
        );
        caseStudySnaps[j].classList.toggle("is-near", focuses[j] > 0.42);
      }
    }

    function scheduleCaseDepthTunnel() {
      if (depthRaf) return;
      depthRaf = window.requestAnimationFrame(updateCaseDepthTunnel);
    }

    updateCaseDepthTunnel();
    window.addEventListener("scroll", scheduleCaseDepthTunnel, { passive: true });
    window.addEventListener("resize", scheduleCaseDepthTunnel, { passive: true });
    window.addEventListener("load", scheduleCaseDepthTunnel);
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
