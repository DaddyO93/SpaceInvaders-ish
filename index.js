const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");

canvas.width = innerWidth;
canvas.height = innerHeight;

// ObjectClass is base class others extend
class ObjectClass {
  constructor(x, y, index) {
    this.x = x;
    this.y = y;
    this.killBox = 0;
    this.index = index;
    this.imageXOffset = 1;
    this.imageYOffset = 0;
    this.killBoxXOffset = 1;
    this.killBoxYOffset = 1;
    this.image = new Image();
  }

  collisionDetection(otherObject) {
    const dist = Math.hypot(this.x - otherObject.x, this.y - otherObject.y);
    // test for drops collision
    if (this.owner == 3) {
      return true;
    }
    // test for player and enemy projectile collision
    else if (this.owner != otherObject.owner) {
      if (dist - otherObject.killBox - this.killBox < 1) {
        otherObject.damage(this);
        // play sound when entity is hit
        // let explosionSound = new Audio('assets/explosion');
        // explosionSound.volume = .6;
        // explosionSound.play();
      }
    }
  }
  // remove item from array
  removeItem(itemArray) {
    setTimeout(() => {
      itemArray.splice(this.index, 1);
    }, 0);
  }

  yEdgeDetection(itemArray) {
    if (this.y < 0 || this.y > canvas.height) {
      this.removeItem(itemArray);
    }
  }

  setIndex(arrayName) {
    if (arrayName.length < 1) {
      let index = 0;
      return index;
    } else {
      let index = arrayName[arrayName.length - 1].index;
      return index;
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
    this.fireRate = 45;
    this.fireTimer = 30;
    this.speed = 7;
    this.extraLives = 0;
    this.score = 0;
    this.drops = [];
    this.usedDropsArray = [];
    this.projectileSpeed = 1;
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

    // player fire
    if (keys["Space"]) {
      // check for Rapid Fire and adjust fire rate if present

      if (this.fireRate < 20) {
        this.fireRate = 20;
      }
      if (this.fireTimer > this.fireRate) {
        let index = this.setIndex(projectiles);
        projectiles.push(
          new Projectile(
            this.x,
            this.y,
            this.projectilesize,
            this.projectileColor,
            this.projectileSpeed,
            this.projectileDamage,
            this.owner,
            index + 1
          )
        );
        this.fireTimer = 0;
      }
      this.fireTimer++;
    }
  }

  damage(projectile) {
    // handle if player is hit
    // if (collisionDetection(projectile)) {
    // check for extra lives
    if (this.extraLives <= 0) {
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
      this.extraLives -= 1;
      // gameManager.displayExtraLives(this.extraLives);
      displayExtraLives(this.extraLives);

      //     // play sound when life is lost
      //     let loseLifeSound = new Audio('assets/loseLifeSound');
      //     loseLifeSound.volume = .3;
      //     loseLifeSound.play()
    }
    // "setTimeout" removes flashing when projectile is removed by waiting until next frame to removes projectile from array
    this.removeItem(projectiles);
    // setTimeout(() => {
    //   projectiles.splice(projectile.index, 1);
    // }, 0);
    // }
  }

  // track bonuses to remove from used list
  bonusTracker() {
    // add effect from drop
    this.drops.forEach((drop) => {
      if (drop.bonusIndex == bonusDrops[0]) {
        this.fireRate -= drop.bonusIndex.effect;
        if (this.fireRate < 45) {
          player, (fireRate = 45);
        }
        this.usedDropsArray.push(drop);
        this.removeItem(this.drops, drop.index);
      } else if (drop.bonusIndex == bonusDrops[1]) {
        this.speed += drop.bonusIndex.effect;
        this.usedDropsArray.push(drop);
        this.removeItem(this.drops, drop.index);
      } else if (drop.bonusIndex == bonusDrops[2]) {
        extraLives++;
        // gameManager.displayExtraLives(extraLives);
        displayExtraLives(extraLives);
        this.removeItem(this.drops, drop.index);
      }
    });
    // check for time-out for used drop and remove
    this.usedDropsArray.forEach((drop) => {
      if (drop.bonusIndex.duration < drop.dropCounter) {
        if (drop.bonusIndex == bonusDrops[0]) {
          this.fireRate += drop.bonusIndex.effect;
          this.removeItem(this.usedDropsArray, drop.index);
        } else if (drop.bonusIndex == bonusDrops[1]) {
          this.speed -= drop.bonusIndex.effect;
          this.removeItem(this.usedDropsArray, drop.index);
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
  constructor(x, y, index, objectImage) {
    super(x, y, index);
    this.image.src = objectImage;
    this.health = 40;
    this.killBox = 40;
    this.counter = 0; // for image changing
    this.index = index; // for tracking
    this.speed = 0.7;
    this.enemyVertical = 0.05;
    this.enemyFireRate = 998;
    this.changeImageSpeed = 20;
    this.projectileSpeed = -7;
    this.projectileColor = "orange";
    this.projectileSize = 2;
    this.imageXOffset = 1.7;
    this.imageYOffset = Math.random(-0.2) * 0.2;
    this.killBoxXOffset = 3;
    this.killBoxYOffset = 1;
    this.imageIndex = 0;
    this.right = true;
    this.damage = 1;
    this.owner = 2;
  }

  damage(projectile) {
    // creates explosions here
    let index = this.setIndex(particles);
    for (let i = 0; i < this.killBox; i++) {
      particles.push(
        new Particle(this.x, this.y, Math.random() * 2, index + 1, {
          x: (Math.random() - 0.5) * (Math.random() * 10),
          y: (Math.random() - 0.5) * (Math.random() * 10),
        })
      );
      index++;
    }

    // reduce enemy health when hit and adjust score
    if (this.health - projectile.playerProjectileDamage > 0) {
      // reduce enemy health with each hit
      this.health -= projectile.playerProjectileDamage;

      // adjusting score when hitting enemies
      // gameManager.scoreTracker(100);
      scoreTracker(100);

      // "setTimeout" removes flashing when projectile is removed by waiting until next frame to removes projectile from array
      this.removeItem(projectiles);
      // setTimeout(() => {
      //   projectiles.splice(projectile.index, 1);
      // }, 0);
      // gameManager.nextLevelTest();
      nextLevelTest();
    }
    // remove enemy whose health reaches 0 and adjust score
    else {
      // gameManager.scoreTracker(250);
      scoreTracker(250);

      // removes flashing when enemy is removed by waiting until next frame and removes enemy and projectile from arrays
      this.removeItem(enemies);
      setTimeout(() => {
        // enemies.splice(this.index, 1);
        projectiles.splice(projectile.index, 1);
      }, 0);
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
    }

    // randomize enemy firerate and speed of projectiles
    let fireFrequency = Math.random() * (1000 - 1) + 1;
    let variableSpeed = Math.random() * 1;
    let bonusDropFrequency = Math.random() * bonusGenerateRate;
    let index = this.setIndex(projectiles);

    if (fireFrequency > this.enemyFireRate) {
      projectiles.push(
        new Projectile(
          this.x,
          this.y,
          this.projectileSize,
          this.projectileColor,
          this.projectileSpeed + variableSpeed,
          // this.projectileSpeed,
          this.damage,
          this.owner,
          index + 1
        )
      );
    }
    if (bonusDropFrequency < 2) {
      let randomDrop = Math.floor(Math.random() * bonusDrops.length);
      let index = this.setIndex(dropsArray);
      dropsArray.push(
        new BonusDrops(
          this.x,
          this.y,
          ((this.projectileSpeed + variableSpeed) / 2) * -1,
          bonusDrops[randomDrop],
          index + 1
        )
      );
    }
    super.draw();
  }
}

class Projectile extends ObjectClass {
  constructor(x, y, killBox, objectImage, speed, damage, owner, index) {
    super(x, y, index);
    this.killBox = killBox;
    this.color = objectImage;
    this.speed = speed;
    this.playerProjectileDamage = damage;
    this.owner = owner;
    this.index = index;
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

    enemies.forEach((enemy) => {
      this.collisionDetection(enemy);
    });
    this.collisionDetection(player);
    this.yEdgeDetection(projectiles);

    this.draw();
  }
}

class Particle extends ObjectClass {
  constructor(x, y, velocity, index) {
    super(x, y, index);
    this.velocity = velocity;
    this.alpha = 1;
    this.friction = 0.97;
    this.color = "red";
    this.index = index;
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

  update() {
    this.draw();
    this.velocity.x *= this.friction;
    this.velocity.y *= this.friction;
    this.x = this.x + this.velocity.x;
    this.y = this.y + this.velocity.y;
    this.alpha -= 0.01;
    if (this.alpha <= 0) {
      particles.splice(this.index, 1);
    }
  }
}

class BonusDrops extends ObjectClass {
  constructor(x, y, speed, bonusInfo, index) {
    super(x, y, index);
    this.dropsIndex = bonusInfo;
    this.killBox = 40;
    this.speed = speed;
    this.bonusInfo = bonusInfo;
    this.image.src = bonusInfo.image;
    this.duration = bonusInfo.duration;
    this.effect - bonusInfo.effect;
    this.dropCounter = bonusInfo.counter;
    this.owner = 3;
  }

  update(drop) {
    if (this.collisionDetection(player)) {
      player.drops.push(drop);
      this.removeItem(dropsArray, drop.index);
    }
    this.yEdgeDetection(dropsArray, drop.index);
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
    effect: 40,
    duration: 200,
    image: "assets/rapidFire.png",
    counter: 0,
  },
  {
    name: "Speed Boost",
    effect: 5,
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
// let nextLevel = [levelTwo];

function init() {
  animationId;
  player = new Player(x / 2 - 20, y - 100, playerImage[0], "image");
  additionalLifeScore = 5000;
  targetScore = 5000;
  enemies = [];
  right = true;
  particles = [];
  projectiles = [];
  keys = [];
  dropsArray = [];
  bonusGenerateRate = 6000;
  projectileIndex = 0;
  levelCounter = 0;
  enemyCount = 12;
  createEnemies();
}

// game manager
// class GameManager {
//   constructor() {}
function levelTwo() {
  let x = 100;
  let y = 100;
  enemyCount = 28;
  for (let count = 0; count <= enemyCount; count++) {
    if (x >= canvas.width - 500) {
      y += 100;
      x = 200;
    }
    x += 200;
    enemies.push(new Enemy(x, y, count, enemyImage[0], "image"));
  }
}

function nextLevelTest() {
  if (enemies.length < 1) {
    nextLevel[levelCounter]();
    levelCounter++;
  }
}
// track score and lives
function scoreTracker(additionalScore) {
  score += additionalScore;
  scoreElement.innerHTML = score;
  if (score > additionalLifeScore) {
    additionalLifeScore += targetScore;
    extraLives++;
    this.displayExtraLives(extraLives);
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

function createEnemies() {
  let x = 100;
  let y = 100;
  for (let count = 0; count <= enemyCount; count++) {
    if (x >= canvas.width - 500) {
      y += 100;
      x = 200;
    }
    x += 200;
    enemies.push(new Enemy(x, y, count, enemyImage[0], "image"));
  }
}
// }

// animation loop
function animate() {
  c.fillStyle = "rgba(0,0,0,1)";
  c.fillRect(0, 0, canvas.width, canvas.height);
  animationId = requestAnimationFrame(animate);

  player.controller();

  player.update();

  particles.forEach((particle) => {
    particle.update();
  });

  enemies.forEach((enemy) => {
    enemy.update();
  });

  projectiles.forEach((projectile) => {
    projectile.update();
  });

  dropsArray.forEach((drop) => {
    drop.update(drop);
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
