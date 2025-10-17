// UIScene.js
import * as Phaser from "https://cdn.jsdelivr.net/npm/phaser@3.60.0/dist/phaser.esm.js";

class UIScene1 extends Phaser.Scene {
    constructor() {
        super({ key: 'UIScene1' });
    }

    create() {
         console.log("UIScene1.create() called");
         // Debug rectangle for visibility
        this.debugRect = this.add.rectangle(50, 50, 50, 50, 0xff0000)
            .setScrollFactor(0)
            .setDepth(1000); // Make sure it's on top
        this.scoreBar = this.add.graphics();
        this.scoreBar.fillStyle(0x000000, 0.7);
        this.scoreBar.fillRect(5, 5, 140, 30);
        this.scoreBar.setScrollFactor(0);

        const initialScore = this.registry.get('score') || 0;
         console.log(" UIScene1.create() called");
        this.scoreText = this.add.text(15, 10, `Virtue Points: ${initialScore}`, { fontSize: '16px', fill: '#ffffff' });
        this.scoreText.setScrollFactor(0);

        this.registry.events.on('changedata-score', this.updateScore, this);
        this.scene.bringToTop();  // bring UIScene graphics to top layer

    }

    updateScore(parent, value, previousValue) {
        this.scoreText.setText(`Virtue Points: ${value}`);
    }
}

export default UIScene1;