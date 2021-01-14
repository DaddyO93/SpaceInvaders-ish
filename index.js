const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");

canvas.width = innerWidth;
canvas.height = innerHeight;

// Player class using image
class Player {
  constructor(x, y, playerImage, killBox) {
    this.x = x;
    this.y = y;
    this.image = new Image();
    this.image.src = playerImage;
    this.killBox = killBox;
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
  constructor(x, y, enemyImage, killBox, enemyHealth, counter) {
    super(x, y, enemyImage, killBox);
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
class BonusDrops extends Projectile {
  constructor(x, y, radius, image, speed, bonus) {
    super(x, y, radius, image, speed, bonus);
    this.radius = radius;
    this.bonus = bonus;
    this.image = image;
  }
  draw() {
    c.beginPath();
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    c.fillStyle = this.image;
    c.fill();
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
let playerKillBox = 50;
let player = new Player(
  x / 2 - playerKillBox,
  y - 100,
  playerImage[0],
  playerKillBox,
  "image"
);
let playerSpeed;
let playerFireRate;
let fireTimer;
let additionalLifeScore;

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
let enemyKillbox = 50;
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
let bonusFastFire;
let bonusShield;
let score;
let extraLives;
let targetScore;
let counter;
let index = 0;
let projectileIndex = 0;
let animationId;

function init() {
  playerImage = [
    "assets/ship.png",
    "assets/shipLeft.png",
    "assets/shipRight.png",
  ];
  playerKillBox = 20;
  player = new Player(
    x / 2 - playerKillBox,
    y - 100,
    playerImage[0],
    playerKillBox,
    "image"
  );
  playerSpeed = 8;
  playerFireRate = 30;
  fireTimer = 30;

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
  enemyKillbox = 50;
  enemyHealth = 40;
  enemySpeed = 0.9;
  enemyVertical = 0.05;
  enemyCount = 13;
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

  bonusDrops = [];
  bonusFastFire = -10;
  bonusShield = 10;

  score = 0;
  additionalLifeScore = 5000;
  targetScore = 5000;
  extraLives = 0;
  counter = 0;
  index = 0;
  projectileIndex = 0;
  animationId;
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

    enemies.push(
      new Enemy(
        x,
        y,
        enemyImage[0],
        enemyKillbox,
        enemyHealth,
        counter,
        "image"
      )
    );
  }
}

function controller() {
  // move player left
  if (keys["KeyA"] || keys["ArrowLeft"]) {
    player.image.src = playerImage[1];
    player.x -= playerSpeed;
  }

  // move player right
  if (keys["KeyD"] || keys["ArrowRight"]) {
    player.image.src = playerImage[2];
    player.x += playerSpeed;
  }

  // player fire
  if (keys["Space"]) {
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
  }
  fireTimer++;
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

// animation loop
function animate() {
  c.fillStyle = "rgba(0,0,0,1)";
  c.fillRect(0, 0, canvas.width, canvas.height);
  animationId = requestAnimationFrame(animate);

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
      const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y);
      if (dist - enemy.killBox - projectile.killBox < 1) {
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
    let bonusDropFrequency = Math.random() * 500;
    if (fireFrequency > enemyFireRate) {
      if (bonusDropFrequency > 490) {
        bonusDrops.push(
          new BonusDrops(
            enemy.x,
            enemy.y,
            10,
            "green",
            enemyProjectileSpeed + variableSpeed,
            bonusFastFire
          )
        );
      }
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
    enemy.update();
  });

  projectileIndex = 0;
  enemyProjectiles.forEach((projectile, projectileIndex) => {
    // handle if player is hit
    const dist = Math.hypot(projectile.x - player.x, projectile.y - player.y);
    if (dist - player.killBox - projectile.killBox < 1) {
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
    if (projectile.y > canvas.height) {
      setTimeout(() => {
        enemyProjectiles.splice(projectileIndex, 1);
      }, 0);
    }
    projectile.update();
  });

  playerProjectiles.forEach((projectile, projectileIndex) => {
    // remove projectile from array when leaves screen
    if (projectile.y < 0) {
      setTimeout(() => {
        playerProjectiles.splice(projectileIndex, 1);
      }, 0);
    }
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
