export interface User {
    id: string;
    username: string;
    highScore: number;
    gamesPlayed: number;
    totalScore: number;
    createdAt: string;
    lastPlayed: string;
}

export interface LeaderboardEntry {
    username: string;
    score: number;
    date: string;
    userId: string;
}

class LocalStorageService {
    private readonly USER_KEY = 'fallgame_user';
    private readonly LEADERBOARD_KEY = 'fallgame_leaderboard';
    private readonly SETTINGS_KEY = 'fallgame_settings';

    // === ПОЛЬЗОВАТЕЛИ ===

    saveUser(username: string): User {
        const user: User = {
            id: this.generateId(),
            username: username.trim(),
            highScore: 0,
            gamesPlayed: 0,
            totalScore: 0,
            createdAt: new Date().toISOString(),
            lastPlayed: new Date().toISOString()
        };

        localStorage.setItem(this.USER_KEY, JSON.stringify(user));
        return user;
    }

    getUser(): User | null {
        const data = localStorage.getItem(this.USER_KEY);
        return data ? JSON.parse(data) : null;
    }

    updateUserScore(score: number): User | null {
        const user = this.getUser();
        if (!user) return null;

        // Обновляем статистику
        user.gamesPlayed += 1;
        user.totalScore += score;
        user.lastPlayed = new Date().toISOString();

        // Обновляем рекорд если нужно
        if (score > user.highScore) {
            user.highScore = score;
        }

        localStorage.setItem(this.USER_KEY, JSON.stringify(user));
        return user;
    }

    // === ТАБЛИЦА ЛИДЕРОВ ===

    updateLeaderboard(score: number): LeaderboardEntry[] {
        const user = this.getUser();
        if (!user) return this.getLeaderboard();

        const leaderboard = this.getLeaderboard();
        const newEntry: LeaderboardEntry = {
            username: user.username,
            score: score,
            date: new Date().toISOString().split('T')[0],
            userId: user.id
        };

        // Добавляем новую запись
        leaderboard.push(newEntry);

        // Сортируем по убыванию очков и убираем дубликаты (оставляем лучший результат пользователя)
        const uniqueLeaderboard = this.getUniqueBestScores(leaderboard);

        // Сохраняем топ-15
        const top15 = uniqueLeaderboard.slice(0, 15);
        localStorage.setItem(this.LEADERBOARD_KEY, JSON.stringify(top15));

        return top15;
    }

    getLeaderboard(): LeaderboardEntry[] {
        const data = localStorage.getItem(this.LEADERBOARD_KEY);
        return data ? JSON.parse(data) : [];
    }

    // Оставляем только лучший результат каждого пользователя
    private getUniqueBestScores(leaderboard: LeaderboardEntry[]): LeaderboardEntry[] {
        const bestScores = new Map<string, LeaderboardEntry>();

        leaderboard.forEach(entry => {
            const existing = bestScores.get(entry.userId);
            if (!existing || entry.score > existing.score) {
                bestScores.set(entry.userId, entry);
            }
        });

        return Array.from(bestScores.values())
            .sort((a, b) => b.score - a.score);
    }

    // === НАСТРОЙКИ ===

    saveSettings(settings: any) {
        localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(settings));
    }

    getSettings() {
        const data = localStorage.getItem(this.SETTINGS_KEY);
        return data ? JSON.parse(data) : {
            soundEnabled: true,
            musicEnabled: false,
            difficulty: 'normal'
        };
    }

    // === УТИЛИТЫ ===

    private generateId(): string {
        return 'user_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    }

    // Очистка всех данных (для тестирования)
    // clearAllData() {
    //     localStorage.removeItem(this.USER_KEY);
    //     localStorage.removeItem(this.LEADERBOARD_KEY);
    //     localStorage.removeItem(this.SETTINGS_KEY);
    // }
    clearUserData() {
        localStorage.removeItem(this.USER_KEY);
        localStorage.removeItem(this.SETTINGS_KEY);

    }

    // Экспорт данных
    exportData(): string {
        const data = {
            user: this.getUser(),
            leaderboard: this.getLeaderboard(),
            settings: this.getSettings(),
            exportedAt: new Date().toISOString()
        };
        return JSON.stringify(data, null, 2);
    }

    // Импорт данных
    importData(jsonData: string): boolean {
        try {
            const data = JSON.parse(jsonData);

            if (data.user) localStorage.setItem(this.USER_KEY, JSON.stringify(data.user));
            if (data.leaderboard) localStorage.setItem(this.LEADERBOARD_KEY, JSON.stringify(data.leaderboard));
            if (data.settings) localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(data.settings));

            return true;
        } catch (error) {
            console.error('Import error:', error);
            return false;
        }
    }
}

export const storageService = new LocalStorageService();