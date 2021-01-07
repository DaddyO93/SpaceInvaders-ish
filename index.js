const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");

canvas.width = innerWidth;
canvas.height = innerHeight;

// Player class
class Player {
  constructor(x, y, radius, color) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
  }
  draw() {
    c.beginPath();
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    c.fillStyle = this.color;
    c.fill();
  }
  update() {
    this.draw();
  }
}

// Enemy class
class Enemy extends Player {
  constructor(x, y, radius, color) {
    super(x, y, radius, color);
  }
  update() {
    super.draw();
    this.y += enemyVertical;
    this.x = this.x + enemySpeed;
  }
}

// Projectile class
class Projectile extends Player {
  constructor(x, y, radius, color, speed) {
    super(x, y, radius, color);
    this.speed = speed;
  }
  update() {
    super.draw();
    this.y = this.y - this.speed;
  }
}

// Particle class
const friction = 0.98;
class Particle extends Player {
  constructor(x, y, radius, color, velocity) {
    super(x, y, radius, color, velocity);
    this.alpha = 1;
  }
  // draws particle on screen
  draw() {
    c.save();
    c.globalAlpha = this.alpha;
    c.beginPath();
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
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

let player = new Player(x / 2, y - 50, 10, "white", 0);
let playerSpeed = 5000;
let playerProjectileSpeed = 8;
let playerProjectileColor = "white";

let enemies = [];
let enemySpeed = 0.5;
let enemyVertical = 0.05;
let enemyCount = 12;
let enemySize = 50;
let enemyFireRate = 997;
let enemyProjectileSpeed = -4;
let enemyProjectileColor = "red";
let right = true;

let projectiles = [];
let projectileSize = 5;
// let projectileColor = "white";
// let projectileSpeed = 8;

let animationId;

function init() {
  player = new Player(x / 2, y - 50, 10, "white", 0);
  playerSpeed = 10;
  playerProjectileSpeed = 8;
  playerProjectileColor = "white";

  enemies = [];
  enemySpeed = 0.5;
  enemyVertical = 0.05;
  enemyCount = 12;
  enemySize = 50;
  enemyFireRate = 997;
  enemyProjectileSpeed = -4;
  enemyProjectileColor = "orange";
  right = true;

  projectiles = [];
  // projectileSpeed = 8;
  projectileSize = 3;
  // projectileColor = "white";

  animationId;
}

function createEnemies() {
  const radius = 50;

  let x = 150;
  let y = 150;

  //   place enemies in rows
  for (count = 0; count <= enemyCount; count++) {
    if (x >= canvas.width - 150) {
      y += 150;
      x = 150;
    }
    x += 150;

    const color = `hsl(${Math.random() * 360}, 50%, 50%)`;

    enemies.push(new Enemy(x, y, radius, color));
  }
}

// animation loop
function animate() {
  animationId = requestAnimationFrame(animate);

  c.fillStyle = "rgba(0,0,0,0.1)";
  c.fillRect(0, 0, canvas.width, canvas.height);

  player.update();
  if (player.x <= 50) {
    player.x = 50;
  } else if (player.x >= canvas.width - 50) {
    player.x = canvas.width - 50;
  }

  // iterates through particles array & removes if faded out enough
  // particles.forEach((particle, index) => {
  //   if (particle.alpha <= 0) {
  //     particles.splice(index, 1);
  //   } else {
  //     particle.update();
  //   }
  // });

  projectiles.forEach((projectile, index) => {
    // collision detection for enemy projectile and player
    const dist = Math.hypot(player.x - projectile.x, player.y - projectile.y);
    if (
      dist - projectile.radius - player.radius < 1 &&
      projectile.color === enemyProjectileColor
    ) {
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
      //     enemy.radius - 60
      //     enemies.splice(index, 1)
      //     extraLivesElement.innerHTML = extraLives
      // }
      // "setTimeout" removes flashing when projectile is removed by waiting until next frame to removes projectile from array
      setTimeout(() => {
        projectiles.splice(index, 1);
      }, 0);
    }
    projectile.update();
  });

  enemies.forEach((enemy, index) => {
    if (enemy.x > canvas.width - 150 && right == true) {
      enemySpeed *= -1;
      right = false;
    } else if (enemy.x < 150) {
      enemySpeed *= -1;
      right = true;
    }

    let number = Math.random() * (1000 - 1) + 1;
    if (number > enemyFireRate) {
      projectiles.push(
        new Projectile(
          enemy.x,
          enemy.y,
          projectileSize,
          enemyProjectileColor,
          enemyProjectileSpeed
        )
      );
    }

    // "HYPOT" = hypotenuse in this case refers to distance between two points
    projectiles.forEach((projectile, projectileIndex) => {
      const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y);

      // collision detection loop and removal from array and screen for projectiles and enemies when projectile touches enemy
      if (
        dist - enemy.radius - projectile.radius < 1 &&
        projectile.color === playerProjectileColor
      ) {
        // play sound when enemy is hit
        // let explosionSound = new Audio('assets/explosion');
        // explosionSound.volume = .6;
        // explosionSound.play();

        // creates explosions here
        // for (let i = 0; i < enemy.radius * 2; i++) {
        //   particles.push(
        //     new Particle(
        //       projectile.x,
        //       projectile.y,
        //       Math.random() * 2,
        //       enemy.color,
        //       {
        //         x: (Math.random() - 0.5) * (Math.random() * 10),
        //         y: (Math.random() - 0.5) * (Math.random() * 10),
        //       }
        //     )
        //   );
        // }

        // shrink size of enemies when hit
        if (enemy.radius - 10 > 5) {
          // adjusting score when hitting enemies and shrinking
          // score += 100
          // scoreElement.innerHTML = score

          // using gsap (GreenSock Animation Platform - a library) to transition in size smoothly
          gsap.to(enemy, {
            radius: enemy.radius - 10,
          });

          // "setTimeout" removes flashing when projectile is removed by waiting until next frame to removes projectile from array
          setTimeout(() => {
            projectiles.splice(projectileIndex, 1);
          }, 0);
        } else {
          // adjusting score when hitting enemies and destroying
          // score += 250
          // scoreElement.innerHTML = score

          // removes flashing when enemy is removed by waiting until next frame and removes enemy and projectile from arrays
          setTimeout(() => {
            enemies.splice(index, 1);
            projectiles.splice(projectileIndex, 1);
          }, 0);
        }
      }
    });

    enemy.update();
  });
}

addEventListener(
  "keydown",
  (event) => {
    if (event.defaultPrevented) {
      return; // Do nothing if event already handled
    }

    switch (event.code) {
      case "KeyA":
      case "ArrowLeft":
        // Handle "move left"
        gsap.to(player, { x: (player.x -= playerSpeed) });
        break;
      case "KeyD":
      case "ArrowRight":
        // Handle "move right"
        gsap.to(player, { x: (player.x += playerSpeed) });
        break;
      case "Space":
        // Handle "fire"
        projectiles.push(
          new Projectile(
            player.x,
            player.y,
            projectileSize,
            playerProjectileColor,
            playerProjectileSpeed
          )
        );
        break;
    }

    // Consume the event so it doesn't get handled twice
    event.preventDefault();
  },
  true
);

init();
animate();
createEnemies();
