(function () {
  var menuButton = document.querySelector("[data-menu-button]");
  var mobileNav = document.querySelector("[data-mobile-nav]");

  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function () {
      mobileNav.classList.toggle("is-open");
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
  var dotsRoot = document.querySelector("[data-hero-dots]");
  var prev = document.querySelector("[data-hero-prev]");
  var next = document.querySelector("[data-hero-next]");
  var current = 0;
  var timer = null;

  function setSlide(index) {
    if (!slides.length) {
      return;
    }

    current = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("is-active", slideIndex === current);
    });

    if (dotsRoot) {
      Array.prototype.slice.call(dotsRoot.querySelectorAll("button")).forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }
  }

  function startHero() {
    if (timer || slides.length < 2) {
      return;
    }

    timer = window.setInterval(function () {
      setSlide(current + 1);
    }, 5200);
  }

  function stopHero() {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  }

  if (slides.length) {
    if (dotsRoot) {
      slides.forEach(function (_, index) {
        var button = document.createElement("button");
        button.type = "button";
        button.setAttribute("aria-label", "切换第 " + (index + 1) + " 个推荐");
        button.addEventListener("click", function () {
          stopHero();
          setSlide(index);
          startHero();
        });
        dotsRoot.appendChild(button);
      });
    }

    if (prev) {
      prev.addEventListener("click", function () {
        stopHero();
        setSlide(current - 1);
        startHero();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        stopHero();
        setSlide(current + 1);
        startHero();
      });
    }

    setSlide(0);
    startHero();
  }

  var searchInput = document.querySelector("[data-search-input]");
  var yearFilter = document.querySelector("[data-year-filter]");
  var regionFilter = document.querySelector("[data-region-filter]");
  var typeFilter = document.querySelector("[data-type-filter]");
  var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
  var emptyMessage = document.querySelector("[data-empty-message]");

  function fillOptions(select, values) {
    if (!select) {
      return;
    }

    values
      .filter(Boolean)
      .sort(function (a, b) {
        return String(b).localeCompare(String(a), "zh-Hans-CN");
      })
      .forEach(function (value) {
        var option = document.createElement("option");
        option.value = value;
        option.textContent = value;
        select.appendChild(option);
      });
  }

  if (cards.length) {
    fillOptions(yearFilter, Array.from(new Set(cards.map(function (card) {
      return card.getAttribute("data-year") || "";
    }))));

    fillOptions(regionFilter, Array.from(new Set(cards.map(function (card) {
      return card.getAttribute("data-region") || "";
    }))));

    fillOptions(typeFilter, Array.from(new Set(cards.map(function (card) {
      return card.getAttribute("data-type") || "";
    }))));
  }

  function applyFilters() {
    var keyword = searchInput ? searchInput.value.trim().toLowerCase() : "";
    var year = yearFilter ? yearFilter.value : "";
    var region = regionFilter ? regionFilter.value : "";
    var type = typeFilter ? typeFilter.value : "";
    var visible = 0;

    cards.forEach(function (card) {
      var search = (card.getAttribute("data-search") || "").toLowerCase();
      var title = (card.getAttribute("data-title") || "").toLowerCase();
      var matchKeyword = !keyword || search.indexOf(keyword) > -1 || title.indexOf(keyword) > -1;
      var matchYear = !year || card.getAttribute("data-year") === year;
      var matchRegion = !region || card.getAttribute("data-region") === region;
      var matchType = !type || card.getAttribute("data-type") === type;
      var show = matchKeyword && matchYear && matchRegion && matchType;

      card.style.display = show ? "" : "none";

      if (show) {
        visible += 1;
      }
    });

    if (emptyMessage) {
      emptyMessage.classList.toggle("is-visible", visible === 0);
    }
  }

  [searchInput, yearFilter, regionFilter, typeFilter].forEach(function (control) {
    if (control) {
      control.addEventListener("input", applyFilters);
      control.addEventListener("change", applyFilters);
    }
  });

  var params = new URLSearchParams(window.location.search);
  var query = params.get("q");

  if (query && searchInput) {
    searchInput.value = query;
    applyFilters();
  }

  var heroSearch = document.querySelector("[data-hero-search]");
  if (heroSearch) {
    heroSearch.addEventListener("submit", function (event) {
      event.preventDefault();
      var input = heroSearch.querySelector("input");
      var value = input ? input.value.trim() : "";
      window.location.href = value ? "browse.html?q=" + encodeURIComponent(value) : "browse.html";
    });
  }
})();
