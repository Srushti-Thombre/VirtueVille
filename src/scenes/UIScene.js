// UIScene.js
import * as Phaser from "https://cdn.jsdelivr.net/npm/phaser@3.60.0/dist/phaser.esm.js";

class UIScene extends Phaser.Scene {
    constructor() {
        super({ key: 'UIScene' });
    }

    create() {
        this.scoreBar = this.add.graphics();
        this.scoreBar.fillStyle(0x000000, 0.7);
        this.scoreBar.fillRect(5, 5, 140, 30);
        this.scoreBar.setScrollFactor(0);

        const initialScore = this.registry.get('score') || 0;
        this.scoreText = this.add.text(15, 10, `Virtue Points: ${initialScore}`, { fontSize: '16px', fill: '#ffffff' });
        this.scoreText.setScrollFactor(0);

        this.registry.events.on('changedata-score', this.updateScore, this);
    }

    updateScore(parent, value, previousValue) {
        this.scoreText.setText(`Virtue Points: ${value}`);
    }
}

export default UIScene;