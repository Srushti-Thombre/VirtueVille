import * as Phaser from "https://cdn.jsdelivr.net/npm/phaser@3.60.0/dist/phaser.esm.js";

export default class GameScene extends Phaser.Scene {
  constructor() {
    super("GameScene");
  }

  preload() {
    // --- map + tilesets ---
    this.load.tilemapTiledJSON("citymap", "maps/city01.tmj");
    this.load.image("CityMap", "tilesets/CityMap.png");
    this.load.image("Sample", "tilesets/Sample.png");

    // --- player sprite sheet ---
    this.load.spritesheet(
      "player",
      "kenney_toon-characters-1/Male adventurer/Tilesheet/character_maleAdventurer_sheet.png",
      { frameWidth: 96, frameHeight: 128 }
    );
  }

  create() {
    // --- map layers ---
    const map = this.make.tilemap({ key: "citymap" });
    const cityTileset = map.addTilesetImage("CityMap", "CityMap");
    const sampleTileset = map.addTilesetImage("Sample", "Sample");
    const tilesets = [cityTileset, sampleTileset];

    const ground = map.createLayer("Ground", tilesets, 0, 0);
    const walls = map.createLayer("Wall", tilesets, 0, 0);
    const library = map.createLayer("library", tilesets, 0, 0);
    const bus_stop = map.createLayer("bus_stop", tilesets, 0, 0);
    walls.setCollisionByExclusion([-1]);

    // --- player ---
    this.player = this.physics.add.sprite(100, 100, "player", 0).setScale(0.3);
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(this.player.width * 0.4, this.player.height * 0.2);
    this.player.body.setOffset(
      this.player.width * 0.3,
      this.player.height * 0.8
    );
    this.physics.add.collider(this.player, walls);

    // --- camera ---
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);

    // --- input ---
    this.cursors = this.input.keyboard.createCursorKeys();

    // --- animations ---
    this.createAnimations();
    
    const librarylayer = map.getObjectLayer("library");
    const bus_stoplayer = map.getObjectLayer("bus_stop");
    if (librarylayer) {
      librarylayer.objects.forEach((obj) => {
        if (obj.text) {
          this.add
            .text(obj.x, obj.y, obj.text.text, {
              fontSize: `${obj.text.pixelsize || 16}px`, // fallback if not defined
              color: obj.text.color || "#ffffff",
              fontFamily: obj.text.fontfamily || "Arial",
              wordWrap: { width: obj.width },
            })
            .setOrigin(0, 0); // match Tiled's bottom-left origin
        }
      });
    }
    if (bus_stoplayer) {
      bus_stoplayer.objects.forEach((obj) => {
        if (obj.text) {
          this.add
            .text(obj.x, obj.y, obj.text.text, {
              fontSize: `${obj.text.pixelsize || 16}px`, // fallback if not defined
              color: obj.text.color || "#ffffff",
              fontFamily: obj.text.fontfamily || "Arial",
              wordWrap: { width: obj.width },
            })
            .setOrigin(0, 0); // match Tiled's bottom-left origin
        }
      });
    }

    this.libraryDoor = this.physics.add
      .staticSprite(425, 205, null) // position = door location
      .setSize(40, 60) // size of the invisible door
      .setVisible(false); // keep hidden

    // overlap check → switch to LibraryScene
    this.physics.add.overlap(this.player, this.libraryDoor, () => {
      this.scene.start("LibraryScene");
    });
    this.PocketDoor = this.physics.add
      .staticSprite(404, 294, null) // position = door location
      .setSize(40, 60) // size of the invisible door
      .setVisible(false); // keep hidden
    // overlap check → switch to PocketScene
    this.physics.add.overlap(this.player, this.PocketDoor, () => {
      this.scene.start("PocketScene");
    });
  }

  createAnimations() {
    this.anims.create({
      key: "walk-down",
      frames: this.anims.generateFrameNumbers("player", { start: 22, end: 23 }),
      frameRate: 8,
      repeat: -1,
    });
    this.anims.create({
      key: "walk-left",
      frames: this.anims.generateFrameNumbers("player", { start: 16, end: 18 }),
      frameRate: 8,
      repeat: -1,
    });
    this.anims.create({
      key: "walk-right",
      frames: this.anims.generateFrameNumbers("player", { start: 19, end: 21 }),
      frameRate: 8,
      repeat: -1,
    });
    this.anims.create({
      key: "walk-up",
      frames: this.anims.generateFrameNumbers("player", { start: 22, end: 23 }),
      frameRate: 8,
      repeat: -1,
    });
  }

  update() {
    //console.log(`Player position → X: ${Math.round(this.player.x)}, Y: ${Math.round(this.player.y)}`)
    if (!this.player || !this.player.body) return;
    const speed = 100;
    const body = this.player.body;
    body.setVelocity(0);

    let moving = false;

    if (this.cursors.left.isDown) {
      body.setVelocityX(-speed);
      moving = true;
    } else if (this.cursors.right.isDown) {
      body.setVelocityX(speed);
      moving = true;
    }

    if (this.cursors.up.isDown) {
      body.setVelocityY(-speed);
      moving = true;
    } else if (this.cursors.down.isDown) {
      body.setVelocityY(speed);
      moving = true;
    }

    if (moving) {
      body.velocity.normalize().scale(speed);

      if (body.velocity.y > 0) this.player.anims.play("walk-down", true);
      else if (body.velocity.y < 0) this.player.anims.play("walk-up", true);
      else if (body.velocity.x > 0) this.player.anims.play("walk-right", true);
      else if (body.velocity.x < 0) this.player.anims.play("walk-left", true);
    } else {
      this.player.anims.stop();
    }
  }
}
