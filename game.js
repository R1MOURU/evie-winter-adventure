
const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");

const startButton = document.getElementById("start-button");
const introScreen = document.getElementById("intro-screen");
const battleScreen = document.getElementById("battle-screen");
const endingScreen = document.getElementById("ending-screen");

const enemyName = document.getElementById("enemy-name");
const enemyHealth = document.getElementById("enemy-health");
const battleMessage = document.getElementById("battle-message");

const attackButton = document.getElementById("attack-button");
const healButton = document.getElementById("heal-button");

const endingMessage = document.getElementById("ending-message");

const dialogueBox = document.getElementById("dialogue-box");
const dialogueText = document.getElementById("dialogue-text");
const dialogueButton = document.getElementById("dialogue-button");

const W = canvas.width;
const H = canvas.height;

let gameState = "intro";
let progress = 0;
let lastTime = 0;
let playerX = 135;
let playerHP = 100;
let currentEnemy = null;
let healUses = 0;
let snowflakes = [];

const encounters = [
  {
    position: 0.22,
    name: "The Fatigue",
    hp: 65,
    maxHP: 65,
    attacks: ["Energy Drain", "Sleepy Fog"],
    damage: [9, 13]
  },
  {
    position: 0.48,
    name: "The Annoying Colleague",
    hp: 75,
    maxHP: 75,
    attacks: [
      "WHY ARE YOU TALKING SO QUIET?!",
      "Say That Again!"
    ],
    damage: [11, 15]
  },
  {
    position: 0.74,
    name: "The Examinator",
    hp: 90,
    maxHP: 90,
    attacks: ["Tricky Question", "Pop Quiz!"],
    damage: [13, 17]
  }
];

const loveMessages = [
  "Just thinking about you makes me smile. ❤️",
  "I wish you were here with me right now.",
  "You're my favorite person in the whole world.",
  "Sending you a little kiss! 💋",
  "I love you more than all the stars.",
  "Can't wait to hug you again. ❤️"
];

const coffeeMessages = [
  "Freshly brewed justice!",
  "Caffeine-powered attack!",
  "Take that, you annoying little monster!"
];

function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function initSnow() {
  snowflakes = [];

  for (let i = 0; i < 45; i++) {
    snowflakes.push({
      x: random(0, W),
      y: random(0, H),
      speed: random(15, 40),
      size: random(1, 3)
    });
  }
}

function drawTree(x, y, scale = 1) {
  const s = scale;

  ctx.fillStyle = "#574b48";
  ctx.fillRect(x - 3 * s, y, 6 * s, 12 * s);

  ctx.fillStyle = "#234c49";
  ctx.fillRect(x - 10 * s, y - 14 * s, 20 * s, 13 * s);
  ctx.fillRect(x - 7 * s, y - 23 * s, 14 * s, 12 * s);
  ctx.fillRect(x - 4 * s, y - 31 * s, 8 * s, 10 * s);

  ctx.fillStyle = "#d9eef1";
  ctx.fillRect(x - 7 * s, y - 21 * s, 14 * s, 3 * s);
  ctx.fillRect(x - 4 * s, y - 30 * s, 8 * s, 3 * s);
}

function drawForest() {
  ctx.fillStyle = "#b9d9e5";
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = "#dcebf0";
  ctx.fillRect(0, 0, W, H);

  // Snowy hills
  ctx.fillStyle = "#a5c8d6";
  ctx.fillRect(0, 75, W, 120);
  ctx.fillRect(0, 300, W, 100);

  // Winding trail
  ctx.fillStyle = "#e8d9c0";
  ctx.beginPath();
  ctx.moveTo(112, 0);
  ctx.lineTo(165, 0);
  ctx.lineTo(175, 120);
  ctx.lineTo(120, 220);
  ctx.lineTo(145, 330);
  ctx.lineTo(100, 480);
  ctx.lineTo(0, 480);
  ctx.lineTo(0, 350);
  ctx.lineTo(65, 220);
  ctx.lineTo(80, 120);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#f7ebd7";
  ctx.fillRect(90, 0, 35, H);

  // Trees
  for (let y = -20; y < H + 40; y += 90) {
    drawTree(22, y + 25, 1.1);
    drawTree(240, y + 65, 1.2);
    drawTree(65, y + 80, 0.65);
    drawTree(195, y + 5, 0.7);
  }

  // Snow patches
  ctx.fillStyle = "#fff";
  for (let i = 0; i < 35; i++) {
    const x = (i * 73) % W;
    const y = (i * 107 + progress * 80) % H;
    ctx.fillRect(x, y, 3, 3);
  }
}

function drawPrincess(x, y) {
  const px = Math.round(x);
  const py = Math.round(y);

  // Hair
  ctx.fillStyle = "#49302f";
  ctx.fillRect(px - 9, py - 18, 18, 20);
  ctx.fillRect(px - 11, py - 10, 4, 17);
  ctx.fillRect(px + 7, py - 10, 4, 17);

  // Face
  ctx.fillStyle = "#f2c5a7";
  ctx.fillRect(px - 6, py - 17, 12, 12);

  // Eyes
  ctx.fillStyle = "#704331";
  ctx.fillRect(px - 4, py - 13, 2, 2);
  ctx.fillRect(px + 3, py - 13, 2, 2);

  // Winter dress
  ctx.fillStyle = "#a86d91";
  ctx.fillRect(px - 8, py - 5, 16, 13);
  ctx.fillRect(px - 11, py + 3, 22, 5);

  // White collar
  ctx.fillStyle = "#fff1dc";
  ctx.fillRect(px - 5, py - 6, 10, 3);

  // Boots
  ctx.fillStyle = "#574b61";
  ctx.fillRect(px - 7, py + 8, 5, 4);
  ctx.fillRect(px + 3, py + 8, 5, 4);

  // Crown
  ctx.fillStyle = "#ffe49b";
  ctx.fillRect(px - 5, py - 23, 10, 3);
  ctx.fillRect(px - 4, py - 26, 3, 4);
  ctx.fillRect(px + 2, py - 26, 3, 4);
}

function drawEnemy(x, y, type) {
  const colors = ["#627d89", "#9c6c70", "#55466f"];
  const color = colors[type];

  ctx.fillStyle = color;
  ctx.fillRect(x - 13, y - 14, 26, 24);
  ctx.fillRect(x - 17, y - 7, 34, 13);

  ctx.fillStyle = "#fff1dc";
  ctx.fillRect(x - 8, y - 7, 5, 5);
  ctx.fillRect(x + 4, y - 7, 5, 5);

  ctx.fillStyle = "#362c3c";
  ctx.fillRect(x - 7, y - 6, 3, 3);
  ctx.fillRect(x + 5, y - 6, 3, 3);

  ctx.fillStyle = "#fff";
  ctx.fillRect(x - 4, y + 3, 8, 2);
}

function drawBeach() {
  ctx.fillStyle = "#f1d9a8";
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = "#77c3ce";
  ctx.fillRect(0, 0, W, 115);

  ctx.fillStyle = "#55aebc";
  ctx.fillRect(0, 20, W, 12);
  ctx.fillRect(0, 45, W, 8);
  ctx.fillRect(0, 75, W, 12);

  ctx.fillStyle = "#ffe8a9";
  ctx.fillRect(210, 35, 28, 28);

  ctx.fillStyle = "#fff0c8";
  ctx.fillRect(0, 120, W, 8);

  drawPrincess(135, 275);

  // Small heart above Evie
  ctx.fillStyle = "#d87983";
  ctx.fillRect(127, 235, 6, 6);
  ctx.fillRect(137, 235, 6, 6);
  ctx.fillRect(130, 241, 10, 6);
  ctx.fillRect(133, 247, 4, 4);
}

function render() {
  ctx.clearRect(0, 0, W, H);

  if (progress >= 1) {
    drawBeach();
    return;
  }

  drawForest();

  const heroY = 390 - (progress * 300);
  drawPrincess(playerX, heroY);

  encounters.forEach((enemy, index) => {
    if (progress < enemy.position && progress > enemy.position - 0.12) {
      drawEnemy(135, heroY - 55, index);
    }
  });

  snowflakes.forEach(flake => {
    ctx.fillStyle = "#fff";
    ctx.fillRect(flake.x, flake.y, flake.size, flake.size);
  });
}

function updateSnow(delta) {
  snowflakes.forEach(flake => {
    flake.y += flake.speed * delta;

    if (flake.y > H) {
      flake.y = 0;
      flake.x = random(0, W);
    }
  });
}

function gameLoop(timestamp) {
  const delta = Math.min((timestamp - lastTime) / 1000 || 0, 0.05);
  lastTime = timestamp;

  if (gameState === "walking") {
    progress += delta * 0.035;

    updateSnow(delta);

    if (progress >= 1) {
      finishGame();
    } else {
      const nextEnemy = encounters.find(
        enemy => !enemy.defeated && progress >= enemy.position
      );

      if (nextEnemy) {
        progress = nextEnemy.position;
        startBattle(nextEnemy);
      }
    }
  }

  render();
  requestAnimationFrame(gameLoop);
}

function startBattle(enemy) {
  gameState = "battle";
  currentEnemy = enemy;
  currentEnemy.hp = currentEnemy.maxHP;
  playerHP = 100;
  healUses = 0;

  enemyName.textContent = enemy.name;
  battleMessage.textContent = "A new challenge appeared!";
  updateEnemyHealth();

  attackButton.disabled = false;
  healButton.disabled = false;
  healButton.textContent = "Text My Boyfriend";

  battleScreen.classList.remove("hidden");
}

function updateEnemyHealth() {
  const percentage = Math.max(
    0,
    (currentEnemy.hp / currentEnemy.maxHP) * 100
  );

  enemyHealth.style.width = percentage + "%";
}

function playerAttack() {
  if (gameState !== "battle") return;

  const damage = random(22, 34);
  currentEnemy.hp -= damage;

  battleMessage.textContent =
    coffeeMessages[random(0, coffeeMessages.length - 1)] +
    " (" + damage + " damage!)";

  updateEnemyHealth();

  if (currentEnemy.hp <= 0) {
    winBattle();
    return;
  }

  setTimeout(enemyAttack, 900);
  attackButton.disabled = true;
  healButton.disabled = true;
}

function playerHeal() {
  if (gameState !== "battle") return;

  if (healUses >= 2) {
    battleMessage.textContent = "No more messages for now! ❤️";
    return;
  }

  healUses++;

  const healing = random(20, 30);
  playerHP = Math.min(100, playerHP + healing);

  const message = loveMessages[
    random(0, loveMessages.length - 1)
  ];

  battleMessage.textContent =
    message + " (+" + healing + " HP)";

  setTimeout(enemyAttack, 900);
  attackButton.disabled = true;
  healButton.disabled = true;
}

function enemyAttack() {
  if (gameState !== "battle") return;

  const index = random(0, 1);
  const attack = currentEnemy.attacks[index];
  const damage = random(
    currentEnemy.damage[index],
    currentEnemy.damage[index] + 3
  );

  playerHP -= damage;

  battleMessage.textContent =
    currentEnemy.name + " used " + attack +
    "! (" + damage + " damage!)";

  if (playerHP <= 0) {
    playerHP = 50;
    battleMessage.textContent =
      "Evie catches her breath and gets back up. ❤️";
  }

  attackButton.disabled = false;
  healButton.disabled = false;

  if (healUses >= 2) {
    healButton.disabled = true;
  }
}

function winBattle() {
  gameState = "walking";
  currentEnemy.defeated = true;

  battleMessage.textContent =
    "You did it! Keep going, Evie! ❤️";

  setTimeout(() => {
    battleScreen.classList.add("hidden");
    currentEnemy = null;
  }, 1200);
}

function finishGame() {
  gameState = "ending";
  progress = 1;

  battleScreen.classList.add("hidden");
  endingMessage.textContent =
    "You made it through the snow, Evie. " +
    "No matter how difficult the journey gets, " +
    "remember that someone is always cheering for you. " +
    "I love you. ❤️";

  endingScreen.classList.remove("hidden");
}

startButton.addEventListener("click", () => {
  introScreen.classList.add("hidden");
  gameState = "walking";
});

attackButton.addEventListener("click", playerAttack);
healButton.addEventListener("click", playerHeal);

initSnow();
requestAnimationFrame(gameLoop);
