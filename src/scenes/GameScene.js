import * as Phaser from "https://cdn.jsdelivr.net/npm/phaser@3.60.0/dist/phaser.esm.js";
import { VirtueSystem } from "../state/VirtueSystem.js";
import { minimapNodes } from "../ui/minimapConfig.js"; // This import is required!
import {
  isTaskCompleted,
  markTaskCompleted,
  traits,
  saveProgress,
} from "../state/traits.js";
import { DilemmaStyles } from "../utils/dilemmaStyles.js";

export default class GameScene extends Phaser.Scene {
  constructor() {
    super("GameScene");
    this.parkingSceneTriggered = false;
    this.wasMoving = false; // Add a flag to track movement state
    this.inParkingLotScene = false; // Flag to prevent player movement during parking lot scene
    this.lockedPlayerPosition = null; // Store player position during parking lot scene
  }

  preload() {
    // --- map + tilesets ---
    this.load.tilemapTiledJSON("citymap", "maps/city01.tmj");
    this.load.image("CityMap", "tilesets/CityMap.png");
    this.load.image("Sample", "tilesets/Sample.png");

    // Load all 4 character options
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

    // Keep player for backward compatibility
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
    VirtueSystem.initScene(this);

    const map = this.make.tilemap({ key: "citymap" });
    const cityTileset = map.addTilesetImage("CityMap", "CityMap");
    const sampleTileset = map.addTilesetImage("Sample", "Sample");
    const tilesets = [cityTileset, sampleTileset];

    const ground = map.createLayer("Ground", tilesets, 0, 0);
    const walls = map.createLayer("Wall", tilesets, 0, 0);
    walls.setCollisionByExclusion([-1]);

    // Get selected character from registry or localStorage
    let playerCharacter = this.registry.get("playerCharacter");
    if (!playerCharacter) {
      playerCharacter =
        localStorage.getItem("selectedCharacter") || "maleAdventurer";
      this.registry.set("playerCharacter", playerCharacter);
    }
    console.log("✅ Using character:", playerCharacter);

    // Create player with selected character
    this.player = this.physics.add
      .sprite(100, 100, playerCharacter, 0)
      .setScale(0.3);
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(this.player.width * 0.4, this.player.height * 0.2);
    this.player.body.setOffset(
      this.player.width * 0.3,
      this.player.height * 0.8
    );

    this.physics.add.collider(this.player, walls);

    // Setup camera to fill screen and follow player
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);
    this.cameras.main.setZoom(1.8); // Balanced zoom - character visible, good screen coverage
    this.cameras.main.setRoundPixels(false);

    this.cursors = this.input.keyboard.createCursorKeys();
    this.createAnimations();

    // --- door triggers ---
    //this.libraryDoor = this.physics.add.staticSprite(425, 205, null).setSize(40, 60).setVisible(false);
    // this.physics.add.overlap(this.player, this.libraryDoor, () => { this.scene.start("LibraryScene"); });
    //this.PocketDoor = this.physics.add.staticSprite(404, 294, null).setSize(40, 60).setVisible(false);
    //this.physics.add.overlap(this.player, this.PocketDoor, () => { this.scene.start("PocketScene"); });
    this.apartmentDoor = this.physics.add
      .staticSprite(637, 285, null)
      .setSize(48, 32)
      .setVisible(false);
    this.physics.add.overlap(this.player, this.apartmentDoor, () => {
      this.scene.start("ApartmentHallwayScene");
    });
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
      if (!isTaskCompleted("pocketTask")) {
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
        console.log(
          "cafeEntrance object (raw):",
          obj.x,
          obj.y,
          obj.width,
          obj.height
        ); // Debug raw data
        const zoneY = obj.y + 30; // Increased offset to lower the zone further (adjust this value)
        const zone = this.add
          .zone(obj.x, zoneY, obj.width || 64, obj.height || 64)
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
        debugGraphics.fillRect(
          obj.x,
          zoneY - (obj.height || 64),
          obj.width || 64,
          obj.height || 64
        );
        debugGraphics.setDepth(1000);
        console.log(
          "Zone position (bottom):",
          obj.x,
          zoneY,
          "Size:",
          obj.width || 64,
          obj.height || 64
        ); // Debug final position
      });
    } else {
      console.log("cafeEntrance layer not found in citymap"); // Debug if layer is missing
    }

    const gardenEntranceLayer = map.getObjectLayer("gardenEntrance");
    if (gardenEntranceLayer) {
      gardenEntranceLayer.objects.forEach((obj) => {
        console.log(
          "gardenEntrance object (raw):",
          obj.x,
          obj.y,
          obj.width,
          obj.height
        ); // Debug raw data
        const zoneY = obj.y + 30; // Increased offset to lower the zone further (adjust this value)
        const zone = this.add
          .zone(obj.x, zoneY, obj.width || 64, obj.height || 64)
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
        debugGraphics.fillRect(
          obj.x,
          zoneY - (obj.height || 64),
          obj.width || 64,
          obj.height || 64
        );
        debugGraphics.setDepth(1000);
        console.log(
          "Zone position (bottom):",
          obj.x,
          zoneY,
          "Size:",
          obj.width || 64,
          obj.height || 64
        ); // Debug final position
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
    this.parkingLotTrigger = this.physics.add
      .staticSprite(triggerX, triggerY, null)
      .setSize(200, 80)
      .setVisible(false);

    this.girl = this.physics.add
      .sprite(triggerX - 100, triggerY - 20, "girl_npc")
      .setScale(0.3)
      .setVisible(false);
    this.uncle = this.physics.add
      .sprite(triggerX - 150, triggerY - 20, "uncle_npc")
      .setScale(0.3)
      .setVisible(false);

    this.girl.body.setSize(this.girl.width * 0.4, this.girl.height * 0.2);
    this.uncle.body.setSize(this.uncle.width * 0.4, this.uncle.height * 0.2);

    this.physics.add.overlap(
      this.player,
      this.parkingLotTrigger,
      this.triggerParkingLotScene,
      null,
      this
    );
  }

  triggerParkingLotScene() {
    if (this.parkingSceneTriggered) return;

    // Check if parking lot task is already completed
    if (isTaskCompleted("parkingLotTask")) {
      console.log("ℹ️ Parking lot task already completed");
      this.parkingLotTrigger.destroy();
      return;
    }

    this.parkingSceneTriggered = true;
    this.parkingLotTrigger.destroy();

    // Lock player position
    this.lockedPlayerPosition = { x: this.player.x, y: this.player.y };

    // Lock camera position
    this.lockedCameraScroll = {
      x: this.cameras.main.scrollX,
      y: this.cameras.main.scrollY,
    };

    // Stop player movement completely
    this.inParkingLotScene = true; // Set flag to disable movement in update()
    this.player.body.setVelocity(0, 0);
    this.player.body.setImmovable(true); // Make player immovable
    this.player.body.moves = false; // Prevent physics from moving the body
    this.player.body.setAllowGravity(false); // Disable gravity if any
    this.player.anims.stop();
    this.input.keyboard.enabled = false;

    // Stop camera from following player and lock it in place
    this.cameras.main.stopFollow();

    this.girl.setVisible(true).anims.play("girl-run", true);
    this.uncle.setVisible(true).anims.play("uncle-run", true);

    const GIRL_FALL_X = 232;
    const GIRL_FALL_Y = 472;

    // Disable camera deadzone to prevent auto-adjustment
    this.cameras.main.setDeadzone(0, 0);

    this.girlTween = this.tweens.add({
      targets: this.girl,
      x: GIRL_FALL_X,
      y: GIRL_FALL_Y,
      duration: 2500,
      ease: "Linear",
      onComplete: () => {
        this.girl.anims.play("girl-fall");
        this.uncle.body.setVelocity(0);
        this.uncle.anims.stop();
        this.time.delayedCall(1000, () => this.showDialogueBox());
      },
    });

    this.uncleTween = this.tweens.add({
      targets: this.uncle,
      x: GIRL_FALL_X - 30,
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

    const dialogueContainer = this.add
      .container(0, 0)
      .setDepth(1000)
      .setScrollFactor(0);

    // Enable input globally
    this.input.enabled = true;

    // Create background using DilemmaStyles
    const bg = this.add.graphics();
    bg.setScrollFactor(0).setDepth(1000);
    bg.fillStyle(
      DilemmaStyles.modal.backgroundColor,
      DilemmaStyles.modal.backgroundAlpha
    );
    bg.fillRoundedRect(
      dialogX - boxWidth / 2,
      dialogY - boxHeight / 2,
      boxWidth,
      boxHeight,
      DilemmaStyles.modal.borderRadius
    );
    bg.lineStyle(
      DilemmaStyles.modal.borderWidth,
      DilemmaStyles.modal.borderColor,
      1
    );
    bg.strokeRoundedRect(
      dialogX - boxWidth / 2,
      dialogY - boxHeight / 2,
      boxWidth,
      boxHeight,
      DilemmaStyles.modal.borderRadius
    );

    const mainText = this.add
      .text(dialogX, dialogY - 70, "What should I do?", {
        fontFamily: DilemmaStyles.title.fontFamily,
        fontSize: DilemmaStyles.title.fontSize,
        fontStyle: DilemmaStyles.title.fontStyle,
        color: DilemmaStyles.title.color,
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
      { text: "Do nothing.", id: "nothing" },
    ];

    // Store all option text objects in an array
    const optionTexts = [];

    options.forEach((opt, i) => {
      const optionText = this.add
        .text(dialogX, dialogY - 20 + i * 30, `${i + 1}. ${opt.text}`, {
          fontFamily: DilemmaStyles.option.fontFamily,
          fontSize: DilemmaStyles.option.fontSize,
          color: DilemmaStyles.option.color,
          backgroundColor: DilemmaStyles.option.backgroundColor,
          padding: DilemmaStyles.option.padding,
        })
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setInteractive({ useHandCursor: true })
        .setDepth(1002);

      // Add to array for later cleanup
      optionTexts.push(optionText);

      // hover effects
      optionText.on("pointerover", () =>
        optionText.setStyle(DilemmaStyles.optionHover)
      );
      optionText.on("pointerout", () =>
        optionText.setStyle(DilemmaStyles.optionNormal)
      );

      // click event
      optionText.on("pointerdown", () => {
        console.log(`Option selected: ${opt.text}`);

        // Process the choice and award traits
        let reason = "";
        let selectedTraits = {};

        switch (opt.id) {
          case "help": // Call for help
            reason = "Called for help - showing responsibility and care";
            selectedTraits = { responsibility: 3, empathy: 2, courage: 1 };
            break;
          case "check": // Check on the girl
            reason = "Checked on the girl - showing empathy";
            selectedTraits = { empathy: 3, courage: 1 };
            break;
          case "confront": // Confront the man
            reason = "Confronted the situation - showing courage";
            selectedTraits = { courage: 3, responsibility: 1 };
            break;
          case "nothing": // Do nothing
            reason = "Chose to ignore - showing indifference";
            selectedTraits = { selfishness: 2, empathy: -2, fear: 1 };
            break;
        }

        // Apply traits
        for (let t in selectedTraits) {
          traits[t] = (traits[t] || 0) + selectedTraits[t];
        }
        saveProgress();

        // Award virtue points (recalculated from traits)
        VirtueSystem.awardPoints(this, 0, reason);
        console.log(`✅ Parking Lot: Applied traits:`, selectedTraits);

        // Mark task as completed
        markTaskCompleted("parkingLotTask");

        console.log("Player position before:", this.player.x, this.player.y);
        console.log(
          "Camera scroll before:",
          this.cameras.main.scrollX,
          this.cameras.main.scrollY
        );

        // Make player completely immobile immediately
        if (this.player && this.player.body) {
          this.player.body.setVelocity(0, 0);
          this.player.body.stop();
        }

        // Lock camera position immediately
        if (this.lockedCameraScroll) {
          this.cameras.main.setScroll(
            this.lockedCameraScroll.x,
            this.lockedCameraScroll.y
          );
        }

        // Destroy ALL UI elements
        bg.destroy();
        mainText.destroy();
        optionTexts.forEach((text) => text.destroy());
        dialogueContainer.destroy();

        // Call end scene immediately - don't clear the flag yet
        console.log(
          "Player position after click:",
          this.player.x,
          this.player.y
        );
        console.log(
          "Camera scroll after click:",
          this.cameras.main.scrollX,
          this.cameras.main.scrollY
        );
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
    // Hide NPCs
    this.girl.setVisible(false);
    this.uncle.setVisible(false);

    // Stop all tweens first
    if (this.girlTween) {
      try {
        this.girlTween.stop();
      } catch (e) {}
      this.girlTween = null;
    }
    if (this.uncleTween) {
      try {
        this.uncleTween.stop();
      } catch (e) {}
      this.uncleTween = null;
    }

    // Ensure player is at the locked position
    if (this.player && this.player.body && this.lockedPlayerPosition) {
      this.player.setPosition(
        this.lockedPlayerPosition.x,
        this.lockedPlayerPosition.y
      );
      this.player.body.reset(
        this.lockedPlayerPosition.x,
        this.lockedPlayerPosition.y
      );
      this.player.body.setVelocity(0, 0);
      this.player.body.stop();
      this.player.anims.stop();

      // DON'T re-enable player physics or clear flags yet - keep locked
    }

    // IMPORTANT: Keep inParkingLotScene = true until camera is ready
    // Wait before re-enabling to ensure everything is settled
    this.time.delayedCall(300, () => {
      // Ensure player is still at locked position
      if (this.player && this.player.body && this.lockedPlayerPosition) {
        this.player.setPosition(
          this.lockedPlayerPosition.x,
          this.lockedPlayerPosition.y
        );
        this.player.body.reset(
          this.lockedPlayerPosition.x,
          this.lockedPlayerPosition.y
        );
        this.player.body.setVelocity(0, 0);
      }

      // Ensure camera is still at locked position
      if (this.lockedCameraScroll) {
        this.cameras.main.setScroll(
          this.lockedCameraScroll.x,
          this.lockedCameraScroll.y
        );
      }

      // Re-enable player physics
      if (this.player && this.player.body) {
        this.player.body.setImmovable(false);
        this.player.body.moves = true;
        this.player.body.setAllowGravity(false);
      }

      // Now resume camera following with smooth lerp
      this.cameras.main.startFollow(this.player, false, 0.08, 0.08);

      // FINALLY clear the flag and enable input
      this.inParkingLotScene = false;
      this.input.keyboard.enabled = true;

      saveProgress();
      console.log("✅ Parking lot task completed");

      // ✅ Update minimap dot color immediately
      const gameScene = this.scene.get("GameScene");
      if (gameScene?.updateMinimapDotColor) {
        gameScene.updateMinimapDotColor("ParkingLot");
      }

      console.log(
        "Camera follow resumed. Player at:",
        this.player.x,
        this.player.y
      );
      console.log(
        "Camera at:",
        this.cameras.main.scrollX,
        this.cameras.main.scrollY
      );

      // Clear locked positions after everything
      this.lockedPlayerPosition = null;
      this.lockedCameraScroll = null;
    });
  }

  // --- OTHER SCENE METHODS ---

  //import { isTaskCompleted } from "../state/traits.js"; // make sure this import exists

  initHtmlMinimap(map) {
    this.minimapContainer = document.getElementById("minimap");
    if (!this.minimapContainer) {
      console.error("❌ Minimap HTML element not found!");
      return;
    }

    this.mapWidth = map.widthInPixels;
    this.mapHeight = map.heightInPixels;

    console.log(
      "🧭 Initializing HTML Minimap with map size:",
      this.mapWidth,
      this.mapHeight
    );

    minimapNodes.forEach((node) => {
      const dot = document.createElement("div");
      dot.style.position = "absolute";
      dot.style.width = "10px";
      dot.style.height = "10px";
      dot.style.borderRadius = "50%";
      dot.style.border = "1px solid white";
      dot.style.transform = "translate(-50%, -50%)";
      dot.style.left = `${(node.x / this.mapWidth) * 100}%`;
      dot.style.top = `${(node.y / this.mapHeight) * 100}%`;
      dot.dataset.key = node.key;
      dot.classList.add("minimap-dot");
      // ✅ Set color based on completion
      const sceneDone = isTaskCompleted(node.key);
      if (sceneDone) {
        dotstyle.backgroundColor = "green";
        dot.style.boxShadow = "0 0 8px 2px rgba(0,255,0,0.7)";
      } else {
        dot.style.backgroundColor = "red";
        dot.style.boxShadow = "none";
      }

      this.minimapContainer.appendChild(dot);

      console.log(`📍 Minimap dot created for scene "${node.key}" at`, {
        x: node.x,
        y: node.y,
        color: dot.style.backgroundColor,
      });
    });

    // 🧍 Player dot setup
    const playerDot = document.createElement("div");
    playerDot.style.position = "absolute";
    playerDot.style.width = "8px";
    playerDot.style.height = "8px";
    playerDot.style.borderRadius = "50%";
    playerDot.style.backgroundColor = "black";
    playerDot.style.border = "2px solid yellow";
    playerDot.style.transform = "translate(-50%, -50%)";
    playerDot.style.zIndex = "1";
    playerDot.style.display = "none";
    playerDot.classList.add("player-dot");

    this.playerDotElement = playerDot;
    this.minimapContainer.appendChild(playerDot);

    console.log("✅ Player dot created successfully.");
  }

  updateMinimapDotColor(sceneKey) {
    const minimap = document.getElementById("minimap");
    if (!minimap) {
      console.warn("⚠️ Minimap element not found in DOM!");
      return;
    }

    const dots = minimap.querySelectorAll(".minimap-dot");
    console.log(`🎯 Trying to update minimap dot for scene: "${sceneKey}"`);
    console.log(`🧮 Found ${dots.length} hotspot dots total.`);

    let matched = false;
    dots.forEach((dot) => {
      console.log(
        `🔹 Dot key = "${dot.dataset.key}", color = ${dot.style.backgroundColor}`
      );
      if (dot.dataset.key === sceneKey) {
        matched = true;
        console.log(
          `✅ Match found → changing color to green for scene "${sceneKey}"`
        );
        //dot.style.backgroundColor = "green";
        dot.style.setProperty("background-color", "green", "important");
        dot.style.transition =
          "background-color 0.4s ease, box-shadow 0.4s ease";

        dot.style.border = "1px solid white";
        dot.style.boxShadow = "0 0 8px 2px rgba(0,255,0,0.7)";
        dot.style.zIndex = "5";
        dot.style.transition = "background-color 0.4s, box-shadow 0.4s";
      }
    });

    if (!matched) {
      console.warn(`🚫 No minimap dot found matching key "${sceneKey}"`);
    }
  }

  playBackgroundMusic() {
    // If music is already playing, just update volume if needed
    if (this.bgMusic && this.bgMusic.isPlaying) {
      const currentVolume = this.registry.get("musicVolume") || 0.7;
      this.bgMusic.setVolume(currentVolume);
      console.log(
        `🎵 Background music already playing, volume updated to ${Math.round(
          currentVolume * 100
        )}%`
      );
      return;
    }

    if (!this.bgMusic) {
      // Get volume from settings, default to 0.7 if not set
      let musicVolume = this.registry.get("musicVolume");
      if (musicVolume === undefined) {
        // Try to load from localStorage
        try {
          const savedSettings = localStorage.getItem("gameSettings");
          if (savedSettings) {
            const settings = JSON.parse(savedSettings);
            musicVolume =
              settings.musicVolume !== undefined ? settings.musicVolume : 0.7;
          } else {
            musicVolume = 0.7;
          }
        } catch (error) {
          console.error("❌ Failed to load music volume:", error);
          musicVolume = 0.7;
        }
        this.registry.set("musicVolume", musicVolume);
      }

      console.log(
        `🎵 Creating background music at ${Math.round(
          musicVolume * 100
        )}% volume`
      );

      try {
        this.bgMusic = this.sound.add("bgMusic", {
          loop: true,
          volume: musicVolume,
        });

        // Add error handler
        this.bgMusic.once("loaderror", () => {
          console.error("❌ Failed to load background music file");
        });

        this.bgMusic.play();

        if (this.bgMusic.isPlaying) {
          console.log("✅ Background music started successfully");
        } else {
          console.warn("⚠️ Background music created but not playing");
        }
      } catch (error) {
        console.error("❌ Error creating background music:", error);
      }
    }
  }

  createAnimations() {
    // Create animations for all 4 character types
    const characters = [
      "maleAdventurer",
      "femaleAdventurer",
      "malePerson",
      "femalePerson",
    ];

    characters.forEach((charKey) => {
      // Walk down
      if (!this.anims.exists(`${charKey}-walk-down`)) {
        this.anims.create({
          key: `${charKey}-walk-down`,
          frames: this.anims.generateFrameNumbers(charKey, {
            start: 22,
            end: 23,
          }),
          frameRate: 8,
          repeat: -1,
        });
      }

      // Walk left
      if (!this.anims.exists(`${charKey}-walk-left`)) {
        this.anims.create({
          key: `${charKey}-walk-left`,
          frames: this.anims.generateFrameNumbers(charKey, {
            start: 16,
            end: 18,
          }),
          frameRate: 8,
          repeat: -1,
        });
      }

      // Walk right
      if (!this.anims.exists(`${charKey}-walk-right`)) {
        this.anims.create({
          key: `${charKey}-walk-right`,
          frames: this.anims.generateFrameNumbers(charKey, {
            start: 19,
            end: 21,
          }),
          frameRate: 8,
          repeat: -1,
        });
      }

      // Walk up
      if (!this.anims.exists(`${charKey}-walk-up`)) {
        this.anims.create({
          key: `${charKey}-walk-up`,
          frames: this.anims.generateFrameNumbers(charKey, {
            start: 22,
            end: 23,
          }),
          frameRate: 8,
          repeat: -1,
        });
      }
    });

    // Backward compatibility - create animations with 'player' prefix too
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

    // NPC animations
    this.anims.create({
      key: "girl-run",
      frames: this.anims.generateFrameNumbers("girl_npc", {
        start: 19,
        end: 21,
      }),
      frameRate: 10,
      repeat: -1,
    });
    this.anims.create({
      key: "uncle-run",
      frames: this.anims.generateFrameNumbers("uncle_npc", {
        start: 19,
        end: 21,
      }),
      frameRate: 10,
      repeat: -1,
    });
    this.anims.create({
      key: "girl-fall",
      frames: [{ key: "girl_npc", frame: 10 }],
      frameRate: 10,
    });
  }

  update() {
    // Lock player and camera in place during parking lot scene
    if (this.inParkingLotScene) {
      if (this.player && this.player.body && this.lockedPlayerPosition) {
        // Force player to stay at locked position
        this.player.setPosition(
          this.lockedPlayerPosition.x,
          this.lockedPlayerPosition.y
        );
        this.player.body.setVelocity(0, 0);
        this.player.body.reset(
          this.lockedPlayerPosition.x,
          this.lockedPlayerPosition.y
        );
        this.player.anims.stop();
      }

      // Force camera to stay at locked position - CRITICAL
      if (this.lockedCameraScroll) {
        this.cameras.main.setScroll(
          this.lockedCameraScroll.x,
          this.lockedCameraScroll.y
        );
      }
      return;
    }

    if (!this.player || !this.player.body || !this.input.keyboard.enabled) {
      if (this.player && this.player.body) {
        this.player.body.setVelocity(0, 0);
        this.player.anims.stop();
      }
      return;
    }
    const speed = 100;
    const body = this.player.body;
    body.setVelocity(0, 0); // Changed to (0, 0) to explicitly set both axes
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

      // Get the selected character key
      const charKey =
        this.registry.get("playerCharacter") ||
        localStorage.getItem("selectedCharacter") ||
        "maleAdventurer";

      // Use character-specific animations
      if (body.velocity.y > 0)
        this.player.anims.play(`${charKey}-walk-down`, true);
      else if (body.velocity.y < 0)
        this.player.anims.play(`${charKey}-walk-up`, true);
      else if (body.velocity.x > 0)
        this.player.anims.play(`${charKey}-walk-right`, true);
      else if (body.velocity.x < 0)
        this.player.anims.play(`${charKey}-walk-left`, true);

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
      if (this.playerDotElement.style.display === "none") {
        this.playerDotElement.style.display = "block";
      }
    }

    // --- ✨ REMOVED the on-screen coordinate update logic ---
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
