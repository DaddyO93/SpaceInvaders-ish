export function controller() {
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

    if (player.fireRate < 10) {
      player.fireRate = 10;
    }
    if (fireTimer > player.fireRate) {
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
