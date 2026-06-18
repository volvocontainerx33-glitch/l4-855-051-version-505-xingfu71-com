(function () {
  function initMoviePlayer(videoId, sourceUrl) {
    var video = document.getElementById(videoId);
    var cover = document.querySelector('[data-player-cover="' + videoId + '"]');

    if (!video) {
      return;
    }

    var attached = false;

    function attachSource() {
      if (attached) {
        return;
      }

      attached = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = sourceUrl;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });

        hls.loadSource(sourceUrl);
        hls.attachMedia(video);
        video.hlsController = hls;
        return;
      }

      video.src = sourceUrl;
    }

    function startPlayback() {
      attachSource();

      if (cover) {
        cover.classList.add("is-hidden");
      }

      video.controls = true;

      var playPromise = video.play();

      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {});
      }
    }

    if (cover) {
      cover.addEventListener("click", startPlayback);
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        startPlayback();
      }
    });

    video.addEventListener("play", function () {
      if (cover) {
        cover.classList.add("is-hidden");
      }
    });
  }

  window.initMoviePlayer = initMoviePlayer;
})();
