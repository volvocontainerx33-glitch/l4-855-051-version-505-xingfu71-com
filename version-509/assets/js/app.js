(function () {
    function ready(fn) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', fn);
        } else {
            fn();
        }
    }

    function initMenu() {
        var toggle = document.querySelector('.menu-toggle');
        var nav = document.querySelector('.site-nav');
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener('click', function () {
            nav.classList.toggle('open');
        });
    }

    function initHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
        var prev = document.querySelector('.hero-prev');
        var next = document.querySelector('.hero-next');
        if (!slides.length) {
            return;
        }
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === current);
            });
        }

        function restart() {
            if (timer) {
                clearInterval(timer);
            }
            timer = setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
                restart();
            });
        });
        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                restart();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                restart();
            });
        }
        restart();
    }

    function initFilters() {
        var grids = Array.prototype.slice.call(document.querySelectorAll('.searchable-grid'));
        if (!grids.length) {
            return;
        }
        var search = document.querySelector('.site-search');
        var year = document.querySelector('.year-filter');

        function yearMatch(cardYear, chosen) {
            if (!chosen) {
                return true;
            }
            if (chosen === '2010') {
                return /^201/.test(cardYear);
            }
            if (chosen === '2000') {
                return /^200/.test(cardYear);
            }
            return cardYear === chosen;
        }

        function apply() {
            var query = search ? search.value.trim().toLowerCase() : '';
            var chosenYear = year ? year.value : '';
            grids.forEach(function (grid) {
                Array.prototype.slice.call(grid.querySelectorAll('.movie-card')).forEach(function (card) {
                    var text = (card.textContent + ' ' + (card.dataset.meta || '')).toLowerCase();
                    var cardYear = card.dataset.year || '';
                    var visible = (!query || text.indexOf(query) !== -1) && yearMatch(cardYear, chosenYear);
                    card.classList.toggle('is-hidden', !visible);
                });
            });
        }

        if (search) {
            search.addEventListener('input', apply);
            var params = new URLSearchParams(window.location.search);
            if (params.get('q')) {
                search.value = params.get('q');
            }
        }
        if (year) {
            year.addEventListener('change', apply);
        }
        apply();
    }

    window.setupMoviePlayer = function (videoId, mediaUrl, coverId) {
        var video = document.getElementById(videoId);
        var cover = document.getElementById(coverId);
        if (!video || !cover || !mediaUrl) {
            return;
        }
        var prepared = false;
        var hls = null;

        function prepare() {
            if (prepared) {
                return;
            }
            prepared = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = mediaUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(mediaUrl);
                hls.attachMedia(video);
            } else {
                video.src = mediaUrl;
            }
        }

        function play() {
            prepare();
            cover.classList.add('is-hidden');
            var promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {
                    cover.classList.remove('is-hidden');
                });
            }
        }

        cover.addEventListener('click', play);
        video.addEventListener('click', function () {
            if (video.paused) {
                play();
            }
        });
        video.addEventListener('play', function () {
            cover.classList.add('is-hidden');
        });
        window.addEventListener('pagehide', function () {
            if (hls && typeof hls.destroy === 'function') {
                hls.destroy();
            }
        });
    };

    ready(function () {
        initMenu();
        initHero();
        initFilters();
    });
})();
