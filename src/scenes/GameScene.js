import * as Phaser from "https://cdn.jsdelivr.net/npm/phaser@3.60.0/dist/phaser.esm.js";
import { isTaskCompleted } from "../state/traits.js";

export default class GameScene extends Phaser.Scene {
  constructor() {
    super("GameScene");
    this.parkingSceneTriggered = false; // Flag to ensure the scene runs only once
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

    // --- NPC sprite sheets (using player sprite as a placeholder) ---
    // TODO: Replace these with the actual spritesheets for the uncle and girl NPCs
    this.load.spritesheet(
      "uncle_npc",
      "kenney_toon-characters-1/Male adventurer/Tilesheet/character_maleAdventurer_sheet.png",
      { frameWidth: 96, frameHeight: 128 }
    );
    this.load.spritesheet(
      "girl_npc",
      "kenney_toon-characters-1/Female adventurer/Tilesheet/character_femaleAdventurer_sheet.png",
      { frameWidth: 96, frameHeight: 128 }
    );
  }

  create() {
    this.cameras.main.setZoom(1.5);

    // --- map layers ---
    const map = this.make.tilemap({ key: "citymap" });
    const cityTileset = map.addTilesetImage("CityMap", "CityMap");
    const sampleTileset = map.addTilesetImage("Sample", "Sample");
    const tilesets = [cityTileset, sampleTileset];

    const ground = map.createLayer("Ground", tilesets, 0, 0);
    const walls = map.createLayer("Wall", tilesets, 0, 0);
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

    // --- existing doors (Library + Pocket) ---
    this.libraryDoor = this.physics.add
      .staticSprite(425, 205, null)
      .setSize(40, 60)
      .setVisible(false);
    this.physics.add.overlap(this.player, this.libraryDoor, () => {
      this.scene.start("LibraryScene");
    });

    this.PocketDoor = this.physics.add
      .staticSprite(404, 294, null) // position = door location
      .setSize(40, 60) // size of the invisible door
      .setVisible(false); // keep hidden
    // overlap check → switch to PocketScene only if task not completed
    this.physics.add.overlap(this.player, this.PocketDoor, () => {
      if (!isTaskCompleted('pocketTask')) {
        this.scene.start("PocketScene");
      } else {
        // Show message that task is already completed
        //this.showTaskCompletedMessage("You've already helped with the wallet situation.");
      }
    });

    // --- ApartmentHallway door trigger ---
    this.apartmentDoor = this.physics.add
      .staticSprite(637, 285, null) // updated coordinates
      .setSize(48, 32)
      .setVisible(false);

    this.physics.add.overlap(this.player, this.apartmentDoor, () => {
      this.scene.start("ApartmentHallwayScene");
    });

    // --- PARKING LOT SCENE SETUP ---
    this.setupParkingLotScene();
  }

  createAnimations() {
    // Player animations
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

    // NPC animations (reusing player frames)
    this.anims.create({
        key: "girl-run",
        frames: this.anims.generateFrameNumbers("girl_npc", { start: 19, end: 21 }),
        frameRate: 10,
        repeat: -1,
    });
    this.anims.create({
        key: "uncle-run",
        frames: this.anims.generateFrameNumbers("uncle_npc", { start: 19, end: 21 }),
        frameRate: 10,
        repeat: -1,
    });
    this.anims.create({
        key: "girl-fall",
        frames: [{ key: 'girl_npc', frame: 10 }], // Using a single frame for fallen state
        frameRate: 10,
    });
  }

  setupParkingLotScene() {
    // 1. Create the invisible trigger zone for the scene
    // TODO: Adjust the X and Y coordinates to place this in your map's parking lot
    const triggerX = 151;
    const triggerY = 424;
    this.parkingLotTrigger = this.physics.add
      .staticSprite(triggerX, triggerY, null)
      .setSize(200, 80) // The size of the trigger area
      .setVisible(false);

    // 2. Create the NPCs, initially invisible
    this.girl = this.physics.add.sprite(triggerX - 100, triggerY - 20, "girl_npc").setScale(0.3).setVisible(false);
    this.uncle = this.physics.add.sprite(triggerX - 150, triggerY - 20, "uncle_npc").setScale(0.3).setVisible(false);
    
    // Set smaller physics bodies for NPCs
    this.girl.body.setSize(this.girl.width * 0.4, this.girl.height * 0.2);
    this.uncle.body.setSize(this.uncle.width * 0.4, this.uncle.height * 0.2);

    // 3. Set up the overlap event
    this.physics.add.overlap( this.player, this.parkingLotTrigger, this.triggerParkingLotScene, null, this );
  }
  
  triggerParkingLotScene() {
    // Prevent the scene from running more than once
    if (this.parkingSceneTriggered) {
      return;
    }
    this.parkingSceneTriggered = true;
    this.parkingLotTrigger.body.enable = false; // Disable trigger after use

    // --- Start Cutscene ---
    // 1. Disable player controls
    this.player.body.setVelocity(0);
    this.player.anims.stop();
    this.input.keyboard.enabled = false;

    // 2. Make NPCs and Car visible and start animations
    this.girl.setVisible(true);
    this.uncle.setVisible(true);

    this.girl.anims.play("girl-run", true);
    this.uncle.anims.play("uncle-run", true);
    
    // --- DESTINATION COORDINATES ---
   
    const GIRL_FALL_X = 232;
    const GIRL_FALL_Y = 472;

    // Animate girl running to a specific point
    this.girlTween = this.tweens.add({
      targets: this.girl,
      x: GIRL_FALL_X,
      y: GIRL_FALL_Y,
      duration: 2500, // Adjust duration as needed
      ease: "Linear",
      onComplete: () => {
        // This runs when the girl reaches her destination
        this.girl.anims.play('girl-fall');
        this.uncle.anims.stop(); // Stop the uncle's running animation
        this.uncle.body.setVelocity(0); // Stop his physics movement

        // After a short delay, show the dialogue box
        this.time.delayedCall(1000, () => {
            this.showDialogueBox();
        });
      }
    });

    // Animate uncle chasing and stopping behind her
    this.uncleTween = this.tweens.add({
      targets: this.uncle,
      x: GIRL_FALL_X - 30, // Stops 30 pixels behind the girl
      y: GIRL_FALL_Y,
      duration: 2500,
      ease: "Linear",
    });
  }

showDialogueBox() {
  const boxWidth = 400;
  const boxHeight = 180;
  const dialogX = this.cameras.main.width / 2;
  const dialogY = this.cameras.main.height / 2;
  const dialogueContainer = this.add.container(0, 0).setDepth(1000).setScrollFactor(0);

  // Enable input globally
  this.input.enabled = true;

  // Create background graphics
  const bg = this.add.rectangle(dialogX, dialogY, boxWidth, boxHeight, 0x000000, 0.8)
    .setStrokeStyle(2, 0xffffff)
    .setScrollFactor(0)
    .setDepth(1000); // ensure on top

  const mainText = this.add.text(dialogX, dialogY - 60, "What should I do?", {
    font: "16px monospace",
    fill: "#ffffff",
    wordWrap: { width: boxWidth - 40 },
    align: "center",
  })
  .setOrigin(0.5)
  .setScrollFactor(0)
  .setDepth(1001);

  // Options
  const options = [
    { text: "Call for help.", id: "help" },
    { text: "Check on the girl.", id: "check" },
    { text: "Confront the man.", id: "confront" },
    { text: "Do nothing.", id: "nothing" }
  ];

  let yOffset = dialogY - 20;
const optionTexts = [];
  options.forEach((opt, i) => {
    const optionText = this.add.text(dialogX, yOffset + i * 25, opt.text, {
      font: "14px monospace",
      fill: "#00ff00"
    })
    .setOrigin(0.5)
    .setScrollFactor(0)
    .setInteractive({ useHandCursor: true })
    .setDepth(1002);

    // hover effects
    optionText.on('pointerover', () => optionText.setStyle({ fill: '#ffff00' }));
    optionText.on('pointerout', () => optionText.setStyle({ fill: '#00ff00' }));

    // click event
    optionText.on('pointerdown', () => {
      console.log(`Option selected: ${opt.text}`);
      this.saveChoice(opt.id);
      bg.destroy();
      mainText.destroy();
      options.forEach(() => optionText.destroy());
       dialogueContainer.destroy();
      this.endParkingLotScene();
    });
  });

  // Bring everything to top
  this.children.bringToTop(bg);
  this.children.bringToTop(mainText);
}

saveChoice(choiceId) {
    console.log("Saving choice:", choiceId);

  this.selectedChoice = choiceId;
}

  endParkingLotScene() {
    // Hide the NPCs and car
    this.girl.setVisible(false);
    this.uncle.setVisible(false);

    // Re-enable player controls
    this.input.keyboard.enabled = true;
  }

  update() {
    if (!this.player || !this.player.body || !this.input.keyboard.enabled) {
        // If player doesn't exist or controls are disabled, do nothing
        return;
    }
    
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

