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
  constructor(x, y, enemyImage, killBox) {
    super(x, y, enemyImage, killBox);
    // this.x = x;
    // this.y = y;
    // this.image = new Image();
    this.image.src = enemyImage;
    // this.killBox = killBox;
  }

  draw() {
    c.drawImage(
      this.image,
      this.x - this.killBox * 1.4,
      this.y - this.killBox,
      this.killBox * 3,
      this.killBox
    );
  }

  update() {
    this.y += enemyVertical;
    this.x = this.x + enemySpeed;
    this.draw();
    // super.draw();
  }
}

// Projectile class
// class Projectile extends Player {
class Projectile {
  // constructor(x, y, killBox, color, speed) {
  constructor(x, y, killBox, color, speed) {
    // super(x, y, killBox);
    this.x = x;
    this.y = y;
    this.killBox = killBox;
    this.color = color;
    this.speed = speed;
  }

  draw() {
    c.beginPath();
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    c.fillStyle = this.color;
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

let playerSpeed = 8;
let playerProjectileSpeed = 8;
let playerProjectileColor = "white";
let playerProjectileSize = 3;
let playerFireRate = 30;
let fireTimer = 30;
let playerProjectiles = [];

let enemies = [];
enemyImage = [
  "assets/UFO1.png",
  "assets/UFO2.png",
  "assets/UFO3.png",
  "assets/UFO4.png",
];
// let enemyImage = "assets/UFO1.png";
let enemyKillbox = 50;
let enemySpeed = 0.5;
let enemyVertical = 0.05;
let enemyCount = 12;
let enemyFireRate = 997;
let enemyProjectileSpeed = -3;
let enemyProjectileColor = "orange";
let enemyProjectileSize = 3;
let right = true;
let enemyProjectiles = [];

let particles = [];

let keys = [];

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
  playerProjectileSpeed = 8;
  playerProjectileColor = "white";
  playerProjectileSize = 3;
  playerFireRate = 30;
  fireTimer = 30;
  playerProjectiles = [];

  enemies = [];
  enemyImage = [
    "assets/UFO1.png",
    "assets/UFO2.png",
    "assets/UFO3.png",
    "assets/UFO4.png",
  ];
  // enemyImage = "assets/UFO1.png";
  enemyKillbox = 50;
  enemySpeed = 0.5;
  enemyVertical = 0.05;
  enemyCount = 12;
  enemyFireRate = 997;
  enemyProjectileSpeed = -3;
  enemyProjectileColor = "orange";
  enemyProjectileSize = 3;
  right = true;
  enemyProjectiles = [];

  particles = [];

  keys = [];

  index = 0;
  projectileIndex = 0;
  animationId;
}

function createEnemies() {
  let x = 150;
  let y = 150;

  //   place enemies in rows
  for (count = 0; count <= enemyCount; count++) {
    if (x >= canvas.width - 200) {
      y += 200;
      x = 200;
    }
    x += 200;

    enemies.push(new Enemy(x, y, enemyImage[0], enemyKillbox, "image"));
  }
}

function controller() {
  // move player left
  if (keys["KeyA"] || keys["ArrowLeft"]) {
    player.playerImage = playerImage[1];
    player.x -= playerSpeed;
  }

  // move player right
  if (keys["KeyD"] || keys["ArrowRight"]) {
    player.playerImage = playerImage[2];
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
          playerProjectileSpeed
        )
      );
      fireTimer = 0;
    }
  }
  fireTimer++;
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
    // enemyImage =
    // reverse direction when enemy reaches edge
    if (enemy.x > canvas.width - 150 && right == true) {
      enemySpeed *= -1;
      right = false;
    } else if (enemy.x < 150) {
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
              enemy.color,
              {
                x: (Math.random() - 0.5) * (Math.random() * 10),
                y: (Math.random() - 0.5) * (Math.random() * 10),
              }
            )
          );
        }

        // shrink size of enemies when hit
        if (enemy.killBox - 10 > 5) {
          // adjusting score when hitting enemies and shrinking
          // score += 100
          // scoreElement.innerHTML = score

          // "setTimeout" removes flashing when projectile is removed by waiting until next frame to removes projectile from array
          setTimeout(() => {
            playerProjectiles.splice(projectileIndex, 1);
          }, 0);
        } else {
          // adjusting score when hitting enemies and destroying
          // score += 250
          // scoreElement.innerHTML = score

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
    enemy.update();
  });

  projectileIndex = 0;
  enemyProjectiles.forEach((projectile, projectileIndex) => {
    // handle if player is hit
    const dist = Math.hypot(projectile.x - player.x, projectile.y - player.y);
    if (dist - player.killBox - projectile.killBox < 1) {
      // check for extra lives
      // if (extraLives <= 0) {

      // play sound when end game
      // let endGameSound = new Audio('assets/endGameSound');
      // endGameSound.volume = .6;
      // endGameSound.play();

      // end game if no extra lives
      cancelAnimationFrame(animationId);

      // display start game modal when game ends
      // modalElement.style.display = 'flex'
      // bigSoreElement.innerHTML = score

      // } else {
      //     extraLives -= 1

      //     // play sound when life is lost
      //     let loseLifeSound = new Audio('assets/loseLifeSound');
      //     loseLifeSound.volume = .3;
      //     loseLifeSound.play()

      //     // destroy enemy that touches player
      //     enemy.killBox - 60
      //     enemies.splice(index, 1)
      //     extraLivesElement.innerHTML = extraLives
      // }
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
  if (
    event == "KeyA" ||
    event == "KeyD" ||
    event == "ArrowLeft" ||
    event == "ArrowRight"
  ) {
    player.playerImage = "assets/ship.png";
  }
});

init();
animate();
createEnemies();
