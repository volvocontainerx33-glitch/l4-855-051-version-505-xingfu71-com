(function () {
    function ready(fn) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', fn);
        } else {
            fn();
        }
    }

    function initMenu() {
        var button = document.querySelector('.menu-toggle');
        var menu = document.querySelector('.mobile-nav');
        if (!button || !menu) {
            return;
        }
        button.addEventListener('click', function () {
            var isOpen = menu.hasAttribute('hidden');
            if (isOpen) {
                menu.removeAttribute('hidden');
                button.setAttribute('aria-expanded', 'true');
            } else {
                menu.setAttribute('hidden', '');
                button.setAttribute('aria-expanded', 'false');
            }
        });
    }

    function initHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === index);
            });
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-slide')) || 0);
                restart();
            });
        });
        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                restart();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                restart();
            });
        }
        restart();
    }

    function initFilters() {
        var forms = Array.prototype.slice.call(document.querySelectorAll('[data-filter-form]'));
        forms.forEach(function (form) {
            var scope = form.closest('section') ? form.closest('section').parentElement : document;
            var grid = document.querySelector('[data-card-grid]');
            var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
            var empty = document.querySelector('[data-empty-state]');
            var search = form.querySelector('[data-search-input]');
            var category = form.querySelector('[data-category-filter]');
            var type = form.querySelector('[data-type-filter]');
            var year = form.querySelector('[data-year-filter]');

            function apply() {
                var query = search ? search.value.trim().toLowerCase() : '';
                var categoryValue = category ? category.value : 'all';
                var typeValue = type ? type.value : 'all';
                var yearValue = year ? year.value : 'all';
                var shown = 0;

                cards.forEach(function (card) {
                    var haystack = [
                        card.getAttribute('data-title'),
                        card.getAttribute('data-region'),
                        card.getAttribute('data-type'),
                        card.getAttribute('data-year'),
                        card.getAttribute('data-tags')
                    ].join(' ').toLowerCase();
                    var ok = true;
                    if (query && haystack.indexOf(query) === -1) {
                        ok = false;
                    }
                    if (categoryValue !== 'all' && card.getAttribute('data-category') !== categoryValue) {
                        ok = false;
                    }
                    if (typeValue !== 'all' && card.getAttribute('data-type') !== typeValue) {
                        ok = false;
                    }
                    if (yearValue !== 'all' && card.getAttribute('data-year') !== yearValue) {
                        ok = false;
                    }
                    card.hidden = !ok;
                    if (ok) {
                        shown += 1;
                    }
                });

                if (empty) {
                    empty.hidden = shown !== 0;
                }
                if (grid) {
                    grid.toggleAttribute('data-empty', shown === 0);
                }
            }

            [search, category, type, year].forEach(function (element) {
                if (element) {
                    element.addEventListener('input', apply);
                    element.addEventListener('change', apply);
                }
            });
        });
    }

    function attachSource(video) {
        var src = video.getAttribute('data-video-src');
        if (!src || video.getAttribute('data-ready') === '1') {
            return;
        }
        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(src);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.ERROR, function (eventName, data) {
                if (!data || !data.fatal) {
                    return;
                }
                if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                    hls.startLoad();
                } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                    hls.recoverMediaError();
                } else {
                    hls.destroy();
                    video.src = src;
                }
            });
            video._hlsInstance = hls;
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = src;
        } else {
            video.src = src;
        }
        video.setAttribute('data-ready', '1');
    }

    function initPlayers() {
        var videos = Array.prototype.slice.call(document.querySelectorAll('.movie-player'));
        videos.forEach(function (video) {
            var frame = video.closest('.video-frame');
            var button = frame ? frame.querySelector('[data-play-target]') : null;
            var play = function () {
                attachSource(video);
                if (button) {
                    button.classList.add('is-hidden');
                }
                var promise = video.play();
                if (promise && typeof promise.catch === 'function') {
                    promise.catch(function () {
                        if (button) {
                            button.classList.remove('is-hidden');
                        }
                    });
                }
            };
            if (button) {
                button.addEventListener('click', play);
            }
            video.addEventListener('play', function () {
                if (button) {
                    button.classList.add('is-hidden');
                }
            });
            video.addEventListener('pause', function () {
                if (button && video.currentTime === 0) {
                    button.classList.remove('is-hidden');
                }
            });
        });
    }

    ready(function () {
        initMenu();
        initHero();
        initFilters();
        initPlayers();
    });
}());
