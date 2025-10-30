import * as Phaser from "https://cdn.jsdelivr.net/npm/phaser@3.60.0/dist/phaser.esm.js";
import { isTaskCompleted, markTaskCompleted, saveProgress } from "../state/traits.js";

class ApartmentHallwayScene extends Phaser.Scene {
  constructor() {
    super({ key: "ApartmentHallwayScene" });
  }

  preload() {
    this.load.tilemapTiledJSON("hallwayMap", "maps/hallway1.tmj");
    this.load.image("hallwayTiles", "tilesets/CityMap.png");

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
    this.load.spritesheet(
      "neighbor",
      "kenney_toon-characters-1/Male person/Tilesheet/character_malePerson_sheet.png",
      { frameWidth: 96, frameHeight: 128 }
    );
  }

  create() {
    console.log("ApartmentHallwayScene: create() started");

    // --- Load Map ---
    const map = this.make.tilemap({ key: "hallwayMap" });
    if (!map) {
      console.error("Map not loaded! Check 'hallwayMap' key and file path.");
      return;
    }

    console.log("Layers in map:", map.layers.map(l => l.name));

    // --- Tileset ---
    const tileset = map.addTilesetImage("CityMap", "hallwayTiles");
    if (!tileset) {
      console.error("Tileset 'CityMap' not found! Check name in Tiled.");
      return;
    }

    // --- Create Layers (Floors first, Walls second) ---
    const floorLayer = map.createLayer("Floors", tileset, 0, 0);
    if (!floorLayer) {
      console.error("Layer 'Floors' not found! Check layer name in Tiled.");
      return;
    }

    const wallLayer = map.createLayer("Walls", tileset, 0, 0);
    if (!wallLayer) {
      console.error("Layer 'Walls' not found! Check layer name in Tiled.");
      return;
    }

    // --- ENABLE COLLISION ON WALLS ---
    wallLayer.setCollisionByProperty({ collides: true });

    // --- DEBUG: Show colliding tiles in RED ---
    const debugGraphics = this.add.graphics();
    wallLayer.renderDebug(debugGraphics, {
      tileColor: null,
      collidingTileColor: new Phaser.Display.Color(255, 0, 0, 180),
      faceColor: new Phaser.Display.Color(0, 255, 0, 180)
    });

    // --- Player ---
    const playerCharacter = this.registry.get("playerCharacter") || localStorage.getItem("selectedCharacter") || "maleAdventurer";
    this.player = this.physics.add.sprite(256, 240, playerCharacter).setScale(0.3);

    // --- Neighbor ---
    this.neighbor = this.physics.add.sprite(320, 112, "neighbor").setScale(0.3);
    this.neighbor.body.setImmovable(true);

    // --- COLLIDERS ---
    this.physics.add.collider(this.player, wallLayer);
    this.physics.add.collider(this.player, this.neighbor);

    // --- Camera ---
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);
    this.cameras.main.setZoom(2);
    this.cameras.main.setRoundPixels(false);

    // --- UI Scene ---
    if (!this.scene.isActive("UIScene1")) {
      this.scene.launch("UIScene1");
    }

    // --- Dialogue Setup ---
    this.neighbor.dialogueState = "IDLE";
    this.helpText = this.add.text(0, 0, "Hello, could you help me please! Press Y to help.", {
      fontSize: "10px",
      fill: "#000000",
      padding: { x: 5, y: 3 },
      wordWrap: { width: 100 }
    }).setOrigin(0).setDepth(1);

    this.dialogueBox = this.add.graphics().setDepth(0);
    this.problemText = this.add.text(this.scale.width / 2, this.scale.height / 2, "", {
      fontSize: "14px",
      fill: "#fff",
      backgroundColor: "#000000c0",
      padding: { x: 10, y: 8 },
      wordWrap: { width: 250 },
      align: "center"
    }).setOrigin(0.5).setScrollFactor(0).setDepth(999).setVisible(false);

    // --- Animations & Input ---
    this.createAnimations();
    this.cursors = this.input.keyboard.createCursorKeys();
    this.interactKey = this.input.keyboard.addKey("Y");

    // --- EXIT ZONE ---
    const exitZone = this.add.zone(240, 32, 32, 32).setOrigin(0, 0);
    this.physics.world.enable(exitZone);
    exitZone.body.setAllowGravity(false);
    exitZone.body.setImmovable(true);
    exitZone.triggered = false;

    const debugRect = this.add.graphics();
    debugRect.lineStyle(2, 0xff0000, 1);
    debugRect.strokeRect(exitZone.x, exitZone.y, exitZone.width, exitZone.height);

    this.physics.add.overlap(this.player, exitZone, () => {
      if (!exitZone.triggered) {
        exitZone.triggered = true;
        console.log("Exit zone triggered!");
        markTaskCompleted("ApartmentHallwayScene");
        saveProgress();
        const gameScene = this.scene.get("GameScene");
        if (gameScene?.updateMinimapDotColor) {
          gameScene.updateMinimapDotColor("ApartmentHallwayScene");
        }
        this.scene.start("GameScene");
      }
    });
  }

  createAnimations() {
    const playerCharacter = this.registry.get("playerCharacter") || localStorage.getItem("selectedCharacter") || "maleAdventurer";

    if (this.anims.exists("left")) this.anims.remove("left");
    if (this.anims.exists("turn")) this.anims.remove("turn");
    if (this.anims.exists("right")) this.anims.remove("right");

    this.anims.create({
      key: "left",
      frames: this.anims.generateFrameNumbers(playerCharacter, { start: 4, end: 5 }),
      frameRate: 10,
      repeat: -1
    });
    this.anims.create({
      key: "turn",
      frames: [{ key: playerCharacter, frame: 0 }],
      frameRate: 20
    });
    this.anims.create({
      key: "right",
      frames: this.anims.generateFrameNumbers(playerCharacter, { start: 2, end: 3 }),
      frameRate: 10,
      repeat: -1
    });
  }

  update() {
    this.handlePlayerMovement();
    this.handleDialogue();
  }

  handlePlayerMovement() {
    const speed = 160;
    let vx = 0, vy = 0;

    if (this.cursors.left.isDown) vx = -speed;
    else if (this.cursors.right.isDown) vx = speed;
    if (this.cursors.up.isDown) vy = -speed;
    else if (this.cursors.down.isDown) vy = speed;

    this.player.setVelocity(vx, vy);

    if (vx !== 0) {
      this.player.anims.play(vx < 0 ? "left" : "right", true);
    } else {
      this.player.anims.play("turn");
    }
  }

  handleDialogue() {
    const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.neighbor.x, this.neighbor.y);
    const isClose = dist < 80;
    const idle = this.neighbor.dialogueState === "IDLE";

    this.helpText.setVisible(idle && isClose);
    this.dialogueBox.setVisible(idle && isClose);
    if (idle && isClose) this.drawDialogueBox();

    if (Phaser.Input.Keyboard.JustDown(this.interactKey) && isClose && idle) {
      this.startDialogue();
    }
  }

  startDialogue() {
    if (isTaskCompleted("apartmentTask")) {
      this.neighbor.dialogueState = "PROMPTED";
      this.helpText.setVisible(false);
      this.dialogueBox.setVisible(false);
      this.problemText.setText("Thank you so much for helping me find my key earlier! You're a lifesaver!").setVisible(true);
      this.time.delayedCall(3000, () => {
        this.problemText.setVisible(false);
        this.neighbor.dialogueState = "IDLE";
      });
      return;
    }

    this.neighbor.dialogueState = "PROMPTED";
    this.helpText.setVisible(false);
    this.dialogueBox.setVisible(false);
    this.problemText.setText("Oh, thank you! I've lost the key to my apartment and I'm locked out. Can you help me?").setVisible(true);

    this.time.delayedCall(2500, () => {
      this.problemText.setVisible(false);
      this.neighbor.dialogueState = "BUSY";

      const dialogueScene = this.scene.get("DialogueScene");
      dialogueScene.events.once("dialogue-complete", () => {
        markTaskCompleted("apartmentTask");
      });

      this.scene.launch("DialogueScene", {
        message: "Oh, thank you! I've lost the key to my apartment and I'm locked out. Can you help me?",
        options: [
          { text: "Look under the nearby potted plant and continue helping him.", points: 10, reason: "Helping find the key", traits: { empathy: 2, responsibility: 2 } },
          { text: "Yes, you can come inside.", points: 15, reason: "Showing trust and hospitality", traits: { empathy: 3, courage: 1 } },
          { text: "No, I don't trust you.", points: -5, reason: "Being unwelcoming", traits: { fear: 2, selfishness: 1 } },
          { text: "Sorry, I can't help right now.", points: 0, reason: "Being neutral", traits: { responsibility: -1 } },
        ],
        onChoice: (choiceIndex) => {
          const points = [10, 15, -5, 0][choiceIndex] || 0;
          const currentScore = this.registry.get("score") || 0;
          this.registry.set("score", currentScore + points);
          this.scene.resume();
          this.neighbor.dialogueState = "IDLE";
        },
      });

      this.time.delayedCall(100, () => this.scene.bringToTop("DialogueScene"));
      this.scene.pause();
    });
  }

  drawDialogueBox() {
    const tw = this.helpText.width, th = this.helpText.height, pad = 5, tail = 5;
    const bw = tw + pad * 2, bh = th + pad * 2;
    const x = this.neighbor.x - bw / 2;
    const y = this.neighbor.y - 15 - bh - tail;

    this.dialogueBox.clear();
    this.dialogueBox.fillStyle(0xffffff, 0.9);
    this.dialogueBox.lineStyle(2, 0x000000, 1);
    this.dialogueBox.fillRoundedRect(0, 0, bw, bh, 5);
    this.dialogueBox.strokeRoundedRect(0, 0, bw, bh, 5);

    const cx = bw / 2;
    this.dialogueBox.beginPath();
    this.dialogueBox.moveTo(cx - 10, bh);
    this.dialogueBox.lineTo(cx, bh + tail);
    this.dialogueBox.lineTo(cx + 10, bh);
    this.dialogueBox.closePath();
    this.dialogueBox.fillPath();
    this.dialogueBox.strokePath();

    this.dialogueBox.setPosition(x, y);
    this.helpText.setPosition(x + pad, y + pad);
  }
}

export default ApartmentHallwayScene;