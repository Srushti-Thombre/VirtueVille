import * as Phaser from "https://cdn.jsdelivr.net/npm/phaser@3.60.0/dist/phaser.esm.js";

export default class TutorialScene extends Phaser.Scene {
  constructor() {
    super({ key: "TutorialScene" });
    this.currentSlide = 0;
    this.totalSlides = 3;
  }

  create() {
    const { width, height } = this.cameras.main;

    // Semi-transparent background overlay
    this.add
      .rectangle(0, 0, width, height, 0x000000, 0.85)
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(1000);

    // Tutorial container
    this.tutorialContainer = this.add.container(width / 2, height / 2);
    this.tutorialContainer.setDepth(1001);

    // Create all slides
    this.createSlide1();
    this.createSlide2();
    this.createSlide3();

    // Navigation buttons (create before showing slides)
    this.createNavigationButtons();

    // Skip button
    this.createSkipButton();

    // Show first slide (after all UI is created)
    this.showSlide(0);
  }

  createSlide1() {
    this.slide1 = this.add.container(0, 0);

    // Title
    const title = this.add
      .text(0, -200, "🎮 Welcome to VirtueVille!", {
        fontSize: "48px",
        fontFamily: "Arial, sans-serif",
        fill: "#FFD700",
        fontStyle: "bold",
        align: "center",
      })
      .setOrigin(0.5);

    // Main content
    const content = this.add
      .text(
        0,
        -50,
        "A character-building game where your choices matter!\n\n" +
          "Explore the city, help people in need,\n" +
          "and earn Virtue Points for making good decisions.",
        {
          fontSize: "24px",
          fontFamily: "Arial, sans-serif",
          fill: "#FFFFFF",
          align: "center",
          lineSpacing: 10,
        }
      )
      .setOrigin(0.5);

    // Icon/Visual
    const icon = this.add
      .text(0, 100, "🏙️", {
        fontSize: "80px",
      })
      .setOrigin(0.5);

    this.slide1.add([title, content, icon]);
    this.tutorialContainer.add(this.slide1);
  }

  createSlide2() {
    this.slide2 = this.add.container(0, 0);

    // Title
    const title = this.add
      .text(0, -200, "🎯 How to Play", {
        fontSize: "48px",
        fontFamily: "Arial, sans-serif",
        fill: "#FFD700",
        fontStyle: "bold",
        align: "center",
      })
      .setOrigin(0.5);

    // Controls section
    const controlsTitle = this.add
      .text(0, -100, "Movement Controls:", {
        fontSize: "28px",
        fontFamily: "Arial, sans-serif",
        fill: "#00FF00",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    const controls = this.add
      .text(
        0,
        -40,
        "⬆️  ↑ Arrow - Move Up\n" +
        "⬇️  ↓ Arrow - Move Down\n" +
        "⬅️  ← Arrow - Move Left\n" +
        "➡️  → Arrow - Move Right",
        {
          fontSize: "20px",
          fontFamily: "Arial, sans-serif",
          fill: "#FFFFFF",
          align: "center",
          lineSpacing: 8,
        }
      )
      .setOrigin(0.5);

    // Interaction tip
    const tip = this.add
      .text(
        0,
        100,
        "💡 Walk near buildings and people to interact!\n" +
          "Look for glowing areas and NPCs who need help.",
        {
          fontSize: "18px",
          fontFamily: "Arial, sans-serif",
          fill: "#FFFF00",
          align: "center",
          lineSpacing: 8,
        }
      )
      .setOrigin(0.5);

    this.slide2.add([title, controlsTitle, controls, tip]);
    this.tutorialContainer.add(this.slide2);
  }

  createSlide3() {
    this.slide3 = this.add.container(0, 0);

    // Title
    const title = this.add
      .text(0, -200, "⭐ Virtue Points System", {
        fontSize: "48px",
        fontFamily: "Arial, sans-serif",
        fill: "#FFD700",
        fontStyle: "bold",
        align: "center",
      })
      .setOrigin(0.5);

    // Content
    const content = this.add
      .text(
        0,
        -80,
        "Complete tasks by helping people in need.\n" +
          "Each choice you make affects your Virtue Points:\n\n" +
          "✅ Helpful actions = More points\n" +
          "⚠️ Selfish actions = Fewer points\n" +
          "❌ Ignoring people = Lost points",
        {
          fontSize: "22px",
          fontFamily: "Arial, sans-serif",
          fill: "#FFFFFF",
          align: "center",
          lineSpacing: 10,
        }
      )
      .setOrigin(0.5);

    // Locations hint
    const locations = this.add
      .text(
        0,
        100,
        "📍 Task Locations:\n" +
          "Library • Cafe • Garden • Apartments • Parking Lot",
        {
          fontSize: "20px",
          fontFamily: "Arial, sans-serif",
          fill: "#00FFFF",
          align: "center",
          lineSpacing: 8,
        }
      )
      .setOrigin(0.5);

    const readyText = this.add
      .text(0, 180, "Ready to make a difference? 🌟", {
        fontSize: "24px",
        fontFamily: "Arial, sans-serif",
        fill: "#FFD700",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    this.slide3.add([title, content, locations, readyText]);
    this.tutorialContainer.add(this.slide3);
  }

  createNavigationButtons() {
    const { width, height } = this.cameras.main;

    // Previous button
    this.prevButton = this.add
      .text(width / 2 - 200, height - 100, "◀ Previous", {
        fontSize: "24px",
        fontFamily: "Arial, sans-serif",
        fill: "#FFFFFF",
        backgroundColor: "#333333",
        padding: { x: 20, y: 10 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .setDepth(1002);

    this.prevButton.on("pointerdown", () => this.previousSlide());
    this.prevButton.on("pointerover", () =>
      this.prevButton.setStyle({ fill: "#FFD700" })
    );
    this.prevButton.on("pointerout", () =>
      this.prevButton.setStyle({ fill: "#FFFFFF" })
    );

    // Next/Start button
    this.nextButton = this.add
      .text(width / 2 + 200, height - 100, "Next ▶", {
        fontSize: "24px",
        fontFamily: "Arial, sans-serif",
        fill: "#FFFFFF",
        backgroundColor: "#4CAF50",
        padding: { x: 20, y: 10 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .setDepth(1002);

    this.nextButton.on("pointerdown", () => this.nextSlide());
    this.nextButton.on("pointerover", () =>
      this.nextButton.setStyle({ backgroundColor: "#45a049" })
    );
    this.nextButton.on("pointerout", () =>
      this.nextButton.setStyle({ backgroundColor: "#4CAF50" })
    );

    // Slide indicator
    this.slideIndicator = this.add
      .text(width / 2, height - 100, "1 / 3", {
        fontSize: "20px",
        fontFamily: "Arial, sans-serif",
        fill: "#AAAAAA",
      })
      .setOrigin(0.5)
      .setDepth(1002);
  }

  createSkipButton() {
    const { width } = this.cameras.main;

    this.skipButton = this.add
      .text(width - 100, 50, "Skip Tutorial ✕", {
        fontSize: "18px",
        fontFamily: "Arial, sans-serif",
        fill: "#FFFFFF",
        backgroundColor: "#666666",
        padding: { x: 15, y: 8 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .setDepth(1002);

    this.skipButton.on("pointerdown", () => this.skipTutorial());
    this.skipButton.on("pointerover", () =>
      this.skipButton.setStyle({ fill: "#FF0000" })
    );
    this.skipButton.on("pointerout", () =>
      this.skipButton.setStyle({ fill: "#FFFFFF" })
    );
  }

  showSlide(index) {
    // Hide all slides
    this.slide1.setVisible(false);
    this.slide2.setVisible(false);
    this.slide3.setVisible(false);

    // Show current slide
    switch (index) {
      case 0:
        this.slide1.setVisible(true);
        break;
      case 1:
        this.slide2.setVisible(true);
        break;
      case 2:
        this.slide3.setVisible(true);
        break;
    }

    // Update navigation
    this.prevButton.setVisible(index > 0);

    // Change button text on last slide
    if (index === this.totalSlides - 1) {
      this.nextButton.setText("Start Game! 🚀");
      this.nextButton.setStyle({ backgroundColor: "#FF6B35" });
    } else {
      this.nextButton.setText("Next ▶");
      this.nextButton.setStyle({ backgroundColor: "#4CAF50" });
    }

    // Update indicator
    this.slideIndicator.setText(`${index + 1} / ${this.totalSlides}`);
  }

  previousSlide() {
    if (this.currentSlide > 0) {
      this.currentSlide--;
      this.showSlide(this.currentSlide);
    }
  }

  nextSlide() {
    if (this.currentSlide < this.totalSlides - 1) {
      this.currentSlide++;
      this.showSlide(this.currentSlide);
    } else {
      // Last slide - start game
      this.startGame();
    }
  }

  skipTutorial() {
    this.startGame();
  }

  startGame() {
    // Mark tutorial as completed
    localStorage.setItem("tutorialCompleted", "true");

    // Start the game scene
    this.scene.stop("TutorialScene");
    this.scene.start("GameScene");
  }
}
