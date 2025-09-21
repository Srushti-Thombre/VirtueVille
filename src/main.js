import Phaser from 'phaser';
import GameScene from './scenes/GameScene.js';

const config = {
  type: Phaser.AUTO,
  parent: 'game',
  width: 960,
  height: 540,
  backgroundColor: '#1c1c1c',
  pixelArt: true,
  physics: { default: 'arcade', arcade: { gravity: { y: 0 }, debug: false } },
  scene: [GameScene]
};

new Phaser.Game(config);
// in main.js
fetch('/check-session')
  .then(res => res.json())
  .then(data => {
    if (!data.loggedIn) window.location.href = '/auth.html';
    else startGame();
  });
