// DialogueScene.js
import * as Phaser from "https://cdn.jsdelivr.net/npm/phaser@3.60.0/dist/phaser.esm.js";

export default class DialogueScene extends Phaser.Scene {
  constructor() {
    super("DialogueScene");
  }

  init(data) {
    console.log("DialogueScene init data:", data); // ✅ debug
    this.message = data.message || "No message received!";
    this.options = data.options || [];
    this.onChoice = data.onChoice || null;
  }

  create() {
    const { width, height } = this.sys.game.config;
    console.log("DialogueScene dimensions:", width, height);

    // Dark overlay
    //this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.6);
    this.add.rectangle(200, 200, 100, 100, 0xff0000);

    // Popup box
    const boxWidth = 500, boxHeight = 300;
    const boxX = width / 2 - boxWidth / 2;
    const boxY = height / 2 - boxHeight / 2;

    const bg = this.add.graphics();
    bg.fillStyle(0x222244, 0.95);
    bg.fillRoundedRect(boxX, boxY, boxWidth, boxHeight, 15);
    bg.lineStyle(3, 0xffffff, 1);
    bg.strokeRoundedRect(boxX, boxY, boxWidth, boxHeight, 15);

    // Title
    this.add.text(width / 2, boxY + 25, "Dialogue", {
      fontSize: "22px",
      color: "#ffcc00",
      fontStyle: "bold"
    }).setOrigin(0.5);

    // Message
    this.add.text(boxX + 20, boxY + 60, this.message, {
      fontSize: "16px",
      color: "#ffffff",
      wordWrap: { width: boxWidth - 40 }
    });

    // Options
    let y = boxY + 140;
    this.options.forEach((opt, i) => {
      const optionText = this.add.text(boxX + 40, y, `${i + 1}. ${opt.text}`, {
        fontSize: "16px",
        color: "#00e6e6",
        backgroundColor: "#333355",
        padding: { left: 10, right: 10, top: 5, bottom: 5 }
      })
      .setInteractive({ useHandCursor: true })
      .on("pointerover", () => {
        optionText.setStyle({ color: "#ffffff", backgroundColor: "#444477" });
      })
      .on("pointerout", () => {
        optionText.setStyle({ color: "#00e6e6", backgroundColor: "#333355" });
      })
      .on("pointerdown", () => {
        // Run callback if provided
        if (this.onChoice) this.onChoice(i);
        // Close this scene and resume hallway
        this.scene.stop("DialogueScene");
        this.scene.resume("ApartmentHallwayScene"); // ✅ resume hallway
      });

      y += 50;
    });
  }
}
