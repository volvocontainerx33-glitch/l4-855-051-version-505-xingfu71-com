(function() {
  var navButton = document.querySelector('[data-nav-toggle]');
  var navPanel = document.querySelector('[data-nav-panel]');

  if (navButton && navPanel) {
    navButton.addEventListener('click', function() {
      navPanel.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero__slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero__dot'));
    var active = 0;

    function showSlide(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function(slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === active);
      });
      dots.forEach(function(dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === active);
      });
    }

    dots.forEach(function(dot, index) {
      dot.addEventListener('click', function() {
        showSlide(index);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function() {
        showSlide(active + 1);
      }, 5200);
    }
  }

  function normalize(value) {
    return (value || '').toString().toLowerCase().trim();
  }

  function applyCardState(scope) {
    var input = scope.querySelector('[data-card-search]');
    var activeFilter = scope.querySelector('[data-filter-group] .filter-pill.is-active');
    var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card, .rank-item'));
    var empty = scope.querySelector('[data-empty-state]');
    var query = normalize(input ? input.value : '');
    var filter = activeFilter ? activeFilter.getAttribute('data-filter-value') : 'all';
    var visibleCount = 0;

    cards.forEach(function(card) {
      var haystack = normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-tags'),
        card.getAttribute('data-region'),
        card.getAttribute('data-year'),
        card.getAttribute('data-type')
      ].join(' '));
      var type = card.getAttribute('data-type') || '';
      var matchQuery = !query || haystack.indexOf(query) !== -1;
      var matchFilter = !filter || filter === 'all' || type === filter;
      var show = matchQuery && matchFilter;
      card.classList.toggle('is-hidden', !show);
      if (show) {
        visibleCount += 1;
      }
    });

    if (empty) {
      empty.classList.toggle('is-visible', visibleCount === 0);
    }
  }

  document.querySelectorAll('.search-scope').forEach(function(scope) {
    var input = scope.querySelector('[data-card-search]');
    var filterButtons = Array.prototype.slice.call(scope.querySelectorAll('[data-filter-group] .filter-pill'));

    if (input) {
      input.addEventListener('input', function() {
        applyCardState(scope);
      });
    }

    filterButtons.forEach(function(button) {
      button.addEventListener('click', function() {
        filterButtons.forEach(function(item) {
          item.classList.remove('is-active');
        });
        button.classList.add('is-active');
        applyCardState(scope);
      });
    });
  });
}());
