// gamification.js

// --- Configuration ---
const POINTS_CONFIG = {
    calculate_footprint: 15,
    set_goal: 10,
};

const ACHIEVEMENTS_CONFIG = [
    { 
        id: 'first_calculation', 
        name: 'Carbon Counter', 
        description: 'Calculate your carbon footprint for the first time.', 
        icon: 'fas fa-calculator',
        points: 25,
        unlocks: (stats) => stats.calculations >= 1
    },
    { 
        id: 'goal_setter', 
        name: 'Ambitious Achiever', 
        description: 'Set your first sustainability goal.', 
        icon: 'fas fa-bullseye',
        points: 20,
        unlocks: (stats) => stats.goalsSet >= 1
    },
    { 
        id: 'points_100', 
        name: 'Eco-Enthusiast', 
        description: 'Earn 100 EcoPoints.', 
        icon: 'fas fa-star',
        points: 50,
        unlocks: (stats) => stats.points >= 100
    },
    { 
        id: 'five_calculations', 
        name: 'Consistent Calculator', 
        description: 'Calculate your footprint 5 times.', 
        icon: 'fas fa-sync-alt',
        points: 50,
        unlocks: (stats) => stats.calculations >= 5
    },
    { 
        id: 'three_goals', 
        name: 'Goal Getter', 
        description: 'Set 3 sustainability goals.', 
        icon: 'fas fa-trophy',
        points: 40,
        unlocks: (stats) => stats.goalsSet >= 3
    },
    { 
        id: 'points_250', 
        name: 'Eco-Warrior', 
        description: 'Earn 250 EcoPoints.', 
        icon: 'fas fa-shield-alt',
        points: 100,
        unlocks: (stats) => stats.points >= 250
    }
];

const DB_KEYS = {
    stats: 'ecoTrackStats',
    unlocked: 'ecoTrackUnlockedAchievements'
};

// --- Core Functions ---

/**
 * Gets the user's current stats from localStorage.
 * @returns {object} The user's stats.
 */
function getStats() {
    const defaults = {
        points: 0,
        calculations: 0,
        goalsSet: 0,
    };
    try {
        const stats = JSON.parse(localStorage.getItem(DB_KEYS.stats));
        return { ...defaults, ...stats };
    } catch (e) {
        return defaults;
    }
}

/**
 * Saves the user's stats to localStorage.
 * @param {object} stats - The stats object to save.
 */
function saveStats(stats) {
    localStorage.setItem(DB_KEYS.stats, JSON.stringify(stats));
}

/**
 * Gets the set of unlocked achievement IDs from localStorage.
 * @returns {Set<string>} A set of unlocked achievement IDs.
 */
function getUnlockedAchievements() {
    try {
        const unlocked = JSON.parse(localStorage.getItem(DB_KEYS.unlocked)) || [];
        return new Set(unlocked);
    } catch (e) {
        return new Set();
    }
}

/**
 * Saves the set of unlocked achievement IDs to localStorage.
 * @param {Set<string>} unlockedSet - The set of unlocked achievement IDs.
 */
function saveUnlockedAchievements(unlockedSet) {
    localStorage.setItem(DB_KEYS.unlocked, JSON.stringify([...unlockedSet]));
}

/**
 * Awards points for a specific action and updates stats.
 * @param {string} actionType - The type of action (e.g., 'calculate_footprint').
 */
function awardAction(actionType) {
    const stats = getStats();
    
    // Add points for the action
    if (POINTS_CONFIG[actionType]) {
        stats.points += POINTS_CONFIG[actionType];
    }

    // Update specific stats
    if (actionType === 'calculate_footprint') {
        stats.calculations += 1;
    } else if (actionType === 'set_goal') {
        stats.goalsSet += 1;
    }

    saveStats(stats);
    checkAndUnlockAchievements();
}

/**
 * Checks for and unlocks any new achievements based on current stats.
 */
function checkAndUnlockAchievements() {
    const stats = getStats();
    const unlocked = getUnlockedAchievements();

    ACHIEVEMENTS_CONFIG.forEach(ach => {
        if (!unlocked.has(ach.id) && ach.unlocks(stats)) {
            // Unlock it!
            unlocked.add(ach.id);
            stats.points += ach.points;
            showAchievementNotification(ach);
        }
    });

    saveStats(stats);
    saveUnlockedAchievements(unlocked);
}

/**
 * Displays a notification for a newly unlocked achievement.
 * @param {object} achievement - The achievement object that was unlocked.
 */
function showAchievementNotification(achievement) {
    // This is a placeholder for a more robust notification system.
    // For now, we'll use a simple alert.
    console.log(`Achievement Unlocked: ${achievement.name}! You earned ${achievement.points} points.`);
    
    // A more advanced version could create a toast/popup element.
    const notificationDiv = document.createElement('div');
    notificationDiv.className = 'achievement-toast';
    notificationDiv.innerHTML = `
        <i class="fas fa-trophy"></i>
        <div>
            <h4>Achievement Unlocked!</h4>
            <p>${achievement.name}</p>
        </div>
    `;
    document.body.appendChild(notificationDiv);

    // Add styles for the toast
    const style = document.createElement('style');
    style.textContent = `
        .achievement-toast {
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: linear-gradient(135deg, #2ECC71, #27AE60);
            color: white;
            padding: 20px;
            border-radius: 12px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.2);
            display: flex;
            align-items: center;
            gap: 15px;
            z-index: 2000;
            animation: slideInUp 0.5s ease-out, fadeOut 0.5s ease-in 4.5s forwards;
        }
        .achievement-toast i {
            font-size: 24px;
        }
        @keyframes slideInUp {
            from { transform: translateY(100px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
        }
    `;
    document.head.appendChild(style);

    setTimeout(() => {
        notificationDiv.remove();
        style.remove();
    }, 5000);
}
