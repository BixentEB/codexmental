let player;
let isPlaying = false;
const tracks = [
  "https://www.youtube.com/watch?v=dQw4w9WgXcQ", // Remplace par tes liens
  "https://www.youtube.com/watch?v=DLzxrzFCyOs",
  "https://www.youtube.com/watch?v=9bZkp7q19f0"
];
let currentIndex = 0;

// Charger l'API YouTube
function onYouTubeIframeAPIReady() {
  player = new YT.Player('player', {
    height: '0',
    width: '0',
    videoId: extractVideoId(tracks[currentIndex]),
    playerVars: {
      'playsinline': 1
    }
  });
}

// Helpers
function extractVideoId(url) {
  const regex = /[?&]v=([^&]+)/;
  const match = url.match(regex);
  return match ? match[1] : "";
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
  currentIndex = (currentIndex + 1) % tracks.length;
  loadTrack(currentIndex);
});

document.getElementById("prev").addEventListener("click", () => {
  currentIndex = (currentIndex - 1 + tracks.length) % tracks.length;
  loadTrack(currentIndex);
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
  document.getElementById("playlist").classList.toggle("hidden");
});

document.querySelectorAll("#playlist li").forEach(li => {
  li.addEventListener("click", () => {
    currentIndex = parseInt(li.dataset.index, 10);
    loadTrack(currentIndex);
  });
});

function loadTrack(index) {
  const videoId = extractVideoId(tracks[index]);
  player.loadVideoById(videoId);
  document.getElementById("track-title").textContent = "Lecture : " + liText(index);
}

function liText(index) {
  return document.querySelector(`#playlist li[data-index="${index}"]`).textContent;
}
