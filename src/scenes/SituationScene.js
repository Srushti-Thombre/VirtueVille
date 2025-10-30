import * as Phaser from "https://cdn.jsdelivr.net/npm/phaser@3.60.0/dist/phaser.esm.js";
import { VirtueSystem } from "../state/VirtueSystem.js";
import { traits, saveProgress, markTaskCompleted } from "../state/traits.js";
import LibraryScene from "../scenes/LibraryScene.js";
import GameScene from "./PocketScene.js";
import { DilemmaStyles } from "../utils/dilemmaStyles.js";

export default class SituationScene extends Phaser.Scene {
  constructor() {
    super("SituationScene");
  }

  init(data) {
    this.message = data.message;
    this.options = data.options;
    this.previousScene = data.previousScene || "LibraryScene";
    this.taskId = data.taskId || "libraryTask"; // Add task ID
    this.previousScene = data.previousScene || "LibraryScene"; // Add previous scene
  }

  create() {
    const { width, height } = this.sys.game.config;

    // Initialize virtue system and ensure UI is running
    VirtueSystem.initScene(this);

    // Bring this scene to the top to ensure visibility
    this.scene.bringToTop();

    // --- Dark overlay background ---
    const overlay = this.add.rectangle(
      width / 2,
      height / 2,
      width,
      height,
      0x000000,
      0.6
    );
    overlay.setDepth(5000);

    // --- Popup background box ---
    const boxWidth = DilemmaStyles.modal.width;
    const boxHeight = DilemmaStyles.modal.height;
    const boxX = width / 2 - boxWidth / 2;
    const boxY = height / 2 - boxHeight / 2;

    const popupBg = this.add.graphics();
    popupBg.setDepth(5001);
    popupBg.fillStyle(DilemmaStyles.modal.backgroundColor, DilemmaStyles.modal.backgroundAlpha);
    popupBg.fillRoundedRect(boxX, boxY, boxWidth, boxHeight, DilemmaStyles.modal.borderRadius);
    popupBg.lineStyle(DilemmaStyles.modal.borderWidth, DilemmaStyles.modal.borderColor, 1);
    popupBg.strokeRoundedRect(boxX, boxY, boxWidth, boxHeight, DilemmaStyles.modal.borderRadius);

    // --- Title ---
    this.add
      .text(width / 2, boxY + 35, "Moral Dilemma", DilemmaStyles.title)
      .setOrigin(0.5)
      .setDepth(5002);

    // --- Situation message ---
    this.add
      .text(boxX + 20, boxY + 80, this.message, DilemmaStyles.question)
      .setDepth(5002);

    // --- Options ---
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

          // Debug: log selected option
          console.log("SituationScene: option selected ->", opt);

          // Award virtue points (recalculated from traits)
          VirtueSystem.awardPoints(
            this,
            0, // Not used anymore, calculated from traits
            opt.reason || "Choice made"
          );

          // Mark this task as completed
          await markTaskCompleted(this.taskId);

          // Resume previous scene (fallback to LibraryScene)
          const prev = this.previousScene || "LibraryScene";
          if (this.scene.get(prev)) {
            this.scene.resume(prev);
          }

          // Close this popup
          this.scene.stop("SituationScene");
        });

      y += optionGap;
    });
  }
}
