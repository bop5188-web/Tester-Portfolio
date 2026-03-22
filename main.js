(function () {
  var cards = document.querySelectorAll(".float-card[data-reveal]");
  if (!cards.length || !("IntersectionObserver" in window)) {
    cards.forEach(function (el) {
      el.classList.add("is-visible");
    });
  } else {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
    );

    cards.forEach(function (el) {
      observer.observe(el);
    });
  }

  var header = document.querySelector(".site-header");
  var heroSpacer = document.querySelector(".hero-spacer");
  if (!header || !heroSpacer) return;

  function updateHeader() {
    var bottom = heroSpacer.getBoundingClientRect().bottom;
    var pastHero = bottom < 72;
    header.classList.toggle("site-header--visible", pastHero);
    header.classList.toggle("site-header--light", pastHero);
  }

  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });
  window.addEventListener("resize", updateHeader, { passive: true });
})();
