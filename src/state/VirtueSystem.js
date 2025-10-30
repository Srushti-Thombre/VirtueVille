// VirtueSystem.js
import { traits } from "./traits.js";

export class VirtueSystem {
    static initScene(scene) {
        // Calculate initial score from traits
        const totalScore = this.calculateVirtuePoints();
        scene.registry.set('score', totalScore);
        console.log('✅ Virtue points system initialized with score:', totalScore);

        // Make sure UIScene1 is running
        const uiScene = scene.scene.manager.getScene('UIScene1');
        if (!uiScene || !scene.scene.manager.isActive('UIScene1')) {
            scene.scene.launch('UIScene1');
        }
        // Make sure MinimapScene is running so HUD can display
        try {
            const mini = scene.scene.manager.getScene('MinimapScene');
            if (!mini || !scene.scene.manager.isActive('MinimapScene')) {
                scene.scene.launch('MinimapScene');
            }
        } catch (e) {
            // ignore if scene manager not available
        }
        // Update registry with current scene key for minimap/UI to listen
        try {
            scene.registry.set('currentScene', scene.scene.key);
        } catch (e) {
            // ignore
        }
    }

    // Calculate virtue points as sum of positive traits minus negative traits
    static calculateVirtuePoints() {
        // Positive traits
        const positiveTraits = (traits.empathy || 0) + 
                              (traits.responsibility || 0) + 
                              (traits.courage || 0);
        
        // Negative traits (subtract these)
        const negativeTraits = (traits.fear || 0) + 
                              (traits.selfishness || 0) + 
                              (traits.dishonesty || 0);
        
        return positiveTraits - negativeTraits;
    }

    static awardPoints(scene, points, reason) {
        // Recalculate score from traits instead of adding points
        const newScore = this.calculateVirtuePoints();
        const oldScore = scene.registry.get('score') || 0;
        const scoreDiff = newScore - oldScore;
        
        // Update score
        scene.registry.set('score', newScore);
        
        // Show floating text feedback
        if (scoreDiff !== 0) {
            const sign = scoreDiff > 0 ? '+' : '';
            const color = scoreDiff > 0 ? '#00ff00' : '#ff0000';
            
            const floatingText = scene.add.text(
                scene.cameras.main.centerX,
                scene.cameras.main.centerY - 50,
                `${sign}${scoreDiff} Virtue Points\n${reason}`,
                {
                    fontSize: '20px',
                    fill: color,
                    align: 'center'
                }
            )
            .setOrigin(0.5)
            .setScrollFactor(0)
            .setDepth(1001);

            scene.tweens.add({
                targets: floatingText,
                y: '-=50',
                alpha: { from: 1, to: 0 },
                duration: 2000,
                ease: 'Power2',
                onComplete: () => floatingText.destroy()
            });
        }
        
        console.log(`Virtue Points ${points > 0 ? 'awarded' : 'deducted'}: ${points} (${reason})`);
    }
}