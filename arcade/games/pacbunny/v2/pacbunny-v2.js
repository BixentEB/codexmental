// Canvas setup
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const gridSize = 32;
const rows = canvas.height / gridSize;
const cols = canvas.width / gridSize;

// Chargement des sprites
const bunnyUpImg = new Image();
bunnyUpImg.src = "https://bixenteb.github.io/cdxmt/games/bback.png";

const bunnyDownImg = new Image();
bunnyDownImg.src = "https://bixenteb.github.io/cdxmt/games/bfront.png";

const bunnyLeftImg = new Image();
bunnyLeftImg.src = "https://bixenteb.github.io/cdxmt/games/bleft.png"; // Mets ici ton profil gauche

// On utilisera bunnyLeftImg retourné pour la droite

const carrotImg = new Image();
carrotImg.src = "https://bixenteb.github.io/cdxmt/games/carrot.png";

const croqueurImg = new Image();
croqueurImg.src = "https://bixenteb.github.io/cdxmt/games/alien.png";

// Joueur
let player = { x: 0, y: 0 };

// Octets
let octets = [];
const totalOctets = 5;

// Ennemis
let croqueurs = [
  { x: 5, y: 5, dir: 1 },
  { x: 10, y: 10, dir: -1 }
];

let score = 0;
let gameOver = false;

// Image actuelle
let currentBunnyImg = bunnyDownImg;
let facingRight = false; // Pour savoir si on doit retourner l'image

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

  // Joueur avec gestion du flip horizontal si à droite
  if (currentBunnyImg === bunnyLeftImg && facingRight) {
    ctx.save();
    ctx.scale(-1, 1);
    ctx.drawImage(
      currentBunnyImg,
      -(player.x * gridSize + gridSize), // inversion horizontale
      player.y * gridSize,
      gridSize,
      gridSize
    );
    ctx.restore();
  } else {
    ctx.drawImage(
      currentBunnyImg,
      player.x * gridSize,
      player.y * gridSize,
      gridSize,
      gridSize
    );
  }
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

// Gestion des touches ZQSD
document.addEventListener("keydown", e => {
  if (gameOver) return;

  if (e.key === "z" && player.y > 0) {
    player.y--;
    currentBunnyImg = bunnyUpImg;
  }
  if (e.key === "s" && player.y < rows -1) {
    player.y++;
    currentBunnyImg = bunnyDownImg;
  }
  if (e.key === "q" && player.x > 0) {
    player.x--;
    currentBunnyImg = bunnyLeftImg;
    facingRight = false;
  }
  if (e.key === "d" && player.x < cols -1) {
    player.x++;
    currentBunnyImg = bunnyLeftImg;
    facingRight = true;
  }

  // Empêcher le scroll de la page
  e.preventDefault();

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
    if (c.x <= 0 || c.x >= cols -1) {
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
