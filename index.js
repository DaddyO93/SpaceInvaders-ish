const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");

canvas.width = innerWidth;
canvas.height = innerHeight;

// Player class using image
class Player {
  constructor(x, y, playerImage, drops) {
    this.x = x;
    this.y = y;
    this.image = new Image();
    this.image.src = playerImage;
    this.killBox = 20;
    this.drops = drops;
    this.fireRate = 30;
    this.speed = 8;
  }

  draw() {
    c.drawImage(
      this.image,
      this.x - this.killBox * 1.4,
      this.y - this.killBox,
      this.killBox * 3,
      this.killBox * 3
    );
  }

  update() {
    this.draw();
  }
}

// Enemy class
class Enemy extends Player {
  constructor(x, y, enemyImage, enemyHealth, counter) {
    super(x, y, enemyImage);
    this.killBox = 40;
    this.enemyHealth = enemyHealth;
    this.image.src = enemyImage;
    this.counter = counter;
  }

  draw() {
    c.drawImage(
      this.image,
      this.x - this.killBox * 1.7,
      this.y - this.killBox + this.killBox,
      this.killBox * 3,
      this.killBox
    );
  }

  update() {
    this.y += enemyVertical;
    this.x = this.x + enemySpeed;
    this.draw();
  }
}

// Projectile class
class Projectile {
  constructor(x, y, killBox, color, speed, damage) {
    this.x = x;
    this.y = y;
    this.killBox = killBox;
    this.color = color;
    this.speed = speed;
    this.playerProjectileDamage = damage;
  }

  draw() {
    c.beginPath();
    c.arc(this.x, this.y, this.killBox, 0, Math.PI * 2, false);
    c.fillStyle = this.color;
    c.fill();
  }

  update() {
    this.y = this.y - this.speed;
    this.x = this.x;
    this.draw();
  }
}

// Bonus drops
class BonusDrops {
  constructor(x, y, killBox, speed, bonusIndex) {
    this.x = x;
    this.y = y;
    this.killBox = killBox;
    this.speed = speed;
    this.bonusIndex = bonusIndex;
    this.image = new Image();
    this.image.src = bonusIndex.image;
  }

  draw() {
    c.drawImage(this.image, this.x, this.y, this.killBox, this.killBox);
  }

  update() {
    this.y = this.y - this.speed;
    this.x = this.x;
    this.draw();
  }
}

// Particle class
const friction = 0.97;
class Particle extends Projectile {
  constructor(x, y, killBox, color, velocity) {
    super(x, y, killBox, color);
    this.velocity = velocity;
    this.alpha = 1;
  }
  // draws particle on screen
  draw() {
    c.save();
    c.globalAlpha = this.alpha;
    c.beginPath();
    c.arc(this.x, this.y, this.killBox, 0, Math.PI * 2, false);
    c.fillStyle = this.color;
    c.fill();
    c.restore();
  }
  // update position of particle
  update() {
    this.draw();
    this.velocity.x *= friction;
    this.velocity.y *= friction;
    this.x = this.x + this.velocity.x;
    this.y = this.y + this.velocity.y;
    this.alpha -= 0.01;
  }
}

const x = canvas.width;
const y = canvas.height;

let playerImage = [
  "assets/ship.png",
  "assets/shipLeft.png",
  "assets/shipRight.png",
];
let player = new Player(x / 2 - 20, y - 100, playerImage[0], "image");
let fireTimer;
let additionalLifeScore;
let playerDrops = [];

let playerProjectiles = [];
let playerProjectileSpeed = 8;
let playerProjectileColor = "white";
let playerProjectileSize = 3;
let playerProjectileDamage;

let enemies = [];
let enemyImage = [
  "assets/UFO1.png",
  "assets/UFO2.png",
  "assets/UFO3.png",
  "assets/UFO4.png",
];
let enemyHealth;
let enemySpeed = 0.7;
let enemyVertical = 0.05;
let enemyCount = 12;
let enemyFireRate = 997;
let right = true;
let changeEnemyImageSpeed;
let enemyIndex;

let enemyProjectiles = [];
let enemyProjectileSpeed = -4;
let enemyProjectileColor = "orange";
let enemyProjectileSize = 3;

let particles = [];
let particleColor;

let keys = [];

let bonusDrops = [];
let bonusGenerateRate;
let dropsIndex;
let dropsArray = [];

let score;
let extraLives;
let targetScore;
let counter;
let index = 0;
let projectileIndex = 0;
let animationId;
let d = new Date();
let now = d.getSeconds();

function init() {
  playerImage = [
    "assets/ship.png",
    "assets/shipLeft.png",
    "assets/shipRight.png",
  ];
  player = new Player(x / 2 - 20, y - 100, playerImage[0], "image");
  fireTimer = 30;
  playerDrops = [];

  playerProjectiles = [];
  playerProjectileSpeed = 8;
  playerProjectileColor = "white";
  playerProjectileSize = 2;
  playerProjectileDamage = 5;

  enemies = [];
  enemyImage = [
    "assets/UFO1.png",
    "assets/UFO2.png",
    "assets/UFO3.png",
    "assets/UFO4.png",
  ];
  enemyHealth = 40;
  enemySpeed = 0.9;
  enemyVertical = 0.05;
  enemyCount = 14;
  enemyFireRate = 990;
  right = true;
  changeEnemyImageSpeed = 20;
  enemyIndex = 0;

  enemyProjectiles = [];
  enemyProjectileSpeed = -7;
  enemyProjectileColor = "orange";
  enemyProjectileSize = 2;

  particles = [];
  particleColor = "red";

  keys = [];

  bonusDrops = [
    {
      name: "Rapid Fire",
      effect: 5,
      duration: 5,
      image: "assets/rapidFire.png",
    },
    {
      name: "Shield",
      effect: 20,
      duration: 5,
      image: "assets/shield.png",
    },
    {
      name: "Extra Life",
      effect: 1,
      duration: 5,
      image: "assets/extraLife.png",
    },
  ];
  dropsArray = [];
  bonusGenerateRate = 5000;
  dropsIndex = 0;

  score = 0;
  additionalLifeScore = 5000;
  targetScore = 5000;
  extraLives = 0;
  counter = 0;
  index = 0;
  projectileIndex = 0;
  animationId;
  d = new Date();
  now = d.getSeconds();
}

function createEnemies() {
  let x = 100;
  let y = 100;

  //   place enemies in rows
  for (count = 1; count <= enemyCount; count++) {
    if (x >= canvas.width - 500) {
      y += 100;
      x = 200;
    }
    x += 200;

    enemies.push(new Enemy(x, y, enemyImage[0], enemyHealth, counter, "image"));
  }
}

function controller() {
  // move player left
  if (keys["KeyA"] || keys["ArrowLeft"]) {
    player.image.src = playerImage[1];
    player.x -= player.speed;
  }

  // move player right
  if (keys["KeyD"] || keys["ArrowRight"]) {
    player.image.src = playerImage[2];
    player.x += player.speed;
  }

  // player fire
  if (keys["Space"]) {
    // check for Rapid Fire and adjust fire rate if present
    // playerDrops.forEach((drop) => {
    //   if (drop.bonusIndex == bonusDrops[0]) {
    //     console.log("drop effect:", drop.bonusIndex.effect);
    //     console.log("fire rate before bonus added", player.fireRate);

    //     player.fireRate - drop.bonusIndex.effect;
    //     console.log("fire rate after bonus added", player.fireRate);
    //   }
    // });
    // if (playerFireRate < 5) {
    //   playerFireRate = 5;
    // }
    if (fireTimer > playerFireRate) {
      playerProjectiles.push(
        new Projectile(
          player.x,
          player.y,
          playerProjectileSize,
          playerProjectileColor,
          playerProjectileSpeed,
          playerProjectileDamage
        )
      );
      fireTimer = 0;
    }
    fireTimer++;
  }
}

// track score and lives
function scoreTracker(additionalScore) {
  score += additionalScore;
  scoreElement.innerHTML = score;
  if (score > additionalLifeScore) {
    additionalLifeScore += targetScore;
    extraLives++;
    displayExtraLives(extraLives);
  }
}

// display extra lives images
function displayExtraLives(extraLives) {
  extraLivesElement.innerHTML = "";
  for (let i = 0; i < extraLives; i++) {
    extraLivesElement.innerHTML +=
      "<img class = 'inline-block ml-2' src = '" + playerImage[0] + "'/>";
  }
}

// track bonuses
function bonusTracker() {
  playerDrops.forEach((drop, index) => {
    if (drop.bonusIndex.duration > now) {
      console.log("removing drop from player drops array");
      playerDrops.splice(index, 1);
    }
  });
}

// collision detection
function collisionDetection(object, item) {
  const dist = Math.hypot(item.x - object.x, item.y - object.y);
  if (dist - object.killBox - item.killBox < 1) {
    return true;
  }
}

// remove item if leaves screen on Y axis
function yEdgeDetection(item, itemArray, index) {
  if (item.y < 0 || item.y > canvas.height) {
    removeItem(itemArray, index);
    // setTimeout(() => {
    //   itemArray.splice(index, 1);
    // }, 0);
  }
}

// remove item from array
function removeItem(itemArray, index) {
  setTimeout(() => {
    itemArray.splice(index, 1);
  }, 0);
}

// animation loop
function animate() {
  c.fillStyle = "rgba(0,0,0,1)";
  c.fillRect(0, 0, canvas.width, canvas.height);
  animationId = requestAnimationFrame(animate);

  bonusTracker();

  controller();

  player.update();
  if (player.x <= 50) {
    player.x = 50;
  } else if (player.x >= canvas.width - 100) {
    player.x = canvas.width - 100;
  }

  // iterates through particles array & removes if faded out enough
  particles.forEach((particle, index) => {
    if (particle.alpha <= 0) {
      particles.splice(index, 1);
    } else {
      particle.update();
    }
  });

  enemies.forEach((enemy, index) => {
    // change enemy images to cause appearance of rotation
    if (enemy.counter > changeEnemyImageSpeed) {
      enemy.counter = 0;
      enemy.image.src = enemyImage[enemyIndex];
      if (enemyIndex < enemyImage.length - 1) {
        enemyIndex++;
      } else {
        enemyIndex = 0;
      }
    }
    enemy.counter++;

    // reverse direction when enemy reaches edge
    if (enemy.x > canvas.width - 100 && right == true) {
      enemySpeed *= -1;
      right = false;
    } else if (enemy.x < 100) {
      enemySpeed *= -1;
      right = true;
    }

    // end game if enemy reaches player Y
    else if (enemy.y > canvas.height - 100) {
      cancelAnimationFrame(animationId);
    }

    // iterate over player projectiles for hits
    projectileIndex = 0;
    playerProjectiles.forEach((projectile, projectileIndex) => {
      // handle if enemy is hit
      if (collisionDetection(enemy, projectile)) {
        // play sound when enemy is hit
        // let explosionSound = new Audio('assets/explosion');
        // explosionSound.volume = .6;
        // explosionSound.play();

        // creates explosions here
        for (let i = 0; i < enemy.killBox; i++) {
          particles.push(
            new Particle(
              projectile.x,
              projectile.y,
              Math.random() * 2,
              particleColor,
              {
                x: (Math.random() - 0.5) * (Math.random() * 10),
                y: (Math.random() - 0.5) * (Math.random() * 10),
              }
            )
          );
        }

        // reduce enemy health when hit and adjust score
        if (enemy.enemyHealth - projectile.playerProjectileDamage > 0) {
          // reduce enemy health with each hit
          enemy.enemyHealth -= projectile.playerProjectileDamage;

          // adjusting score when hitting enemies
          scoreTracker(100);

          // "setTimeout" removes flashing when projectile is removed by waiting until next frame to removes projectile from array
          setTimeout(() => {
            playerProjectiles.splice(projectileIndex, 1);
          }, 0);
        }
        // remove enemy whose health reaches 0 and adjust score
        else {
          scoreTracker(250);

          // removes flashing when enemy is removed by waiting until next frame and removes enemy and projectile from arrays
          setTimeout(() => {
            enemies.splice(index, 1);
            playerProjectiles.splice(projectileIndex, 1);
          }, 0);
        }
      }
    });

    // randomize enemy firerate and speed of projectiles
    let fireFrequency = Math.random() * (1000 - 1) + 1;
    let variableSpeed = Math.random() * 2;
    let bonusDropFrequency = Math.random() * bonusGenerateRate;
    if (fireFrequency > enemyFireRate) {
      enemyProjectiles.push(
        new Projectile(
          enemy.x,
          enemy.y,
          enemyProjectileSize,
          enemyProjectileColor,
          enemyProjectileSpeed + variableSpeed
        )
      );
    }
    if (bonusDropFrequency < 2) {
      let randomDrop = Math.floor(Math.random() * bonusDrops.length);
      dropsArray.push(
        new BonusDrops(
          enemy.x,
          enemy.y,
          20,
          (enemyProjectileSpeed + variableSpeed) / 2,
          bonusDrops[randomDrop]
        )
      );
    }
    enemy.update();
  });

  projectileIndex = 0;
  enemyProjectiles.forEach((projectile, projectileIndex) => {
    // handle if player is hit
    if (collisionDetection(player, projectile)) {
      // check for extra lives
      if (extraLives <= 0) {
        // play sound when end game
        // let endGameSound = new Audio('assets/endGameSound');
        // endGameSound.volume = .6;
        // endGameSound.play();

        // end game if no extra lives
        cancelAnimationFrame(animationId);

        // display start game modal when game ends
        // modalElement.style.display = 'flex'
        // bigSoreElement.innerHTML = score
      } else {
        extraLives -= 1;
        displayExtraLives(extraLives);

        //     // play sound when life is lost
        //     let loseLifeSound = new Audio('assets/loseLifeSound');
        //     loseLifeSound.volume = .3;
        //     loseLifeSound.play()
      }
      // "setTimeout" removes flashing when projectile is removed by waiting until next frame to removes projectile from array
      setTimeout(() => {
        enemyProjectiles.splice(projectileIndex, 1);
      }, 0);
    }
    // remove projectile from array when leaves screen
    yEdgeDetection(projectile, enemyProjectiles, projectileIndex);

    // following replaced by preceding

    // if (projectile.y > canvas.height) {
    //   setTimeout(() => {
    //     enemyProjectiles.splice(projectileIndex, 1);
    //   }, 0);
    // }

    projectile.update();
  });

  // need to add collision detection and add to array that is players
  dropsArray.forEach((drop, dropsIndex) => {
    if (collisionDetection(player, drop)) {
      playerDrops.push(drop);
      removeItem(dropsArray, dropsIndex);
    }
    yEdgeDetection(drop, dropsArray, dropsIndex);
    drop.update();
  });

  playerProjectiles.forEach((projectile, projectileIndex) => {
    // remove projectile from array when leaves screen
    yEdgeDetection(projectile, playerProjectiles, projectileIndex);

    // following replaced by preceding

    // if (projectile.y < 0) {
    //   setTimeout(() => {
    //     playerProjectiles.splice(projectileIndex, 1);
    //   }, 0);
    // }
    projectile.update();
  });
}

addEventListener("keydown", (event) => {
  keys[event.code] = true;
});
addEventListener("keyup", (event) => {
  keys[event.code] = false;
  player.image.src = playerImage[0];
});

init();
animate();
createEnemies();
