const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");

canvas.width = innerWidth;
canvas.height = innerHeight;

// ObjectClass is base class others extend
class ObjectClass {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.killBox = 0;
    this.imageXOffset = 1;
    this.imageYOffset = 0;
    this.killBoxXOffset = 1;
    this.killBoxYOffset = 1;
    this.image = new Image();
  }

  collisionDetection(otherObject, index, array, enemyIndex) {
    const dist = Math.hypot(this.x - otherObject.x, this.y - otherObject.y);
    if (dist - otherObject.killBox - this.killBox < 1) {
      // test for drops collision
      if (this.owner == 3) {
        this.removeItem(array, index);
        return true;
      }
      // test for player and enemy projectile collision
      else if (this.owner != otherObject.owner) {
        this.removeItem(array, index);
        otherObject.damage(this.damage, enemyIndex);
      }
    }
  }
  // remove item from array
  removeItem(itemArray, index) {
    itemArray.splice(index, 1);
  }

  yEdgeDetection(itemArray, index) {
    if (this.y < -1000 || this.y > canvas.height) {
      this.removeItem(itemArray, index);
    }
  }

  draw() {
    c.drawImage(
      this.image,
      this.x - this.killBox * this.imageXOffset,
      this.y - this.killBox + this.imageYOffset,
      this.killBox * this.killBoxXOffset,
      this.killBox * this.killBoxYOffset
    );
  }

  update() {
    this.draw();
  }
}

class Player extends ObjectClass {
  constructor(x, y, objectImage) {
    super(x, y);
    this.image.src = objectImage;
    this.killBox = 15;
    this.fireRate = 40; // lower number = faster firing
    this.fireTimer = this.fireRate + 1; // interval between firing, start > fire rate to fire immediately
    this.speed = 7; // higher = faster
    this.extraLives = 0;
    this.score = 0;
    this.drops = [];
    this.usedDropsArray = [];
    this.projectiles = [];
    this.projectileSpeed = 8;
    this.projectileColor = "white";
    this.projectilesize = 3;
    this.projectileDamage = 5;
    this.imageXOffset = 1.4;
    this.killBoxXOffset = 3;
    this.killBoxYOffset = 3;
    this.owner = 1;
  }

  controller() {
    // move player left
    if (keys["KeyA"] || keys["ArrowLeft"]) {
      this.image.src = playerImage[1];
      this.x -= this.speed;
    }

    // move player right
    if (keys["KeyD"] || keys["ArrowRight"]) {
      this.image.src = playerImage[2];
      this.x += this.speed;
    }

    // if (keys["ShiftLeft"] || keys["ShiftRight"]) {
    //   pauseModalElement.style.display = "flex";
    //   let pauseButtonTimer = true;
    //   pauseGame(pauseButtonTimer);
    // }

    // player fire
    if (keys["Space"]) {
      // check for Rapid Fire and adjust fire rate if present
      if (this.fireTimer > this.fireRate) {
        // play sound when end game
        let playerFire = new Audio("assets/playerFire");
        playerFire.volume = 0.6;
        playerFire.play();
        this.projectiles.push(
          new Projectile(
            this.x,
            this.y,
            this.projectilesize,
            this.projectileColor,
            this.projectileSpeed,
            this.projectileDamage,
            this.owner
          )
        );
        this.fireTimer = 0;
      }
      this.fireTimer++;
    }
  }

  damage(projectileDamage, index) {
    // handle if player is hit
    // check for extra lives
    if (this.extraLives <= 0) {
      // play sound when end game
      let endGameSound = new Audio("assets/endGameSound");
      endGameSound.volume = 0.6;
      endGameSound.play();

      // end game if no extra lives
      cancelAnimationFrame(animationId);
      startModalElement.style.display = "flex";

      // display start game modal when game ends
      pauseModalElement.style.display = "flex";
      bigSoreElement.innerHTML = score;
    } else {
      this.extraLives -= 1;
      displayExtraLives(this.extraLives);

      // play sound when life is lost
      let loseLifeSound = new Audio("assets/loseLife");
      loseLifeSound.volume = 0.3;
      loseLifeSound.play();
    }
  }

  // track bonuses to remove from used list
  bonusTracker() {
    // add effect from drop
    this.drops.forEach((drop, index) => {
      // rapid fire
      if (drop.bonusInfo == bonusDrops[0]) {
        this.fireRate -= drop.bonusInfo.effect;
        if (this.fireRate <= 5) {
          this.fireRate = 5;
          drop.dropCounter = 0;
        }
        this.usedDropsArray.push(drop);
      }
      // speed boost
      else if (drop.bonusInfo == bonusDrops[1]) {
        this.speed += drop.bonusInfo.effect;
        if (this.speed > 13) {
          this.speed = 13;
        }
        this.usedDropsArray.push(drop);
      }
      // extra life
      else if (drop.bonusInfo == bonusDrops[2]) {
        this.extraLives++;
        displayExtraLives(this.extraLives);
      }
      this.removeItem(this.drops, index);
    });
    // check for time-out for used drop and remove
    this.usedDropsArray.forEach((drop, index) => {
      if (drop.bonusInfo.duration < drop.dropCounter) {
        if (drop.bonusInfo == bonusDrops[0]) {
          this.fireRate += drop.bonusInfo.effect;
          if (this.fireRate > 40) {
            this.fireRate = 40;
          }
          this.removeItem(this.usedDropsArray, index);
        } else if (drop.bonusInfo == bonusDrops[1]) {
          this.speed -= drop.bonusInfo.effect;
          if (this.speed <= 7) {
            this.speed = 7;
          }
          this.removeItem(this.usedDropsArray, index);
        }
      } else {
        drop.dropCounter++;
      }
    });
  }

  update() {
    if (this.x <= 50) {
      this.x = 50;
    } else if (this.x >= canvas.width - 100) {
      this.x = canvas.width - 100;
    }
    this.bonusTracker();
    super.draw();
  }
}

class Enemy extends ObjectClass {
  constructor(x, y, objectImage) {
    super(x, y);
    this.image.src = objectImage;
    this.health = 40;
    this.killBox = 40;
    this.counter = 0; // for image changing
    this.speed = 1; // higher = faster
    this.enemyVertical = 0.15; // higher = faster dropping
    this.enemyFireRate = 996; // lower = faster firing
    this.changeImageSpeed = 20 + Math.random() * 3; // randomize image change speed
    this.projectileSpeed = -7; // lower = faster bullet speed
    this.projectileColor = "orange";
    this.projectileSize = 2;
    this.imageXOffset = 1.4;
    this.imageYOffset = 0.9;
    this.killBoxXOffset = 3;
    this.killBoxYOffset = 1;
    this.imageIndex = 0;
    this.right = true;
    this.projectileDamage = 1;
    this.owner = 2;
  }

  damage(projectileDamage, index) {
    // creates explosions
    for (let i = 0; i < this.killBox / 2; i++) {
      particles.push(
        new Particle(this.x, this.y, {
          x: (Math.random() - 0.5) * (Math.random() * 10),
          y: (Math.random() - 0.5) * (Math.random() * 10),
        })
      );
    }

    // play sound when player is hit
    let explosionSound = new Audio("assets/explosion");
    explosionSound.volume = 0.6;
    explosionSound.play();

    // reduce enemy health when hit and adjust score
    if (this.health - projectileDamage > 0) {
      this.health -= projectileDamage;

      // adjusting score when hitting enemies
      scoreTracker(100);
    }
    // remove enemy whose health reaches 0 and adjust score
    else {
      //play sound when enemy destroyed
      let enemyDestroyed = new Audio("assets/enemyDestroy");
      enemyDestroyed.volume = 0.6;
      enemyDestroyed.play();

      // creates explosions
      for (let i = 0; i < 100; i++) {
        particles.push(
          new Particle(this.x, this.y, {
            x: (Math.random() - 0.5) * (Math.random() * 10),
            y: (Math.random() - 0.5) * (Math.random() * 10),
          })
        );
      }

      scoreTracker(250);
      this.removeItem(enemies, index);
      nextLevelTest();
    }
  }

  update() {
    this.y += this.enemyVertical;
    this.x = this.x + this.speed;
    // change enemy images to cause appearance of rotation
    if (this.counter > this.changeImageSpeed) {
      this.counter = 0;
      this.image.src = enemyImage[this.imageIndex];
      if (this.imageIndex < enemyImage.length - 1) {
        this.imageIndex++;
      } else {
        this.imageIndex = 0;
      }
    }
    this.counter++;

    // reverse direction when enemy reaches edge
    if (this.x > canvas.width - 100 && this.right == true) {
      this.speed *= -1;
      this.right = false;
    } else if (this.x < 100) {
      this.speed *= -1;
      this.right = true;
    }

    // end game if enemy reaches player Y
    else if (this.y > canvas.height - 100) {
      cancelAnimationFrame(animationId);
      startModalElement.style.display = "flex";
    }

    // randomize enemy firerate and speed of projectiles
    let fireFrequency = Math.random() * (1000 - 1) + 1;
    let variableSpeed = Math.random() * 1;
    let bonusDropFrequency = Math.random() * bonusGenerateRate;

    if (fireFrequency > this.enemyFireRate) {
      projectiles.push(
        new Projectile(
          this.x,
          this.y,
          this.projectileSize,
          this.projectileColor,
          this.projectileSpeed + variableSpeed,
          this.projectileDamage,
          this.owner
        )
      );
      // play sound when enemy fires
      let enemyFire = new Audio("assets/enemyFire");
      enemyFire.volume = 0.6;
      enemyFire.play();
    }
    if (bonusDropFrequency < 2) {
      let weightedLoop = 0;
      let randomDrop = Math.floor(Math.random() * bonusDrops.length);
      if (randomDrop == 2) {
        if (weightedLoop < 2) {
          weightedLoop++;
        } else {
          weightedLoop == 0;
          dropsArray.push(
            new BonusDrops(
              this.x,
              this.y,
              ((this.projectileSpeed + variableSpeed) / 2) * -1,
              bonusDrops[randomDrop]
            )
          );
        }
      } else {
        dropsArray.push(
          new BonusDrops(
            this.x,
            this.y,
            ((this.projectileSpeed + variableSpeed) / 2) * -1,
            bonusDrops[randomDrop]
          )
        );
      }
    }
    super.draw();
  }
}

class Projectile extends ObjectClass {
  constructor(x, y, killBox, objectImage, speed, damage, owner) {
    super(x, y);
    this.killBox = killBox;
    this.color = objectImage;
    this.speed = speed;
    this.damage = damage;
    this.owner = owner;
  }

  draw() {
    c.beginPath();
    c.arc(this.x, this.y, this.killBox, 0, Math.PI * 2, false);
    c.fillStyle = this.color;
    c.fill();
  }

  update(array, projectileIndex) {
    this.y = this.y - this.speed;
    this.x = this.x;

    this.yEdgeDetection(array, projectileIndex);

    this.draw();
  }
}

class Particle extends ObjectClass {
  constructor(x, y, velocity) {
    super(x, y);
    this.velocity = velocity;
    this.alpha = 1;
    this.friction = 0.97;
    this.color = "red";
    this.killBox = Math.random(0.2) * 3;
  }

  draw() {
    c.save();
    c.globalAlpha = this.alpha;
    c.beginPath();
    c.arc(this.x, this.y, this.killBox, 0, Math.PI * 2, false);
    c.fillStyle = this.color;
    c.fill();
    c.restore();
  }

  update(index) {
    this.velocity.x *= this.friction;
    this.velocity.y *= this.friction;
    this.x = this.x + this.velocity.x;
    this.y = this.y + this.velocity.y;
    this.alpha -= 0.01;
    if (this.alpha <= 0) {
      setTimeout(() => {
        particles.splice(index, 1);
      }, 0);
    }
    this.draw();
  }
}

class BonusDrops extends ObjectClass {
  constructor(x, y, speed, bonusInfo) {
    super(x, y);
    this.killBox = 40;
    this.imageYOffset = 25;
    this.speed = speed;
    this.bonusInfo = bonusInfo;
    this.image.src = bonusInfo.image;
    this.duration = bonusInfo.duration;
    this.effect - bonusInfo.effect;
    this.dropCounter = bonusInfo.counter;
    this.owner = 3;
  }

  update(index) {
    if (this.collisionDetection(player, index, dropsArray)) {
      // play sound when drop grabbed
      let powerUp = new Audio("assets/powerup");
      powerUp.volume = 0.6;
      powerUp.play();
      player.drops.push(this);
    }
    this.yEdgeDetection(dropsArray, index);
    this.y += this.speed;
    super.draw();
  }
}

const x = canvas.width;
const y = canvas.height;
let animationId;
const playerImage = [
  "assets/ship.png",
  "assets/shipLeft.png",
  "assets/shipRight.png",
];
let player = new Player(x / 2 - 20, y - 100, playerImage[0], "image");
let additionalLifeScore;
let targetScore;
let enemies = [];
const enemyImage = [
  "assets/UFO1.png",
  "assets/UFO2.png",
  "assets/UFO3.png",
  "assets/UFO4.png",
];
let right = true;
const bonusDrops = [
  {
    name: "Rapid Fire",
    effect: 20,
    duration: 900,
    image: "assets/rapidFire.png",
    counter: 0,
  },
  {
    name: "Speed Boost",
    effect: 2,
    duration: 200,
    image: "assets/speedBoost.png",
    counter: 0,
  },
  {
    name: "Extra Life",
    effect: 1,
    duration: 0,
    image: "assets/extraLife.png",
  },
];
let bonusGenerateRate;
let particles = [];
let projectiles = [];
let keys = [];
let dropsArray = [];
let levelCounter;
let enemyCount;

function init() {
  animationId;
  player = new Player(x / 2 - 20, y - 100, playerImage[0], "image");
  additionalLifeScore = 10000;
  targetScore = 10000;
  enemies = [];
  right = true;
  particles = [];
  projectiles = [];
  keys = [];
  dropsArray = [];
  bonusGenerateRate = 8000; // higher = less frequent drop
  levelCounter = 0;
  levelOne();
}

function createEnemies() {
  levelCounter++;
  displayLevelNumber(levelCounter);
  let x = canvas.width - 200;
  let y = 0;
  for (let count = 1; count <= enemyCount; count++) {
    if (x <= 300) {
      y -= 100;
      x = canvas.width - 200;
    }
    x -= 200;
    enemies.push(new Enemy(x, y, enemyImage[0], count, "image"));
  }
  enemies.forEach((enemy) => {
    enemy.draw();
  });
}

function levelOne() {
  enemyCount = 5;
  createEnemies();
}

function levelIncrease() {
  //play sound when start next level
  let nextLevel = new Audio("assets/nextLevel");
  nextLevel.volume = 0.6;
  nextLevel.play();
  enemyCount += 5;
  setTimeout(() => {
    createEnemies();
  }, 2000);
  enemies.forEach((enemy) => {
    this.enemyFireRate -= 10;
    this.speed += 20;
    this.enemyVertical += 0.01;
    this.projectileSpeed -= 3;
    enemy.draw();
  });
}

function nextLevelTest() {
  if (enemies.length < 1) {
    levelIncrease();
  }
}

// display level number
function displayLevelNumber(levelCounter) {
  levelElement.innerHTML = levelCounter;
}

// track score and lives
function scoreTracker(additionalScore) {
  player.score += additionalScore;
  scoreElement.innerHTML = player.score;
  if (player.score > additionalLifeScore) {
    additionalLifeScore += targetScore;
    player.extraLives++;
    this.displayExtraLives(player.extraLives);
  }
}

// display extra lives images
function displayExtraLives(extraLives) {
  extraLivesElement.innerHTML = "";
  for (let i = 0; i < extraLives; i++) {
    extraLivesElement.innerHTML +=
      "<img class = 'inline-block ml-2' style='width:30px;height:30px;' src = '" +
      playerImage[0] +
      "'/>";
  }
}

// function pauseGame() {
//   function recursivePause(pauseGame) {
//     if (pauseButtonTimer) {
//       setTimeout(() => {}, 1000);
//     }
//     pauseGameButton.addEventListener("click", () => {
//       pauseModalElement.style.display = "none";
//       pauseButtonTimer = false;
//     });
//   }
// }

// animation loop
function animate() {
  c.fillStyle = "rgba(0,0,0,1)";
  c.fillRect(0, 0, canvas.width, canvas.height);
  animationId = requestAnimationFrame(animate);

  player.controller();

  player.update();

  particles.forEach((particle, index) => {
    particle.update(index);
  });

  enemies.forEach((enemy, enemyIndex) => {
    player.projectiles.forEach((projectile, projectileIndex) => {
      projectile.collisionDetection(
        enemy,
        projectileIndex,
        player.projectiles,
        enemyIndex
      );
    });
    enemy.update(enemyIndex);
  });

  projectiles.forEach((projectile, index) => {
    projectile.collisionDetection(player, index, projectiles);
    projectile.update(projectiles, index);
  });

  player.projectiles.forEach((projectile, index) => {
    projectile.update(player.projectiles, index);
  });

  dropsArray.forEach((drop, index) => {
    drop.update(index);
  });
}

addEventListener("keydown", (event) => {
  keys[event.code] = true;
});
addEventListener("keyup", (event) => {
  keys[event.code] = false;
  player.image.src = playerImage[0];
});

c.fillStyle = "rgba(0,0,0,1)";
c.fillRect(0, 0, canvas.width, canvas.height);
startModalElement.style.display = "flex";
// pauseModalElement.style.display = "none";

// start game on clicking "start game" button
startGameButton.addEventListener("click", () => {
  startModalElement.style.display = "none";

  init();
  animate();
});
