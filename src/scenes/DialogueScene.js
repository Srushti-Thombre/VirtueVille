// DialogueScene.js
import * as Phaser from "https://cdn.jsdelivr.net/npm/phaser@3.60.0/dist/phaser.esm.js";
import { traits, saveProgress } from "../state/traits.js";
import { VirtueSystem } from "../state/VirtueSystem.js";
import { DilemmaStyles } from "../utils/dilemmaStyles.js";

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

    // Initialize virtue system
    VirtueSystem.initScene(this);

    // Bring this scene to the top to ensure visibility
    this.scene.bringToTop();

    // Dark overlay
    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.6);
    overlay.setDepth(5000);

    // Popup box
    const boxWidth = DilemmaStyles.modal.width;
    const boxHeight = DilemmaStyles.modal.height;
    const boxX = width / 2 - boxWidth / 2;
    const boxY = height / 2 - boxHeight / 2;

    const bg = this.add.graphics();
    bg.setDepth(5001);
    bg.fillStyle(DilemmaStyles.modal.backgroundColor, DilemmaStyles.modal.backgroundAlpha);
    bg.fillRoundedRect(boxX, boxY, boxWidth, boxHeight, DilemmaStyles.modal.borderRadius);
    bg.lineStyle(DilemmaStyles.modal.borderWidth, DilemmaStyles.modal.borderColor, 1);
    bg.strokeRoundedRect(boxX, boxY, boxWidth, boxHeight, DilemmaStyles.modal.borderRadius);

    // Title
    this.add
      .text(width / 2, boxY + 35, "Dialogue", DilemmaStyles.title)
      .setOrigin(0.5)
      .setDepth(5002);

    // Message
    this.add.text(boxX + 20, boxY + 80, this.message, DilemmaStyles.question)
    .setDepth(5002);

    // Options
    let y = boxY + 180;
    const optionGap = 50;
    this.options.forEach((opt, i) => {
      const optionText = this.add
        .text(boxX + 40, y, `${i + 1}. ${opt.text}`, DilemmaStyles.option)
        .setDepth(5003)
        .setInteractive({ useHandCursor: true })
        .on("pointerover", () => {
          optionText.setStyle(DilemmaStyles.optionHover);
        })
        .on("pointerout", () => {
          optionText.setStyle(DilemmaStyles.optionNormal);
        })
        .on("pointerdown", async () => {
          // Apply traits if present
          if (opt.traits) {
            for (let t in opt.traits) {
              traits[t] = (traits[t] || 0) + opt.traits[t];
            }
            await saveProgress();
          }

          // Award virtue points (recalculated from traits)
          VirtueSystem.awardPoints(
            this,
            0, // Not used anymore, calculated from traits
            opt.reason || "Choice made"
          );

          // Run callback if provided
          if (this.onChoice) this.onChoice(i);

          // Emit event for apartment task completion
          this.events.emit("dialogue-complete");

          // Close this scene and resume hallway
          this.scene.stop("DialogueScene");
          this.scene.resume("ApartmentHallwayScene"); // ✅ resume hallway
        });

      y += optionGap;
    });
  }
}
