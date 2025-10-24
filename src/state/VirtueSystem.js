// VirtueSystem.js
export class VirtueSystem {
    static initScene(scene) {
        // Initialize score if it doesn't exist
        if (scene.registry.get('score') === undefined) {
            scene.registry.set('score', 0);
            console.log('✅ Virtue points system initialized with score: 0');
        } else {
            console.log('✅ Virtue points system loaded with score:', scene.registry.get('score'));
        }

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

    static awardPoints(scene, points, reason) {
        // Get current score
        const currentScore = scene.registry.get('score') || 0;
        
        // Update score
        scene.registry.set('score', currentScore + points);
        
        // Show floating text feedback
        if (points !== 0) {
            const sign = points > 0 ? '+' : '';
            const color = points > 0 ? '#00ff00' : '#ff0000';
            
            const floatingText = scene.add.text(
                scene.cameras.main.centerX,
                scene.cameras.main.centerY - 50,
                `${sign}${points} Virtue Points\n${reason}`,
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