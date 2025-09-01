import Phaser from 'phaser';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  preload() {
    // Load map + both tilesets
    this.load.tilemapTiledJSON('citymap', '/maps/city01.tmj');
    this.load.image('CityMap', '/tilesets/CityMap.png');   // your main tileset
    this.load.image('Sample', '/tilesets/Sample.png');     // extra tileset you pasted buildings from
  }

  create() {
    // --- map ---
    const map = this.make.tilemap({ key: 'citymap' });

    // --- tilesets ---
    const cityTileset = map.addTilesetImage('CityMap', 'CityMap');
    const sampleTileset = map.addTilesetImage('Sample', 'Sample');

    // include both so Tiled can resolve everything
    const tilesets = [cityTileset, sampleTileset];

    // --- layers (names must match exactly from Tiled!) ---
    const ground = map.createLayer('Ground', tilesets, 0, 0);
    const walls = map.createLayer('Wall', tilesets, 0, 0);

    // Enable collision on walls (make sure "Walls" layer in Tiled has collidable tiles)
    walls.setCollisionByExclusion([-1]);

    // --- player (blue dot) ---
    this.player = this.add.circle(100, 100, 8, 0x0000ff);
    this.physics.add.existing(this.player);
    this.player.body.setCollideWorldBounds(true);

    // collide player with walls
    this.physics.add.collider(this.player, walls);

    // --- camera follow ---
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);

    this.cameras.main.setZoom(1.5);


    // --- input ---
    this.cursors = this.input.keyboard.createCursorKeys();
  }

  update() {
    const speed = 100;
    const body = this.player.body;

    body.setVelocity(0);

    if (this.cursors.left.isDown) {
      body.setVelocityX(-speed);
    } else if (this.cursors.right.isDown) {
      body.setVelocityX(speed);
    }

    if (this.cursors.up.isDown) {
      body.setVelocityY(-speed);
    } else if (this.cursors.down.isDown) {
      body.setVelocityY(speed);
    }

    body.velocity.normalize().scale(speed);
  }
}
