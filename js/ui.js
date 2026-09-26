class UIManager {
    constructor() {
        this.batteryFill = document.getElementById('battery-fill');
        this.batteryText = document.getElementById('battery-text');
        this.cargoText = document.getElementById('cargo-text');
        this.deliveriesText = document.getElementById('deliveries-text');
        this.scoreText = document.getElementById('score-text');
        this.timeText = document.getElementById('time-text');
        this.efficiencyText = document.getElementById('efficiency-text');
       
        this.startScreen = document.getElementById('start-screen');
        this.pauseScreen = document.getElementById('pause-screen');
        this.gameoverScreen = document.getElementById('gameover-screen');
        this.finalStats = document.getElementById('final-stats');
    }

    /**
     * Update all HUD elements
     */
    updateHUD(player, timeLeft, totalTime) {
        // Battery
        const batteryPercent = Math.max(0, (player.battery / player.maxBattery) * 100);
        this.batteryFill.style.width = `${batteryPercent}%`;
        this.batteryText.textContent = `${Math.round(batteryPercent)}%`;
       
        if (batteryPercent < 30) {
            this.batteryFill.classList.add('low');
        } else {
            this.batteryFill.classList.remove('low');
        }

        // Cargo
        this.cargoText.textContent = player.cargo;

        // Deliveries
        this.deliveriesText.textContent = `${player.deliveries}/5`;

        // Score
        this.scoreText.textContent = Math.round(player.score);

        // Time
        const minutes = Math.floor(timeLeft / 60);
        const seconds = Math.floor(timeLeft % 60);
        this.timeText.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

        // Efficiency
        if (player.distanceTravelled > 0) {
            const efficiency = Math.max(0, 100 - (player.energyUsed / player.distanceTravelled) * 10);
            this.efficiencyText.textContent = `${Math.round(efficiency)}%`;
        } else {
            this.efficiencyText.textContent = '100%';
        }
    }

    showScreen(screenName) {
        this.hideAllScreens();
        switch (screenName) {
            case 'start':
                this.startScreen.classList.remove('hidden');
                break;
            case 'pause':
                this.pauseScreen.classList.remove('hidden');
                break;
            case 'gameover':
                this.gameoverScreen.classList.remove('hidden');
                break;
        }
    }

    hideAllScreens() {
        this.startScreen.classList.add('hidden');
        this.pauseScreen.classList.add('hidden');
        this.gameoverScreen.classList.add('hidden');
    }

    showGameOver(player, isWin) {
        const timeBonus = isWin ? 500 : 0;
        const batteryBonus = Math.round(player.battery * 5);
        const efficiencyBonus = Math.round(Math.max(0, 100 - (player.energyUsed / Math.max(1, player.distanceTravelled)) * 10));
        const finalScore = player.score + timeBonus + batteryBonus + efficiencyBonus;

        this.finalStats.innerHTML = `
            <p>🏆 Final Score: <strong>${Math.round(finalScore)}</strong></p>
            <p>📦 Deliveries: <strong>${player.deliveries}/5</strong></p>
            <p>📏 Distance: <strong>${Math.round(player.distanceTravelled)}m</strong></p>
            <p>⚡ Energy Used: <strong>${Math.round(player.energyUsed)}%</strong></p>
            <p>${isWin ? '✅ Mission Complete!' : '❌ Mission Failed - Out of Time'}</p>
        `;

        // Save high score
        StorageManager.saveHighScore(finalScore);
        this.showScreen('gameover');
    }
}
