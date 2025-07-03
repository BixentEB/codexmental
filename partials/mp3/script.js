let player;
let isPlaying = false;

// Remplace par TON ID de playlist YouTube
const playlistId = "PLT-yriVgmcnC9pZ3EtA08WmtcBGWjwxkt";

function onYouTubeIframeAPIReady() {
  player = new YT.Player('player', {
    height: '0',
    width: '0',
    playerVars: {
      listType: 'playlist',
      list: playlistId,
      index: 0,
      autoplay: 0
    }
  });
}

// Gestion des boutons
document.getElementById("music-icon").addEventListener("click", () => {
  const controls = document.getElementById("controls-bar");
  controls.classList.toggle("hidden");
});

document.getElementById("play").addEventListener("click", () => {
  if (player) {
    player.playVideo();
    isPlaying = true;
  }
});

document.getElementById("pause").addEventListener("click", () => {
  if (player) {
    player.pauseVideo();
    isPlaying = false;
  }
});

document.getElementById("next").addEventListener("click", () => {
  if (player) {
    player.nextVideo();
  }
});

document.getElementById("prev").addEventListener("click", () => {
  if (player) {
    player.previousVideo();
  }
});

document.getElementById("repeat").addEventListener("click", () => {
  if (player) {
    player.seekTo(0);
    player.playVideo();
  }
});

document.getElementById("volume").addEventListener("input", (e) => {
  if (player) {
    player.setVolume(e.target.value);
  }
});

document.getElementById("playlist-toggle").addEventListener("click", () => {
  const playlist = document.getElementById("playlist");
  playlist.classList.toggle("hidden");
});

// Pour afficher un titre de test
document.getElementById("track-title").textContent = "Playlist YouTube chargée...";

// Récupérer le titre via API
player.addEventListener("onStateChange", function(event) {
  if (event.data === YT.PlayerState.PLAYING) {
    const videoData = player.getVideoData();
    document.getElementById("track-title").textContent = videoData.title;
  }
});

