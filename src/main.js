

import * as Phaser from "https://cdn.jsdelivr.net/npm/phaser@3.60.0/dist/phaser.esm.js";


import GameScene from './scenes/GameScene.js';
import LibraryScene from "./scenes/LibraryScene.js";
import SituationScene from "./scenes/SituationScene.js";
import PocketScene from "./scenes/PocketScene.js";
import SituationScene1 from "./scenes/SituationScene1.js";
import UIScene1 from "./scenes/UIScene1.js"; 
import ApartmentHallwayScene from "./scenes/ApartmentHallwayScene.js";
import DialogueScene from "./scenes/DialogueScene.js"; // 

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
        DialogueScene 
    ]
};

// Start the Phaser game immediately
const game = new Phaser.Game(config);
game.registry.set('score', 0);