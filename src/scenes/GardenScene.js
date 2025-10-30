import * as Phaser from "https://cdn.jsdelivr.net/npm/phaser@3.60.0/dist/phaser.esm.js";
import { isTaskCompleted, markTaskCompleted, traits, saveProgress } from "../state/traits.js";
import { VirtueSystem } from "../state/VirtueSystem.js";
import { DilemmaStyles } from "../utils/dilemmaStyles.js";

export default class GardenScene extends Phaser.Scene {
  constructor() {
    super("GardenScene");
    this.canInteract = false;
    this.dialogOpen = false;
  }

  init(data) {
    this.entryData = data || {};
  }

  preload() {
    console.log("Preloading GardenScene assets...");
    this.load.tilemapTiledJSON("gardenmap", "maps/Garden.tmj");
    this.load.image("city01", "tilesets/city01.png");
    this.load.image("CityMap", "tilesets/CityMap.png");

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
    console.log("Creating GardenScene...");

    // Initialize virtue points system
    VirtueSystem.initScene(this);

    const map = this.make.tilemap({ key: "gardenmap" });
    const city011Tiles = map.addTilesetImage("city01", "city01");
    const cityMapTiles = map.addTilesetImage("CityMap", "CityMap");
    const tilesets = [city011Tiles, cityMapTiles];
    const groundLayer = map.createLayer("Ground", tilesets, 0, 0);
    const wallLayer = map.createLayer("Wall", tilesets, 0, 0);
    const treeLayer = map.createLayer("Tree", tilesets, 0, 0);
    const exitLayer = map.createLayer("exit", tilesets, 0, 0);
    if (wallLayer)
      try {
        wallLayer.setCollisionByExclusion([-1]);
      } catch (e) {
        wallLayer.setCollisionByProperty({ collides: true });
      }
    if (treeLayer)
      try {
        treeLayer.setCollisionByExclusion([-1]);
      } catch (e) {
        treeLayer.setCollisionByProperty({ collides: true });
      }

    // Spawn player away from exit to avoid immediate re-exit
    const exitObjLayer = map.getObjectLayer("exit");
    let spawnX = 150; // default fallback
    let spawnY = 250; // default fallback

    if (exitObjLayer) {
      const exitObj = exitObjLayer.objects.find((o) => o.name === "exit");
      if (exitObj) {
        // Spawn MUCH further from the exit object to avoid overlap
        spawnX = exitObj.x + 50; // Move 150 pixels away horizontally
        spawnY = exitObj.y + 50; // Move 150 pixels away vertically
      }
    }

    // Get selected character
    const playerCharacter =
      this.registry.get("playerCharacter") ||
      localStorage.getItem("selectedCharacter") ||
      "maleAdventurer";

    this.player = this.physics.add
      .sprite(spawnX, spawnY, playerCharacter, 0)
      .setScale(0.35);
    this.player.setCollideWorldBounds(true);
    this.player.setDepth(150);

    this.cursors = this.input.keyboard.createCursorKeys();
    if (wallLayer) this.physics.add.collider(this.player, wallLayer);
    if (treeLayer) this.physics.add.collider(this.player, treeLayer);
    if (groundLayer) groundLayer.setDepth(0);
    if (wallLayer) wallLayer.setDepth(100);
    if (treeLayer) treeLayer.setDepth(300);

    // Ensure UIScene1 is running for HUD buttons
    if (!this.scene.isActive("UIScene1")) {
      this.scene.launch("UIScene1");
    }

    // Enhanced camera follow
    this.cameras.main.setRoundPixels(false);

    this.createAnimations();

    const benchLayer =
      map.getObjectLayer("bench") || map.getObjectLayer("objects") || null;
    let benchX = Math.round(map.widthInPixels / 2) - 40;
    let benchY = Math.round(map.heightInPixels / 2) + 20;
    if (benchLayer && benchLayer.objects && benchLayer.objects.length) {
      const b = benchLayer.objects[0];
      benchX = b.x || benchX;
      benchY = b.y || benchY;
    }

    const lakeX = 40;
    const lakeY = map.heightInPixels - 40;

    const playerScale = this.player.scaleX || this.player.scale || 0.18;
    const npcScale = playerScale * (128 / 256);
    this.npcA = this.physics.add
      .sprite(benchX - 16, benchY, "femaleAdventurer", "idle")
      .setScale(npcScale);
    this.npcB = this.physics.add
      .sprite(benchX + 16, benchY, "femalePerson", "idle")
      .setScale(npcScale);
    this.npcA.setDepth(140);
    this.npcB.setDepth(140);
    this.npcA.body.setImmovable(true);
    this.npcB.body.setImmovable(true);
    [this.npcA, this.npcB].forEach((npc) => {
      npc.setCollideWorldBounds(true);
      if (npc.body) {
        npc.setSize(npc.width * 0.4, npc.height * 0.2);
        npc.setOffset(npc.width * 0.3, npc.height * 0.8);
      }
    });

    // Gardener starts at bottom left (exit point)
    this.gardener = this.physics.add
      .sprite(lakeX, lakeY, "malePerson", "idle")
      .setScale(npcScale);
    this.gardener.setDepth(140);
    this.gardener.body.setCollideWorldBounds(true);
    if (this.gardener.body) {
      this.gardener.setSize(
        this.gardener.width * 0.4,
        this.gardener.height * 0.2
      );
      this.gardener.setOffset(
        this.gardener.width * 0.3,
        this.gardener.height * 0.8
      );
    }

    ["femaleAdventurer", "femalePerson", "malePerson"].forEach((key) => {
      if (!this.anims.exists(`${key}-walk`)) {
        this.anims.create({
          key: `${key}-walk`,
          frames: this.anims.generateFrameNames(key, {
            start: 0,
            end: 7,
            prefix: "walk",
            zeroPad: 0,
          }),
          frameRate: 8,
          repeat: -1,
        });
      }
    });

    const benchZone = this.add.zone(benchX, benchY, 80, 48).setOrigin(0.5);
    this.physics.world.enable(benchZone);
    benchZone.body.setAllowGravity(false);
    benchZone.body.setImmovable(true);
    benchZone.triggered = false;

    const makeSpeechBubble = (x, y, msg, index = 0) => {
      const txt = this.add
        .text(0, 0, msg, {
          fontSize: "14px",
          color: "#000000",
          align: "center",
          wordWrap: { width: 100 },
        })
        .setOrigin(0.5);
      const paddingX = 5;
      const paddingY = 2;
      const rectW = txt.width + paddingX * 2;
      const rectH = txt.height + paddingY * 2;
      const g = this.add.graphics();
      g.fillStyle(0xffffff, 1);
      g.fillRoundedRect(-rectW / 2, -rectH - 8 - index * 20, rectW, rectH, 4);
      g.lineStyle(2, 0x000000, 0.25);
      g.strokeRoundedRect(-rectW / 2, -rectH - 8 - index * 20, rectW, rectH, 4);
      g.fillStyle(0xffffff, 1);
      g.fillTriangle(
        -4,
        -8 - index * 20,
        4,
        -8 - index * 20,
        0,
        -2 - index * 20
      );
      txt.setPosition(0, -rectH / 2 - 8 - index * 20).setOrigin(0.5);
      const container = this.add.container(x, y - 10, [g, txt]);
      container.setDepth(500);
      return container;
    };

    this.physics.add.overlap(
      this.player,
      benchZone,
      () => {
        if (benchZone.triggered) return;

        // Check if garden task is already completed
        if (isTaskCompleted("gardenTask")) {
          console.log("ℹ️ Garden task already completed");
          return;
        }

        benchZone.triggered = true;
        this.npcASpeech = makeSpeechBubble.call(
          this,
          this.npcA.x,
          this.npcA.y - 8,
          "You did it",
          0
        );
        this.npcBSpeech = makeSpeechBubble.call(
          this,
          this.npcB.x,
          this.npcB.y - 8,
          "No, you did",
          1
        );

        const targetX = benchX + 20; // Adjusted to avoid tree
        const targetY = benchY - 20;
        this.time.delayedCall(3000, () => {
          this.physics.moveTo(this.gardener, targetX, targetY, 80);
        });
        const arriveCheck = this.time.addEvent({
          delay: 100,
          loop: true,
          callback: () => {
            const dist = Phaser.Math.Distance.Between(
              this.gardener.x,
              this.gardener.y,
              targetX,
              targetY
            );
            if (dist < 8) {
              this.gardener.body.reset(targetX, targetY);
              arriveCheck.remove(false);
              // Display question and options after gardener stops - FIXED
              this.showQuiz();
            }
          },
        });
      },
      null,
      this
    );

    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    this.cameras.main.setZoom(2.0);
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    // FIXED: Exit zone logic using your working example pattern
    const exitLayer2 = map.getObjectLayer("exit");
    const exitObj = exitLayer2?.objects?.find((o) => o.name === "exit");

    if (exitObj) {
      console.log(
        "Exit object found at:",
        exitObj.x,
        exitObj.y,
        "Size:",
        exitObj.width,
        exitObj.height
      );

      // Use the exact same pattern as your working code
      this.exitZone = this.physics.add
        .staticImage(exitObj.x, exitObj.y, null)
        .setVisible(false);

      // Set the body size to match the object dimensions
      this.exitZone.body.setSize(exitObj.width || 77, exitObj.height || 45);

      this.physics.add.overlap(this.player, this.exitZone, () => {
        console.log(
          "Player overlapping exit zone - transitioning to GameScene"
        );
        markTaskCompleted("GardenScene");  // ⚠️ change this to match your current scene name
    saveProgress();
 const gameScene = this.scene.get("GameScene");
    if (gameScene?.updateMinimapDotColor) {
      gameScene.updateMinimapDotColor("GardenScene"); // same key
    }
        this.scene.start("GameScene");
      });
    } else {
      console.log("No exit object found in exit layer");
    }

    this.map = map;
  }

  // FIXED: Smaller quiz box (0.6 times smaller)
  showQuiz() {
    this.quizActive = true;

    // Create quiz background with proper scroll factor - Using unified design
    const cam = this.cameras.main;
    const boxWidth = 320;
    const boxHeight = 300;
    const centerX = cam.width / 2;
    const centerY = cam.height / 2;
    const boxX = centerX - boxWidth / 2;
    const boxY = centerY - boxHeight / 2;

    this.quizBox = this.add.graphics().setDepth(999).setScrollFactor(0);
    this.quizBox.fillStyle(DilemmaStyles.modal.backgroundColor, DilemmaStyles.modal.backgroundAlpha);
    this.quizBox.fillRoundedRect(boxX, boxY, boxWidth, boxHeight, DilemmaStyles.modal.borderRadius);
    this.quizBox.lineStyle(DilemmaStyles.modal.borderWidth, DilemmaStyles.modal.borderColor, 1);
    this.quizBox.strokeRoundedRect(boxX, boxY, boxWidth, boxHeight, DilemmaStyles.modal.borderRadius);

    // Question text
    this.quizText = this.add
      .text(
        boxX + 20,
        boxY + 30,
        "Two kids are fighting over who broke the bench, what will you do:",
        {
          fontFamily: DilemmaStyles.question.fontFamily,
          fontSize: "13px",
          color: DilemmaStyles.question.color,
          wordWrap: { width: boxWidth - 40 },
        }
      )
      .setScrollFactor(0)
      .setDepth(1000)
      .setVisible(true);

    // Options
    const options = [
      "Tell the gardener to scold both kids.",
      "Help fix the bench and calm them down.",
      "Ignore it, it's not your problem.",
      "Calm both kids down and ask what really happened before the gardener arrives.",
    ];

    if (this.optionTexts) this.optionTexts.forEach((o) => o.destroy());
    this.optionTexts = [];

    let optionY = boxY + 95;
    const optionGap = 50;
    options.forEach((option, i) => {
      const opt = this.add
        .text(boxX + 20, optionY, `${i + 1}. ${option}`, {
          fontFamily: DilemmaStyles.option.fontFamily,
          fontSize: "11px",
          color: DilemmaStyles.option.color,
          backgroundColor: DilemmaStyles.option.backgroundColor,
          padding: { left: 6, right: 6, top: 4, bottom: 4 },
          wordWrap: { width: boxWidth - 50 },
          lineSpacing: 2,
        })
        .setInteractive({ useHandCursor: true })
        .setDepth(1001)
        .setScrollFactor(0);

      opt.on("pointerover", () => opt.setStyle(DilemmaStyles.optionHover));
      opt.on("pointerout", () => opt.setStyle(DilemmaStyles.optionNormal));

      opt.on("pointerdown", () =>
        this.handleQuizSelection(String.fromCharCode(65 + i))
      );
      this.optionTexts.push(opt);
      optionY += optionGap;
    });

    // Bring elements to top
    this.children.bringToTop(this.quizBox);
    this.children.bringToTop(this.quizText);
    this.optionTexts.forEach((o) => this.children.bringToTop(o));
  }

  // FIXED: Handle quiz selection
  handleQuizSelection(selectedKey) {
    if (!["A", "B", "C", "D"].includes(selectedKey)) return;

    this.quizActive = false;

    // Determine traits and reason based on choice
    let reason = "";
    let selectedTraits = {};
    const index = selectedKey.charCodeAt(0) - 65;
    
    switch (index) {
      case 0: // A: Help plant the tree
        reason = "Showed responsibility and care for the environment";
        selectedTraits = { responsibility: 3, empathy: 2, courage: 1 };
        break;
      case 1: // B: Take a photo
        reason = "Showed interest but didn't actively participate";
        selectedTraits = { empathy: 1 };
        break;
      case 2: // C: Watch quietly
        reason = "Respectfully observed without interfering";
        selectedTraits = { empathy: 1, responsibility: 1 };
        break;
      case 3: // D: Leave
        reason = "Missed an opportunity to contribute positively";
        selectedTraits = { selfishness: 2, responsibility: -2 };
        break;
    }

    // Apply traits
    for (let t in selectedTraits) {
      traits[t] = (traits[t] || 0) + selectedTraits[t];
    }
    saveProgress();

    // Award virtue points (recalculated from traits)
    VirtueSystem.awardPoints(this, 0, reason);
    console.log(`✅ Garden: Applied traits:`, selectedTraits);

    // Clean up quiz elements
    if (this.quizBox) this.quizBox.destroy();
    if (this.quizText) this.quizText.destroy();
    if (this.optionTexts) this.optionTexts.forEach((o) => o.destroy());

    // Show selection result briefly
    const cam = this.cameras.main;
    const boxWidth = 320;
    const boxHeight = 90;
    const resultBox = this.add.graphics().setDepth(999).setScrollFactor(0);
    resultBox.fillStyle(DilemmaStyles.modal.backgroundColor, DilemmaStyles.modal.backgroundAlpha);
    resultBox.fillRoundedRect(
      cam.width / 2 - boxWidth / 2,
      cam.height / 2 - boxHeight / 2,
      boxWidth,
      boxHeight,
      DilemmaStyles.modal.borderRadius
    );
    resultBox.lineStyle(DilemmaStyles.modal.borderWidth, DilemmaStyles.modal.borderColor, 1);
    resultBox.strokeRoundedRect(
      cam.width / 2 - boxWidth / 2,
      cam.height / 2 - boxHeight / 2,
      boxWidth,
      boxHeight,
      DilemmaStyles.modal.borderRadius
    );

    const resultText = this.add
      .text(cam.width / 2, cam.height / 2, `You chose option ${selectedKey}`, {
        fontFamily: DilemmaStyles.question.fontFamily,
        fontSize: "14px",
        color: DilemmaStyles.question.color,
        align: "center",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(1000);

    // Clean up after showing result
    this.time.delayedCall(1400, () => {
      resultBox.destroy();
      resultText.destroy();
      this.moveCharacters();
    });
  }

  // Move characters after quiz
  moveCharacters() {
    const lakeX = 40;
    const lakeY = this.map.heightInPixels - 40;

    // Mark garden task as completed
    markTaskCompleted("gardenTask");
    console.log("✅ Garden task completed");

    this.physics.moveTo(this.gardener, lakeX, lakeY, 100);
    this.tweens.add({
      targets: [this.npcA],
      x: 50,
      y: 50,
      duration: 1200,
      ease: "Sine.easeInOut",
    });
    this.tweens.add({
      targets: [this.npcB],
      x: 70,
      y: 70,
      duration: 1200,
      ease: "Sine.easeInOut",
    });
    this.time.delayedCall(1000, () => {
      if (this.npcASpeech) this.npcASpeech.destroy();
      if (this.npcBSpeech) this.npcBSpeech.destroy();
    });
  }

  update() {
    const speed = 100;
    const body = this.player.body;
    body.setVelocity(0);
    if (this.cursors.left.isDown) body.setVelocityX(-speed);
    else if (this.cursors.right.isDown) body.setVelocityX(speed);
    if (this.cursors.up.isDown) body.setVelocityY(-speed);
    else if (this.cursors.down.isDown) body.setVelocityY(speed);
    if (body.velocity.x !== 0 || body.velocity.y !== 0) {
      if (body.velocity.x !== 0 && body.velocity.y !== 0)
        body.velocity.normalize().scale(speed);
      if (body.velocity.y > 0) this.player.anims.play("walk-down", true);
      else if (body.velocity.y < 0) this.player.anims.play("walk-up", true);
      else if (body.velocity.x > 0) this.player.anims.play("walk-right", true);
      else if (body.velocity.x < 0) this.player.anims.play("walk-left", true);
    } else {
      this.player.anims.stop();
    }
  }

  createAnimations() {
    const g = this.anims;

    // Get the selected character
    const playerCharacter =
      this.registry.get("playerCharacter") ||
      localStorage.getItem("selectedCharacter") ||
      "maleAdventurer";

    // Destroy existing animations if they exist
    if (g.exists("walk-down")) g.remove("walk-down");
    if (g.exists("walk-left")) g.remove("walk-left");
    if (g.exists("walk-right")) g.remove("walk-right");
    if (g.exists("walk-up")) g.remove("walk-up");

    g.create({
      key: "walk-down",
      frames: g.generateFrameNames(playerCharacter, { start: 22, end: 23 }),
      frameRate: 8,
      repeat: -1,
    });
    g.create({
      key: "walk-left",
      frames: g.generateFrameNames(playerCharacter, { start: 16, end: 18 }),
      frameRate: 8,
      repeat: -1,
    });
    g.create({
      key: "walk-right",
      frames: g.generateFrameNames(playerCharacter, { start: 19, end: 21 }),
      frameRate: 8,
      repeat: -1,
    });
    g.create({
      key: "walk-up",
      frames: g.generateFrameNames(playerCharacter, { start: 22, end: 23 }),
      frameRate: 8,
      repeat: -1,
    });
  }
}
