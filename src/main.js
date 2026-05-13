import * as Phaser from "https://cdn.jsdelivr.net/npm/phaser@3.60.0/dist/phaser.esm.js";

import CharacterSelectionScene from "./scenes/CharacterSelectionScene.js";
import TutorialScene from "./scenes/TutorialScene.js";
import SettingsScene from "./scenes/SettingsScene.js";
import GameScene from "./scenes/GameScene.js";
import LibraryScene from "./scenes/LibraryScene.js";
import SituationScene from "./scenes/SituationScene.js";
import PocketScene from "./scenes/PocketScene.js";
import SituationScene1 from "./scenes/SituationScene1.js";
import UIScene1 from "./scenes/UIScene1.js";
import ApartmentHallwayScene from "./scenes/ApartmentHallwayScene.js";
import DialogueScene from "./scenes/DialogueScene.js";
import { loadProgress } from "./state/traits.js";
import cafeScene from "./scenes/CafeScene.js";
import GardenScene from "./scenes/GardenScene.js";

//import MusicScene from "./scenes/MusicScene.js";
// Phaser game configuration with enhanced graphics - Full screen
const config = {
  type: Phaser.WEBGL, // Use WebGL for better graphics
  parent: "game",
  width: window.innerWidth,
  height: window.innerHeight,
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  backgroundColor: "#1c1c1c",
  pixelArt: false, // Disable pixelArt for smoother graphics
  antialias: true, // Enable antialiasing
  antialiasGL: true, // Enable WebGL antialiasing
  roundPixels: false, // Smoother movement
  render: {
    transparent: false,
    clearBeforeRender: true,
    antialias: true,
    antialiasGL: true,
    mipmapFilter: "LINEAR",
    powerPreference: "high-performance", // Request high-performance GPU
  },
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 },
      debug: false,
      fps: 60, // Smooth physics at 60 FPS
    },
  },
  //
  scene: [
    CharacterSelectionScene, // Character selection first
    TutorialScene, // Tutorial after character selection
    GameScene, // Main game scene
    UIScene1,
    SettingsScene, // Settings menu

    LibraryScene,
    SituationScene,
    PocketScene,
    SituationScene1,
    ApartmentHallwayScene,
    DialogueScene,
    cafeScene,
    GardenScene,
  ],
};

// Load saved progress and start the game with error handling
async function initGame() {
  try {
    console.log("🎮 Initializing VirtueVille game...");
    await loadProgress();
    console.log("✅ Progress loaded");

    const game = new Phaser.Game(config);

    // Import VirtueSystem to calculate initial score from loaded traits
    const { VirtueSystem } = await import("./state/VirtueSystem.js");
    const initialScore = VirtueSystem.calculateVirtuePoints();
    game.registry.set("score", initialScore);
    console.log("✅ Initial virtue score set:", initialScore);

    // Load and set initial volume settings
    try {
      const savedSettings = localStorage.getItem("gameSettings");
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        game.registry.set("musicVolume", settings.musicVolume || 0.7);
        game.registry.set("sfxVolume", settings.sfxVolume || 0.8);
        console.log("✅ Volume settings loaded:", settings);
      } else {
        // Set default volumes
        game.registry.set("musicVolume", 0.7);
        game.registry.set("sfxVolume", 0.8);
        console.log("✅ Default volume settings applied");
      }
    } catch (error) {
      console.error(
        "⚠️ Failed to load volume settings, using defaults:",
        error
      );
      game.registry.set("musicVolume", 0.7);
      game.registry.set("sfxVolume", 0.8);
    }

    console.log("✅ Game initialized successfully");

    // Add global error handler for Phaser
    window.addEventListener("error", (event) => {
      console.error("❌ Game error:", event.error);
    });
  } catch (error) {
    console.error("❌ Fatal error during game initialization:", error);
    // Display user-friendly error message
    const errorDiv = document.createElement("div");
    errorDiv.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      border-radius: 20px;
      text-align: center;
      font-family: 'Poppins', Arial, sans-serif;
      z-index: 10000;
      box-shadow: 0 10px 40px rgba(0,0,0,0.3);
    `;
    errorDiv.innerHTML = `
      <h2 style="margin: 0 0 15px 0;">⚠️ Game Failed to Load</h2>
      <p style="margin: 0 0 20px 0;">${
        error.message || "An unexpected error occurred"
      }</p>
      <button onclick="location.reload()" style="
        background: white;
        color: #667eea;
        border: none;
        padding: 12px 30px;
        border-radius: 25px;
        cursor: pointer;
        font-weight: bold;
        font-size: 16px;
      ">Reload Page</button>
    `;
    document.body.appendChild(errorDiv);
  }
}

// Start the game
initGame();
