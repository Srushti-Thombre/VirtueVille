import * as Phaser from "https://cdn.jsdelivr.net/npm/phaser@3.60.0/dist/phaser.esm.js";
import LibraryScene from "../scenes/LibraryScene.js";
import { traits, saveProgress, markTaskCompleted } from "../state/traits.js";
import GameScene from "./GameScene.js";
import { VirtueSystem } from "../state/VirtueSystem.js";

export default class SituationScene1 extends Phaser.Scene {
  constructor() {
    super("SituationScene1");
  }

  init(data) {
    this.message = data.message;
    this.options = data.options;
    this.taskId = data.taskId || "pocketTask"; // Default task ID
  }

  create() {
    const { width, height } = this.sys.game.config;

    // Initialize virtue system and ensure UI is running
    VirtueSystem.initScene(this);

    // --- Dark overlay background ---
    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.6);

    // --- Popup background box ---
    const boxWidth = 600;
    const boxHeight = 400;
    const boxX = width / 2 - boxWidth / 2;
    const boxY = height / 2 - boxHeight / 2;

    const popupBg = this.add.graphics();
    popupBg.fillStyle(0x222244, 0.95); // dark bluish
    popupBg.fillRoundedRect(boxX, boxY, boxWidth, boxHeight, 20);
    popupBg.lineStyle(4, 0xffffff, 1);
    popupBg.strokeRoundedRect(boxX, boxY, boxWidth, boxHeight, 20);

    // --- Title ---
    this.add
      .text(width / 2, boxY + 30, "Moral Dilemma", {
        fontSize: "24px",
        fontStyle: "bold",
        color: "#ffcc00",
      })
      .setOrigin(0.5);

    // --- Situation message ---
    this.add.text(boxX + 20, boxY + 70, this.message, {
      fontSize: "18px",
      color: "#ffffff",
      wordWrap: { width: boxWidth - 40 },
    });

    // --- Options ---
    let y = boxY + 160;
    this.options.forEach((opt, i) => {
      const optionText = this.add
        .text(boxX + 40, y, `${i + 1}. ${opt.text}`, {
          fontSize: "18px",
          color: "#00e6e6",
          backgroundColor: "#333355",
          padding: { left: 10, right: 10, top: 5, bottom: 5 },
        })
        .setInteractive({ useHandCursor: true })
        .on("pointerover", () => {
          optionText.setStyle({ color: "#ffffff", backgroundColor: "#444477" });
        })
        .on("pointerout", () => {
          optionText.setStyle({ color: "#00e6e6", backgroundColor: "#333355" });
        })
        .on("pointerdown", async () => {
          console.log('SituationScene1: option selected ->', opt);

          // Apply traits if present
          if (opt.traits) {
            for (let t in opt.traits) {
              traits[t] = (traits[t] || 0) + opt.traits[t];
            }
            await saveProgress();
          }

          // Mark this task as completed
          await markTaskCompleted(this.taskId);

          // Award virtue points if defined
          if (typeof opt.points !== "undefined") {
            console.log(`SituationScene1: awarding ${opt.points} points for reason: ${opt.reason}`);
            VirtueSystem.awardPoints(this, opt.points, opt.reason || "Choice made");
          }

          // Close popup and resume PocketScene
          this.scene.stop("SituationScene1"); // stop popup
          this.scene.resume("PocketScene");   // resume main gameplay
        });

      y += 50;
    });
  }
}
