const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");

const $ = id => document.getElementById(id);

const introScreen = $("intro-screen");
const battleScreen = $("battle-screen");
const endingScreen = $("ending-screen");
const gameoverScreen = $("gameover-screen");

const startButton = $("start-button");
const restartButton = $("restart-button");
const attackButton = $("attack-button");
const healButton = $("heal-button");

const enemyName = $("enemy-name");
const enemyHealth = $("enemy-health");
const playerHealth = $("player-health");
const enemyHPText = $("enemy-hp-text");
const playerHPText = $("player-hp-text");
const battleMessage = $("battle-message");
const endingMessage = $("ending-message");

const W = canvas.width;
const H = canvas.height;

const MAX_PLAYER_HP = 100;

let state = "intro";
let progress = 0;
let playerHP = MAX_PLAYER_HP;
let currentEnemy = null;
let healUses = 0;
let lastTime = 0;
let animationTime = 0;
let snowflakes = [];
let actionLocked = false;

const enemies = [
  {
    position: 0.23,
    name: "The Fatigue",
    maxHP: 65,
    hp: 65,
    damage: [8, 12],
    attacks: ["Energy Drain", "Sleepy Fog"],
    defeated: false,
    type: "fatigue"
  },
  {
    position: 0.49,
    name: "The Annoying Colleague",
    maxHP: 75,
    hp: 75,
    damage: [10, 14],
    attacks: [
      "WHY ARE YOU TALKING SO QUIET?!",
      "Say That Again!"
    ],
    defeated: false,
    type: "colleague"
  },
  {
    position: 0.75,
    name: "The Examinator",
    maxHP: 90,
    hp: 90,
    damage: [12, 17],
    attacks: ["Tricky Question", "Pop Quiz!"],
    defeated: false,
    type: "exam"
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

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

// The road and Evie's movement use exactly the same curve.
function roadX(p) {
  return 135 + Math.sin(p * Math.PI * 2.1) * 29
            + Math.sin(p * Math.PI * 4.0) * 9;
}

function roadY(p) {
  return 430 - p * 350;
}

function initSnow() {
  snowflakes = [];

  for (let i = 0; i < 55; i++) {
    snowflakes.push({
      x: random(0, W),
      y: random(0, H),
      speed: random(15, 42),
      size: random(1, 3)
    });
  }
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

function drawTree(x, y, scale = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  drawPixel(-3, 0, 6, 13, "#66504b");

  drawPixel(-11, -15, 22, 15, "#28534d");
  drawPixel(-8, -25, 16, 13, "#32685a");
  drawPixel(-5, -34, 10, 11, "#3d7662");

  drawPixel(-8, -15, 16, 3, "#dceef0");
  drawPixel(-5, -25, 10, 3, "#e9f4f1");
  drawPixel(-3, -34, 6, 3, "#f6fbf6");

  ctx.restore();
}

function drawPrincess(x, y, walking = false) {
  const bob = walking ? Math.sin(animationTime * 9) * 2 : 0;
  const px = Math.round(x);
  const py = Math.round(y + bob);

  ctx.save();

  // Long curly dark hair
  drawPixel(px - 10, py - 19, 20, 23, "#422a32");
  drawPixel(px - 13, py - 11, 5, 18, "#49303a");
  drawPixel(px + 8, py - 12, 5, 19, "#49303a");
  drawPixel(px - 12, py + 2, 5, 6, "#49303a");
  drawPixel(px + 8, py + 2, 5, 6, "#49303a");

  // Face
  drawPixel(px - 7, py - 18, 14, 14, "#edbd9e");
  drawPixel(px - 8, py - 14, 2, 7, "#edbd9e");
  drawPixel(px + 6, py - 14, 2, 7, "#edbd9e");

  // Hair fringe
  drawPixel(px - 7, py - 21, 14, 5, "#422a32");
  drawPixel(px - 5, py - 17, 5, 3, "#422a32");

  // Brown eyes
  drawPixel(px - 4, py - 12, 2, 2, "#68402e");
  drawPixel(px + 3, py - 12, 2, 2, "#68402e");

  // Blush
  drawPixel(px - 6, py - 8, 3, 2, "#d98d87");
  drawPixel(px + 4, py - 8, 3, 2, "#d98d87");

  // Golden crown
  drawPixel(px - 7, py - 25, 14, 3, "#e9bd62");
  drawPixel(px - 6, py - 28, 3, 4, "#f8d985");
  drawPixel(px - 1, py - 30, 3, 6, "#ffe7a0");
  drawPixel(px + 4, py - 28, 3, 4, "#f8d985");
  drawPixel(px - 1, py - 25, 3, 2, "#c98288");

  // Winter dress
  drawPixel(px - 8, py - 4, 16, 10, "#a75f85");
  drawPixel(px - 10, py + 2, 20, 7, "#bd779b");
  drawPixel(px - 12, py + 7, 24, 5, "#a75f85");

  // White collar
  drawPixel(px - 5, py - 5, 10, 3, "#fff0d8");

  // Dress decoration
  drawPixel(px - 1, py + 1, 3, 3, "#f4d79b");

  // Sleeves
  drawPixel(px - 12, py - 2, 5, 8, "#a75f85");
  drawPixel(px + 7, py - 2, 5, 8, "#a75f85");

  // Arms
  drawPixel(px - 11, py + 4, 3, 5, "#edbd9e");
  drawPixel(px + 8, py + 4, 3, 5, "#edbd9e");

  // Boots
  const step = walking ? Math.sin(animationTime * 9) * 2 : 0;
  drawPixel(px - 7, py + 12 + step, 5, 4, "#57445e");
  drawPixel(px + 3, py + 12 - step, 5, 4, "#57445e");

  ctx.restore();
}

function drawFatigue(x, y) {
  const bob = Math.sin(animationTime * 3) * 2;

  ctx.save();
  ctx.translate(x, y + bob);

  // Body
  drawPixel(-13, -12, 26, 22, "#718c98");
  drawPixel(-17, -6, 34, 14, "#627c89");
  drawPixel(-10, -17, 20, 8, "#829da4");

  // Sleepy hood
  drawPixel(-12, -17, 24, 5, "#506b79");

  // Eyes
  drawPixel(-8, -4, 5, 2, "#f4e5c8");
  drawPixel(4, -4, 5, 2, "#f4e5c8");

  // Mouth
  drawPixel(-2, 4, 5, 2, "#3b4755");

  // Arms
  drawPixel(-20, -5, 5, 12, "#627c89");
  drawPixel(15, -5, 5, 12, "#627c89");

  // Feet
  drawPixel(-10, 10, 7, 5, "#485e6c");
  drawPixel(3, 10, 7, 5, "#485e6c");

  ctx.restore();
}

function drawColleague(x, y) {
  const bob = Math.sin(animationTime * 5) * 1.5;

  ctx.save();
  ctx.translate(x, y + bob);

  // Hair
  drawPixel(-10, -19, 20, 9, "#543c32");
  drawPixel(-13, -14, 4, 10, "#543c32");

  // Face
  drawPixel(-9, -13, 18, 17, "#e4b18e");

  // Eyes
  drawPixel(-6, -7, 3, 3, "#352c32");
  drawPixel(4, -7, 3, 3, "#352c32");

  // Eyebrows
  drawPixel(-8, -11, 6, 2, "#49312d");
  drawPixel(3, -11, 6, 2, "#49312d");

  // Annoyed mouth
  drawPixel(-3, 1, 8, 2, "#813e4b");

  // Office clothes
  drawPixel(-10, 4, 20, 15, "#586c8a");
  drawPixel(-13, 9, 26, 8, "#465875");

  // Shirt and tie
  drawPixel(-3, 4, 7, 6, "#f0e6d5");
  drawPixel(-1, 9, 3, 7, "#b65b62");

  // Arms
  drawPixel(-16, 6, 5, 13, "#586c8a");
  drawPixel(11, 6, 5, 13, "#586c8a");

  // Shoes
  drawPixel(-9, 19, 7, 4, "#413b4c");
  drawPixel(3, 19, 7, 4, "#413b4c");

  ctx.restore();
}

function drawExaminator(x, y) {
  const bob = Math.sin(animationTime * 4) * 2;

  ctx.save();
  ctx.translate(x, y + bob);

  // Shadow cloak
  drawPixel(-15, -12, 30, 29, "#4e426e");
  drawPixel(-20, -3, 40, 17, "#40395f");
  drawPixel(-16, 14, 32, 7, "#342f50");

  // Head
  drawPixel(-11, -22, 22, 17, "#74678d");
  drawPixel(-14, -18, 28, 9, "#625578");

  // Hood
  drawPixel(-14, -25, 28, 7, "#39334f");
  drawPixel(-10, -30, 20, 7, "#514666");

  // Glowing eyes
  drawPixel(-7, -17, 5, 4, "#ffe28e");
  drawPixel(3, -17, 5, 4, "#ffe28e");

  // Book
  drawPixel(15, 1, 10, 13, "#b88a61");
  drawPixel(17, 3, 6, 9, "#f3d9a7");
  drawPixel(20, 3, 2, 9, "#805d51");

  // Cloak details
  drawPixel(-3, -1, 6, 12, "#a38bb2");
  drawPixel(-1, 3, 2, 4, "#ffe3a0");

  ctx.restore();
}

function drawEnemy(enemy, x, y) {
  if (enemy.type === "fatigue") {
    drawFatigue(x, y);
  } else if (enemy.type === "colleague") {
    drawColleague(x, y);
  } else {
    drawExaminator(x, y);
  }
}

function drawForest() {
  ctx.fillStyle = "#dcebf0";
  ctx.fillRect(0, 0, W, H);

  // Distant snow
  ctx.fillStyle = "#c2dce6";
  ctx.fillRect(0, 65, W, 95);
  ctx.fillRect(0, 270, W, 120);

  // Winding trail, following the same curve as Evie
  ctx.fillStyle = "#e8d9c0";
  ctx.beginPath();

  for (let i = 0; i <= 100; i++) {
    const p = i / 100;
    const x = roadX(p) - 37;
    const y = roadY(p);

    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }

  for (let i = 100; i >= 0; i--) {
    const p = i / 100;
    const x = roadX(p) + 37;
    const y = roadY(p);

    ctx.lineTo(x, y);
  }

  ctx.closePath();
  ctx.fill();

  // Soft center of the path
  ctx.strokeStyle = "#f5ead7";
  ctx.lineWidth = 2;
  ctx.beginPath();

  for (let i = 0; i <= 100; i++) {
    const p = i / 100;
    const x = roadX(p);
    const y = roadY(p);

    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }

  ctx.stroke();

  // Trees placed along the road edges
  for (let i = 0; i < 11; i++) {
    const p = i / 10;
    const x = roadX(p);
    const y = roadY(p);

    drawTree(x - 65, y + 15, 0.9);
    drawTree(x + 65, y - 10, 1.05);
  }

  // Snow details
  ctx.fillStyle = "#ffffff";

  for (let i = 0; i < 28; i++) {
    const x = (i * 79 + 23) % W;
    const y = (i * 113 + 41) % H;
    ctx.fillRect(x, y, 3, 3);
  }
}

function drawBeach() {
  ctx.fillStyle = "#f1d9a8";
  ctx.fillRect(0, 0, W, H);

  // Ocean
  ctx.fillStyle = "#66b9c5";
  ctx.fillRect(0, 0, W, 145);

  ctx.fillStyle = "#4d9eae";
  ctx.fillRect(0, 23, W, 10);
  ctx.fillRect(0, 55, W, 7);
  ctx.fillRect(0, 90, W, 9);
  ctx.fillRect(0, 125, W, 7);

  // Sun
  ctx.fillStyle = "#ffe6a0";
  ctx.fillRect(205, 30, 30, 30);

  // Sand
  ctx.fillStyle = "#f6e4bd";
  ctx.fillRect(0, 145, W, H - 145);

  ctx.fillStyle = "#fff0ce";
  ctx.fillRect(0, 141, W, 7);

  // Small beach details
  ctx.fillStyle = "#d4b98d";
  ctx.fillRect(35, 250, 8, 4);
  ctx.fillRect(210, 330, 6, 4);

  drawPrincess(135, 275, false);

  // Heart
  ctx.fillStyle = "#d87983";
  ctx.fillRect(125, 229, 7, 7);
  ctx.fillRect(135, 229, 7, 7);
  ctx.fillRect(128, 236, 11, 6);
  ctx.fillRect(131, 242, 5, 4);
}

function render() {
  ctx.clearRect(0, 0, W, H);

  if (progress >= 1) {
    drawBeach();
    return;
  }

  drawForest();

  // Enemy sprites along the road
  enemies.forEach(enemy => {
    if (!enemy.defeated && enemy !== currentEnemy) {
      const distance = Math.abs(progress - enemy.position);

      if (distance < 0.12) {
        drawEnemy(
          enemy,
          roadX(enemy.position),
          roadY(enemy.position) - 5
        );
      }
    }
  });

  // Evie always stays on the road center
  const heroX = roadX(progress);
  const heroY = roadY(progress);

  drawPrincess(
    heroX,
    heroY,
    state === "walking"
  );

  // Battle enemy stays visible behind the battle window
  if (state === "battle" && currentEnemy) {
    drawEnemy(currentEnemy, 135, 145);
  }

  snowflakes.forEach(flake => {
    ctx.fillStyle = "#fff";
    ctx.fillRect(
      Math.round(flake.x),
      Math.round(flake.y),
      flake.size,
      flake.size
    );
  });
}

function updateSnow(delta) {
  snowflakes.forEach(flake => {
    flake.y += flake.speed * delta;

    if (flake.y > H) {
      flake.y = -3;
      flake.x = random(0, W);
    }
  });
}

function updateHealthBars() {
  if (!currentEnemy) return;

  const enemyPercent = clamp(
    currentEnemy.hp / currentEnemy.maxHP * 100,
    0,
    100
  );

  const playerPercent = clamp(
    playerHP / MAX_PLAYER_HP * 100,
    0,
    100
  );

  enemyHealth.style.width = enemyPercent + "%";
  playerHealth.style.width = playerPercent + "%";

  enemyHPText.textContent =
    Math.max(0, currentEnemy.hp) + " / " + currentEnemy.maxHP;

  playerHPText.textContent =
    Math.max(0, playerHP) + " / " + MAX_PLAYER_HP;
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
  healButton.textContent = "Text My Boyfriend";

  updateHealthBars();

  battleScreen.classList.remove("hidden");
}

function endTurn() {
  if (state !== "battle") return;

  actionLocked = true;
  attackButton.disabled = true;
  healButton.disabled = true;

  setTimeout(enemyAttack, 900);
}

function playerAttack() {
  if (state !== "battle" || actionLocked) return;

  const damage = random(27, 37);
  currentEnemy.hp = Math.max(0, currentEnemy.hp - damage);

  battleMessage.textContent =
    coffeeMessages[random(0, coffeeMessages.length - 1)] +
    " (" + damage + " damage!)";

  updateHealthBars();

  if (currentEnemy.hp <= 0) {
    winBattle();
    return;
  }

  endTurn();
}

function playerHeal() {
  if (state !== "battle" || actionLocked) return;
  if (healUses >= 2) return;

  healUses++;

  const healing = random(22, 30);
  const oldHP = playerHP;

  playerHP = Math.min(MAX_PLAYER_HP, playerHP + healing);

  const actualHealing = playerHP - oldHP;
  const message = loveMessages[
    random(0, loveMessages.length - 1)
  ];

  battleMessage.textContent =
    message + " (+" + actualHealing + " HP)";

  healButton.textContent =
    "Text My Boyfriend (" + (2 - healUses) + " left)";

  updateHealthBars();

  if (healUses >= 2) {
    healButton.disabled = true;
  }

  endTurn();
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
    loseBattle();
    return;
  }

  actionLocked = false;
  attackButton.disabled = false;
  healButton.disabled = healUses >= 2;
}

function winBattle() {
  state = "walking";
  actionLocked = true;

  currentEnemy.defeated = true;

  battleMessage.textContent =
    "You did it! Keep going, Evie! ❤️";

  setTimeout(() => {
    battleScreen.classList.add("hidden");
    currentEnemy = null;
    actionLocked = false;

    // Move slightly beyond the encounter point.
    progress = Math.min(0.99, progress + 0.005);
  }, 1300);
}

function loseBattle() {
  state = "gameover";
  actionLocked = true;

  battleScreen.classList.add("hidden");
  gameoverScreen.classList.remove("hidden");
}

function finishGame() {
  state = "ending";
  progress = 1;

  battleScreen.classList.add("hidden");

  endingMessage.textContent =
    "You made it through the snow, Evie. " +
    "Even on the hardest days, remember that " +
    "someone believes in you, is proud of you, " +
    "and loves you more than words can say❤️";

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
  endingScreen.classList.add("hidden");
  gameoverScreen.classList.add("hidden");

  state = "walking";
}

function gameLoop(timestamp) {
  const delta = Math.min(
    (timestamp - lastTime) / 1000 || 0,
    0.05
  );

  lastTime = timestamp;
  animationTime += delta;

  updateSnow(delta);

  if (state === "walking") {
    progress = Math.min(1, progress + delta * 0.035);

    if (progress >= 1) {
      finishGame();
    } else {
      const nextEnemy = enemies.find(
        enemy =>
          !enemy.defeated &&
          progress >= enemy.position
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

startButton.addEventListener("click", startGame);
restartButton.addEventListener("click", startGame);

attackButton.addEventListener("click", playerAttack);
healButton.addEventListener("click", playerHeal);

initSnow();
requestAnimationFrame(gameLoop);
