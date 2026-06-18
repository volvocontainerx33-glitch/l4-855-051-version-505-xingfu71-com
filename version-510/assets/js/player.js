(function () {
    var videos = Array.prototype.slice.call(document.querySelectorAll('.movie-video'));

    function attachStream(video, stream) {
        if (video.dataset.ready === '1') {
            return;
        }

        video.dataset.ready = '1';

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = stream;
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });

            hls.loadSource(stream);
            hls.attachMedia(video);
            video._hlsInstance = hls;
            return;
        }

        video.src = stream;
    }

    videos.forEach(function (video) {
        var stream = video.getAttribute('data-stream');
        var shell = video.closest('.video-shell');
        var cover = shell ? shell.querySelector('.player-cover') : null;

        if (!stream) {
            return;
        }

        function start() {
            attachStream(video, stream);

            if (cover) {
                cover.classList.add('is-hidden');
            }

            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {});
            }
        }

        if (cover) {
            cover.addEventListener('click', start);
        }

        video.addEventListener('click', function () {
            if (video.paused) {
                start();
            }
        });

        video.addEventListener('play', function () {
            if (cover) {
                cover.classList.add('is-hidden');
            }
        });
    });

    window.addEventListener('pagehide', function () {
        videos.forEach(function (video) {
            if (video._hlsInstance) {
                video._hlsInstance.destroy();
                video._hlsInstance = null;
            }
        });
    });
})();
