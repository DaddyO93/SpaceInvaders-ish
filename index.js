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

  collisionDetection(otherObject, index, array, otherIndex) {
    // owners:
    //    1 = player & enemy
    //    2 = nuke blast
    //    3 = bonus drop
    //    4 - launched nuke
    const dist = Math.hypot(this.x - otherObject.x, this.y - otherObject.y);
    if (dist - otherObject.killBox - this.killBox < 1) {
      // test for drops collision
      if (this.owner == 3) {
        this.removeItem(array, index);
        return true;
      }
      // test for launched nuke collision
      else if (this.owner == 4) {
        newNukes.push(
          new Projectile(this.x, this.y, 10, "yellow", 0, 40, 2, true)
          // x, y, size, color, speed, damage, owner, isANuke
        );
        this.removeItem(array, index);
      }
      // test for nuke explosion collision
      else if (this.owner == 2) {
        let nukeExplode = new Audio("assets/nukeExplosion");
        nukeExplode.volume = 1;
        nukeExplode.play();
        otherObject.damage(this.damage, otherIndex);
      }
      // enemy/player collision
      if (this.owner == otherObject.owner) {
        this.damage(40, index); // enemy dies
        otherObject.damage(); // player looses life
      } else if (this.owner != 2) {
        this.removeItem(array, index);
        otherObject.damage(this.damage, otherIndex);
      }
    }
  }
  // remove item from array
  removeItem(itemArray, index) {
    itemArray.splice(index, 1);
  }

  nukeBlast(index) {
    this.killBox += this.sizeChange;
    if (this.killBox > 150) {
      this.killBox = 149;
      this.sizeChange *= -1;
    }
    if (this.killBox <= 10) {
      this.removeItem(newNukes, index);
    } else {
    }
  }

  now() {
    let now = new Date();
    return now.getTime();
  }

  timeTracker() {
    return (this.fireTimer = this.now() + this.pauseTimer);
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
    this.pauseTimer = 500; // higher number = slower rate of fire
    this.fireTimer = 0; // interval between firing, now + pauseTimer
    this.speed = 7; // higher = faster
    this.extraLives = 0;
    this.nukes = 0;
    this.score = 0;
    this.drops = [];
    this.usedDropsArray = [];
    this.projectiles = [];
    this.projectileSpeed = 9;
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

    if (keys["KeyS"]) {
      if (this.now() > this.fireTimer) {
        if (this.nukes > 0) {
          this.projectiles.push(
            new Projectile(
              this.x,
              this.y,
              10, //size
              "yellow",
              this.projectileSpeed,
              0, // damage
              4 // owner
            )
          );
          let nukeLaunch = new Audio("assets/nukeLaunch");
          nukeLaunch.volume = 0.6;
          nukeLaunch.play();
          this.nukes--;
          this.fireTimer = this.timeTracker();
          displayNukes(this.nukes);
        }
      }
    }

    // pause feature
    if (keys["KeyP"]) {
      cancelAnimationFrame(timeStamp);
      pause();
    }

    // player fire
    if (keys["Space"]) {
      // check for Rapid Fire and adjust fire rate if present
      if (this.now() > this.fireTimer) {
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
            6
          )
        );
        this.fireTimer = this.timeTracker();
      }
    }
  }

  damage() {
    // check for extra lives
    if (this.extraLives <= 0) {
      // play sound when end game
      let endGameSound = new Audio("assets/endGameSound");
      endGameSound.volume = 0.6;
      endGameSound.play();

      // end game if no extra lives
      cancelAnimationFrame(timeStamp);
      startModalElement.style.display = "flex";
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
        this.pauseTimer -= drop.bonusInfo.effect;

        if (this.pauseTimer <= 100) {
          this.pauseTimer = 100;
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
      // nukes
      else if (drop.bonusInfo == bonusDrops[3]) {
        this.nukes++;
        displayNukes(this.nukes);
      }
      this.removeItem(this.drops, index);
    });
    // check for time-out for used drop and remove
    this.usedDropsArray.forEach((drop, index) => {
      if (drop.bonusInfo.duration < drop.dropCounter) {
        // adjust for rapid fire
        if (drop.bonusInfo == bonusDrops[0]) {
          this.pauseTimer += drop.bonusInfo.effect;
          if (this.pauseTimer > 500) {
            this.pauseTimer = 500;
          }
          this.removeItem(this.usedDropsArray, index);
        } else if (drop.bonusInfo == bonusDrops[1]) {
          this.speed -= drop.bonusInfo.effect;
          if (this.speed < 7) {
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
    this.particleCount = 10;
    this.counter = 0; // for image changing
    this.speed = 1; // higher = faster
    this.enemyVertical = 0.15; // higher = faster dropping
    this.enemyFireRate = 996; // lower = faster firing rate
    this.changeImageSpeed = 20 + Math.random() * 3; // randomize image change speed
    this.projectileSpeed = -6; // higher = faster bullet speed
    this.projectileColor = "orange";
    this.projectileSize = 2;
    this.imageXOffset = 1.4;
    this.imageYOffset = 0.9;
    this.killBoxXOffset = 3;
    this.killBoxYOffset = 1;
    this.imageIndex = 0;
    this.right = true;
    this.projectileDamage = 1;
    this.owner = 1;
  }

  damage(projectileDamage, index) {
    // creates explosions
    for (let i = 0; i < this.particleCount / 2; i++) {
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
      for (let i = 0; i < this.particleCount * 5; i++) {
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
    this.x += this.speed;

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
    else if (this.y > canvas.height) {
      cancelAnimationFrame(timeStamp);
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
          5
        )
      );
      // play sound when enemy fires
      let enemyFire = new Audio("assets/enemyFire");
      enemyFire.volume = 0.6;
      enemyFire.play();
    }
    if (bonusDropFrequency < 2) {
      let randomDrop = Math.floor(Math.random() * bonusDrops.length);
      // Reduce frequency of extra life and Nuke drops
      if (randomDrop == 2 || randomDrop == 3) {
        if (count <= weightedDrop) {
          randomDrop = Math.floor(Math.random() * bonusDrops.length);
          count++;
        } else {
          count = 0;
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
  constructor(x, y, killBox, objectImage, speed, damage, owner, isANuke) {
    super(x, y);
    this.killBox = killBox;
    this.color = objectImage;
    this.speed = speed;
    this.damage = damage;
    this.owner = owner;
    this.sizeChange = 6;
    this.isANuke = isANuke;
  }

  damage(damage, index, array) {
    this.removeItem(array, index);
  }

  draw() {
    c.beginPath();
    c.arc(this.x, this.y, this.killBox, 0, Math.PI * 2, false);
    c.fillStyle = this.color;
    c.fill();
  }

  update(array, projectileIndex) {
    this.y -= this.speed;
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
    this.friction = 0.97; // higher is farther spray
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
    this.alpha -= 0.02;
    if (this.alpha <= 0) {
      this.removeItem(particles, index);
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
    effect: 150,
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
  {
    name: "Nuke",
    effect: 40,
    duration: 0,
    image: "assets/nuke.png",
  },
];
let bonusGenerateRate;
let particles = [];
let projectiles = [];
let keys = [];
let dropsArray = [];
let newNukes = [];
let levelCounter;
let enemyCount;
let weightedDrop;
let count;

function init() {
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
  weightedDrop = 4; // higher = less frequent
  count = 0;
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
  }, 5000);
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
    let extraLife = new Audio("assets/extraLife");
    extraLife.volume = 0.06;
    extraLife.play();
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

function displayNukes(nukes) {
  nukesOnHand.innerHTML = "";
  for (let i = 0; i < nukes; i++) {
    nukesOnHand.innerHTML +=
      "<img class = 'inline-block ml-2' style='width:25px;height:25px;' src = 'assets/nuke.png'/>";
  }
}

function pause() {
  let sayings = [
    "Get back out there, Magot!!!",
    "Don't stop now, the cows are counting on you!",
    "What? Does your little finger hurt from all that shooting?",
    "Fine, take a break, but make it snappy!",
    "Did your Mommy call you for dinner?",
    "You just letting them walk all over you?",
    "Bring... It... On...",
    "Ready yet?",
    "Let's go!",
    "Yea, that was a bit intense!",
  ];
  pauseModalElement.style.display = "flex";
  let saying = Math.floor(Math.random(0) * (sayings.length - 1));
  pauseSayings.innerHTML = "";
  pauseSayings.innerHTML += sayings[saying];
}

function displayAlternateSayings() {}

// animation loop
function animate() {
  c.fillStyle = "rgba(0,0,0,1)";
  c.fillRect(0, 0, canvas.width, canvas.height);
  timeStamp = requestAnimationFrame(animate);

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
    newNukes.forEach((nuke, nukeIndex) => {
      nuke.nukeBlast(nukeIndex);
      nuke.draw();
      nuke.collisionDetection(enemy, nukeIndex, newNukes, enemyIndex);
    });
    enemy.collisionDetection(player, enemyIndex, enemies, 0);
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
pauseModalElement.style.display = "none";

pauseModalElement.addEventListener("click", () => {
  pauseModalElement.style.display = "none";
  timeStamp = 0;
  animate();
});

// start game on clicking "start game" button
startGameButton.addEventListener("click", () => {
  startModalElement.style.display = "none";

  init();
  animate();
});
