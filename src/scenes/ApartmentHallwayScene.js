import * as Phaser from "https://cdn.jsdelivr.net/npm/phaser@3.60.0/dist/phaser.esm.js";

class ApartmentHallwayScene extends Phaser.Scene {
  constructor() {
    super({ key: 'ApartmentHallwayScene' });
  }

  preload() {
    // --- Load tilemap and assets ---
    this.load.tilemapTiledJSON('hallwayMap', 'maps/hallway1.tmj');
    this.load.image('hallwayTiles', 'tilesets/CityMap.png');
    this.load.spritesheet('player', 'kenney_toon-characters-1/Male adventurer/Tilesheet/character_maleAdventurer_sheet.png', {
      frameWidth: 96,
      frameHeight: 128
    });
    this.load.spritesheet('neighbor', 'kenney_toon-characters-1/Male person/Tilesheet/character_malePerson_sheet.png', {
      frameWidth: 96,
      frameHeight: 128
    });
  }

  create() {
    console.log("Game Started and Scene Created.");

    // --- Load map ---
    const map = this.make.tilemap({ key: 'hallwayMap' });
    console.log("Available layers:", map.layers.map(l => l.name));

    // --- Load tileset ---
    const tileset = map.addTilesetImage('CityMap', 'hallwayTiles');

    // --- Create map layers ---
    const floorAndWallsLayer = map.createLayer('Floors', tileset, 0, 0);
    const objectsLayer = map.createLayer('Objects', tileset, 0, 0);
    const walls = map.createLayer('Walls', tileset, 0, 0);

    // --- Enable collisions on walls ---
    walls.setCollisionByProperty({ collides: true });

    // --- Player & NPC setup ---
    this.player = this.physics.add.sprite(256, 240, 'player').setScale(0.3);
    this.neighbor = this.physics.add.sprite(320, 112, 'neighbor').setScale(0.3);
    this.neighbor.body.setImmovable(true);

    // --- Colliders ---
    this.physics.add.collider(this.player, walls);
    this.physics.add.collider(this.player, this.neighbor);

    // --- Camera setup ---
    this.cameras.main.startFollow(this.player, true);
    this.cameras.main.setZoom(2);

    // --- Dialogue setup ---
    this.neighbor.dialogueState = 'IDLE';
    this.helpText = this.add.text(0, 0, 'Hello, could you help me please!', {
      fontSize: '10px',
      fill: '#000000',
      padding: { x: 5, y: 3 },
      wordWrap: { width: 100 }
    }).setOrigin(0).setDepth(1);

    this.dialogueBox = this.add.graphics().setDepth(0);
    this.problemText = this.add.text(
      this.scale.width / 2,
      this.scale.height / 2,
      '',
      {
        fontSize: '14px',
        fill: '#fff',
        backgroundColor: '#000000c0',
        padding: { x: 10, y: 8 },
        wordWrap: { width: 250 },
        align: 'center'
      }
    ).setOrigin(0.5).setScrollFactor(0).setDepth(999).setVisible(false);

    // --- Animations & Input ---
    this.createAnimations();
    this.cursors = this.input.keyboard.createCursorKeys();
    this.interactKey = this.input.keyboard.addKey('Y');

    // --- EXIT ZONE ---
    const exitZone = this.add.zone(240, 32, 32, 32).setOrigin(0, 0);
    this.physics.world.enable(exitZone);
    exitZone.body.setAllowGravity(false);
    exitZone.body.setImmovable(true);
    exitZone.triggered = false;

    // --- Debug rectangle for exit zone ---
    const debugRect = this.add.graphics();
    debugRect.lineStyle(2, 0xff0000, 1);
    debugRect.strokeRect(exitZone.x, exitZone.y, exitZone.width, exitZone.height);

    // --- Overlap check for exit ---
    this.physics.add.overlap(this.player, exitZone, () => {
      if (!exitZone.triggered) {
        exitZone.triggered = true;
        console.log("Player hit exit zone!");
        this.scene.start('GameScene');
      }
    });

    // --- Debug collision visuals ---
    const debugGraphics = this.add.graphics().setAlpha(0.5);
    walls.renderDebug(debugGraphics, {
      tileColor: null,
      collidingTileColor: new Phaser.Display.Color(255, 0, 0, 200),
      faceColor: new Phaser.Display.Color(0, 255, 0, 200)
    });
  }

  // --- Animation setup ---
  createAnimations() {
    if (!this.anims.exists('left')) {
      this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('player', { start: 4, end: 5 }),
        frameRate: 10,
        repeat: -1
      });
    }

    if (!this.anims.exists('turn')) {
      this.anims.create({
        key: 'turn',
        frames: [{ key: 'player', frame: 0 }],
        frameRate: 20
      });
    }

    if (!this.anims.exists('right')) {
      this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('player', { start: 2, end: 3 }),
        frameRate: 10,
        repeat: -1
      });
    }
  }

  update() {
    this.handlePlayerMovement();
    this.handleDialogue();
  }

  // --- Player Movement ---
  handlePlayerMovement() {
    const speed = 160;
    let vx = 0, vy = 0;

    if (this.cursors.left.isDown) vx = -speed;
    else if (this.cursors.right.isDown) vx = speed;

    if (this.cursors.up.isDown) vy = -speed;
    else if (this.cursors.down.isDown) vy = speed;

    this.player.setVelocity(vx, vy);

    if (vx !== 0) this.player.anims.play(vx < 0 ? 'left' : 'right', true);
    else this.player.anims.play('turn');
  }

  // --- Dialogue System ---
  handleDialogue() {
    const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.neighbor.x, this.neighbor.y);
    const isClose = dist < 80;
    const idle = this.neighbor.dialogueState === 'IDLE';

    this.helpText.setVisible(idle && isClose);
    this.dialogueBox.setVisible(idle && isClose);

    if (idle && isClose) this.drawDialogueBox();

    if (Phaser.Input.Keyboard.JustDown(this.interactKey) && isClose && idle) {
      this.startDialogue();
    }
  }

  startDialogue() {
    console.log("Player said Yes! Starting dialogue...");
    this.neighbor.dialogueState = 'PROMPTED';
    this.helpText.setVisible(false);
    this.dialogueBox.setVisible(false);

    this.problemText.setText(
      "Oh, thank you! I've lost the key to my apartment and I'm locked out. Can you help me?"
    ).setVisible(true);

    this.time.delayedCall(2500, () => {
      this.problemText.setVisible(false);
      this.neighbor.dialogueState = 'BUSY';

      // Launch DialogueScene with choices
      this.scene.launch("DialogueScene", {
        message: "Oh, thank you! I've lost the key to my apartment and I'm locked out. Can you help me?",
        options: [
          { text: "Look under the nearby potted plant and continue helping him." },
          { text: "Yes, you can come inside." },
          { text: "No, I don’t trust you." },
          { text: "Sorry, I can't help right now." }
        ],
        onChoice: (choiceIndex) => {
          console.log("Player chose option", choiceIndex);

          // --- Virtue Points logic ---
          let points = 0;
          switch (choiceIndex) {
            case 0: points = 10; break;
            case 1: points = 15; break;
            case 2: points = -5; break;
            case 3: points = 0; break;
          }

          // Update global score
          const currentScore = this.registry.get('score') || 0;
          this.registry.set('score', currentScore + points);
          console.log("Updated Virtue Points:", this.registry.get('score'));

          // Resume scene after dialogue
          this.scene.resume();
          this.neighbor.dialogueState = 'IDLE';
        }
      });

      this.scene.pause();
    });
  }

  // --- Draws the floating dialogue bubble above NPC ---
  drawDialogueBox() {
    const tw = this.helpText.width;
    const th = this.helpText.height;
    const pad = 5;
    const tail = 5;
    const bw = tw + pad * 2;
    const bh = th + pad * 2;

    let x = this.neighbor.x - (bw / 2);
    let y = this.neighbor.y - 15 - bh - tail;

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
