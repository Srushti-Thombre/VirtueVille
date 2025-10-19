import * as Phaser from "https://cdn.jsdelivr.net/npm/phaser@3.60.0/dist/phaser.esm.js";
import { VirtueSystem } from "../state/VirtueSystem.js";
import { minimapNodes } from "../ui/minimapConfig.js"; // This import is required!
import { isTaskCompleted } from "../state/traits.js";

export default class GameScene extends Phaser.Scene {
  constructor() {
    super("GameScene");
    this.parkingSceneTriggered = false;
    this.wasMoving = false; // Add a flag to track movement state
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

    // --- NPC sprite sheets ---
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
    this.load.audio("bgMusic", "audio/Intro Theme.mp3");
  }

  create() {
    this.cameras.main.setZoom(1.5);
    VirtueSystem.initScene(this);
    
    const map = this.make.tilemap({ key: "citymap" });
    const cityTileset = map.addTilesetImage("CityMap", "CityMap");
    const sampleTileset = map.addTilesetImage("Sample", "Sample");
    const tilesets = [cityTileset, sampleTileset];

    const ground = map.createLayer("Ground", tilesets, 0, 0);
    const walls = map.createLayer("Wall", tilesets, 0, 0);
    walls.setCollisionByExclusion([-1]);

    this.player = this.physics.add.sprite(100, 100, "player", 0).setScale(0.3);
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(this.player.width * 0.4, this.player.height * 0.2);
    this.player.body.setOffset(this.player.width * 0.3, this.player.height * 0.8);
    this.physics.add.collider(this.player, walls);

    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    this.cursors = this.input.keyboard.createCursorKeys();
    this.createAnimations();

    // --- door triggers ---
    //this.libraryDoor = this.physics.add.staticSprite(425, 205, null).setSize(40, 60).setVisible(false);
   // this.physics.add.overlap(this.player, this.libraryDoor, () => { this.scene.start("LibraryScene"); });
    //this.PocketDoor = this.physics.add.staticSprite(404, 294, null).setSize(40, 60).setVisible(false);
    //this.physics.add.overlap(this.player, this.PocketDoor, () => { this.scene.start("PocketScene"); });
    this.apartmentDoor = this.physics.add.staticSprite(637, 285, null).setSize(48, 32).setVisible(false);
    this.physics.add.overlap(this.player, this.apartmentDoor, () => { this.scene.start("ApartmentHallwayScene"); });
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

    // --- cafeEntrance trigger logic ---
    const cafeEntranceLayer = map.getObjectLayer("cafeEntrance");
    if (cafeEntranceLayer) {
      cafeEntranceLayer.objects.forEach((obj) => {
        console.log("cafeEntrance object (raw):", obj.x, obj.y, obj.width, obj.height); // Debug raw data
        const zoneY = obj.y + 30; // Increased offset to lower the zone further (adjust this value)
        const zone = this.add.zone(obj.x, zoneY, obj.width || 64, obj.height || 64)
          .setOrigin(0, 1) // Bottom-left origin
          .setScale(1 / this.cameras.main.zoom); // Adjust for camera zoom
        this.physics.world.enable(zone);
        zone.body.setAllowGravity(false);
        zone.body.setImmovable(true);
        zone.entered = false;
        this.physics.add.overlap(
          this.player,
          zone,
          () => {
            console.log("Player overlapping cafeEntrance at:", obj.x, zoneY); // Debug log
            if (!zone.entered) {
              zone.entered = true;
              this.scene.start("CafeScene"); // Transition to CafeScene
            }
          },
          null,
          this
        );
        // Visualize zone for debugging (remove in production)
        const debugGraphics = this.add.graphics().setAlpha(0.5);
        debugGraphics.fillStyle(0xff0000, 0.5);
        debugGraphics.fillRect(obj.x, zoneY - (obj.height || 64), obj.width || 64, obj.height || 64);
        debugGraphics.setDepth(1000);
        console.log("Zone position (bottom):", obj.x, zoneY, "Size:", obj.width || 64, obj.height || 64); // Debug final position
      });
    } else {
      console.log("cafeEntrance layer not found in citymap"); // Debug if layer is missing
    }

    const gardenEntranceLayer = map.getObjectLayer("gardenEntrance");
    if (gardenEntranceLayer) {
      gardenEntranceLayer.objects.forEach((obj) => {
        console.log("gardenEntrance object (raw):", obj.x, obj.y, obj.width, obj.height); // Debug raw data
        const zoneY = obj.y + 30; // Increased offset to lower the zone further (adjust this value)
        const zone = this.add.zone(obj.x, zoneY, obj.width || 64, obj.height || 64)
          .setOrigin(0, 1) // Bottom-left origin
          .setScale(1 / this.cameras.main.zoom); // Adjust for camera zoom
        this.physics.world.enable(zone);
        zone.body.setAllowGravity(false);
        zone.body.setImmovable(true);
        zone.entered = false;
        this.physics.add.overlap(
          this.player,
          zone,
          () => {
            console.log("Player overlapping gardenEntrance at:", obj.x, zoneY); // Debug log
            if (!zone.entered) {
              zone.entered = true;
              this.scene.start("GardenScene"); // Transition to CafeScene
            }
          },
          null,
          this
        );
        // Visualize zone for debugging (remove in production)
        const debugGraphics = this.add.graphics().setAlpha(0.5);
        debugGraphics.fillStyle(0xff0000, 0.5);
        debugGraphics.fillRect(obj.x, zoneY - (obj.height || 64), obj.width || 64, obj.height || 64);
        debugGraphics.setDepth(1000);
        console.log("Zone position (bottom):", obj.x, zoneY, "Size:", obj.width || 64, obj.height || 64); // Debug final position
      });
    } else {
      console.log("gardenEntrance layer not found in citymap"); // Debug if layer is missing
    }


    // --- PARKING LOT SCENE SETUP ---
    this.setupParkingLotScene();
    
    if (this.sound.context.state === "suspended") {
      this.input.once("pointerdown", () => {
        this.sound.context.resume();
        this.playBackgroundMusic();
      });
    } else {
      this.playBackgroundMusic();
    }
    
    this.initHtmlMinimap(map);

    // --- ✨ REMOVED the on-screen coordinate display ---
  }

  // --- PARKING LOT SCENE METHODS ---

  setupParkingLotScene() {
    const triggerX = 151;
    const triggerY = 424;
    this.parkingLotTrigger = this.physics.add.staticSprite(triggerX, triggerY, null)
      .setSize(200, 80)
      .setVisible(false);

    this.girl = this.physics.add.sprite(triggerX - 100, triggerY - 20, "girl_npc").setScale(0.3).setVisible(false);
    this.uncle = this.physics.add.sprite(triggerX - 150, triggerY - 20, "uncle_npc").setScale(0.3).setVisible(false);
    
    this.girl.body.setSize(this.girl.width * 0.4, this.girl.height * 0.2);
    this.uncle.body.setSize(this.uncle.width * 0.4, this.uncle.height * 0.2);

    this.physics.add.overlap(this.player, this.parkingLotTrigger, this.triggerParkingLotScene, null, this);
  }
  
  triggerParkingLotScene() {
    if (this.parkingSceneTriggered) return;
    this.parkingSceneTriggered = true;
    this.parkingLotTrigger.destroy();

    this.player.body.setVelocity(0);
    this.player.anims.stop();
    this.input.keyboard.enabled = false;

    this.girl.setVisible(true).anims.play("girl-run", true);
    this.uncle.setVisible(true).anims.play("uncle-run", true);
    
    const GIRL_FALL_X = 232;
    const GIRL_FALL_Y = 472;

    this.girlTween = this.tweens.add({
      targets: this.girl, x: GIRL_FALL_X, y: GIRL_FALL_Y, duration: 2500, ease: "Linear",
      onComplete: () => {
        this.girl.anims.play('girl-fall');
        this.uncle.body.setVelocity(0);
        this.uncle.anims.stop();
        this.time.delayedCall(1000, () => this.showDialogueBox());
      }
    });

    this.uncleTween = this.tweens.add({
      targets: this.uncle, x: GIRL_FALL_X - 30, y: GIRL_FALL_Y, duration: 2500, ease: "Linear",
    });
  }

  showDialogueBox() {
    const boxWidth = 400;
    const boxHeight = 180;
    const dialogX = this.cameras.main.width / 2;
    const dialogY = this.cameras.main.height / 2;
    
    const uiObjects = [];

    //const bg = this.add.rectangle(dialogX, dialogY, boxWidth, boxHeight, 0x000000, 0.8)
     // .setStrokeStyle(2, 0xffffff)
     // .setScrollFactor(0)
     // .setDepth(5000);
   // uiObjects.push(bg);

    //const mainText = this.add.text(dialogX, dialogY - 60, "What should I do?", {
    //  font: "16px monospace", fill: "#ffffff",
    //  wordWrap: { width: boxWidth - 40 }, align: "center",
   // })
  //  .setOrigin(0.5)
   // .setScrollFactor(0)
    //.setDepth(5001);
    //uiObjects.push(mainText);

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

    options.forEach((opt, i) => {
      const optionText = this.add.text(dialogX, (dialogY - 20) + i * 25, opt.text, {
        font: "14px monospace", fill: "#00ff00"})
        /*let yOffset = dialogY - 20;
        const optionTexts = [];
    options.forEach((opt, i) => {
      const optionText = this.add.text(dialogX, yOffset + i * 25, opt.text, {
        font: "14px monospace",
        fill: "#00ff00"
      })*/
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
        //this.saveChoice(opt.id);
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

  /*saveChoice(choiceId) {
    console.log("Saving choice:", choiceId);
    this.selectedChoice = choiceId;

    let points = 0;
    let reason = '';
    
    switch (choiceId) {
        case 'help':
            points = 15;
            reason = 'Called for help - showing responsibility and care';
            break;
        case 'check':
            points = 10;
            reason = 'Checked on the girl - showing empathy';
            break;
        case 'confront':
            points = 5;
            reason = 'Confronted the situation - showing courage';
            break;
        case 'nothing':
            points = -10;
            reason = 'Chose to ignore - showing indifference';
            break;
    }
    VirtueSystem.awardPoints(this, points, reason);
    console.log("Updated Virtue Points:", this.registry.get('score'));
  }*/


  endParkingLotScene() {
    this.girl.setVisible(false);
    this.uncle.setVisible(false);
    this.input.keyboard.enabled = true;

    if (this.girlTween) { try { this.girlTween.stop(); } catch (e) {} this.girlTween = null; }
    if (this.uncleTween) { try { this.uncleTween.stop(); } catch (e) {} this.uncleTween = null; }
  }

  // --- OTHER SCENE METHODS ---

  initHtmlMinimap(map) {
    this.minimapContainer = document.getElementById('minimap');
    if (!this.minimapContainer) { console.error("Minimap HTML element not found!"); return; }
    this.mapWidth = map.widthInPixels;
    this.mapHeight = map.heightInPixels;
    minimapNodes.forEach(node => {
      const dot = document.createElement('div');
      dot.style.position = 'absolute';
      dot.style.width = '10px';
      dot.style.height = '10px';
      dot.style.borderRadius = '50%';
      dot.style.backgroundColor = `#${node.color.toString(16).padStart(6, '0')}`;
      dot.style.border = '1px solid white';
      dot.style.transform = 'translate(-50%, -50%)';
      dot.style.left = `${(node.x / this.mapWidth) * 100}%`;
      dot.style.top = `${(node.y / this.mapHeight) * 100}%`;
      this.minimapContainer.appendChild(dot);
    });
    const playerDot = document.createElement('div');
    playerDot.style.position = 'absolute';
    playerDot.style.width = '8px';
    playerDot.style.height = '8px';
    playerDot.style.borderRadius = '50%';
    playerDot.style.backgroundColor = 'black';
    playerDot.style.border = '2px solid yellow';
    playerDot.style.transform = 'translate(-50%, -50%)';
    playerDot.style.zIndex = '10';
    playerDot.style.display = 'none';
    this.minimapContainer.appendChild(playerDot);
    this.playerDotElement = playerDot;
  }

  playBackgroundMusic() {
    if (!this.bgMusic) {
      this.bgMusic = this.sound.add("bgMusic", { loop: true, volume: 0.4 });
      this.bgMusic.play();
    }
  }

  createAnimations() {
    this.anims.create({ key: "walk-down", frames: this.anims.generateFrameNumbers("player", { start: 22, end: 23 }), frameRate: 8, repeat: -1 });
    this.anims.create({ key: "walk-left", frames: this.anims.generateFrameNumbers("player", { start: 16, end: 18 }), frameRate: 8, repeat: -1 });
    this.anims.create({ key: "walk-right", frames: this.anims.generateFrameNumbers("player", { start: 19, end: 21 }), frameRate: 8, repeat: -1 });
    this.anims.create({ key: "walk-up", frames: this.anims.generateFrameNumbers("player", { start: 22, end: 23 }), frameRate: 8, repeat: -1 });
    this.anims.create({ key: "girl-run", frames: this.anims.generateFrameNumbers("girl_npc", { start: 19, end: 21 }), frameRate: 10, repeat: -1 });
    this.anims.create({ key: "uncle-run", frames: this.anims.generateFrameNumbers("uncle_npc", { start: 19, end: 21 }), frameRate: 10, repeat: -1 });
    this.anims.create({ key: "girl-fall", frames: [{ key: 'girl_npc', frame: 10 }], frameRate: 10 });
  }

  update() {
    if (!this.player || !this.player.body || !this.input.keyboard.enabled) {
      if(this.player && this.player.body) this.player.anims.stop();
      return;
    }
    const speed = 100;
    const body = this.player.body;
    body.setVelocity(0);
    let moving = false;
    if (this.cursors.left.isDown) { body.setVelocityX(-speed); moving = true; } 
    else if (this.cursors.right.isDown) { body.setVelocityX(speed); moving = true; }
    if (this.cursors.up.isDown) { body.setVelocityY(-speed); moving = true; } 
    else if (this.cursors.down.isDown) { body.setVelocityY(speed); moving = true; }

    if (moving) {
      body.velocity.normalize().scale(speed);
      if (body.velocity.y > 0) this.player.anims.play("walk-down", true);
      else if (body.velocity.y < 0) this.player.anims.play("walk-up", true);
      else if (body.velocity.x > 0) this.player.anims.play("walk-right", true);
      else if (body.velocity.x < 0) this.player.anims.play("walk-left", true);
      this.wasMoving = true; // Set flag to true when player is moving
    } else {
      this.player.anims.stop();
      // --- ✨ LOG COORDINATES TO CONSOLE WHEN PLAYER STOPS ---
      if (this.wasMoving) {
        const x = Math.floor(this.player.x);
        const y = Math.floor(this.player.y);
        console.log(`Player stopped at: X: ${x}, Y: ${y}`);
        this.wasMoving = false; // Reset flag so it only logs once
      }
    }
    
    if (this.playerDotElement) {
      const playerXPercent = (this.player.x / this.mapWidth) * 100;
      const playerYPercent = (this.player.y / this.mapHeight) * 100;
      this.playerDotElement.style.left = `${playerXPercent}%`;
      this.playerDotElement.style.top = `${playerYPercent}%`;
      if (this.playerDotElement.style.display === 'none') {
        this.playerDotElement.style.display = 'block';
      }
    }

    // --- ✨ REMOVED the on-screen coordinate update logic ---
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