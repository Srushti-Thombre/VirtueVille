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

    // Add Help Button
    this.createHelpButton();

    // Add Dashboard Button
    this.createDashboardButton();

    // Add Logout Button
    this.createLogoutButton();

    this.createLessonsButton();

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

      // Stop if already running
      if (this.scene.isActive("CharacterSelectionScene")) {
        this.scene.stop("CharacterSelectionScene");
      }

      // Launch character selection scene with flag indicating mid-game change
      this.scene.launch("CharacterSelectionScene", { midGameChange: true });

      // Bring it to the top so it's visible
      this.scene.bringToTop("CharacterSelectionScene");

      console.log("✅ Character selection scene launched and brought to top");
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

  createHelpButton() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Position at bottom-left, next to settings button
    const buttonX = 240;
    const buttonY = height - 50;
    const buttonSize = 40;

    // Help button background
    const buttonBg = this.add.graphics();
    buttonBg.fillGradientStyle(0x1976d2, 0x1976d2, 0x2196f3, 0x2196f3, 1);
    buttonBg.fillRoundedRect(buttonX, buttonY, buttonSize, buttonSize, 10);
    buttonBg.lineStyle(2, 0x42a5f5, 1);
    buttonBg.strokeRoundedRect(buttonX, buttonY, buttonSize, buttonSize, 10);
    buttonBg.setScrollFactor(0);
    buttonBg.setDepth(1000);
    buttonBg.setInteractive(
      new Phaser.Geom.Rectangle(buttonX, buttonY, buttonSize, buttonSize),
      Phaser.Geom.Rectangle.Contains
    );

    // Help icon (question mark)
    const buttonText = this.add
      .text(buttonX + buttonSize / 2, buttonY + buttonSize / 2, "❓", {
        fontSize: "24px",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(1001);

    // Hover effects
    buttonBg.on("pointerover", () => {
      buttonBg.clear();
      buttonBg.fillGradientStyle(0x2186c2, 0x2186c2, 0x31a6f3, 0x31a6f3, 1);
      buttonBg.fillRoundedRect(buttonX, buttonY, buttonSize, buttonSize, 10);
      buttonBg.lineStyle(3, 0x64b5f6, 1);
      buttonBg.strokeRoundedRect(buttonX, buttonY, buttonSize, buttonSize, 10);

      this.tweens.add({
        targets: buttonText,
        scale: 1.2,
        duration: 200,
        ease: "Back.easeOut",
      });
    });

    buttonBg.on("pointerout", () => {
      buttonBg.clear();
      buttonBg.fillGradientStyle(0x1976d2, 0x1976d2, 0x2196f3, 0x2196f3, 1);
      buttonBg.fillRoundedRect(buttonX, buttonY, buttonSize, buttonSize, 10);
      buttonBg.lineStyle(2, 0x42a5f5, 1);
      buttonBg.strokeRoundedRect(buttonX, buttonY, buttonSize, buttonSize, 10);

      this.tweens.add({
        targets: buttonText,
        scale: 1,
        duration: 200,
        ease: "Back.easeIn",
      });
    });

    // Click handler - Show help panel
    buttonBg.on("pointerdown", () => {
      this.showHelpPanel();
    });

    this.helpPanel = null; // Store reference to help panel
  }

  showHelpPanel() {
    // If panel already exists, remove it
    if (this.helpPanel) {
      this.helpPanel.destroy();
      this.helpPanel = null;
      return;
    }

    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Create container for help panel
    this.helpPanel = this.add.container(width / 2, height / 2);
    this.helpPanel.setScrollFactor(0);
    this.helpPanel.setDepth(2000);

    // Semi-transparent background overlay
    const overlay = this.add
      .rectangle(0, 0, width, height, 0x000000, 0.7)
      .setOrigin(0.5)
      .setInteractive();

    // Panel background
    const panelWidth = Math.min(650, width - 60);
    const panelHeight = Math.min(550, height - 60);
    const panel = this.add.graphics();
    panel.fillStyle(0x1a1a2e, 1);
    panel.fillRoundedRect(
      -panelWidth / 2,
      -panelHeight / 2,
      panelWidth,
      panelHeight,
      15
    );
    panel.lineStyle(4, 0x3498db, 1);
    panel.strokeRoundedRect(
      -panelWidth / 2,
      -panelHeight / 2,
      panelWidth,
      panelHeight,
      15
    );

    // Title
    const title = this.add
      .text(0, -panelHeight / 2 + 35, "📖 How to Play VirtueVille", {
        fontSize: "32px",
        fontFamily: "Arial, sans-serif",
        fill: "#FFD700",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    // Divider line
    const divider = this.add.graphics();
    divider.lineStyle(2, 0x3498db, 0.5);
    divider.lineBetween(
      -panelWidth / 2 + 40,
      -panelHeight / 2 + 65,
      panelWidth / 2 - 40,
      -panelHeight / 2 + 65
    );

    // Help content - using separate text objects for better layout
    const yStart = -panelHeight / 2 + 90;
    const leftMargin = -panelWidth / 2 + 40;

    // Controls section
    const controlsTitle = this.add
      .text(leftMargin, yStart, "🎮 CONTROLS:", {
        fontSize: "18px",
        fontFamily: "Arial, sans-serif",
        fill: "#3498db",
        fontStyle: "bold",
      })
      .setOrigin(0);

    const controlsText = this.add
      .text(leftMargin + 20, yStart + 25, "Arrow Keys - Move your character", {
        fontSize: "15px",
        fontFamily: "Arial, sans-serif",
        fill: "#FFFFFF",
      })
      .setOrigin(0);

    // Objective section
    const objectiveTitle = this.add
      .text(leftMargin, yStart + 60, "🎯 OBJECTIVE:", {
        fontSize: "18px",
        fontFamily: "Arial, sans-serif",
        fill: "#3498db",
        fontStyle: "bold",
      })
      .setOrigin(0);

    const objectiveText = this.add
      .text(
        leftMargin + 20,
        yStart + 85,
        "Explore the city and help people in need\nComplete tasks to earn Virtue Points",
        {
          fontSize: "15px",
          fontFamily: "Arial, sans-serif",
          fill: "#FFFFFF",
          lineSpacing: 5,
        }
      )
      .setOrigin(0);

    // Task locations section
    const locationsTitle = this.add
      .text(leftMargin, yStart + 140, "📍 TASK LOCATIONS:", {
        fontSize: "18px",
        fontFamily: "Arial, sans-serif",
        fill: "#3498db",
        fontStyle: "bold",
      })
      .setOrigin(0);

    const locationsText = this.add
      .text(
        leftMargin + 20,
        yStart + 165,
        "• Library - Help return a found book\n" +
          "• Cafe - Help a man without his wallet\n" +
          "• Garden - Help kids resolve a conflict\n" +
          "• Apartments - Help neighbor find their key\n" +
          "• Parking Lot - Complete special task",
        {
          fontSize: "15px",
          fontFamily: "Arial, sans-serif",
          fill: "#FFFFFF",
          lineSpacing: 6,
        }
      )
      .setOrigin(0);

    // Virtue points section
    const virtueTitle = this.add
      .text(leftMargin, yStart + 280, "⭐ VIRTUE POINTS:", {
        fontSize: "18px",
        fontFamily: "Arial, sans-serif",
        fill: "#3498db",
        fontStyle: "bold",
      })
      .setOrigin(0);

    const virtueText = this.add
      .text(
        leftMargin + 20,
        yStart + 305,
        "• Helpful choices = More points\n" +
          "• Selfish choices = Fewer points\n" +
          "• Your choices matter!",
        {
          fontSize: "15px",
          fontFamily: "Arial, sans-serif",
          fill: "#FFFFFF",
          lineSpacing: 6,
        }
      )
      .setOrigin(0);

    // Tip section
    const tipText = this.add
      .text(
        0,
        panelHeight / 2 - 90,
        "💡 TIP: Walk near buildings to trigger tasks",
        {
          fontSize: "16px",
          fontFamily: "Arial, sans-serif",
          fill: "#FFD700",
          fontStyle: "italic",
        }
      )
      .setOrigin(0.5);

    // Close button
    const closeButton = this.add
      .text(0, panelHeight / 2 - 40, "Close [X]", {
        fontSize: "20px",
        fontFamily: "Arial, sans-serif",
        fill: "#FFFFFF",
        backgroundColor: "#e74c3c",
        padding: { x: 20, y: 10 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    closeButton.on("pointerover", () => {
      closeButton.setStyle({ backgroundColor: "#c0392b" });
    });

    closeButton.on("pointerout", () => {
      closeButton.setStyle({ backgroundColor: "#e74c3c" });
    });

    closeButton.on("pointerdown", () => {
      this.helpPanel.destroy();
      this.helpPanel = null;
    });

    // Click overlay to close
    overlay.on("pointerdown", () => {
      this.helpPanel.destroy();
      this.helpPanel = null;
    });

    // Add all elements to container
    this.helpPanel.add([
      overlay,
      panel,
      divider,
      title,
      controlsTitle,
      controlsText,
      objectiveTitle,
      objectiveText,
      locationsTitle,
      locationsText,
      virtueTitle,
      virtueText,
      tipText,
      closeButton,
    ]);

    // Entrance animation
    this.helpPanel.setScale(0.8);
    this.helpPanel.setAlpha(0);
    this.tweens.add({
      targets: this.helpPanel,
      scale: 1,
      alpha: 1,
      duration: 300,
      ease: "Back.easeOut",
    });
  }

  createDashboardButton() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Position at bottom-left, next to help button
    const buttonX = 290;
    const buttonY = height - 50;
    const buttonWidth = 120;
    const buttonHeight = 40;

    // Dashboard button background
    const buttonBg = this.add.graphics();
    buttonBg.fillGradientStyle(0x16a085, 0x16a085, 0x1abc9c, 0x1abc9c, 1);
    buttonBg.fillRoundedRect(buttonX, buttonY, buttonWidth, buttonHeight, 10);
    buttonBg.lineStyle(2, 0x2ecc71, 1);
    buttonBg.strokeRoundedRect(buttonX, buttonY, buttonWidth, buttonHeight, 10);
    buttonBg.setScrollFactor(0);
    buttonBg.setDepth(1000);
    buttonBg.setInteractive(
      new Phaser.Geom.Rectangle(buttonX, buttonY, buttonWidth, buttonHeight),
      Phaser.Geom.Rectangle.Contains
    );

    // Button text
    const buttonText = this.add
      .text(buttonX + buttonWidth / 2, buttonY + 10, "📊 Dashboard", {
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
      buttonBg.fillGradientStyle(0x1fb896, 0x1fb896, 0x26d9ab, 0x26d9ab, 1);
      buttonBg.fillRoundedRect(buttonX, buttonY, buttonWidth, buttonHeight, 10);
      buttonBg.lineStyle(3, 0x3be9c1, 1);
      buttonBg.strokeRoundedRect(
        buttonX,
        buttonY,
        buttonWidth,
        buttonHeight,
        10
      );

      this.tweens.add({
        targets: buttonText,
        scale: 1.1,
        duration: 200,
        ease: "Back.easeOut",
      });
    });

    buttonBg.on("pointerout", () => {
      buttonBg.clear();
      buttonBg.fillGradientStyle(0x16a085, 0x16a085, 0x1abc9c, 0x1abc9c, 1);
      buttonBg.fillRoundedRect(buttonX, buttonY, buttonWidth, buttonHeight, 10);
      buttonBg.lineStyle(2, 0x2ecc71, 1);
      buttonBg.strokeRoundedRect(
        buttonX,
        buttonY,
        buttonWidth,
        buttonHeight,
        10
      );

      this.tweens.add({
        targets: buttonText,
        scale: 1,
        duration: 200,
        ease: "Back.easeIn",
      });
    });

    // Click handler - Open dashboard in new tab
    buttonBg.on("pointerdown", () => {
      console.log("✅ Opening dashboard");
      window.open("/dashboard.html", "_blank");
    });
  }

  createLogoutButton() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Position next to dashboard button
    const buttonX = 420;
    const buttonY = height - 50;
    const buttonWidth = 100;
    const buttonHeight = 40;

    // Logout button background
    const buttonBg = this.add.graphics();
    buttonBg.fillGradientStyle(0xc0392b, 0xc0392b, 0xe74c3c, 0xe74c3c, 1);
    buttonBg.fillRoundedRect(buttonX, buttonY, buttonWidth, buttonHeight, 10);
    buttonBg.lineStyle(2, 0xe67e73, 1);
    buttonBg.strokeRoundedRect(buttonX, buttonY, buttonWidth, buttonHeight, 10);
    buttonBg.setScrollFactor(0);
    buttonBg.setDepth(1000);
    buttonBg.setInteractive(
      new Phaser.Geom.Rectangle(buttonX, buttonY, buttonWidth, buttonHeight),
      Phaser.Geom.Rectangle.Contains
    );

    // Button text
    const buttonText = this.add
      .text(buttonX + buttonWidth / 2, buttonY + 10, "🚪 Logout", {
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
      buttonBg.fillGradientStyle(0xd44637, 0xd44637, 0xf15b4d, 0xf15b4d, 1);
      buttonBg.fillRoundedRect(buttonX, buttonY, buttonWidth, buttonHeight, 10);
      buttonBg.lineStyle(3, 0xf39c8f, 1);
      buttonBg.strokeRoundedRect(
        buttonX,
        buttonY,
        buttonWidth,
        buttonHeight,
        10
      );

      this.tweens.add({
        targets: buttonText,
        scale: 1.1,
        duration: 200,
        ease: "Back.easeOut",
      });
    });

    buttonBg.on("pointerout", () => {
      buttonBg.clear();
      buttonBg.fillGradientStyle(0xc0392b, 0xc0392b, 0xe74c3c, 0xe74c3c, 1);
      buttonBg.fillRoundedRect(buttonX, buttonY, buttonWidth, buttonHeight, 10);
      buttonBg.lineStyle(2, 0xe67e73, 1);
      buttonBg.strokeRoundedRect(
        buttonX,
        buttonY,
        buttonWidth,
        buttonHeight,
        10
      );

      this.tweens.add({
        targets: buttonText,
        scale: 1,
        duration: 200,
        ease: "Back.easeIn",
      });
    });

    // Click handler - Logout with confirmation
    buttonBg.on("pointerdown", async () => {
      const confirmLogout = confirm("Are you sure you want to logout?");
      if (confirmLogout) {
        try {
          console.log("✅ Logging out...");
          const response = await fetch("/api/logout", {
            method: "POST",
            credentials: "same-origin",
          });

          if (response.ok) {
            // Clear local storage
            localStorage.removeItem("virtueVille_user");
            localStorage.removeItem("virtueVille_save");

            // Redirect to login page
            window.location.href = "/auth.html";
          } else {
            alert("Failed to logout. Please try again.");
          }
        } catch (error) {
          console.error("Logout error:", error);
          alert("Failed to logout. Please try again.");
        }
      }
    });
  }
  createLessonsButton() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Position next to Dashboard button
    const buttonX = 420 + 110; // right after Logout button
    const buttonY = height - 50;
    const buttonWidth = 120;
    const buttonHeight = 40;

    // Button background
    const buttonBg = this.add.graphics();
    buttonBg.fillGradientStyle(0x673ab7, 0x673ab7, 0x9575cd, 0x9575cd, 1);
    buttonBg.fillRoundedRect(buttonX, buttonY, buttonWidth, buttonHeight, 10);
    buttonBg.lineStyle(2, 0xb39ddb, 1);
    buttonBg.strokeRoundedRect(buttonX, buttonY, buttonWidth, buttonHeight, 10);
    buttonBg.setScrollFactor(0);
    buttonBg.setDepth(1000);
    buttonBg.setInteractive(
      new Phaser.Geom.Rectangle(buttonX, buttonY, buttonWidth, buttonHeight),
      Phaser.Geom.Rectangle.Contains
    );

    // Button text
    const buttonText = this.add
      .text(buttonX + buttonWidth / 2, buttonY + 10, "🎥 Lessons", {
        fontFamily: "Poppins, Arial, sans-serif",
        fontSize: "14px",
        fill: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5, 0)
      .setScrollFactor(0)
      .setDepth(1001);

    // Hover effect
    buttonBg.on("pointerover", () => {
      buttonBg.clear();
      buttonBg.fillGradientStyle(0x7e57c2, 0x7e57c2, 0xb388ff, 0xb388ff, 1);
      buttonBg.fillRoundedRect(buttonX, buttonY, buttonWidth, buttonHeight, 10);
      buttonBg.lineStyle(3, 0xd1c4e9, 1);
      buttonBg.strokeRoundedRect(
        buttonX,
        buttonY,
        buttonWidth,
        buttonHeight,
        10
      );

      this.tweens.add({
        targets: buttonText,
        scale: 1.1,
        duration: 200,
        ease: "Back.easeOut",
      });
    });

    buttonBg.on("pointerout", () => {
      buttonBg.clear();
      buttonBg.fillGradientStyle(0x673ab7, 0x673ab7, 0x9575cd, 0x9575cd, 1);
      buttonBg.fillRoundedRect(buttonX, buttonY, buttonWidth, buttonHeight, 10);
      buttonBg.lineStyle(2, 0xb39ddb, 1);
      buttonBg.strokeRoundedRect(
        buttonX,
        buttonY,
        buttonWidth,
        buttonHeight,
        10
      );

      this.tweens.add({
        targets: buttonText,
        scale: 1,
        duration: 200,
        ease: "Back.easeIn",
      });
    });

    // Click handler - open lessons page
    buttonBg.on("pointerdown", () => {
      console.log("✅ Opening lessons page");
      window.open("view/lessons.html", "_blank"); // Or "_self" for same tab
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
