import * as Phaser from "https://cdn.jsdelivr.net/npm/phaser@3.60.0/dist/phaser.esm.js";

export default class GameScene extends Phaser.Scene {
  constructor() {
    super("PocketScene");
  }

  preload() {
    // --- map + tilesets ---
    this.load.tilemapTiledJSON("pocketmap", "maps/pocket.tmj");
    this.load.image("Sample", "tilesets/Sample.png");
    this.load.image("city01", "tilesets/city01.png");

    // --- player sprite sheet ---
    this.load.spritesheet(
      "player",
      "kenney_toon-characters-1/Male adventurer/Tilesheet/character_maleAdventurer_sheet.png",
      { frameWidth: 96, frameHeight: 128 }
    );
  }

  create() {
    // --- map layers ---
    const map = this.make.tilemap({ key: "pocketmap" });
    const sampleTileset = map.addTilesetImage("Sample", "Sample");
    const cityTileset = map.addTilesetImage("city01", "city01");
    const tilesets = [cityTileset, sampleTileset];

    const ground = map.createLayer("Ground", tilesets, 0, 0);
    const walls = map.createLayer("wall", tilesets, 0, 0);
    const objects = map.createLayer("pocket", tilesets, 0, 0);
    const objects1 = map.createLayer("exit", tilesets, 0, 0);
    walls.setCollisionByExclusion([-1]);

    

    // --- input ---
    this.cursors = this.input.keyboard.createCursorKeys();
    this.player = this.physics.add.sprite(100, 100, "player", 0).setScale(0.3);
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(this.player.width * 0.6, this.player.height * 0.8);
    this.player.body.setOffset(
      this.player.width * 0.2,
      this.player.height * 0.2
    );
    this.physics.add.collider(this.player, walls);
    //this.physics.add.collider(this.player, furnitures);
    //this.physics.add.collider(this.player, props);
    // Spawn player inside library
    //this.player = this.physics.add.sprite(this.startX, this.startY, 'player');
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    this.player.setCollideWorldBounds(true);

    // --- animations ---
    this.createAnimations();
    //this.libraryDoor = this.physics.add.staticSprite(500, 200, null).setSize(50, 100);

    // Collider with door
    /*this.physics.add.overlap(this.player, this.libraryDoor, () => {
        this.scene.start("LibraryScene");
    }, null, this);*/
    const pocketlayer = map.getObjectLayer("pocket");
    if (pocketlayer) {
      pocketlayer.objects.forEach((obj) => {
        // Create invisible rectangle zone at object's coordinates
        const zone = this.add
          .zone(obj.x, obj.y, obj.width || 32, obj.height || 32)
          .setOrigin(0, 1); // Tiled Y origin is bottom-left
        this.physics.world.enable(zone);
        zone.body.setAllowGravity(false);
        zone.body.setImmovable(true);
        zone.triggered = false;

        // Overlap detection
        this.physics.add.overlap(
          this.player,
          zone,
          () => {
            if (!zone.triggered && !this.scene.isActive("SituationScene1")) {
              zone.triggered = true; // ✅ prevent retriggering
              console.log("Triggered pocket object at", obj.x, obj.y);

              // Pause library scene + launch situation
              this.scene.pause();
              this.scene.launch("SituationScene1", {
                message:
                  "While walking near the marketplace, you notice someone's pocket wallet has fallen on the ground.",
                options: [
                  {
                    text: "Pick up the wallet and return it to the person immediately",
                    traits: { empathy: 2, honesty: 3 },
                  },
                  {
                    text: "Pick it up but keep the money, then return only the empty wallet",
                    traits: { selfishness: 3, dishonesty: 2 },
                  },
                  {
                    text: "Ignore the wallet and walk away",
                    traits: { fear: 1, responsibility: -1 },
                  },
                  {
                    text: "Give it to a nearby guard or authority figure",
                    traits: { responsibility: 3, courage: 1 },
                  },
                ],
              });
            }
          },
          null,
          this
        );
      });
    } else {
      console.warn("Object layer 'login' not found in map!");
    }
    const exitlayer = map.getObjectLayer("exit");
    if (exitlayer) {
      exitlayer.objects.forEach((obj) => {
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
        // Create invisible rectangle zone at object's coordinates
        const zone = this.add
          .zone(obj.x, obj.y, obj.width || 32, obj.height || 32)
          .setOrigin(0, 1); // Tiled Y origin is bottom-left
        this.physics.world.enable(zone);
        zone.body.setAllowGravity(false);
        zone.body.setImmovable(true);
        zone.triggered = false;
        // Overlap detection
        this.physics.add.overlap(
          this.player,
          zone,
          () => {
            if (!zone.triggered) {
              zone.triggered = true; // ✅ prevent retriggering
              console.log("Triggered exit object at", obj.x, obj.y);

              // Pause library scene + launch situation
              this.scene.pause();
              this.scene.start("GameScene");
            }
          },
          null,
          this
        );
      });
    }
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
