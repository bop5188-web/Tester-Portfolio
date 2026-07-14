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
    var wheelStack = document.querySelector(".case-study-stack--wheel");

    if (isHomePage && wheelStack) {
      if (topChrome) {
        var wheelTop = wheelStack.getBoundingClientRect().top;
        var showChrome = wheelTop < vh * 0.88;
        topChrome.classList.toggle("is-visible", showChrome);
        topChrome.setAttribute("aria-hidden", showChrome ? "false" : "true");
      }
      var start = wheelStack.offsetTop;
      var end = start + wheelStack.offsetHeight - vh;
      if (end <= start) end = start + 1;
      if (sy >= start) {
        p = (sy - start) / (end - start);
      }
    } else if (isHomePage) {
      var snaps = document.querySelectorAll(".case-study-snap");
      var firstSnap = snaps[0];
      if (firstSnap && topChrome) {
        var firstTop = firstSnap.getBoundingClientRect().top;
        var showChromeLegacy = firstTop < vh * 0.88;
        topChrome.classList.toggle("is-visible", showChromeLegacy);
        topChrome.setAttribute("aria-hidden", showChromeLegacy ? "false" : "true");
      }

      if (snaps.length && firstSnap) {
        var s0 = firstSnap.offsetTop;
        var lastSnap = snaps[snaps.length - 1];
        var e0 = lastSnap.offsetTop + lastSnap.offsetHeight - vh;
        if (e0 <= s0) e0 = s0 + 1;
        if (sy >= s0) {
          p = (sy - s0) / (e0 - s0);
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

  /* --- Home: infinite Ferris-wheel project cards --- */
  var caseSnapDock = document.getElementById("caseSnapDock");
  var caseWheel = document.getElementById("caseWheel");
  var caseWheelStack = document.querySelector(".case-study-stack--wheel");
  var caseStudySnaps = document.querySelectorAll(".case-study-snap");
  var snapDockBtns = caseSnapDock
    ? caseSnapDock.querySelectorAll(".case-snap-dock__btn")
    : [];
  var prefersSnapReduce =
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var wheelState = {
    rotation: 0,
    active: 0,
    n: caseStudySnaps.length,
  };

  function wrapIndex(i, n) {
    return ((i % n) + n) % n;
  }

  function setDockActive(index) {
    if (!snapDockBtns.length) return;
    for (var j = 0; j < snapDockBtns.length; j++) {
      var on = j === index;
      snapDockBtns[j].classList.toggle("is-active", on);
      snapDockBtns[j].setAttribute("aria-current", on ? "true" : "false");
    }
  }

  function renderProjectWheel() {
    if (!caseWheel || !wheelState.n || prefersSnapReduce) return;
    var n = wheelState.n;
    var step = (Math.PI * 2) / n;
    var rotation = wheelState.rotation;
    var vh = window.innerHeight || 1;
    var radius = Math.min(vh * 0.4, 360);
    var best = 0;
    var bestScore = -Infinity;

    for (var i = 0; i < n; i++) {
      var snap = caseStudySnaps[i];
      var slide = snap.querySelector(".case-study-slide");
      if (!slide) continue;

      var t = i * step - rotation;
      while (t > Math.PI) t -= Math.PI * 2;
      while (t < -Math.PI) t += Math.PI * 2;

      var y = Math.sin(t) * radius;
      var z = Math.cos(t) * radius - radius;
      var depth = (Math.cos(t) + 1) * 0.5;
      var scale = 0.52 + depth * 0.52;
      var opacity = depth < 0.12 || Math.abs(t) > Math.PI * 0.78 ? 0 : Math.pow(depth, 0.95);
      var blur = (1 - depth) * 7.5;
      var tilt = -t * (180 / Math.PI) * 0.22;

      slide.style.opacity = "";
      slide.style.setProperty("--wheel-o", opacity.toFixed(3));
      slide.style.setProperty("--wheel-blur", blur.toFixed(2) + "px");
      slide.style.transform =
        "translate3d(-50%, calc(-50% + " +
        y.toFixed(1) +
        "px), " +
        z.toFixed(1) +
        "px) rotateX(" +
        tilt.toFixed(2) +
        "deg) scale(" +
        scale.toFixed(3) +
        ")";
      snap.style.zIndex = String(Math.round(depth * 100));
      snap.classList.toggle("is-front", depth > 0.82);
      snap.classList.toggle("is-near", depth > 0.45);
      snap.setAttribute("aria-hidden", opacity < 0.08 ? "true" : "false");

      if (depth > bestScore) {
        bestScore = depth;
        best = i;
      }
    }

    wheelState.active = best;
    setDockActive(best);
    if (caseWheel) {
      caseWheel.setAttribute("aria-valuenow", String(best + 1));
    }
  }

  function wheelScrollMetrics() {
    if (!caseWheelStack) return null;
    var vh = window.innerHeight || 1;
    var start = caseWheelStack.offsetTop;
    var range = Math.max(1, caseWheelStack.offsetHeight - vh);
    return { start: start, range: range, vh: vh };
  }

  function updateWheelFromScroll() {
    if (!caseWheelStack || !wheelState.n || prefersSnapReduce) return;
    var m = wheelScrollMetrics();
    if (!m) return;
    var scrolled = Math.max(0, Math.min(m.range, window.scrollY - m.start));
    var step = (Math.PI * 2) / wheelState.n;
    /* ~0.7 viewport of scroll per project slot → smooth Ferris turns */
    wheelState.rotation = (scrolled / (m.vh * 0.7)) * step;
    renderProjectWheel();
  }

  function scrollWheelToIndex(index) {
    if (!caseWheelStack || !wheelState.n) return;
    var n = wheelState.n;
    var i = wrapIndex(index, n);
    var m = wheelScrollMetrics();
    if (!m) return;
    var step = (Math.PI * 2) / n;
    var cur = wheelState.rotation;
    var lap = Math.floor(cur / (Math.PI * 2));
    var target = lap * Math.PI * 2 + i * step;
    if (target - cur > Math.PI) target -= Math.PI * 2;
    if (cur - target > Math.PI) target += Math.PI * 2;
    var top = m.start + (target / step) * (m.vh * 0.7);
    top = Math.max(m.start, Math.min(m.start + m.range, top));
    window.scrollTo({
      top: top,
      behavior: prefersSnapReduce ? "auto" : "smooth",
    });
  }

  function scrollToCaseSnapById(id) {
    if (!id || !caseStudySnaps.length) return;
    for (var i = 0; i < caseStudySnaps.length; i++) {
      if (caseStudySnaps[i].id === id) {
        if (caseWheelStack && !prefersSnapReduce) {
          /* Ensure wheel is on screen, then spin to card */
          var m = wheelScrollMetrics();
          if (m && window.scrollY < m.start - 4) {
            window.scrollTo({
              top: m.start + 8,
              behavior: prefersSnapReduce ? "auto" : "smooth",
            });
            window.setTimeout(function () {
              scrollWheelToIndex(i);
            }, 420);
            return;
          }
          scrollWheelToIndex(i);
          return;
        }
        caseStudySnaps[i].scrollIntoView({
          behavior: prefersSnapReduce ? "auto" : "smooth",
          block: "start",
        });
        return;
      }
    }
  }

  if (isHomePage && caseSnapDock && snapDockBtns.length) {
    snapDockBtns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        scrollToCaseSnapById(btn.getAttribute("data-case-snap-target"));
      });
    });
  }

  if (isHomePage && caseWheel && caseWheelStack && caseStudySnaps.length) {
    if (!prefersSnapReduce) {
      caseWheel.setAttribute("aria-valuemin", "1");
      caseWheel.setAttribute("aria-valuemax", String(wheelState.n));
      updateWheelFromScroll();
      window.addEventListener("scroll", updateWheelFromScroll, { passive: true });
      window.addEventListener("resize", updateWheelFromScroll, { passive: true });
      window.addEventListener("load", updateWheelFromScroll);
    } else {
      caseStudySnaps.forEach(function (snap) {
        snap.classList.add("is-front", "is-near");
        snap.removeAttribute("aria-hidden");
      });
    }
  }

  /* Progress bar uses updateCaseScrollProgress above (wheel runway aware) */

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
    if (!isHomePage || !caseStudySnaps.length) return;
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
    var active = typeof wheelState.active === "number" ? wheelState.active : 0;
    if (e.key === "ArrowUp") {
      if (!caseWheelStack || prefersSnapReduce) {
        window.scrollTo({
          behavior: prefersSnapReduce ? "auto" : "smooth",
          top: 0,
        });
        return;
      }
      var mUp = wheelScrollMetrics();
      if (mUp && window.scrollY <= mUp.start + 12) {
        window.scrollTo({
          behavior: prefersSnapReduce ? "auto" : "smooth",
          top: 0,
        });
        return;
      }
      scrollWheelToIndex(active - 1);
      return;
    }
    scrollWheelToIndex(active + 1);
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
