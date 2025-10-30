import * as Phaser from "https://cdn.jsdelivr.net/npm/phaser@3.60.0/dist/phaser.esm.js";
import { traits, saveProgress, isTaskCompleted } from "../state/traits.js";
import { VirtueSystem } from "../state/VirtueSystem.js";

export default class LibraryScene extends Phaser.Scene {
  constructor() {
    super("LibraryScene");
  }

  preload() {
    this.load.tilemapTiledJSON("librarymap", "maps/library.tmj");
    this.load.image("LibraryMap", "tilesets/library.png");
    this.load.image("Sample1", "tilesets/libassetpack-tiled.png");
    this.load.image("dummy", "tilesets/free_overview.png");

    // Load all character spritesheets
    this.load.spritesheet(
      "maleAdventurer",
      "kenney_toon-characters-1/Male adventurer/Tilesheet/character_maleAdventurer_sheet.png",
      { frameWidth: 96, frameHeight: 128 }
    );
    this.load.spritesheet(
      "femaleAdventurer",
      "kenney_toon-characters-1/Female adventurer/Tilesheet/character_femaleAdventurer_sheet.png",
      { frameWidth: 96, frameHeight: 128 }
    );
    this.load.spritesheet(
      "malePerson",
      "kenney_toon-characters-1/Male person/Tilesheet/character_malePerson_sheet.png",
      { frameWidth: 96, frameHeight: 128 }
    );
    this.load.spritesheet(
      "femalePerson",
      "kenney_toon-characters-1/Female person/Tilesheet/character_femalePerson_sheet.png",
      { frameWidth: 96, frameHeight: 128 }
    );
  }

  create() {
    // Initialize virtue points system
    VirtueSystem.initScene(this);

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

    // Get selected character
    const playerCharacter =
      this.registry.get("playerCharacter") ||
      localStorage.getItem("selectedCharacter") ||
      "maleAdventurer";

    this.player = this.physics.add
      .sprite(14, 510, playerCharacter, 0)
      .setScale(0.5);
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

    // Create animations for the selected character
    this.createAnimations();

    // Enhanced camera follow
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);
    this.cameras.main.setRoundPixels(false);
    this.player.setCollideWorldBounds(true);

    // Ensure UIScene1 is running for HUD buttons
    if (!this.scene.isActive("UIScene1")) {
      this.scene.launch("UIScene1");
    }

    // Provide minimap bounds so the MinimapScene can map world coordinates
    try {
      this.registry.set("minimapBounds", {
        worldWidth: map.widthInPixels,
        worldHeight: map.heightInPixels,
      });
    } catch (e) {
      console.warn("Unable to set minimapBounds in LibraryScene:", e);
    }
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
              if (isTaskCompleted("libraryTask")) {
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
                    points: 10,
                    reason: "Being responsible and protecting someone's privacy",
                    traits: { responsibility: 2, empathy: 1 },
                  },
                  {
                    text: "Ignore and walk away",
                    points: -5,
                    reason: "Ignoring potential security risks",
                    traits: { responsibility: -2, selfishness: 1 },
                  },
                  {
                    text: "Misuse their account",
                    points: -15,
                    reason: "Deliberately violating someone's privacy",
                    traits: { dishonesty: 3, selfishness: 2, responsibility: -3 },
                  },
                  {
                    text: "Inform the librarian",
                    points: 15,
                    reason: "Taking responsible action to protect someone's account",
                    traits: { responsibility: 3, courage: 1, empathy: 1 },
                  },
                ],
              });

              // Bring SituationScene to top after a small delay to ensure it's created
              this.time.delayedCall(100, () => {
                this.scene.bringToTop("SituationScene");
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
    // Get the selected character
    const playerCharacter =
      this.registry.get("playerCharacter") ||
      localStorage.getItem("selectedCharacter") ||
      "maleAdventurer";

    // Destroy existing animations if they exist
    if (this.anims.exists("walk-down")) this.anims.remove("walk-down");
    if (this.anims.exists("walk-left")) this.anims.remove("walk-left");
    if (this.anims.exists("walk-right")) this.anims.remove("walk-right");
    if (this.anims.exists("walk-up")) this.anims.remove("walk-up");

    this.anims.create({
      key: "walk-down",
      frames: this.anims.generateFrameNumbers(playerCharacter, {
        start: 22,
        end: 23,
      }),
      frameRate: 8,
      repeat: -1,
    });
    this.anims.create({
      key: "walk-left",
      frames: this.anims.generateFrameNumbers(playerCharacter, {
        start: 16,
        end: 18,
      }),
      frameRate: 8,
      repeat: -1,
    });
    this.anims.create({
      key: "walk-right",
      frames: this.anims.generateFrameNumbers(playerCharacter, {
        start: 19,
        end: 21,
      }),
      frameRate: 8,
      repeat: -1,
    });
    this.anims.create({
      key: "walk-up",
      frames: this.anims.generateFrameNumbers(playerCharacter, {
        start: 22,
        end: 23,
      }),
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
    // update player position for the minimap
    try {
      this.registry.set("playerPos", { x: this.player.x, y: this.player.y });
    } catch (e) {}
  }

  showTaskCompletedMessage(message) {
    // Create a temporary text display
    const messageText = this.add
      .text(
        this.cameras.main.centerX,
        this.cameras.main.centerY - 50,
        message,
        {
          fontSize: "20px",
          color: "#ffff00",
          backgroundColor: "#000000",
          padding: { x: 20, y: 10 },
          align: "center",
        }
      )
      .setOrigin(0.5)
      .setDepth(1000);

    // Auto-remove after 3 seconds
    this.time.delayedCall(3000, () => {
      if (messageText) {
        messageText.destroy();
      }
    });
  }
}
