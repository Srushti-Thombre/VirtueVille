import * as Phaser from "https://cdn.jsdelivr.net/npm/phaser@3.60.0/dist/phaser.esm.js";

export default class SettingsScene extends Phaser.Scene {
  constructor() {
    super("SettingsScene");
    this.settings = {
      musicVolume: 0.7,
      sfxVolume: 0.8,
      fullscreen: false,
    };
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Load saved settings
    this.loadSettings();

    // Semi-transparent overlay background
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.7);
    overlay.fillRect(0, 0, width, height);
    overlay.setScrollFactor(0);
    overlay.setDepth(2000);

    // Settings panel background
    const panelWidth = 500;
    const panelHeight = 580;
    const panelX = width / 2 - panelWidth / 2;
    const panelY = height / 2 - panelHeight / 2;

    const panel = this.add.graphics();
    panel.fillGradientStyle(0x2d1b4e, 0x2d1b4e, 0x1a0f2e, 0x1a0f2e, 1);
    panel.fillRoundedRect(panelX, panelY, panelWidth, panelHeight, 20);
    panel.lineStyle(3, 0x9c27b0, 1);
    panel.strokeRoundedRect(panelX, panelY, panelWidth, panelHeight, 20);
    panel.setScrollFactor(0);
    panel.setDepth(2001);

    // Title
    this.add
      .text(width / 2, panelY + 40, "⚙️ Settings", {
        fontFamily: "Poppins, Arial, sans-serif",
        fontSize: "36px",
        fill: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(2002);

    // Music Volume Section
    this.createVolumeControl(
      width / 2,
      panelY + 120,
      "🎵 Music Volume",
      "musicVolume",
      2002
    );

    // Sound Effects Volume Section
    this.createVolumeControl(
      width / 2,
      panelY + 230,
      "🔊 Sound Effects",
      "sfxVolume",
      2002
    );

    // Fullscreen Toggle
    this.createFullscreenToggle(width / 2, panelY + 340, 2002);

    // Test Music Button
    this.createTestMusicButton(width / 2, panelY + 400, 2002);

    // Close Button
    this.createCloseButton(width / 2, panelY + 490, 2002);

    // Make panel interactive to prevent clicks going through
    panel.setInteractive(
      new Phaser.Geom.Rectangle(panelX, panelY, panelWidth, panelHeight),
      Phaser.Geom.Rectangle.Contains
    );
  }

  createVolumeControl(x, y, label, settingKey, depth) {
    // Label
    this.add
      .text(x, y - 20, label, {
        fontFamily: "Poppins, Arial, sans-serif",
        fontSize: "20px",
        fill: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(depth);

    // Volume percentage
    const volumeText = this.add
      .text(x, y + 10, `${Math.round(this.settings[settingKey] * 100)}%`, {
        fontFamily: "Poppins, Arial, sans-serif",
        fontSize: "18px",
        fill: "#ffd700",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(depth);

    // Slider background
    const sliderWidth = 300;
    const sliderHeight = 10;
    const sliderBg = this.add.graphics();
    sliderBg.fillStyle(0x444444, 1);
    sliderBg.fillRoundedRect(
      x - sliderWidth / 2,
      y + 40,
      sliderWidth,
      sliderHeight,
      5
    );
    sliderBg.setScrollFactor(0);
    sliderBg.setDepth(depth);

    // Slider fill
    const sliderFill = this.add.graphics();
    this.updateSliderFill(
      sliderFill,
      x,
      y + 40,
      sliderWidth,
      sliderHeight,
      this.settings[settingKey]
    );
    sliderFill.setScrollFactor(0);
    sliderFill.setDepth(depth + 1);

    // Slider handle
    const handleX =
      x - sliderWidth / 2 + sliderWidth * this.settings[settingKey];
    const handle = this.add.circle(handleX, y + 45, 15, 0x9c27b0);
    handle.setStrokeStyle(3, 0xffffff);
    handle.setScrollFactor(0);
    handle.setDepth(depth + 2);
    handle.setInteractive({ draggable: true });

    // Drag functionality
    handle.on("drag", (pointer, dragX) => {
      const minX = x - sliderWidth / 2;
      const maxX = x + sliderWidth / 2;
      const clampedX = Phaser.Math.Clamp(dragX, minX, maxX);

      handle.x = clampedX;

      const volume = (clampedX - minX) / sliderWidth;
      this.settings[settingKey] = volume;

      volumeText.setText(`${Math.round(volume * 100)}%`);
      this.updateSliderFill(
        sliderFill,
        x,
        y + 40,
        sliderWidth,
        sliderHeight,
        volume
      );

      // Save settings
      this.saveSettings();

      // Apply volume changes immediately
      this.registry.set(settingKey, volume);
      this.applyVolumeChanges(settingKey, volume);
    });

    // Hover effect
    handle.on("pointerover", () => {
      handle.setFillStyle(0xba68c8);
      handle.setScale(1.2);
    });

    handle.on("pointerout", () => {
      handle.setFillStyle(0x9c27b0);
      handle.setScale(1);
    });
  }

  updateSliderFill(graphics, x, y, width, height, volume) {
    graphics.clear();
    graphics.fillGradientStyle(0x9c27b0, 0x9c27b0, 0xba68c8, 0xba68c8, 1);
    graphics.fillRoundedRect(x - width / 2, y, width * volume, height, 5);
  }

  createFullscreenToggle(x, y, depth) {
    // Label
    this.add
      .text(x - 100, y, "🖥️ Fullscreen", {
        fontFamily: "Poppins, Arial, sans-serif",
        fontSize: "20px",
        fill: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0, 0.5)
      .setScrollFactor(0)
      .setDepth(depth);

    // Toggle button
    const toggleWidth = 60;
    const toggleHeight = 30;
    const toggleBg = this.add.graphics();

    const updateToggle = (isOn) => {
      toggleBg.clear();
      toggleBg.fillStyle(isOn ? 0x4caf50 : 0x666666, 1);
      toggleBg.fillRoundedRect(
        x + 80,
        y - toggleHeight / 2,
        toggleWidth,
        toggleHeight,
        15
      );
    };

    updateToggle(this.settings.fullscreen);
    toggleBg.setScrollFactor(0);
    toggleBg.setDepth(depth);
    toggleBg.setInteractive(
      new Phaser.Geom.Rectangle(
        x + 80,
        y - toggleHeight / 2,
        toggleWidth,
        toggleHeight
      ),
      Phaser.Geom.Rectangle.Contains
    );

    // Toggle circle
    const circleX = this.settings.fullscreen
      ? x + 80 + toggleWidth - 18
      : x + 80 + 18;
    const toggleCircle = this.add.circle(circleX, y, 12, 0xffffff);
    toggleCircle.setScrollFactor(0);
    toggleCircle.setDepth(depth + 1);

    // Toggle text
    const toggleText = this.add
      .text(x + 160, y, this.settings.fullscreen ? "ON" : "OFF", {
        fontFamily: "Poppins, Arial, sans-serif",
        fontSize: "18px",
        fill: this.settings.fullscreen ? "#4caf50" : "#999999",
        fontStyle: "bold",
      })
      .setOrigin(0, 0.5)
      .setScrollFactor(0)
      .setDepth(depth);

    // Click handler
    toggleBg.on("pointerdown", () => {
      this.settings.fullscreen = !this.settings.fullscreen;

      updateToggle(this.settings.fullscreen);

      // Animate circle
      this.tweens.add({
        targets: toggleCircle,
        x: this.settings.fullscreen ? x + 80 + toggleWidth - 18 : x + 80 + 18,
        duration: 200,
        ease: "Power2",
      });

      // Update text
      toggleText.setText(this.settings.fullscreen ? "ON" : "OFF");
      toggleText.setColor(this.settings.fullscreen ? "#4caf50" : "#999999");

      // Apply fullscreen
      if (this.settings.fullscreen) {
        if (!this.scale.isFullscreen) {
          this.scale.startFullscreen();
        }
      } else {
        if (this.scale.isFullscreen) {
          this.scale.stopFullscreen();
        }
      }

      this.saveSettings();
    });

    // Hover effect
    toggleBg.on("pointerover", () => {
      toggleCircle.setScale(1.2);
    });

    toggleBg.on("pointerout", () => {
      toggleCircle.setScale(1);
    });
  }

  createTestMusicButton(x, y, depth) {
    const buttonWidth = 150;
    const buttonHeight = 35;

    const button = this.add.graphics();
    button.fillStyle(0x4caf50, 1);
    button.fillRoundedRect(
      x - buttonWidth / 2,
      y - buttonHeight / 2,
      buttonWidth,
      buttonHeight,
      18
    );
    button.setScrollFactor(0);
    button.setDepth(depth);
    button.setInteractive(
      new Phaser.Geom.Rectangle(
        x - buttonWidth / 2,
        y - buttonHeight / 2,
        buttonWidth,
        buttonHeight
      ),
      Phaser.Geom.Rectangle.Contains
    );

    const buttonText = this.add
      .text(x, y, "🎵 Test Music", {
        fontFamily: "Poppins, Arial, sans-serif",
        fontSize: "16px",
        fill: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(depth + 1);

    // Click handler
    button.on("pointerdown", () => {
      console.log("🎵 Testing music playback...");

      // Try to resume audio context
      if (this.sound.context.state === "suspended") {
        this.sound.context.resume().then(() => {
          console.log("✅ Audio context resumed");
        });
      }

      // Find GameScene and try to play music
      const gameScene = this.scene.get("GameScene");
      if (gameScene) {
        console.log("🎵 Found GameScene, attempting to play music");
        if (gameScene.bgMusic) {
          if (!gameScene.bgMusic.isPlaying) {
            gameScene.bgMusic.play();
            console.log("✅ Music playback started");
          } else {
            console.log("ℹ️ Music is already playing");
          }
        } else {
          console.log("🎵 Creating new music instance");
          gameScene.playBackgroundMusic();
        }
      }

      buttonText.setText("✅ Playing");
      this.time.delayedCall(1000, () => {
        buttonText.setText("🎵 Test Music");
      });
    });

    // Hover effects
    button.on("pointerover", () => {
      button.clear();
      button.fillStyle(0x66bb6a, 1);
      button.fillRoundedRect(
        x - buttonWidth / 2,
        y - buttonHeight / 2,
        buttonWidth,
        buttonHeight,
        18
      );
    });

    button.on("pointerout", () => {
      button.clear();
      button.fillStyle(0x4caf50, 1);
      button.fillRoundedRect(
        x - buttonWidth / 2,
        y - buttonHeight / 2,
        buttonWidth,
        buttonHeight,
        18
      );
    });
  }

  createCloseButton(x, y, depth) {
    const buttonWidth = 150;
    const buttonHeight = 50;

    const button = this.add.graphics();
    button.fillStyle(0xffffff, 1);
    button.fillRoundedRect(
      x - buttonWidth / 2,
      y - buttonHeight / 2,
      buttonWidth,
      buttonHeight,
      25
    );
    button.setScrollFactor(0);
    button.setDepth(depth);
    button.setInteractive(
      new Phaser.Geom.Rectangle(
        x - buttonWidth / 2,
        y - buttonHeight / 2,
        buttonWidth,
        buttonHeight
      ),
      Phaser.Geom.Rectangle.Contains
    );

    const buttonText = this.add
      .text(x, y, "Close", {
        fontFamily: "Poppins, Arial, sans-serif",
        fontSize: "20px",
        fill: "#7b1fa2",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(depth + 1);

    // Hover effects
    button.on("pointerover", () => {
      button.clear();
      button.fillStyle(0xf0f0f0, 1);
      button.fillRoundedRect(
        x - buttonWidth / 2,
        y - buttonHeight / 2,
        buttonWidth,
        buttonHeight,
        25
      );
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
      button.fillRoundedRect(
        x - buttonWidth / 2,
        y - buttonHeight / 2,
        buttonWidth,
        buttonHeight,
        25
      );
      this.tweens.add({
        targets: [button, buttonText],
        scaleX: 1,
        scaleY: 1,
        duration: 100,
        ease: "Power2",
      });
    });

    button.on("pointerdown", () => {
      console.log("✅ Closing settings");
      this.scene.stop("SettingsScene");

      // Resume the game scene if it was paused
      if (this.scene.isPaused("GameScene")) {
        this.scene.resume("GameScene");
      }
    });
  }

  loadSettings() {
    try {
      const savedSettings = localStorage.getItem("gameSettings");
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        this.settings = { ...this.settings, ...parsed };
        console.log("✅ Settings loaded:", this.settings);

        // Apply settings to registry
        this.registry.set("musicVolume", this.settings.musicVolume);
        this.registry.set("sfxVolume", this.settings.sfxVolume);
      }
    } catch (error) {
      console.error("❌ Failed to load settings:", error);
    }
  }

  saveSettings() {
    try {
      localStorage.setItem("gameSettings", JSON.stringify(this.settings));
      console.log("✅ Settings saved:", this.settings);
    } catch (error) {
      console.error("❌ Failed to save settings:", error);
    }
  }

  applyVolumeChanges(settingKey, volume) {
    // Apply music volume to all active music in all scenes
    if (settingKey === "musicVolume") {
      console.log(`🎵 Setting music volume to ${Math.round(volume * 100)}%`);

      // Get all running scenes
      const scenes = this.scene.manager.scenes;
      scenes.forEach((scene) => {
        if (scene.bgMusic && scene.bgMusic.isPlaying) {
          scene.bgMusic.setVolume(volume);
        }
        // Also check for backgroundMusic property
        if (scene.backgroundMusic && scene.backgroundMusic.isPlaying) {
          scene.backgroundMusic.setVolume(volume);
        }
      });

      // Set global music volume for future sounds
      this.sound.volume = volume;
    }

    // Apply sound effects volume
    if (settingKey === "sfxVolume") {
      console.log(`🔊 Setting SFX volume to ${Math.round(volume * 100)}%`);
      // Sound effects will use this registry value when they play
      // You can also iterate through active sounds if needed
    }
  }
}
