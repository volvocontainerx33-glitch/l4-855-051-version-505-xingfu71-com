(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-site-nav]');
    var search = document.querySelector('.header-search');

    if (menuButton && nav) {
        menuButton.addEventListener('click', function () {
            nav.classList.toggle('is-open');
            if (search) {
                search.classList.toggle('is-open');
            }
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var thumbs = Array.prototype.slice.call(document.querySelectorAll('[data-hero-target]'));
    var next = document.querySelector('[data-hero-next]');
    var prev = document.querySelector('[data-hero-prev]');
    var active = 0;
    var timer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }

        active = (index + slides.length) % slides.length;

        slides.forEach(function (slide, idx) {
            slide.classList.toggle('is-active', idx === active);
        });

        thumbs.forEach(function (thumb, idx) {
            thumb.classList.toggle('is-active', idx === active);
        });
    }

    function startHero() {
        if (timer || slides.length < 2) {
            return;
        }

        timer = window.setInterval(function () {
            showSlide(active + 1);
        }, 5200);
    }

    function restartHero() {
        if (timer) {
            window.clearInterval(timer);
            timer = null;
        }
        startHero();
    }

    thumbs.forEach(function (thumb) {
        thumb.addEventListener('click', function () {
            showSlide(Number(thumb.getAttribute('data-hero-target')) || 0);
            restartHero();
        });
    });

    if (next) {
        next.addEventListener('click', function () {
            showSlide(active + 1);
            restartHero();
        });
    }

    if (prev) {
        prev.addEventListener('click', function () {
            showSlide(active - 1);
            restartHero();
        });
    }

    showSlide(0);
    startHero();

    var filterRoot = document.querySelector('[data-filter-root]');

    if (filterRoot) {
        var localSearch = filterRoot.querySelector('[data-local-search]');
        var regionSelect = filterRoot.querySelector('[data-region-filter]');
        var typeSelect = filterRoot.querySelector('[data-type-filter]');
        var cards = Array.prototype.slice.call(filterRoot.querySelectorAll('.movie-card'));
        var empty = filterRoot.querySelector('[data-empty-state]');
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q');

        if (query && localSearch) {
            localSearch.value = query;
        }

        function normalize(value) {
            return String(value || '').trim().toLowerCase();
        }

        function applyFilters() {
            var keyword = normalize(localSearch ? localSearch.value : '');
            var region = regionSelect ? regionSelect.value : '';
            var type = typeSelect ? typeSelect.value : '';
            var visible = 0;

            cards.forEach(function (card) {
                var text = normalize(card.getAttribute('data-search'));
                var cardRegion = card.getAttribute('data-region') || '';
                var cardType = card.getAttribute('data-type') || '';
                var matched = true;

                if (keyword && text.indexOf(keyword) === -1) {
                    matched = false;
                }

                if (region && cardRegion !== region) {
                    matched = false;
                }

                if (type && cardType !== type) {
                    matched = false;
                }

                card.style.display = matched ? '' : 'none';
                if (matched) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle('is-visible', visible === 0);
            }
        }

        [localSearch, regionSelect, typeSelect].forEach(function (item) {
            if (item) {
                item.addEventListener('input', applyFilters);
                item.addEventListener('change', applyFilters);
            }
        });

        applyFilters();
    }
})();
