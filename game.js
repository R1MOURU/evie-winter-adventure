const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");

const $ = id => document.getElementById(id);

const introScreen = $("intro-screen");
const battleScreen = $("battle-screen");
const victoryScreen = $("victory-screen");
const endingScreen = $("ending-screen");
const gameOverScreen = $("game-over-screen");

const startButton = $("start-button");
const retryButton = $("retry-button");
const restartButton = $("restart-button");
const continueButton = $("continue-button");

const attackButton = $("attack-button");
const healButton = $("heal-button");

const enemyName = $("enemy-name");
const enemyHealth = $("enemy-health");
const playerHealth = $("player-health");
const enemyHpText = $("enemy-hp-text");
const playerHpText = $("player-hp-text");
const battleMessage = $("battle-message");
const healCounter = $("heal-counter");

const victoryTitle = $("victory-title");
const victoryMessage = $("victory-message");
const endingMessage = $("ending-message");

const W = canvas.width;
const H = canvas.height;

const MAX_PLAYER_HP = 100;
const MAX_HEALS = 3;

let state = "intro";
let progress = 0;
let lastTime = 0;
let playerHP = MAX_PLAYER_HP;
let currentEnemy = null;
let healUses = 0;
let snowflakes = [];
let animationTime = 0;
let actionLocked = false;

const enemies = [
  {
    position: 0.22,
    name: "The Fatigue",
    maxHP: 80,
    attacks: ["Energy Drain", "Sleepy Fog"],
    damage: [11, 15],
    victoryTitle: "Fatigue defeated!",
    victoryMessage:
      "You defeated Fatigue! Even the sleepiest monster couldn't stop you. You're doing amazing, princess! ❤️",
    defeated: false
  },
  {
    position: 0.48,
    name: "The Annoying Colleague",
    maxHP: 95,
    attacks: [
      "WHY ARE YOU TALKING SO QUIET?!",
      "Say That Again!"
    ],
    damage: [13, 17],
    victoryTitle: "Problem solved!",
    victoryMessage:
      "The annoying colleague has been thrown into the trash can! Maybe now he'll finally stop asking you to speak louder! 🤣",
    defeated: false
  },
  {
    position: 0.74,
    name: "The Examinator",
    maxHP: 110,
    attacks: ["Tricky Question", "Pop Quiz!"],
    damage: [15, 19],
    victoryTitle: "The Examinator is defeated!",
    victoryMessage:
      "You conquered the Examinator! No tricky question can measure how wonderful you are! ❤️",
    defeated: false
  }
];

const loveMessages = [
  "Just thinking about you makes me smile. ❤️",
  "I wish you were here with me right now.",
  "You're my favorite person in the whole world.",
  "Sending you a little kiss! 💋",
  "I love you more than all the stars.",
  "Can't wait to hug you again. ❤️",
  "You make even the hardest days better.",
  "I wish I could cuddle with you right now.",
  "You're always in my heart. ❤️"
];

const coffeeMessages = [
  "Freshly brewed justice!",
  "Caffeine-powered attack!",
  "Take that, you annoying little monster!"
];

function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function drawPixel(x, y, width, height, color) {
  ctx.fillStyle = color;
  ctx.fillRect(
    Math.round(x),
    Math.round(y),
    width,
    height
  );
}

function drawPrincess(x, y, scale = 1) {
  ctx.save();
  ctx.translate(Math.round(x), Math.round(y));
  ctx.scale(scale, scale);

  const bob = state === "walking"
    ? Math.sin(animationTime * 8) * 1.5
    : Math.sin(animationTime * 3) * 0.5;

  ctx.translate(0, bob);

  // Curly dark hair
  drawPixel(-10, -23, 20, 18, "#39272b");
  drawPixel(-13, -19, 5, 19, "#39272b");
  drawPixel(8, -19, 5, 19, "#39272b");
  drawPixel(-12, -25, 6, 7, "#51343a");
  drawPixel(7, -27, 6, 8, "#51343a");
  drawPixel(-10, -31, 7, 7, "#51343a");
  drawPixel(1, -33, 7, 8, "#51343a");

  // Face
  drawPixel(-7, -23, 14, 13, "#edbd9e");
  drawPixel(-8, -20, 2, 7, "#edbd9e");

  // Eyes
  drawPixel(-4, -18, 2, 2, "#593a2f");
  drawPixel(4, -18, 2, 2, "#593a2f");

  // Hair fringe
  drawPixel(-7, -25, 7, 5, "#39272b");
  drawPixel(1, -27, 6, 5, "#39272b");

  // Crown
  drawPixel(-7, -35, 14, 4, "#f5cf75");
  drawPixel(-6, -39, 4, 5, "#f5cf75");
  drawPixel(2, -40, 4, 6, "#f5cf75");
  drawPixel(-1, -37, 3, 4, "#fff0b0");

  // Neck and collar
  drawPixel(-3, -10, 6, 5, "#edbd9e");
  drawPixel(-7, -8, 14, 4, "#fff0d9");

  // Winter dress
  drawPixel(-9, -5, 18, 15, "#a85e83");
  drawPixel(-13, 5, 26, 7, "#a85e83");
  drawPixel(-8, -3, 16, 3, "#d18eaa");
  drawPixel(-2, 0, 4, 8, "#f1d5a7");

  // Sleeves
  drawPixel(-14, -4, 5, 9, "#d6e5e8");
  drawPixel(9, -4, 5, 9, "#d6e5e8");

  // Boots
  drawPixel(-8, 12, 6, 5, "#57465e");
  drawPixel(2, 12, 6, 5, "#57465e");

  // Hair curls
  drawPixel(-14, -15, 4, 4, "#51343a");
  drawPixel(10, -13, 4, 4, "#51343a");
  drawPixel(-13, -7, 4, 4, "#51343a");
  drawPixel(10, -6, 4, 4, "#51343a");

  ctx.restore();
}

function drawEnemy(x, y, type, scale = 1) {
  ctx.save();
  ctx.translate(Math.round(x), Math.round(y));
  ctx.scale(scale, scale);

  const bob = Math.sin(animationTime * 4) * 1.5;
  ctx.translate(0, bob);

  if (type === 0) {
    // The Fatigue
    drawPixel(-15, -12, 30, 25, "#708b9c");
    drawPixel(-12, -17, 24, 8, "#8da8b3");
    drawPixel(-19, -4, 5, 13, "#708b9c");
    drawPixel(14, -4, 5, 13, "#708b9c");
    drawPixel(-10, 13, 7, 5, "#536d7d");
    drawPixel(4, 13, 7, 5, "#536d7d");

    drawPixel(-8, -4, 5, 2, "#33434e");
    drawPixel(4, -4, 5, 2, "#33434e");
    drawPixel(-3, 5, 7, 2, "#33434e");
    drawPixel(-4, -21, 8, 5, "#e5eef0");
  }

  if (type === 1) {
    // The Annoying Colleague
    drawPixel(-13, -17, 26, 25, "#d5a37c");
    drawPixel(-10, -23, 20, 8, "#47383a");
    drawPixel(-14, -12, 28, 5, "#47383a");

    drawPixel(-8, -7, 4, 4, "#332a2b");
    drawPixel(4, -7, 4, 4, "#332a2b");
    drawPixel(-4, 2, 8, 4, "#6b3535");

    drawPixel(-17, 8, 34, 12, "#5b718e");
    drawPixel(-10, 20, 7, 5, "#353746");
    drawPixel(3, 20, 7, 5, "#353746");

    drawPixel(-3, -20, 6, 3, "#d9d4c9");
  }

  if (type === 2) {
    // The Examinator
    drawPixel(-17, -14, 34, 30, "#55466f");
    drawPixel(-13, -21, 26, 10, "#786a99");
    drawPixel(-20, -8, 5, 16, "#786a99");
    drawPixel(15, -8, 5, 16, "#786a99");

    drawPixel(-10, -7, 5, 5, "#ffe7a1");
    drawPixel(5, -7, 5, 5, "#ffe7a1");
    drawPixel(-8, -6, 2, 3, "#30253d");
    drawPixel(7, -6, 2, 3, "#30253d");

    drawPixel(-7, 7, 14, 3, "#30253d");
    drawPixel(-12, 16, 8, 6, "#403652");
    drawPixel(4, 16, 8, 6, "#403652");
    drawPixel(-5, -27, 10, 7, "#d9c4ff");
  }

  ctx.restore();
}

function drawTree(x, y, scale = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  drawPixel(-3, 0, 6, 12, "#65504a");

  drawPixel(-10, -13, 20, 14, "#28544d");
  drawPixel(-8, -23, 16, 13, "#31685c");
  drawPixel(-5, -31, 10, 11, "#397768");

  drawPixel(-8, -13, 16, 3, "#e7f1ed");
  drawPixel(-5, -23, 10, 3, "#e7f1ed");

  ctx.restore();
}

function drawForest() {
  ctx.fillStyle = "#dcebf0";
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = "#c0dce5";
  ctx.fillRect(0, 70, W, 120);
  ctx.fillRect(0, 310, W, 110);

  // Winding path
  ctx.fillStyle = "#e8d9c0";
  ctx.beginPath();
  ctx.moveTo(100, 0);
  ctx.lineTo(160, 0);
  ctx.lineTo(170, 110);
  ctx.lineTo(115, 220);
  ctx.lineTo(145, 340);
  ctx.lineTo(100, 480);
  ctx.lineTo(0, 480);
  ctx.lineTo(0, 350);
  ctx.lineTo(65, 220);
  ctx.lineTo(75, 110);
  ctx.closePath();
  ctx.fill();

  // Snow on the path
  ctx.fillStyle = "#f7ead5";
  ctx.fillRect(93, 0, 28, 80);

  // Trees
  for (let y = -20; y < H + 50; y += 90) {
    drawTree(22, y + 25, 1.1);
    drawTree(245, y + 60, 1.1);
    drawTree(65, y + 80, 0.7);
    drawTree(195, y + 5, 0.7);
  }

  // Snow patches
  ctx.fillStyle = "#fff";
  for (let i = 0; i < 32; i++) {
    const x = (i * 73) % W;
    const y = (i * 107 + progress * 100) % H;
    ctx.fillRect(x, y, 3, 3);
  }
}

function drawBeach() {
  ctx.fillStyle = "#f1d9a8";
  ctx.fillRect(0, 0, W, H);

  // Sea
  ctx.fillStyle = "#77c3ce";
  ctx.fillRect(0, 0, W, 115);

  ctx.fillStyle = "#55aebc";
  ctx.fillRect(0, 22, W, 10);
  ctx.fillRect(0, 55, W, 8);
  ctx.fillRect(0, 83, W, 10);

  // Sun
  drawPixel(210, 35, 28, 28, "#ffe8a9");

  // Shore
  ctx.fillStyle = "#fff0c8";
  ctx.fillRect(0, 120, W, 8);

  drawPrincess(135, 275, 1.7);

  // Heart
  drawPixel(125, 215, 7, 7, "#d87983");
  drawPixel(136, 215, 7, 7, "#d87983");
  drawPixel(129, 222, 10, 7, "#d87983");
  drawPixel(132, 229, 4, 4, "#d87983");
}

function drawSnow() {
  snowflakes.forEach(flake => {
    drawPixel(
      flake.x,
      flake.y,
      flake.size,
      flake.size,
      "#ffffff"
    );
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

function render() {
  ctx.clearRect(0, 0, W, H);

  if (state === "ending") {
    drawBeach();
    return;
  }

  if (state === "intro") {
    drawForest();
    drawSnow();
    drawPrincess(135, 360);
    return;
  }

  if (state === "battle" && currentEnemy) {
    ctx.fillStyle = "#c5dce3";
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = "#e8d9c0";
    ctx.fillRect(0, 300, W, 180);

    drawTree(25, 250, 1.1);
    drawTree(245, 250, 1.1);

    drawEnemy(
      135,
      160,
      enemies.indexOf(currentEnemy),
      2.1
    );

    drawPrincess(135, 325, 1.8);
    return;
  }

  drawForest();

  const heroY = 390 - progress * 300;
  drawPrincess(135, heroY);

  enemies.forEach((enemy, index) => {
    if (
      !enemy.defeated &&
      progress < enemy.position &&
      progress > enemy.position - 0.13
    ) {
      drawEnemy(135, heroY - 55, index, 1.1);
    }
  });

  drawSnow();
}

function updateHealthBars() {
  const enemyPercent = Math.max(
    0,
    currentEnemy
      ? currentEnemy.hp / currentEnemy.maxHP * 100
      : 0
  );

  const playerPercent = Math.max(
    0,
    playerHP / MAX_PLAYER_HP * 100
  );

  enemyHealth.style.width = enemyPercent + "%";
  playerHealth.style.width = playerPercent + "%";

  enemyHpText.textContent = currentEnemy
    ? currentEnemy.hp + " / " + currentEnemy.maxHP
    : "0 / 0";

  playerHpText.textContent =
    playerHP + " / " + MAX_PLAYER_HP;
}

function updateHealCounter() {
  healCounter.textContent =
    "Boyfriend texts left: " + (MAX_HEALS - healUses);
}

function startBattle(enemy) {
  state = "battle";
  currentEnemy = enemy;
  currentEnemy.hp = currentEnemy.maxHP;

  healUses = 0;
  actionLocked = false;

  enemyName.textContent = enemy.name;
  battleMessage.textContent = "A new challenge appeared!";

  attackButton.disabled = false;
  healButton.disabled = false;

  updateHealthBars();
  updateHealCounter();

  battleScreen.classList.remove("hidden");
}

function enemyAttack() {
  if (state !== "battle" || !currentEnemy) return;

  const index = random(0, 1);
  const attack = currentEnemy.attacks[index];

  const damage = random(
    currentEnemy.damage[index],
    currentEnemy.damage[index] + 3
  );

  playerHP = Math.max(0, playerHP - damage);

  battleMessage.textContent =
    currentEnemy.name + " used " + attack +
    "! (" + damage + " damage!)";

  updateHealthBars();

  if (playerHP <= 0) {
    setTimeout(gameOver, 700);
    return;
  }

  actionLocked = false;
  attackButton.disabled = false;
  healButton.disabled = healUses >= MAX_HEALS;
}

function playerAttack() {
  if (state !== "battle" || actionLocked) return;

  actionLocked = true;
  attackButton.disabled = true;
  healButton.disabled = true;

  const damage = random(22, 34);

  currentEnemy.hp = Math.max(
    0,
    currentEnemy.hp - damage
  );

  battleMessage.textContent =
    coffeeMessages[
      random(0, coffeeMessages.length - 1)
    ] + " (" + damage + " damage!)";

  updateHealthBars();

  if (currentEnemy.hp <= 0) {
    setTimeout(winBattle, 800);
  } else {
    setTimeout(enemyAttack, 900);
  }
}

function playerHeal() {
  if (state !== "battle" || actionLocked) return;

  if (healUses >= MAX_HEALS) {
    battleMessage.textContent =
      "No more messages for now! ❤️";
    return;
  }

  if (playerHP >= MAX_PLAYER_HP) {
    battleMessage.textContent =
      "You're already doing great! ❤️";
    return;
  }

  actionLocked = true;
  attackButton.disabled = true;
  healButton.disabled = true;

  healUses++;

  const healing = random(24, 32);

  playerHP = Math.min(
    MAX_PLAYER_HP,
    playerHP + healing
  );

  const message = loveMessages[
    random(0, loveMessages.length - 1)
  ];

  battleMessage.textContent =
    message + " (+" + healing + " HP)";

  updateHealthBars();
  updateHealCounter();

  setTimeout(enemyAttack, 900);
}

function winBattle() {
  if (state !== "battle" || !currentEnemy) return;

  currentEnemy.defeated = true;
  actionLocked = true;

  attackButton.disabled = true;
  healButton.disabled = true;

  const defeatedEnemy = currentEnemy;

  setTimeout(() => {
    battleScreen.classList.add("hidden");

    victoryTitle.textContent =
      defeatedEnemy.victoryTitle;

    victoryMessage.textContent =
      defeatedEnemy.victoryMessage;

    victoryScreen.classList.remove("hidden");

    state = "victory";
  }, 800);
}

function continueAdventure() {
  if (state !== "victory") return;

  victoryScreen.classList.add("hidden");

  currentEnemy = null;
  actionLocked = false;

  state = "walking";
}

function gameOver() {
  state = "gameover";

  battleScreen.classList.add("hidden");
  gameOverScreen.classList.remove("hidden");
}

function finishGame() {
  state = "ending";
  progress = 1;

  endingMessage.textContent =
    "You made it through the snow, Evie. " +
    "No matter how difficult the journey gets, " +
    "remember that someone is always cheering for you. " +
    "I love you. ❤️";

  endingScreen.classList.remove("hidden");
}

function startGame() {
  progress = 0;
  playerHP = MAX_PLAYER_HP;
  currentEnemy = null;
  healUses = 0;
  actionLocked = false;

  enemies.forEach(enemy => {
    enemy.defeated = false;
    enemy.hp = enemy.maxHP;
  });

  introScreen.classList.add("hidden");
  battleScreen.classList.add("hidden");
  victoryScreen.classList.add("hidden");
  endingScreen.classList.add("hidden");
  gameOverScreen.classList.add("hidden");

  updateHealthBars();
  updateHealCounter();

  state = "walking";
}

function gameLoop(timestamp) {
  const delta = Math.min(
    (timestamp - lastTime) / 1000 || 0,
    0.05
  );

  lastTime = timestamp;
  animationTime += delta;

  if (state === "walking") {
    progress += delta * 0.035;

    updateSnow(delta);

    if (progress >= 1) {
      finishGame();
    } else {
      const nextEnemy = enemies.find(enemy =>
        !enemy.defeated &&
        progress >= enemy.position
      );

      if (nextEnemy) {
        progress = nextEnemy.position;
        startBattle(nextEnemy);
      }
    }
  }

  if (state === "battle" || state === "victory") {
    updateSnow(delta);
  }

  render();
  requestAnimationFrame(gameLoop);
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

startButton.addEventListener("click", startGame);
retryButton.addEventListener("click", startGame);
restartButton.addEventListener("click", startGame);
continueButton.addEventListener("click", continueAdventure);

attackButton.addEventListener("click", playerAttack);
healButton.addEventListener("click", playerHeal);

initSnow();
updateHealthBars();
updateHealCounter();

requestAnimationFrame(gameLoop);
