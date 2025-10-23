// ✅ Full CafeScene.js (only showQuiz fixed, nothing else changed)
import * as Phaser from "https://cdn.jsdelivr.net/npm/phaser@3.60.0/dist/phaser.esm.js";

export default class CafeScene extends Phaser.Scene {
  constructor() {
    super("CafeScene");
    this.canInteract = false;
    this.dialogOpen = false;
    this.dialogueIndex = 0;
    this.dialogueTimer = null;
    this.currentDialogue = null;
    this.quizActive = false;
    this.interactionTriggered = false;
    this.selectedOption = null;
    this.isOverlapping = false;
  }

  preload() {
    console.log("Preloading CafeScene assets...");
    this.load.tilemapTiledJSON("cafe", "public/maps/cafe.tmj");
    this.load.image("cafe_tileset", "public/tilesets/cafe_tileset.png");
    this.load.image(
      "soldier_tilesheet",
      "public/tilesets/soldier_tilesheet.png"
    );
    this.load.image("player_tilesheet", "public/tilesets/player_tilesheet.png");
    this.load.image("female_tilesheet", "public/tilesets/female_tilesheet.png");
    this.load.image(
      "adventurer_tilesheet",
      "public/tilesets/adventurer_tilesheet.png"
    );

    this.load.spritesheet(
      "player",
      "public/kenney_toon-characters-1/Male adventurer/Tilesheet/character_maleAdventurer_sheet.png",
      { frameWidth: 96, frameHeight: 128 }
    );

    this.load.atlasXML(
      "femaleAdventurer",
      "public/kenney_toon-characters-1/Female adventurer/Tilesheet/character_femaleAdventurer_sheetHD.png",
      "kenney_toon-characters-1/Female adventurer/Tilesheet/character_femaleAdventurer_sheetHD.xml"
    );
    this.load.atlasXML(
      "malePerson",
      "kenney_toon-characters-1/Male person/Tilesheet/character_malePerson_sheetHD.png",
      "kenney_toon-characters-1/Male person/Tilesheet/character_malePerson_sheetHD.xml"
    );
  }

  create() {
    const map = this.make.tilemap({ key: "cafe" });
    const tilesets = [
      map.addTilesetImage("cafe_tileset", "cafe_tileset"),
      map.addTilesetImage("soldier_tilesheet", "soldier_tilesheet"),
      map.addTilesetImage("player_tilesheet", "player_tilesheet"),
      map.addTilesetImage("female_tilesheet", "female_tilesheet"),
      map.addTilesetImage("adventurer_tilesheet", "adventurer_tilesheet"),
    ];

    const nonCollideLayer = map.createLayer("Non-Collide", tilesets, 0, 0);
    const collideLayer = map.createLayer("Collide", tilesets, 0, 0);
    if (collideLayer) collideLayer.setCollisionByExclusion([-1]);
    const peopleLayer = map.createLayer("People", tilesets, 0, 0);

    const playerSpawnLayer = map.getObjectLayer("playerSpawn");
    const spawnObj = playerSpawnLayer.objects.find(
      (o) => o.name === "playerSpawn"
    );
    this.player = this.physics.add
      .sprite(spawnObj.x, spawnObj.y, "player", 0)
      .setCollideWorldBounds(true);
    this.player.setDisplaySize(60, 90);

    const tableX = map.widthInPixels - 180 - 48;
    const tableY = map.heightInPixels - 220 - 128;
    this.barista = this.physics.add.staticSprite(
      tableX + 45,
      tableY + 5,
      "femaleAdventurer"
    );
    this.man = this.physics.add.staticSprite(tableX, tableY, "malePerson");
    this.barista.setDisplaySize(60, 90);
    this.man.setDisplaySize(60, 90);
    this.barista.setDepth(150);
    this.man.setDepth(150);

    if (collideLayer) this.physics.add.collider(this.player, collideLayer);

    // Enhanced camera follow
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);
    this.cameras.main.setRoundPixels(false);
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    this.cursors = this.input.keyboard.createCursorKeys();
    this.interactKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE
    );

    this.createPlayerAnimations();

    this.dialogue = [
      {
        speaker: "Man",
        text: "I come here every single morning! I just forgot my wallet today.",
      },
      {
        speaker: "Barista",
        text: "I’m really sorry, sir, but I can’t give anything without payment.",
      },
      {
        speaker: "Man",
        text: "You’ve seen me here before! I’m not making it up.",
      },
      {
        speaker: "Barista",
        text: "Even if you are a regular, rules are rules.",
      },
    ];

    this.dialogueBoxes = {};
    this.dialogueTexts = {};

    this.quizBox = this.add.graphics().setDepth(999).setScrollFactor(0);
    this.quizText = this.add
      .text(0, 0, "", {
        fontSize: "18px",
        fill: "#000",
        wordWrap: { width: 320, useAdvancedWrap: true },
        lineSpacing: 4,
      })
      .setScrollFactor(0)
      .setDepth(1000)
      .setVisible(false);

    this.quizOptions = [
      "A. Step forward and pay for the man’s drink quietly, without making a scene.",
      "B. Tell the barista to make an exception — “He’s a regular! Don’t be so heartless.”",
      "C. You give the man a reassuring smile, letting him know someone believes him — even if you can’t help more.",
      "D. Ignore the argument; it’s none of your business.",
    ];

    const exitLayer = map.getObjectLayer("exit");
    const exitObj = exitLayer?.objects?.find((o) => o.name === "exit");
    if (exitObj) {
      this.exitZone = this.physics.add
        .staticImage(exitObj.x, exitObj.y, null)
        .setVisible(false);
      this.physics.add.overlap(this.player, this.exitZone, () =>
        this.scene.start("GameScene")
      );
    }

    const triggerLayer = map.getObjectLayer("trigger");
    if (triggerLayer) {
      triggerLayer.objects.forEach((obj) => {
        const zone = this.add
          .zone(obj.x, obj.y, obj.width || 32, obj.height || 32)
          .setOrigin(0, 1);
        this.physics.world.enable(zone);
        zone.body.setAllowGravity(false);
        zone.body.setImmovable(true);
        zone.triggered = false;
        this.physics.add.overlap(
          this.player,
          zone,
          () => {
            if (!zone.triggered && !this.dialogOpen && !this.quizActive) {
              zone.triggered = true;
              this.interactionTriggered = true;
              this.dialogOpen = true;
              this.dialogueIndex = 0;
              this.showNextDialogue();
            }
          },
          null,
          this
        );
      });
    }

    this.map = map;
  }

  createPlayerAnimations() {
    this.anims.create({
      key: "left",
      frames: this.anims.generateFrameNumbers("player", { start: 16, end: 18 }),
      frameRate: 10,
      repeat: -1,
    });
    this.anims.create({
      key: "right",
      frames: this.anims.generateFrameNumbers("player", { start: 19, end: 21 }),
      frameRate: 10,
      repeat: -1,
    });
    this.anims.create({
      key: "up",
      frames: this.anims.generateFrameNumbers("player", { start: 22, end: 23 }),
      frameRate: 10,
      repeat: -1,
    });
    this.anims.create({
      key: "down",
      frames: this.anims.generateFrameNumbers("player", { start: 22, end: 23 }),
      frameRate: 10,
      repeat: -1,
    });
  }

  update() {
    if (!this.player || !this.cursors) return;
    const speed = 120;
    this.player.setVelocity(0);
    if (this.dialogOpen || this.quizActive) return;

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-speed);
      this.player.anims.play("left", true);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(speed);
      this.player.anims.play("right", true);
    } else if (this.cursors.up.isDown) {
      this.player.setVelocityY(-speed);
      this.player.anims.play("up", true);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(speed);
      this.player.anims.play("down", true);
    } else {
      this.player.setVelocity(0);
      this.player.anims.stop();
    }
  }

  showNextDialogue() {
    for (let s in this.dialogueBoxes) {
      this.dialogueBoxes[s].clear();
      this.dialogueTexts[s].setVisible(false);
    }

    if (this.dialogueIndex < this.dialogue.length) {
      const line = this.dialogue[this.dialogueIndex];
      const sp = line.speaker === "Man" ? this.man : this.barista;
      const boxWidth = 300,
        boxHeight = 110;
      const boxX = sp.x - boxWidth / 2,
        boxY = sp.y - 130;

      if (!this.dialogueBoxes[line.speaker]) {
        this.dialogueBoxes[line.speaker] = this.add.graphics().setDepth(1000);
        this.dialogueTexts[line.speaker] = this.add
          .text(boxX + 14, boxY + 12, "", {
            fontSize: "16px",
            fill: "#000",
            wordWrap: { width: boxWidth - 28, useAdvancedWrap: true },
            lineSpacing: 4,
          })
          .setDepth(1001);
      } else this.dialogueTexts[line.speaker].setPosition(boxX + 14, boxY + 12);

      const g = this.dialogueBoxes[line.speaker];
      const t = this.dialogueTexts[line.speaker];
      g.clear();
      g.fillStyle(0xffffff, 1);
      g.fillRoundedRect(boxX, boxY, boxWidth, boxHeight, 12);
      g.lineStyle(2, 0x000000, 1);
      g.strokeRoundedRect(boxX, boxY, boxWidth, boxHeight, 12);
      g.fillTriangle(
        boxX + boxWidth / 2 - 10,
        boxY + boxHeight,
        boxX + boxWidth / 2 + 10,
        boxY + boxHeight,
        boxX + boxWidth / 2,
        boxY + boxHeight + 12
      );
      t.setText(`${line.speaker}: ${line.text}`).setVisible(true);

      this.dialogueIndex++;
      if (this.dialogueTimer) this.dialogueTimer.remove(false);
      this.dialogueTimer = this.time.delayedCall(
        4200,
        this.showNextDialogue,
        [],
        this
      );
    } else {
      for (let s in this.dialogueBoxes) {
        this.dialogueBoxes[s].clear();
        this.dialogueTexts[s].setVisible(false);
      }
      this.dialogOpen = false;
      this.dialogueIndex = 0;
      this.time.delayedCall(500, () => this.showQuiz(), [], this);
    }
  }

  // ✅ FIXED quiz visibility: always centers to screen, unaffected by camera scroll
  showQuiz() {
    this.quizActive = true;

    const cam = this.cameras.main;
    const boxWidth = 420,
      boxHeight = 340;
    const centerX = cam.width / 2,
      centerY = cam.height / 2;
    const boxX = centerX - boxWidth / 2,
      boxY = centerY - boxHeight / 2 + 20;

    this.quizBox.clear();
    this.quizBox.fillStyle(0xffffff, 1);
    this.quizBox.fillRoundedRect(boxX, boxY, boxWidth, boxHeight, 14);
    this.quizBox.lineStyle(2, 0x000000, 1);
    this.quizBox.strokeRoundedRect(boxX, boxY, boxWidth, boxHeight, 14);

    this.quizText.setText("A man forgot his wallet. What do you do?");
    this.quizText.setVisible(true).setPosition(boxX + 30, boxY + 30);

    if (this.optionTexts) this.optionTexts.forEach((o) => o.destroy());
    this.optionTexts = [];

    let optionY = boxY + 100;
    const optionGap = 50;
    this.quizOptions.forEach((option, i) => {
      const opt = this.add
        .text(boxX + 36, optionY, option, {
          fontSize: "16px",
          fill: "#000",
          wordWrap: { width: boxWidth - 80, useAdvancedWrap: true },
          lineSpacing: 4,
        })
        .setInteractive({ useHandCursor: true })
        .setDepth(1001)
        .setScrollFactor(0);

      opt.on("pointerdown", () =>
        this.handleQuizSelection({ key: String.fromCharCode(65 + i) })
      );
      this.optionTexts.push(opt);
      optionY += optionGap;
    });

    this.children.bringToTop(this.quizBox);
    this.children.bringToTop(this.quizText);
    this.optionTexts.forEach((o) => this.children.bringToTop(o));
    this.input.keyboard.once("keydown", this.handleQuizSelection, this);
  }

  handleQuizSelection(event) {
    const key = (event.key || "").toUpperCase();
    if (!["A", "B", "C", "D"].includes(key)) return;
    const index = key.charCodeAt(0) - 65;
    this.selectedOption = key;
    this.quizActive = false;

    if (this.optionTexts) this.optionTexts.forEach((o) => o.destroy());
    this.optionTexts = [];

    const cam = this.cameras.main;
    const boxWidth = 380,
      boxHeight = 84;
    const boxX = cam.width / 2 - boxWidth / 2,
      boxY = cam.height / 2 - boxHeight / 2;

    this.quizBox.clear();
    this.quizBox.fillStyle(0xffffff, 1);
    this.quizBox.fillRoundedRect(boxX, boxY, boxWidth, boxHeight, 12);
    this.quizBox.lineStyle(2, 0x000000, 1);
    this.quizBox.strokeRoundedRect(boxX, boxY, boxWidth, boxHeight, 12);

    this.quizText
      .setText(`You chose: ${this.quizOptions[index]}`)
      .setStyle({
        fontSize: "16px",
        fill: "#000",
        wordWrap: { width: boxWidth - 40 },
      })
      .setPosition(boxX + 16, boxY + 14)
      .setVisible(true);

    this.time.delayedCall(1400, this.moveMan, [], this);
  }

  moveMan() {
    this.quizBox.clear();
    this.quizText.setVisible(false);

    const exitLayer = this.map.getObjectLayer("exit");
    const exitObj = exitLayer?.objects?.find((o) => o.name === "exit");
    if (!exitObj) return;

    this.tweens.add({
      targets: this.man,
      x: exitObj.x,
      y: exitObj.y,
      duration: 2000,
      onComplete: () => {
        try {
          this.man.destroy();
        } catch {}
      },
    });
  }
}
