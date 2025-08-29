import { traits, saveProgress, loadProgress, clamp01to10 } from '../state/traits.js';

export default class GameScene extends Phaser.Scene {
  constructor(){ super('Game'); }
  preload(){}

  create(){
    // temp player texture
    const g = this.add.graphics();
    g.fillStyle(0x00ffcc, 1);
    g.fillCircle(8,8,8);
    g.generateTexture('player', 16,16);
    g.destroy();

    this.player = this.physics.add.sprite(200, 200, 'player').setCollideWorldBounds(true);
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keyB = this.input.keyboard.addKey('B');

    this.add.text(16, 16, 'Arrow keys to move\nSPACE: +1 Empathy (demo)\nB: Toggle Character Board',
      { font: '16px monospace', fill: '#ffffff' });

    loadProgress();
    this.events.on('updateTraits', () => {
      const el = document.getElementById('traits');
      el.innerHTML = Object.entries(traits)
        .map(([k,v]) => `${k.toUpperCase()}: ${v}/10`).join('<br>');
    });
    this.events.emit('updateTraits');

    document.getElementById('closeBoard').onclick = () => {
      document.getElementById('charboard').style.display = 'none';
    };

    // demo “choice”: press SPACE to change a trait
    this.input.keyboard.on('keydown-SPACE', () => {
      traits.empathy = clamp01to10(traits.empathy + 1);
      saveProgress();
      this.events.emit('updateTraits');
      const t = this.add.text(this.player.x-32, this.player.y-24, '+1 Empathy',
        { font:'12px monospace', fill:'#00ff00' });
      this.time.delayedCall(600, () => t.destroy());
    });
  }

  update(){
    const speed = 160;
    this.player.setVelocity(0);
    if (this.cursors.left.isDown) this.player.setVelocityX(-speed);
    else if (this.cursors.right.isDown) this.player.setVelocityX(speed);
    if (this.cursors.up.isDown) this.player.setVelocityY(-speed);
    else if (this.cursors.down.isDown) this.player.setVelocityY(speed);

    if (Phaser.Input.Keyboard.JustDown(this.keyB)) {
      const board = document.getElementById('charboard');
      board.style.display = (board.style.display === 'none' || !board.style.display) ? 'block' : 'none';
    }
  }
}
