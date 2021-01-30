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
    if (this.y < 0 || this.y > canvas.height) {
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
    this.fireRate = 50;
    this.fireTimer = 30;
    this.speed = 7;
    this.extraLives = 0;
    this.score = 0;
    this.drops = [];
    this.usedDropsArray = [];
    this.projectiles = [];
    this.projectileSpeed = 7;
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
      displayExtraLives(this.extraLives);

      //     // play sound when life is lost
      //     let loseLifeSound = new Audio('assets/loseLifeSound');
      //     loseLifeSound.volume = .3;
      //     loseLifeSound.play()
    }
  }

  // track bonuses to remove from used list
  bonusTracker() {
    // add effect from drop
    this.drops.forEach((drop) => {
      if (drop.bonusInfo == bonusDrops[0]) {
        this.fireRate -= drop.bonusInfo.effect;
        if (this.fireRate < 20) {
          this.fireRate = 20;
        }
        this.usedDropsArray.push(drop);
        this.removeItem(this.drops, drop.index);
      } else if (drop.bonusInfo == bonusDrops[1]) {
        this.speed += drop.bonusInfo.effect;
        this.usedDropsArray.push(drop);
        this.removeItem(this.drops, drop.index);
      } else if (drop.bonusInfo == bonusDrops[2]) {
        this.extraLives++;
        displayExtraLives(this.extraLives);
        this.removeItem(this.drops, drop.index);
      }
    });
    // check for time-out for used drop and remove
    this.usedDropsArray.forEach((drop) => {
      if (drop.bonusInfo.duration < drop.dropCounter) {
        if (drop.bonusInfo == bonusDrops[0]) {
          this.fireRate += drop.bonusInfo.effect;
          if (this.fireRate > 50) {
            this.fireRate = 50;
          }
          this.removeItem(this.usedDropsArray, drop);
        } else if (drop.bonusInfo == bonusDrops[1]) {
          this.speed -= drop.bonusInfo.effect;
          this.removeItem(this.usedDropsArray, drop);
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
    this.speed = 0.7;
    this.enemyVertical = 0.05;
    this.enemyFireRate = 998;
    this.changeImageSpeed = 20 + Math.random() * 3; // randomize image change speed
    this.projectileSpeed = -7;
    this.projectileColor = "orange";
    this.projectileSize = 2;
    this.imageXOffset = 1.7;
    this.imageYOffset = Math.random(-0.2) * 1;
    this.killBoxXOffset = 3;
    this.killBoxYOffset = 1;
    this.imageIndex = 0;
    this.right = true;
    this.projectileDamage = 1;
    this.owner = 2;
  }

  damage(projectileDamage, index) {
    // creates explosions
    for (let i = 0; i < this.killBox; i++) {
      particles.push(
        new Particle(this.x, this.y, {
          x: (Math.random() - 0.5) * (Math.random() * 10),
          y: (Math.random() - 0.5) * (Math.random() * 10),
        })
      );
    }

    // reduce enemy health when hit and adjust score
    if (this.health - projectileDamage > 0) {
      this.health -= projectileDamage;

      // adjusting score when hitting enemies
      scoreTracker(100);
    }
    // remove enemy whose health reaches 0 and adjust score
    else {
      scoreTracker(250);
      this.removeItem(enemies, index);
      // nextLevelTest();
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
    }
    if (bonusDropFrequency < 2) {
      let randomDrop = Math.floor(Math.random() * bonusDrops.length);
      dropsArray.push(
        new BonusDrops(
          this.x,
          this.y,
          ((this.projectileSpeed + variableSpeed) / 2) * -1,
          bonusDrops[randomDrop]
        )
      );
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
    // enemies.forEach((enemy, index) => {
    //   if (this.collisionDetection(enemy, projectileIndex, projectiles)) {
    //     enemy.damage(this.damage, index);
    //     // play sound when entity is hit
    //     // let explosionSound = new Audio('assets/explosion');
    //     // explosionSound.volume = .6;
    //     // explosionSound.play();
    //   }
    // });

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
let projectileIndex;
let keys = [];
let dropsArray = [];
let levelCounter;
let enemyCount;

function init() {
  animationId;
  player = new Player(x / 2 - 20, y - 100, playerImage[0], "image");
  additionalLifeScore = 5000;
  targetScore = 5000;
  enemies = [];
  right = true;
  particles = [];
  projectiles = [];
  projectileIndex = 0;
  keys = [];
  dropsArray = [];
  bonusGenerateRate = 6000;
  levelCounter = 0;
  enemyCount = 1;
  createEnemies();
}

class levelSelector {
  constructor() {
    this.nextLevel = [this.levelOne, this.levelTwo];
  }

  levelOne() {}

  levelTwo() {
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
}

function nextLevelTest() {
  if (enemies.length < 1) {
    console.log("level up!");
    levelSelector.nextLevel[1];
  }
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

function createEnemies() {
  let x = 100;
  let y = 100;
  for (let count = 0; count <= enemyCount; count++) {
    if (x >= canvas.width - 500) {
      y += 100;
      x = 200;
    }
    x += 200;
    enemies.push(new Enemy(x, y, enemyImage[0], count, "image"));
  }
}

// animation loop
function animate() {
  c.fillStyle = "rgba(0,0,0,1)";
  c.fillRect(0, 0, canvas.width, canvas.height);
  // setInterval((animationId = requestAnimationFrame(animate)), 1000 / 30);
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

init();
animate();
