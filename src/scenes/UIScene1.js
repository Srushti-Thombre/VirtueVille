// UIScene.js
import * as Phaser from "https://cdn.jsdelivr.net/npm/phaser@3.60.0/dist/phaser.esm.js";

class UIScene1 extends Phaser.Scene {
  constructor() {
    super({ key: "UIScene1" });
  }

  create() {
    console.log("UIScene1.create() called");

    // Enhanced UI with gradient background and shadow
    this.scoreBar = this.add.graphics();

    // Draw gradient background
    this.scoreBar.fillGradientStyle(0x4a148c, 0x4a148c, 0x7b1fa2, 0x7b1fa2, 1);
    this.scoreBar.fillRoundedRect(5, 5, 160, 40, 10);

    // Add border glow effect
    this.scoreBar.lineStyle(2, 0x9c27b0, 1);
    this.scoreBar.strokeRoundedRect(5, 5, 160, 40, 10);

    this.scoreBar.setScrollFactor(0);
    this.scoreBar.setDepth(1000);

    const initialScore = this.registry.get("score") || 0;
    console.log(" UIScene1.create() called");

    // Enhanced text with shadow and better styling
    this.scoreText = this.add.text(15, 15, `Virtue Points: ${initialScore}`, {
      fontFamily: "Poppins, Arial, sans-serif",
      fontSize: "16px",
      fill: "#ffffff",
      fontStyle: "bold",
      shadow: {
        offsetX: 2,
        offsetY: 2,
        color: "#000000",
        blur: 4,
        stroke: true,
        fill: true,
      },
    });
    this.scoreText.setScrollFactor(0);
    this.scoreText.setDepth(1001);

    // Add Character Change Button
    this.createCharacterButton();

    // Add Settings Button
    this.createSettingsButton();

    this.registry.events.on("changedata-score", this.updateScore, this);
    this.scene.bringToTop(); // bring UIScene graphics to top layer
  }

  createCharacterButton() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Position at bottom-left
    const buttonX = 10;
    const buttonY = height - 50;
    const buttonWidth = 170;
    const buttonHeight = 40;

    // Button background
    const buttonBg = this.add.graphics();
    buttonBg.fillGradientStyle(0x4a148c, 0x4a148c, 0x7b1fa2, 0x7b1fa2, 1);
    buttonBg.fillRoundedRect(buttonX, buttonY, buttonWidth, buttonHeight, 10);
    buttonBg.lineStyle(2, 0x9c27b0, 1);
    buttonBg.strokeRoundedRect(buttonX, buttonY, buttonWidth, buttonHeight, 10);
    buttonBg.setScrollFactor(0);
    buttonBg.setDepth(1000);
    buttonBg.setInteractive(
      new Phaser.Geom.Rectangle(buttonX, buttonY, buttonWidth, buttonHeight),
      Phaser.Geom.Rectangle.Contains
    );

    // Button text
    const buttonText = this.add
      .text(buttonX + buttonWidth / 2, buttonY + 10, "Change Character", {
        fontFamily: "Poppins, Arial, sans-serif",
        fontSize: "14px",
        fill: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5, 0)
      .setScrollFactor(0)
      .setDepth(1001);

    // Hover effects
    buttonBg.on("pointerover", () => {
      buttonBg.clear();
      buttonBg.fillGradientStyle(0x5a1a9c, 0x5a1a9c, 0x8b2fb2, 0x8b2fb2, 1);
      buttonBg.fillRoundedRect(buttonX, buttonY, buttonWidth, buttonHeight, 10);
      buttonBg.lineStyle(3, 0xba68c8, 1);
      buttonBg.strokeRoundedRect(
        buttonX,
        buttonY,
        buttonWidth,
        buttonHeight,
        10
      );
      buttonText.setStyle({ fill: "#ffd700" });
    });

    buttonBg.on("pointerout", () => {
      buttonBg.clear();
      buttonBg.fillGradientStyle(0x4a148c, 0x4a148c, 0x7b1fa2, 0x7b1fa2, 1);
      buttonBg.fillRoundedRect(buttonX, buttonY, buttonWidth, buttonHeight, 10);
      buttonBg.lineStyle(2, 0x9c27b0, 1);
      buttonBg.strokeRoundedRect(
        buttonX,
        buttonY,
        buttonWidth,
        buttonHeight,
        10
      );
      buttonText.setStyle({ fill: "#ffffff" });
    });

    // Click handler - Fixed to properly restart CharacterSelectionScene
    buttonBg.on("pointerdown", () => {
      console.log("✅ Change Character button clicked");

      // Stop CharacterSelectionScene if it's already running
      if (this.scene.isActive("CharacterSelectionScene")) {
        this.scene.stop("CharacterSelectionScene");
      }

      // Pause current game
      if (this.scene.isActive("GameScene")) {
        this.scene.pause("GameScene");
      }

      // Start character selection scene
      this.scene.start("CharacterSelectionScene");
      console.log("✅ Character selection scene started");
    });
  }

  createSettingsButton() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Position at bottom-left, next to character button
    const buttonX = 190;
    const buttonY = height - 50;
    const buttonSize = 40;

    // Settings button (gear icon background)
    const buttonBg = this.add.graphics();
    buttonBg.fillGradientStyle(0x4a148c, 0x4a148c, 0x7b1fa2, 0x7b1fa2, 1);
    buttonBg.fillRoundedRect(buttonX, buttonY, buttonSize, buttonSize, 10);
    buttonBg.lineStyle(2, 0x9c27b0, 1);
    buttonBg.strokeRoundedRect(buttonX, buttonY, buttonSize, buttonSize, 10);
    buttonBg.setScrollFactor(0);
    buttonBg.setDepth(1000);
    buttonBg.setInteractive(
      new Phaser.Geom.Rectangle(buttonX, buttonY, buttonSize, buttonSize),
      Phaser.Geom.Rectangle.Contains
    );

    // Settings icon (gear emoji)
    const buttonText = this.add
      .text(buttonX + buttonSize / 2, buttonY + buttonSize / 2, "⚙️", {
        fontSize: "24px",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(1001);

    // Hover effects
    buttonBg.on("pointerover", () => {
      buttonBg.clear();
      buttonBg.fillGradientStyle(0x5a1a9c, 0x5a1a9c, 0x8b2fb2, 0x8b2fb2, 1);
      buttonBg.fillRoundedRect(buttonX, buttonY, buttonSize, buttonSize, 10);
      buttonBg.lineStyle(3, 0xba68c8, 1);
      buttonBg.strokeRoundedRect(buttonX, buttonY, buttonSize, buttonSize, 10);

      this.tweens.add({
        targets: buttonText,
        angle: 90,
        duration: 200,
        ease: "Power2",
      });
    });

    buttonBg.on("pointerout", () => {
      buttonBg.clear();
      buttonBg.fillGradientStyle(0x4a148c, 0x4a148c, 0x7b1fa2, 0x7b1fa2, 1);
      buttonBg.fillRoundedRect(buttonX, buttonY, buttonSize, buttonSize, 10);
      buttonBg.lineStyle(2, 0x9c27b0, 1);
      buttonBg.strokeRoundedRect(buttonX, buttonY, buttonSize, buttonSize, 10);

      this.tweens.add({
        targets: buttonText,
        angle: 0,
        duration: 200,
        ease: "Power2",
      });
    });

    // Click handler
    buttonBg.on("pointerdown", () => {
      console.log("✅ Opening settings");

      // Stop SettingsScene if it's already running
      if (this.scene.isActive("SettingsScene")) {
        this.scene.stop("SettingsScene");
      }

      // Pause current game
      if (this.scene.isActive("GameScene")) {
        this.scene.pause("GameScene");
      }

      // Start settings scene
      this.scene.launch("SettingsScene");
      console.log("✅ Settings scene launched");
    });
  }

  updateScore(parent, value, previousValue) {
    this.scoreText.setText(`Virtue Points: ${value}`);

    // Add pulse animation when score changes
    if (value !== previousValue) {
      this.tweens.add({
        targets: this.scoreText,
        scaleX: 1.2,
        scaleY: 1.2,
        duration: 100,
        yoyo: true,
        ease: "Power2",
      });

      // Flash the background
      this.tweens.add({
        targets: this.scoreBar,
        alpha: 0.7,
        duration: 100,
        yoyo: true,
        ease: "Power2",
      });
    }
  }
}

export default UIScene1;
