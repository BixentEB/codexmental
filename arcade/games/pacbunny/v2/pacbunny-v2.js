const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const gridSize = 32;
const rows = canvas.height / gridSize;
const cols = canvas.width / gridSize;

// Chargement des sprites
const bunnyFrames = [
  new Image(),
  new Image(),
  new Image(),
  new Image()
];
bunnyFrames[0].src = "/arcade/assets/walk1.png";
bunnyFrames[1].src = "/arcade/assets/walk2.png";
bunnyFrames[2].src = "/arcade/assets/walk3.png";
bunnyFrames[3].src = "/arcade/assets/walk4.png";

const carrotImg = new Image();
carrotImg.src = "/arcade/assets/carrot.png";

const croqueurImg = new Image();
croqueurImg.src = "/arcade/assets/alien1.png";

// Joueur
let player = { x: 0, y: 0 };

// Octets (carottes)
let octets = [];
const totalOctets = 5;

// Ennemis croqueurs
let croqueurs = [
  { x: 5, y: 5, dir: 1 },
  { x: 10, y: 10, dir: -1 }
];

let score = 0;
let gameOver = false;
let currentFrame = 0;

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
  octets.forEach(o => {
    ctx.drawImage(carrotImg, o.x * gridSize, o.y * gridSize, gridSize, gridSize);
  });

  // Croqueurs
  croqueurs.forEach(c => {
    ctx.drawImage(croqueurImg, c.x * gridSize, c.y * gridSize, gridSize, gridSize);
  });

  // Joueur (frame courante)
  ctx.drawImage(bunnyFrames[currentFrame], player.x * gridSize, player.y * gridSize, gridSize, gridSize);
}

function updateScore() {
  document.getElementById("score").textContent = "Score : " + score;
}

function checkVictory() {
  if (octets.length === 0) {
    document.getElementById("victory").style.display = "block";
  }
}

function checkCollision() {
  croqueurs.forEach(c => {
    if (c.x === player.x && c.y === player.y) {
      document.getElementById("gameover").style.display = "block";
      gameOver = true;
    }
  });
}

document.addEventListener("keydown", e => {
  if (gameOver) return;

  if (e.key === "ArrowUp" && player.y > 0) player.y--;
  if (e.key === "ArrowDown" && player.y < rows - 1) player.y++;
  if (e.key === "ArrowLeft" && player.x > 0) player.x--;
  if (e.key === "ArrowRight" && player.x < cols - 1) player.x++;

  // Avance la frame (1 -> 2 -> 3 -> 4 -> 1)
  currentFrame = (currentFrame + 1) % bunnyFrames.length;

  // Mange octet
  for (let i = 0; i < octets.length; i++) {
    if (octets[i].x === player.x && octets[i].y === player.y) {
      octets.splice(i, 1);
      score++;
      updateScore();
      checkVictory();
      break;
    }
  }

  checkCollision();
  draw();
});

function moveCroqueurs() {
  if (gameOver) return;
  croqueurs.forEach(c => {
    c.x += c.dir;
    if (c.x <= 0 || c.x >= cols - 1) {
      c.dir *= -1;
    }
  });
  checkCollision();
  draw();
}

// Bouge les ennemis toutes les 500ms
setInterval(moveCroqueurs, 500);

spawnOctets();
draw();
updateScore();
