const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const gridSize = 20;
const rows = canvas.height / gridSize;
const cols = canvas.width / gridSize;

let player = { x: 0, y: 0 };
let octets = [];
const totalOctets = 10;
let score = 0;

function spawnOctets() {
  octets = [];
  while (octets.length < totalOctets) {
    const pos = {
      x: Math.floor(Math.random() * cols),
      y: Math.floor(Math.random() * rows)
    };
    if (!(pos.x === player.x && pos.y === player.y)) {
      octets.push(pos);
    }
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Octets
  ctx.fillStyle = "#0ff";
  octets.forEach(o => {
    ctx.fillRect(o.x * gridSize, o.y * gridSize, gridSize, gridSize);
  });

  // Joueur
  ctx.fillStyle = "#0f0";
  ctx.fillRect(player.x * gridSize, player.y * gridSize, gridSize, gridSize);
}

function updateScore() {
  document.getElementById("score").textContent = "Score : " + score;
}

function checkVictory() {
  if (octets.length === 0) {
    document.getElementById("victory").style.display = "block";
  }
}

document.addEventListener("keydown", e => {
  if (e.key === "ArrowUp" && player.y > 0) player.y--;
  if (e.key === "ArrowDown" && player.y < rows -1) player.y++;
  if (e.key === "ArrowLeft" && player.x > 0) player.x--;
  if (e.key === "ArrowRight" && player.x < cols -1) player.x++;

  for (let i = 0; i < octets.length; i++) {
    if (octets[i].x === player.x && octets[i].y === player.y) {
      octets.splice(i,1);
      score++;
      updateScore();
      checkVictory();
      break;
    }
  }

  draw();
});

spawnOctets();
draw();
updateScore();
