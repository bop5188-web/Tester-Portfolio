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
  var hero = document.querySelector(".hero");
  if (!header || !hero) return;

  function updateHeaderTheme() {
    var heroBottom = hero.getBoundingClientRect().bottom;
    if (heroBottom < 72) {
      header.classList.add("site-header--light");
    } else {
      header.classList.remove("site-header--light");
    }
  }

  updateHeaderTheme();
  window.addEventListener("scroll", updateHeaderTheme, { passive: true });
  window.addEventListener("resize", updateHeaderTheme, { passive: true });
})();
