import * as Phaser from "https://cdn.jsdelivr.net/npm/phaser@3.60.0/dist/phaser.esm.js";

export default class CharacterSelectionScene extends Phaser.Scene {
  constructor() {
    super("CharacterSelectionScene");
    this.selectedCharacter = null;
  }

  preload() {
    // Load all 4 character spritesheets
    this.load.spritesheet(
      "maleAdventurer",
      "kenney_toon-characters-1/Male adventurer/Tilesheet/character_maleAdventurer_sheet.png",
      { frameWidth: 96, frameHeight: 128 }
    );
    this.load.spritesheet(
      "femaleAdventurer",
      "kenney_toon-characters-1/Female adventurer/Tilesheet/character_femaleAdventurer_sheet.png",
      { frameWidth: 96, frameHeight: 128 }
    );
    this.load.spritesheet(
      "malePerson",
      "kenney_toon-characters-1/Male person/Tilesheet/character_malePerson_sheet.png",
      { frameWidth: 96, frameHeight: 128 }
    );
    this.load.spritesheet(
      "femalePerson",
      "kenney_toon-characters-1/Female person/Tilesheet/character_femalePerson_sheet.png",
      { frameWidth: 96, frameHeight: 128 }
    );
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Set default character if not already selected
    if (
      !this.registry.get("playerCharacter") &&
      !localStorage.getItem("selectedCharacter")
    ) {
      this.registry.set("playerCharacter", "maleAdventurer");
      localStorage.setItem("selectedCharacter", "maleAdventurer");
    }

    // Background
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x667eea, 0x667eea, 0x764ba2, 0x764ba2, 1);
    bg.fillRect(0, 0, width, height);
    bg.setScrollFactor(0);

    // Title
    this.add
      .text(width / 2, 80, "Choose Your Character", {
        fontFamily: "Poppins, Arial, sans-serif",
        fontSize: "48px",
        fill: "#ffffff",
        fontStyle: "bold",
        stroke: "#000000",
        strokeThickness: 4,
      })
      .setOrigin(0.5)
      .setScrollFactor(0);

    // Character data
    const characters = [
      {
        key: "maleAdventurer",
        name: "Male Adventurer",
        description: "Brave Explorer",
      },
      {
        key: "femaleAdventurer",
        name: "Female Adventurer",
        description: "Fearless Hero",
      },
      { key: "malePerson", name: "Male Citizen", description: "Everyday Hero" },
      {
        key: "femalePerson",
        name: "Female Citizen",
        description: "Kind Helper",
      },
    ];

    const startX = width / 2 - 450;
    const startY = height / 2 - 50;
    const spacing = 300;

    characters.forEach((char, index) => {
      const x = startX + index * spacing;
      const y = startY;

      // Character card background
      const card = this.add.graphics();
      card.fillStyle(0x1a1a2e, 0.8);
      card.fillRoundedRect(x - 80, y - 100, 160, 280, 15);
      card.lineStyle(3, 0x9c27b0, 1);
      card.strokeRoundedRect(x - 80, y - 100, 160, 280, 15);
      card.setScrollFactor(0);
      card.setInteractive(
        new Phaser.Geom.Rectangle(x - 80, y - 100, 160, 280),
        Phaser.Geom.Rectangle.Contains
      );
      card.setData("charKey", char.key);

      // Character sprite
      const sprite = this.add.sprite(x, y, char.key, 0).setScale(1.5);
      sprite.setScrollFactor(0);

      // Character name
      this.add
        .text(x, y + 90, char.name, {
          fontFamily: "Poppins, Arial, sans-serif",
          fontSize: "16px",
          fill: "#ffffff",
          fontStyle: "bold",
          align: "center",
          wordWrap: { width: 140 },
        })
        .setOrigin(0.5)
        .setScrollFactor(0);

      // Character description
      this.add
        .text(x, y + 115, char.description, {
          fontFamily: "Poppins, Arial, sans-serif",
          fontSize: "12px",
          fill: "#cccccc",
          align: "center",
        })
        .setOrigin(0.5)
        .setScrollFactor(0);

      // Hover effects
      card.on("pointerover", () => {
        card.clear();
        card.fillStyle(0x2a2a3e, 0.9);
        card.fillRoundedRect(x - 80, y - 100, 160, 280, 15);
        card.lineStyle(4, 0xba68c8, 1);
        card.strokeRoundedRect(x - 80, y - 100, 160, 280, 15);
        sprite.setScale(1.6);
        this.tweens.add({
          targets: sprite,
          y: y - 10,
          duration: 200,
          ease: "Power2",
        });
      });

      card.on("pointerout", () => {
        if (this.selectedCharacter !== char.key) {
          card.clear();
          card.fillStyle(0x1a1a2e, 0.8);
          card.fillRoundedRect(x - 80, y - 100, 160, 280, 15);
          card.lineStyle(3, 0x9c27b0, 1);
          card.strokeRoundedRect(x - 80, y - 100, 160, 280, 15);
        }
        sprite.setScale(1.5);
        this.tweens.add({
          targets: sprite,
          y: y,
          duration: 200,
          ease: "Power2",
        });
      });

      card.on("pointerdown", () => {
        this.selectCharacter(char.key, card, x, y);
      });
    });

    // Instruction text
    this.add
      .text(width / 2, height - 150, "Click on a character to select", {
        fontFamily: "Poppins, Arial, sans-serif",
        fontSize: "18px",
        fill: "#ffffff",
        alpha: 0.8,
      })
      .setOrigin(0.5)
      .setScrollFactor(0);

    // Confirm button (initially hidden)
    this.confirmButton = this.createConfirmButton(width / 2, height - 80);
    this.confirmButton.setVisible(false);

    // Check if character already selected
    const savedCharacter = localStorage.getItem("selectedCharacter");
    if (savedCharacter) {
      this.selectedCharacter = savedCharacter;
    }
  }

  selectCharacter(charKey, card, x, y) {
    console.log("✅ Character selected:", charKey);
    this.selectedCharacter = charKey;

    // Clear all cards and reset
    this.children.list.forEach((child) => {
      if (child.type === "Graphics" && child.getData("charKey")) {
        const cardX = child.x;
        const cardY = child.y;
        // Reset appearance
      }
    });

    // Highlight selected card
    card.clear();
    card.fillStyle(0x4a148c, 0.95);
    card.fillRoundedRect(x - 80, y - 100, 160, 280, 15);
    card.lineStyle(5, 0xffd700, 1);
    card.strokeRoundedRect(x - 80, y - 100, 160, 280, 15);

    // Show confirm button
    this.confirmButton.setVisible(true);

    // Save selection to localStorage
    localStorage.setItem("selectedCharacter", charKey);
  }

  createConfirmButton(x, y) {
    const button = this.add.graphics();
    button.fillStyle(0xffffff, 1);
    button.fillRoundedRect(x - 100, y - 25, 200, 50, 25);
    button.setScrollFactor(0);
    button.setInteractive(
      new Phaser.Geom.Rectangle(x - 100, y - 25, 200, 50),
      Phaser.Geom.Rectangle.Contains
    );

    const buttonText = this.add
      .text(x, y, "Start Game", {
        fontFamily: "Poppins, Arial, sans-serif",
        fontSize: "20px",
        fill: "#667eea",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setScrollFactor(0);

    button.on("pointerover", () => {
      button.clear();
      button.fillStyle(0xf0f0f0, 1);
      button.fillRoundedRect(x - 100, y - 25, 200, 50, 25);
      this.tweens.add({
        targets: [button, buttonText],
        scaleX: 1.05,
        scaleY: 1.05,
        duration: 100,
        ease: "Power2",
      });
    });

    button.on("pointerout", () => {
      button.clear();
      button.fillStyle(0xffffff, 1);
      button.fillRoundedRect(x - 100, y - 25, 200, 50, 25);
      this.tweens.add({
        targets: [button, buttonText],
        scaleX: 1,
        scaleY: 1,
        duration: 100,
        ease: "Power2",
      });
    });

    button.on("pointerdown", () => {
      if (this.selectedCharacter) {
        console.log("✅ Changing character to:", this.selectedCharacter);
        // Store in registry and localStorage for persistence
        this.registry.set("playerCharacter", this.selectedCharacter);
        localStorage.setItem("selectedCharacter", this.selectedCharacter);

        // Always return to GameScene (mid-game character change)
        console.log("✅ Restarting GameScene with new character");
        // Stop this scene
        this.scene.stop("CharacterSelectionScene");
        // Stop and restart GameScene to apply new character
        this.scene.stop("GameScene");
        this.scene.start("GameScene");
      }
    });

    return button;
  }
}
