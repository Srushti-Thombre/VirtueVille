
import * as Phaser from "https://cdn.jsdelivr.net/npm/phaser@3.60.0/dist/phaser.esm.js";


import GameScene from './scenes/GameScene.js';
import LibraryScene from "./scenes/LibraryScene.js";
import SituationScene from "./scenes/SituationScene.js";
import PocketScene from "./scenes/PocketScene.js";
import SituationScene1 from "./scenes/SituationScene1.js";
import UIScene1 from "./scenes/UIScene1.js"; 
import ApartmentHallwayScene from "./scenes/ApartmentHallwayScene.js";
import DialogueScene from "./scenes/DialogueScene.js"; // 
import { loadProgress } from "./state/traits.js";
import UIScene from "./scenes/UIScene.js"; 
import ApartmentHallwayScene from "./scenes/ApartmentHallwayScene.js";
import DialogueScene from "./scenes/DialogueScene.js";
import cafeScene from "./scenes/CafeScene.js";
import GardenScene from "./scenes/GardenScene.js";

//import MusicScene from "./scenes/MusicScene.js";
//import UIScene from "./scenes/UIScene.js";
// Phaser game configuration
const config = {
    type: Phaser.AUTO,
    parent: 'game',
    width: 960,
    height: 540,
    backgroundColor: '#1c1c1c',
    pixelArt: true,
    physics: {
        default: 'arcade',
        arcade: { gravity: { y: 0 }, debug: false }
    },
    // 
    scene: [
         
        GameScene,
        UIScene1,
        
        LibraryScene,
        SituationScene,
        PocketScene,
        SituationScene1,
        ApartmentHallwayScene,
        DialogueScene,
        cafeScene,
        GardenScene
    ]
};

// Start the Phaser game immediately
const game = new Phaser.Game(config);
game.registry.set('score', 0);
// Load saved progress and start the game
async function initGame() {
  await loadProgress();
  const game = new Phaser.Game(config);
}

// Start the game
initGame();
