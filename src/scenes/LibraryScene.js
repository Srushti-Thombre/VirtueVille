import * as Phaser from "https://cdn.jsdelivr.net/npm/phaser@3.60.0/dist/phaser.esm.js";
import { traits, saveProgress, isTaskCompleted } from "../state/traits.js";

export default class LibraryScene extends Phaser.Scene {
  constructor() {
    super("LibraryScene");
  }

  preload() {
    this.load.tilemapTiledJSON("librarymap", "maps/library.tmj");
    this.load.image("LibraryMap", "tilesets/library.png");
    this.load.image("Sample1", "tilesets/libassetpack-tiled.png");
    this.load.image("dummy", "tilesets/free_overview.png");
    this.load.spritesheet(
      "player",
      "kenney_toon-characters-1/Male adventurer/Tilesheet/character_maleAdventurer_sheet.png",
      { frameWidth: 96, frameHeight: 128 }
    );
  }

  create() {
    // Example background
    //this.add.image(400, 300, "LibraryMap").setScale(1);
    //this.startX = 450; // X coordinate to spawn player inside library
    //this.startY = 300; // Y coordinate to spawn player inside library
    this.cursors = this.input.keyboard.createCursorKeys();

    // --- map layers ---
    const map = this.make.tilemap({ key: "librarymap" });
    const library = map.addTilesetImage("LibraryMap", "LibraryMap");
    const libraryTileset = map.addTilesetImage("Sample1", "Sample1");
    const sampleTileset = map.addTilesetImage("dummy", "dummy");

    const tilesets = [library, libraryTileset, sampleTileset];
    const ground = map.createLayer("Tile Layer 1", tilesets, 0, 0);
    const walls = map.createLayer("properties", tilesets, 0, 0);
    const furnitures = map.createLayer("computer", tilesets, 0, 0);
    const props = map.createLayer("login", tilesets, 0, 0);
    const exit = map.createLayer("exit", tilesets, 0, 0);
    walls.setCollisionByExclusion([-1]);
    //furnitures.setCollisionByExclusion([-1]);
    //props.setCollisionByExclusion([-1]);
    this.player = this.physics.add.sprite(14, 510, "player", 0).setScale(0.5);
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
    // --- object layer ---
    const loginLayer = map.getObjectLayer("login");

    if (loginLayer) {
      loginLayer.objects.forEach((obj) => {
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
            if (!zone.triggered && !this.scene.isActive("SituationScene")) {
              zone.triggered = true; // ✅ prevent retriggering
              console.log("Triggered login object at", obj.x, obj.y);

              // Check if library task is already completed
              if (isTaskCompleted('libraryTask')) {
                // Show message that task is already completed
                /*this.showTaskCompletedMessage("You've already handled the computer situation.");*/
                return;
              }

              // Pause library scene + launch situation
              this.scene.pause();
              this.scene.launch("SituationScene", {
                taskId: "libraryTask",
                message:
                  "In the library, you notice someone forgot to log out of their account on a public computer.",
                options: [
                  {
                    text: "Log out quietly",
                    traits: { empathy: 2, responsibility: 2 },
                  },
                  {
                    text: "Ignore and walk away",
                    traits: { fear: 1, selfishness: 1 },
                  },
                  {
                    text: "Misuse their account",
                    traits: { selfishness: 3, dishonesty: 2 },
                  },
                  {
                    text: "Inform the librarian",
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

  showTaskCompletedMessage(message) {
    // Create a temporary text display
    const messageText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY - 50, message, {
      fontSize: '20px',
      color: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 },
      align: 'center'
    }).setOrigin(0.5).setDepth(1000);

    // Auto-remove after 3 seconds
    this.time.delayedCall(3000, () => {
      if (messageText) {
        messageText.destroy();
      }
    });
  }
}
