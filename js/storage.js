class StorageManager {
    static STORAGE_KEY = 'ecodash_highscores';

    /**
     * Save a high score to local storage
     */
    static saveHighScore(score) {
        const scores = this.getHighScores();
        const newScore = {
            score: Math.round(score),
            date: new Date().toISOString(),
            player: 'Player'
        };
       
        scores.push(newScore);
        scores.sort((a, b) => b.score - a.score);
       
        // Keep only top 10
        const topScores = scores.slice(0, 10);
       
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(topScores));
            return newScore;
        } catch (e) {
            console.warn('Could not save high score:', e);
            return null;
        }
    }

    /**
     * Get all high scores from local storage
     */
    static getHighScores() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.warn('Could not load high scores:', e);
            return [];
        }
    }

    /**
     * Get the highest score
     */
    static getBestScore() {
        const scores = this.getHighScores();
        return scores.length > 0 ? scores[0].score : 0;
    }

    /**
     * Clear all high scores
     */
    static clearHighScores() {
        try {
            localStorage.removeItem(this.STORAGE_KEY);
        } catch (e) {
            console.warn('Could not clear high scores:', e);
        }
    }
}
