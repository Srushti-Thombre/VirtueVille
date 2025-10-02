// ApartmentHallwayScene.js
import * as Phaser from "https://cdn.jsdelivr.net/npm/phaser@3.60.0/dist/phaser.esm.js";

class ApartmentHallwayScene extends Phaser.Scene {
    constructor() {
        super({ key: 'ApartmentHallwayScene' });
    }

    preload() {
        // Load assets
        this.load.tilemapTiledJSON('hallwayMap', 'maps/hallwaytilemap.tmj');
        this.load.image('hallwayTiles', 'tilesets/CityMap.png');
        this.load.spritesheet('player', 'kenney_toon-characters-1/Male adventurer/Tilesheet/character_maleAdventurer_sheet.png', { frameWidth: 96, frameHeight: 128 });
        this.load.spritesheet('neighbor', 'kenney_toon-characters-1/Male person/Tilesheet/character_malePerson_sheet.png', { frameWidth: 96, frameHeight: 128 });
    }

    create() {
        console.log("Game Started and Scene Created.");

        // Map setup
        const map = this.make.tilemap({ key: 'hallwayMap' });
        const tileset = map.addTilesetImage('kenny', 'hallwayTiles');
        const floorAndWallsLayer = map.createLayer('FloorAndWalls', tileset, 0, 0);
        map.createLayer('Objects', tileset, 0, 0);

        // Characters
        this.player = this.physics.add.sprite(256, 240, 'player').setScale(0.3);
        this.neighbor = this.physics.add.sprite(320, 112, 'neighbor').setScale(0.3);
        this.neighbor.body.setImmovable(true);

        // Collisions
        floorAndWallsLayer.setCollisionByProperty({ collides: true });
        this.physics.add.collider(this.player, floorAndWallsLayer);
        this.physics.add.collider(this.player, this.neighbor);

        // Camera
        this.cameras.main.startFollow(this.player, true);
        this.cameras.main.setZoom(2);

        // Dialogue state
        this.neighbor.dialogueState = 'IDLE';

        // NPC greeting (above head)
        this.helpText = this.add.text(0, 0, 'Hello, could you help me please!', {
            fontSize: '10px',
            fill: '#000000',
            padding: { x: 5, y: 3 },
            wordWrap: { width: 100 }
        }).setOrigin(0).setDepth(1);
        this.dialogueBox = this.add.graphics().setDepth(0);

        // Placeholder for problem text
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

        // Animations
        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('player', { start: 4, end: 5 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'turn',
            frames: [{ key: 'player', frame: 0 }],
            frameRate: 20
        });
        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('player', { start: 2, end: 3 }),
            frameRate: 10,
            repeat: -1
        });

        // Input
        this.cursors = this.input.keyboard.createCursorKeys();
        this.interactKey = this.input.keyboard.addKey('Y');
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

        if (vx !== 0) this.player.anims.play(vx < 0 ? 'left' : 'right', true);
        else this.player.anims.play('turn');
    }

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

        // Show problem text
        this.problemText.setText(
            "Oh, thank you! I've lost the key to my apartment and I'm locked out. Can you help me?"
        ).setVisible(true);

        // After delay, hide text & launch DialogueScene
        this.time.delayedCall(2500, () => {
            this.problemText.setVisible(false);

            console.log("Launching DialogueScene...");
            this.neighbor.dialogueState = 'BUSY';

            this.scene.launch("DialogueScene", {
                message: "Oh, thank you! I've lost the key to my apartment and I'm locked out. Can you help me?",
                options: [
                    { text: "Look under the nearby potted plant and contiue help him." },
                    { text: "Yes u can stay with come inside" },
                    { text: "No u cant come inside i dont trust u " },
                    { text: "Sorry, I can't help right now." }
                ],
                onChoice: (choiceIndex) => {
                    console.log("Player chose option", choiceIndex);
                    this.scene.resume(); // Resume hallway scene
                    this.neighbor.dialogueState = 'IDLE';
                }
            });
            this.scene.pause();
        });
    }

    drawDialogueBox() {
        const tw = this.helpText.width, th = this.helpText.height, pad = 5, tail = 5;
        const bw = tw + pad * 2, bh = th + pad * 2;
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
