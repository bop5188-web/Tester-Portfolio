(function () {
  var isWorkPage = document.body.classList.contains("page-work");
  var isHomePage = document.documentElement.classList.contains("page-home");

  /* --- Top chrome: nav + progress (hidden on Spline until scroll on home) --- */
  var topChrome = document.getElementById("topChrome");
  var spline = document.querySelector("spline-viewer");
  var scrollHint = document.querySelector(".scroll-into-work");

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

  /* --- Home / name → scroll to top when already on homepage --- */
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
    var homeMain = document.getElementById("main");

    if (isHomePage && homeMain) {
      if (topChrome) {
        topChrome.classList.add("is-visible");
        topChrome.setAttribute("aria-hidden", "false");
      }
      var start = homeMain.offsetTop;
      var end = Math.max(start + 1, document.documentElement.scrollHeight - vh);
      if (sy >= start) {
        p = (sy - start) / (end - start);
      }
    } else if (!isHomePage) {
      var doc = document.documentElement;
      var max = doc.scrollHeight - window.innerHeight;
      p = max > 0 ? sy / max : 0;
      if (topChrome && !topChrome.classList.contains("top-chrome--always")) {
        topChrome.classList.add("is-visible");
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

  /* --- Case study panel (iframe) --- */
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
    var closeBtn = casePanel.querySelector(
      "[data-close-case-panel].case-study-panel__close"
    );
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

  /* --- Home: connect experience ↔ skills --- */
  var expItems = document.querySelectorAll(".home-exp[data-skills]");
  var skillTiles = document.querySelectorAll(".home-skill-tile[data-skill]");
  var expTimeline = document.getElementById("homeExpTimeline");
  var skillBelts = document.getElementById("homeSkillBelts");

  function clearSkillLinks() {
    expItems.forEach(function (el) {
      el.classList.remove("is-lit");
    });
    skillTiles.forEach(function (el) {
      el.classList.remove("is-lit");
    });
    if (expTimeline) expTimeline.classList.remove("is-dim");
    if (skillBelts) skillBelts.classList.remove("is-dim");
  }

  function lightSkills(keys) {
    skillTiles.forEach(function (tile) {
      var key = tile.getAttribute("data-skill");
      tile.classList.toggle("is-lit", keys.indexOf(key) !== -1);
    });
  }

  function lightExperience(skillKey) {
    expItems.forEach(function (exp) {
      var keys = (exp.getAttribute("data-skills") || "").split(/\s+/);
      exp.classList.toggle("is-lit", keys.indexOf(skillKey) !== -1);
    });
  }

  if (expItems.length && skillTiles.length) {
    expItems.forEach(function (exp) {
      exp.addEventListener("mouseenter", function () {
        var keys = (exp.getAttribute("data-skills") || "").trim().split(/\s+/);
        clearSkillLinks();
        exp.classList.add("is-lit");
        lightSkills(keys);
        if (skillBelts) skillBelts.classList.add("is-dim");
      });
      exp.addEventListener("mouseleave", clearSkillLinks);
      exp.addEventListener("focusin", function () {
        var keys = (exp.getAttribute("data-skills") || "").trim().split(/\s+/);
        clearSkillLinks();
        exp.classList.add("is-lit");
        lightSkills(keys);
        if (skillBelts) skillBelts.classList.add("is-dim");
      });
      exp.addEventListener("focusout", function (e) {
        if (!exp.contains(e.relatedTarget)) clearSkillLinks();
      });
    });

    skillTiles.forEach(function (tile) {
      tile.setAttribute("tabindex", "0");
      tile.addEventListener("mouseenter", function () {
        var key = tile.getAttribute("data-skill");
        clearSkillLinks();
        tile.classList.add("is-lit");
        lightExperience(key);
        if (expTimeline) expTimeline.classList.add("is-dim");
      });
      tile.addEventListener("mouseleave", clearSkillLinks);
      tile.addEventListener("focus", function () {
        var key = tile.getAttribute("data-skill");
        clearSkillLinks();
        tile.classList.add("is-lit");
        lightExperience(key);
        if (expTimeline) expTimeline.classList.add("is-dim");
      });
      tile.addEventListener("blur", clearSkillLinks);
    });
  }

  /* --- Scroll reveals for experience + skills --- */
  var revealReduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var revealNodes = document.querySelectorAll(".home-exp, .home-skill-belt");

  document.querySelectorAll(".home-skill-belt").forEach(function (belt) {
    belt.querySelectorAll(".home-skill-tile").forEach(function (tile, i) {
      tile.style.setProperty("--t", String(i));
    });
  });

  if (revealReduce) {
    revealNodes.forEach(function (el) {
      el.classList.add("is-inview");
    });
  } else if ("IntersectionObserver" in window && revealNodes.length) {
    var revealObs = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-inview");
          revealObs.unobserve(entry.target);
        });
      },
      { threshold: 0.18, rootMargin: "0px 0px -8% 0px" }
    );
    revealNodes.forEach(function (el) {
      revealObs.observe(el);
    });
  } else {
    revealNodes.forEach(function (el) {
      el.classList.add("is-inview");
    });
  }

  /* --- Experience neon line: grow orb → orb on scroll --- */
  var expSection = document.getElementById("experience");
  var expRail = expSection
    ? expSection.querySelector(".home-experience__rail")
    : null;
  var expLine = expSection
    ? expSection.querySelector(".home-exp-line")
    : null;
  var expOrbs = expSection
    ? expSection.querySelectorAll(".home-exp__orb")
    : [];
  var expCards = expSection
    ? expSection.querySelectorAll(".home-exp")
    : [];
  var expLineRaf = 0;

  function clamp01(n) {
    return Math.max(0, Math.min(1, n));
  }

  function layoutExpLine() {
    if (!expRail || !expLine || expOrbs.length < 2) return;
    var railRect = expRail.getBoundingClientRect();
    var first = expOrbs[0].getBoundingClientRect();
    var last = expOrbs[expOrbs.length - 1].getBoundingClientRect();
    var left = first.left + first.width / 2 - railRect.left + expRail.scrollLeft;
    var right =
      railRect.width -
      (last.left + last.width / 2 - railRect.left + expRail.scrollLeft);
    var top = first.top + first.height / 2 - railRect.top - 1.5;
    expLine.style.left = left + "px";
    expLine.style.right = Math.max(0, right) + "px";
    expLine.style.top = top + "px";
  }

  function updateExpLineProgress() {
    if (!expSection || !expRail) return;
    layoutExpLine();

    if (revealReduce) {
      expSection.style.setProperty("--line-progress", "1");
      expCards.forEach(function (card) {
        card.classList.add("is-connected");
      });
      return;
    }

    var rect = expRail.getBoundingClientRect();
    var vh = window.innerHeight || 1;
    var start = vh * 0.72;
    var end = vh * 0.28;
    var travel = Math.max(rect.height + (start - end), 1);
    var yProgress = clamp01((start - rect.top) / travel);

    var maxScroll = Math.max(expRail.scrollWidth - expRail.clientWidth, 0);
    var xProgress = maxScroll > 0 ? clamp01(expRail.scrollLeft / maxScroll) : 0;
    var progress = Math.max(yProgress, xProgress);

    expSection.style.setProperty("--line-progress", progress.toFixed(4));

    var last = Math.max(expCards.length - 1, 1);
    expCards.forEach(function (card, i) {
      var threshold = i / last;
      card.classList.toggle("is-connected", progress >= threshold - 0.03);
    });
  }

  function scheduleExpLineUpdate() {
    if (expLineRaf) return;
    expLineRaf = window.requestAnimationFrame(function () {
      expLineRaf = 0;
      updateExpLineProgress();
    });
  }

  if (expSection && expRail) {
    updateExpLineProgress();
    window.addEventListener("scroll", scheduleExpLineUpdate, { passive: true });
    window.addEventListener("resize", scheduleExpLineUpdate);
    expRail.addEventListener("scroll", scheduleExpLineUpdate, { passive: true });
  }

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
