document.addEventListener("DOMContentLoaded", function () {
    prepareMenu();
    prepareHero();
    prepareFilters();
    preparePlayers();
});

function prepareMenu() {
    var button = document.querySelector("[data-menu-button]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!button || !nav) {
        return;
    }
    button.addEventListener("click", function () {
        nav.classList.toggle("is-open");
        document.body.classList.toggle("menu-open", nav.classList.contains("is-open"));
    });
}

function prepareHero() {
    var slider = document.querySelector("[data-hero-slider]");
    if (!slider) {
        return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
    var visuals = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-visual]"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
    if (!slides.length) {
        return;
    }
    var current = 0;
    function show(index) {
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle("is-active", slideIndex === current);
        });
        visuals.forEach(function (visual, visualIndex) {
            visual.classList.toggle("is-active", visualIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle("is-active", dotIndex === current);
        });
    }
    dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
            show(index);
        });
    });
    show(0);
    window.setInterval(function () {
        show(current + 1);
    }, 5200);
}

function prepareFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));
    panels.forEach(function (panel) {
        var section = panel.parentElement;
        var input = panel.querySelector("[data-filter-search]");
        var category = panel.querySelector("[data-filter-category]");
        var type = panel.querySelector("[data-filter-type]");
        var year = panel.querySelector("[data-filter-year]");
        var cards = Array.prototype.slice.call(section.querySelectorAll("[data-movie-card]"));
        function normalize(value) {
            return String(value || "").trim().toLowerCase();
        }
        function apply() {
            var query = normalize(input ? input.value : "");
            var categoryValue = normalize(category ? category.value : "");
            var typeValue = normalize(type ? type.value : "");
            var yearValue = normalize(year ? year.value : "");
            cards.forEach(function (card) {
                var textMatch = !query || normalize(card.getAttribute("data-search")).indexOf(query) > -1;
                var categoryMatch = !categoryValue || normalize(card.getAttribute("data-category")) === categoryValue;
                var typeMatch = !typeValue || normalize(card.getAttribute("data-type")).indexOf(typeValue) > -1;
                var yearMatch = !yearValue || normalize(card.getAttribute("data-year")) === yearValue;
                card.hidden = !(textMatch && categoryMatch && typeMatch && yearMatch);
            });
        }
        [input, category, type, year].forEach(function (control) {
            if (control) {
                control.addEventListener("input", apply);
                control.addEventListener("change", apply);
            }
        });
    });
}

function preparePlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-video-player]"));
    players.forEach(function (player) {
        var video = player.querySelector("video");
        var overlay = player.querySelector("[data-player-overlay]");
        var loaded = false;
        var hlsObject = null;
        if (!video) {
            return;
        }
        function load() {
            if (loaded) {
                return;
            }
            loaded = true;
            var streamUrl = video.getAttribute("data-stream");
            if (!streamUrl) {
                return;
            }
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsObject = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsObject.loadSource(streamUrl);
                hlsObject.attachMedia(video);
            } else {
                video.src = streamUrl;
            }
        }
        function start() {
            load();
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(function () {
                    if (overlay) {
                        overlay.classList.remove("is-hidden");
                    }
                });
            }
        }
        if (overlay) {
            overlay.addEventListener("click", start);
        }
        video.addEventListener("click", function () {
            if (video.paused) {
                start();
            }
        });
        video.addEventListener("play", function () {
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
        });
        video.addEventListener("pause", function () {
            if (overlay && video.currentTime === 0) {
                overlay.classList.remove("is-hidden");
            }
        });
        window.addEventListener("beforeunload", function () {
            if (hlsObject) {
                hlsObject.destroy();
            }
        });
    });
}
