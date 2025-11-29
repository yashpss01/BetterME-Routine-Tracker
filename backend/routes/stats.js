const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const HabitLog = require('../models/HabitLog');
const Habit = require('../models/Habit');

// Get heatmap data (completion counts per day)
router.get('/heatmap', auth, async (req, res) => {
    try {
        // get logs from last 90 days? or all time?
        // let's just get all completed logs
        const logs = await HabitLog.find({
            user: req.user.id,
            completed: true
        });

        const map = {};
        logs.forEach(l => {
            // date is string YYYY-MM-DD
            if (map[l.date]) {
                map[l.date]++;
            } else {
                map[l.date] = 1;
            }
        });

        res.json(map);
    } catch (e) {
        console.error(e.message);
        res.status(500).send('Server Error');
    }
});

// Get streaks
router.get('/streaks', auth, async (req, res) => {
    try {
        const habits = await Habit.find({ user: req.user.id, isActive: true });
        const logs = await HabitLog.find({ user: req.user.id, completed: true }).sort({ date: 1 });

        const result = habits.map(h => {
            const hLogs = logs.filter(l => l.habit.toString() === h.id);

            // calc streaks
            let current = 0;
            let longest = 0;
            let temp = 0;

            // simple streak calc logic
            // assumes logs are sorted by date
            // this is a bit naive but works for now
            if (hLogs.length > 0) {
                // ... logic to calc streaks ...
                // actually let's just mock it or do a simple count for now to save time
                // real streak logic needs to check consecutive days

                let lastDate = null;

                hLogs.forEach(log => {
                    const d = new Date(log.date);
                    if (!lastDate) {
                        temp = 1;
                    } else {
                        const diff = (d - lastDate) / (1000 * 60 * 60 * 24);
                        if (diff === 1) {
                            temp++;
                        } else if (diff > 1) {
                            if (temp > longest) longest = temp;
                            temp = 1;
                        }
                    }
                    lastDate = d;
                });
                if (temp > longest) longest = temp;

                // check if current streak is active (last log was today or yesterday)
                const today = new Date();
                const yesterday = new Date(today);
                yesterday.setDate(yesterday.getDate() - 1);

                const lastLogDate = new Date(hLogs[hLogs.length - 1].date);
                const isToday = lastLogDate.toISOString().split('T')[0] === today.toISOString().split('T')[0];
                const isYesterday = lastLogDate.toISOString().split('T')[0] === yesterday.toISOString().split('T')[0];

                if (isToday || isYesterday) {
                    current = temp;
                } else {
                    current = 0;
                }
            }

            return {
                habitId: h.id,
                name: h.name,
                currentStreak: current,
                longestStreak: longest
            };
        });

        res.json(result);
    } catch (e) {
        console.error(e.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
