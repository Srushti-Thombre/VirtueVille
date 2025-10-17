import * as Phaser from "https://cdn.jsdelivr.net/npm/phaser@3.60.0/dist/phaser.esm.js";
import { minimapNodes } from "../ui/minimapConfig.js";

export default class MinimapScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MinimapScene' });
  }

  create() {
    // --- 🎯 ADJUST THESE 4 VALUES UNTIL THE PINK BOX IS PERFECT ---
    const w = 150; // The width of your minimap area
    const h = 115; // The height of your minimap area
    const offsetX = 25; // How many pixels from the RIGHT edge of the screen
    const offsetY = 45; // How many pixels from the TOP edge of the screen
    // -----------------------------------------------------------

    // These calculate the final position based on your offsets
    const baseX = this.cameras.main.width - w - offsetX;
    const baseY = offsetY;
    
    this._minimap = { x: baseX, y: baseY, w, h };
    const mapContainer = this.add.container(baseX, baseY).setScrollFactor(0).setDepth(2000);

    // --- DEBUG RECTANGLE ---
    // This helps you visually align the minimap.
    // Once it's perfect, you can delete these next two lines.
    //const debugRect = this.add.rectangle(baseX + w / 2, baseY + h / 2, w, h, 0xff00ff, 0.5);
   // debugRect.setScrollFactor(0).setDepth(9999); // Puts it on top of everything
    // -----------------------

    this.nodeSprites = {};
    const PAD = 6;

    const maskG = this.make.graphics({ x: 0, y: 0, add: false });
    maskG.fillStyle(0xffffff);
    maskG.fillRect(baseX, baseY, w, h);
    const minimapMask = maskG.createGeometryMask();
    mapContainer.setMask(minimapMask);

    // (The rest of the file is exactly the same as before)
    // ...
    const nodesPos = minimapNodes.map(n => ({
        key: n.key, label: n.label, color: n.color,
        x: Phaser.Math.Clamp(n.x, PAD, w - PAD),
        y: Phaser.Math.Clamp(n.y, PAD, h - PAD)
    }));

    const MIN_DIST = 16;
    for (let iter = 0; iter < 3; iter++) {
      for (let i = 0; i < nodesPos.length; i++) {
        for (let j = i + 1; j < nodesPos.length; j++) {
          const a = nodesPos[i], b = nodesPos[j];
          const dx = b.x - a.x, dy = b.y - a.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 0.001;
          if (dist < MIN_DIST) {
            const overlap = MIN_DIST - dist;
            b.y = Phaser.Math.Clamp(b.y + overlap, PAD, h - PAD);
          }
        }
      }
    }

    for (const n of nodesPos) {
      const dot = this.add.circle(n.x, n.y, 6, n.color).setDepth(1);
      mapContainer.add(dot);

      const tmp = this.add.text(0, 0, n.label, { fontSize: '10px' }).setVisible(false);
      const labelWidth = tmp.width, labelHeight = tmp.height;
      tmp.destroy();

      let labelX = n.x + 8;
      if (labelX + labelWidth > w - PAD) labelX = n.x - 8 - labelWidth;
      const labelY = Phaser.Math.Clamp(n.y - labelHeight / 2, PAD, h - PAD - labelHeight);

      const label = this.add.text(labelX, labelY, n.label, { fontSize: '10px', fill: '#ffffff' }).setDepth(1).setAlpha(0.9);
      mapContainer.add(label);

      dot.x = Phaser.Math.Clamp(dot.x, PAD, w - PAD);
      dot.y = Phaser.Math.Clamp(dot.y, PAD, h - PAD);

      this.nodeSprites[n.key] = { dot, label };
    }

    const current = this.registry.get('currentScene');
    if (current && this.nodeSprites[current]) {
      this._highlight(current);
    }

    this.playerDot = this.add.circle(0, 0, 5, 0x000000)
      .setStrokeStyle(1, 0xffffff)
      .setDepth(2)
      .setVisible(false);
    mapContainer.add(this.playerDot);

    this.registry.events.on('changedata-minimapBounds', (parent, val) => { this._mapBounds = val; });
    this.registry.events.on('changedata-playerPos', (parent, pos) => { this._updatePlayerDot(pos); });
    
    this._mapBounds = this.registry.get('minimapBounds');
    const pos = this.registry.get('playerPos');
    if (pos) this._updatePlayerDot(pos);

    this.registry.events.on('changedata-currentScene', (parent, value) => { this._highlight(value); });
  }

  _highlight(sceneKey) {
    Object.values(this.nodeSprites).forEach(o => {
      o.dot.setScale(1).setStrokeStyle(0);
      o.label.setStyle({ fill: '#ffffff' });
    });
    const entry = this.nodeSprites[sceneKey];
    if (entry) {
      entry.dot.setScale(1.6).setStrokeStyle(2, 0xffff00);
      entry.label.setStyle({ fill: '#ffff00' });
    }
  }

  _updatePlayerDot(pos) {
    if (!pos || !this._mapBounds || !this._minimap) return;
    const { worldWidth, worldHeight } = this._mapBounds;
    if (!worldWidth || !worldHeight) return;

    const { w, h } = this._minimap;
    const PAD = 6;
    
    const mx = Phaser.Math.Clamp((pos.x / worldWidth) * w, PAD, w - PAD);
    const my = Phaser.Math.Clamp((pos.y / worldHeight) * h, PAD, h - PAD);

    this.playerDot.setPosition(mx, my).setVisible(true);
  }
}