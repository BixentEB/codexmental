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
bunnyLeftImg.src = "https://bixenteb.github.io/cdxmt/games/bleft.png";

const carrotImg = new Image();
carrotImg.src = "https://bixenteb.github.io/cdxmt/games/carrot.png";

const croqueurImg = new Image();
croqueurImg.src = "https://bixenteb.github.io/cdxmt/games/alien1.png";

// Compteur d'images chargées
let imagesLoaded = 0;
const totalImages = 5;

// Onload pour toutes les images
bunnyUpImg.onload = checkAllImagesLoaded;
bunnyDownImg.onload = checkAllImagesLoaded;
bunnyLeftImg.onload = checkAllImagesLoaded;
carrotImg.onload = checkAllImagesLoaded;
croqueurImg.onload = checkAllImagesLoaded;

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
let facingRight = false;

// Grille du labyrinthe (0=vide,1=mur)
const maze = [
  [0,0,0,0,0,0,0,0,0,0,0,0],
  [0,1,1,0,1,0,1,0,1,0,1,0],
  [0,0,0,0,0,0,0,0,1,0,0,0],
  [0,1,0,1,1,1,1,0,1,0,1,0],
  [0,0,0,0,0,0,0,0,0,0,0,0]
];

function checkAllImagesLoaded() {
  imagesLoaded++;
  if (imagesLoaded === totalImages) {
    spawnOctets();
    draw();
    updateScore();
  }
}

function spawnOctets() {
  octets = [];
  while (octets.length < totalOctets) {
    const pos = {
      x: Math.floor(Math.random() * cols),
      y: Math.floor(Math.random() * rows)
    };
    if (!(pos.x === player.x && pos.y === player.y) && maze[pos.y][pos.x] === 0) {
      octets.push(pos);
    }
  }
}

function draw() {
  // Fond Mars
  ctx.fillStyle = "#330000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Murs
  for (let y = 0; y < maze.length; y++) {
    for (let x = 0; x < maze[y].length; x++) {
      if (maze[y][x] === 1) {
        ctx.fillStyle = "#550000";
        ctx.fillRect(x * gridSize, y * gridSize, gridSize, gridSize);
      }
    }
  }

  // Octets
  octets.forEach(o => {
    ctx.drawImage(carrotImg, o.x * gridSize, o.y * gridSize, gridSize * 0.6, gridSize * 0.6);
  });

  // Croqueurs
  croqueurs.forEach(c => {
    ctx.drawImage(croqueurImg, c.x * gridSize, c.y * gridSize, gridSize, gridSize);
  });

  // Joueur avec flip si besoin
  if (currentBunnyImg === bunnyLeftImg && facingRight) {
    ctx.save();
    ctx.scale(-1,1);
    ctx.drawImage(
      currentBunnyImg,
      -(player.x * gridSize + gridSize),
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

// ZQSD contrôles avec collisions murs et limites
document.addEventListener("keydown", e => {
  if (gameOver) return;
  const key = e.key.toLowerCase();

  let newX = player.x;
  let newY = player.y;

  if (key === "z") newY--;
  if (key === "s") newY++;
  if (key === "q") newX--;
  if (key === "d") newX++;

  // Limites du terrain
  if (newX < 0 || newX >= cols || newY < 0 || newY >= rows) return;

  // Collision mur
  if (maze[newY][newX] === 1) return;

  // Si tout est ok, on bouge
  player.x = newX;
  player.y = newY;

  // Orientation
  if (key === "z") currentBunnyImg = bunnyUpImg;
  if (key === "s") currentBunnyImg = bunnyDownImg;
  if (key === "q") { currentBunnyImg = bunnyLeftImg; facingRight = false; }
  if (key === "d") { currentBunnyImg = bunnyLeftImg; facingRight = true; }

  e.preventDefault();

  // Mange octet
  for (let i = 0; i < octets.length; i++) {
    if (octets[i].x === player.x && octets[i].y === player.y) {
      octets.splice(i,1);
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
