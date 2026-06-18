(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
      menuButton.addEventListener('click', function () {
        mobileNav.classList.toggle('open');
      });
    }

    var slider = document.querySelector('[data-hero-slider]');

    if (slider) {
      var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
      var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
      var prev = slider.querySelector('[data-hero-prev]');
      var next = slider.querySelector('[data-hero-next]');
      var index = 0;

      function show(nextIndex) {
        if (!slides.length) {
          return;
        }

        index = (nextIndex + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle('active', slideIndex === index);
        });

        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle('active', dotIndex === index);
        });
      }

      if (prev) {
        prev.addEventListener('click', function () {
          show(index - 1);
        });
      }

      if (next) {
        next.addEventListener('click', function () {
          show(index + 1);
        });
      }

      dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
          show(Number(dot.getAttribute('data-hero-dot') || 0));
        });
      });

      window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    var cardList = document.querySelector('[data-card-list]');

    if (cardList) {
      var searchInput = document.querySelector('[data-search-input]');
      var categorySelect = document.querySelector('[data-category-select]');
      var sortSelect = document.querySelector('[data-sort-select]');
      var emptyState = document.querySelector('[data-empty-state]');
      var cards = Array.prototype.slice.call(cardList.querySelectorAll('.movie-card'));

      function applyFilters() {
        var term = searchInput ? searchInput.value.trim().toLowerCase() : '';
        var category = categorySelect ? categorySelect.value : 'all';
        var visible = 0;

        cards.forEach(function (card) {
          var matchesText = !term || (card.getAttribute('data-search') || '').indexOf(term) !== -1;
          var matchesCategory = category === 'all' || (card.getAttribute('data-category') || '') === category;
          var showCard = matchesText && matchesCategory;

          card.style.display = showCard ? '' : 'none';

          if (showCard) {
            visible += 1;
          }
        });

        if (emptyState) {
          emptyState.style.display = visible ? 'none' : 'block';
        }
      }

      function applySort() {
        var mode = sortSelect ? sortSelect.value : 'default';
        var sorted = cards.slice();

        if (mode === 'year') {
          sorted.sort(function (a, b) {
            return Number(b.getAttribute('data-year') || 0) - Number(a.getAttribute('data-year') || 0);
          });
        }

        if (mode === 'views') {
          sorted.sort(function (a, b) {
            return Number(b.getAttribute('data-views') || 0) - Number(a.getAttribute('data-views') || 0);
          });
        }

        if (mode === 'default') {
          sorted.sort(function (a, b) {
            return cards.indexOf(a) - cards.indexOf(b);
          });
        }

        sorted.forEach(function (card) {
          cardList.appendChild(card);
        });

        applyFilters();
      }

      if (searchInput) {
        searchInput.addEventListener('input', applyFilters);
      }

      if (categorySelect) {
        categorySelect.addEventListener('change', applyFilters);
      }

      if (sortSelect) {
        sortSelect.addEventListener('change', applySort);
      }
    }
  });
})();
