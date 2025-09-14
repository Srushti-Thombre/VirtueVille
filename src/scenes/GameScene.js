import Phaser from 'phaser';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  preload() {
    // --- map + tilesets ---
    this.load.tilemapTiledJSON('citymap', '/maps/city01.tmj');
    this.load.image('CityMap', '/tilesets/CityMap.png');
    this.load.image('Sample', '/tilesets/Sample.png');

    // --- player sprite sheet ---
    // Make sure this path is correct relative to your public/assets folder.
    // The path has been updated to the male adventurer sprite sheet.
    this.load.spritesheet('player', '/kenney_toon-characters-1/Male adventurer/Tilesheet/character_maleAdventurer_sheet.png', {
      frameWidth: 96,
      frameHeight: 128
    });
  }

  create() {
    // --- map ---
    const map = this.make.tilemap({ key: 'citymap' });
    const cityTileset = map.addTilesetImage('CityMap', 'CityMap');
    const sampleTileset = map.addTilesetImage('Sample', 'Sample');
    const tilesets = [cityTileset, sampleTileset];

    const ground = map.createLayer('Ground', tilesets, 0, 0);
    const walls = map.createLayer('Wall', tilesets, 0, 0);
    walls.setCollisionByExclusion([-1]);

    // --- player (sprite is now loaded!) ---
    this.player = this.physics.add.sprite(100, 100, 'player', 0);
    this.player.setCollideWorldBounds(true);
    // Scale down the player to fit the map
    this.player.setScale(0.3);

    // Adjust the physics body size and offset
    this.player.body.setSize(this.player.width * 0.4, this.player.height * 0.2);
    this.player.body.setOffset(this.player.width * 0.3, this.player.height * 0.8);
    
    this.physics.add.collider(this.player, walls);

    // --- camera ---
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);

    // --- input ---
    this.cursors = this.input.keyboard.createCursorKeys();

    // --- animations (using frames from the male adventurer sprite sheet) ---
    // Walk down animations (you wanted a run-like animation)
    this.anims.create({
      key: 'walk-down',
      frames: this.anims.generateFrameNumbers('player', { start: 22, end: 23 }),
      frameRate: 8,
      repeat: -1
    });

    // Walk left animations
    this.anims.create({
      key: 'walk-left',
      frames: this.anims.generateFrameNumbers('player', { start: 16, end: 18 }),
      frameRate: 8,
      repeat: -1
    });

    // Walk right animations
    this.anims.create({
      key: 'walk-right',
      frames: this.anims.generateFrameNumbers('player', { start: 19, end: 21 }),
      frameRate: 8,
      repeat: -1
    });

    // Walk up animations
    this.anims.create({
      key: 'walk-up',
      frames: this.anims.generateFrameNumbers('player', { start: 22, end: 23 }),
      frameRate: 8,
      repeat: -1
    });
  }

  update() {
    const speed = 100;
    const body = this.player.body;
    body.setVelocity(0);

    // --- Fixed Movement and Animation Logic ---
    let movingHorizontally = false;
    let movingVertically = false;

    if (this.cursors.left.isDown) {
      body.setVelocityX(-speed);
      movingHorizontally = true;
    } else if (this.cursors.right.isDown) {
      body.setVelocityX(speed);
      movingHorizontally = true;
    }

    if (this.cursors.up.isDown) {
      body.setVelocityY(-speed);
      movingVertically = true;
    } else if (this.cursors.down.isDown) {
      body.setVelocityY(speed);
      movingVertically = true;
    }

    if (movingHorizontally || movingVertically) {
      body.velocity.normalize().scale(speed);

      if (body.velocity.y > 0) {
        this.player.anims.play('walk-down', true);
      } else if (body.velocity.y < 0) {
        this.player.anims.play('walk-up', true);
      } else if (body.velocity.x > 0) {
        this.player.anims.play('walk-right', true);
      } else if (body.velocity.x < 0) {
        this.player.anims.play('walk-left', true);
      }
    } else {
      this.player.anims.stop();
    }
  }
}
