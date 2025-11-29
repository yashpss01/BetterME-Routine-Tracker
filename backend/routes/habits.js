const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Habit = require('../models/Habit');
const HabitLog = require('../models/HabitLog');

// Get my habits
router.get('/', auth, async (req, res) => {
    try {
        // sort by newest first
        const list = await Habit.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.json(list);
    } catch (err) {
        console.log("GET /habits error", err);
        res.status(500).send('Server Error');
    }
});

// Create a habit
router.post('/', auth, async (req, res) => {
    const { name, category, targetType, targetValue } = req.body;

    if (!name) return res.status(400).send("Name is required");

    try {
        const newDoc = new Habit({
            user: req.user.id,
            name,
            category: category || 'Personal',
            targetType,
            targetValue
        });

        const saved = await newDoc.save();
        res.json(saved);
    } catch (e) {
        console.error(e);
        res.status(500).send('Could not save habit');
    }
});

// Update
router.put('/:id', auth, async (req, res) => {
    const { name, category, targetType, targetValue, isActive } = req.body;

    // messy object build
    let updateData = {};
    if (name) updateData.name = name;
    if (category) updateData.category = category;
    if (targetType) updateData.targetType = targetType;
    if (targetValue) updateData.targetValue = targetValue;
    if (typeof isActive !== 'undefined') updateData.isActive = isActive;

    try {
        let habit = await Habit.findById(req.params.id);
        if (!habit) return res.status(404).json({ msg: 'Not found' });

        // security check
        if (habit.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not your habit' });
        }

        habit = await Habit.findByIdAndUpdate(
            req.params.id,
            { $set: updateData },
            { new: true }
        );

        res.json(habit);
    } catch (e) {
        console.error(e.message);
        res.status(500).send('Server Error');
    }
});

// Delete
router.delete('/:id', auth, async (req, res) => {
    try {
        const habit = await Habit.findById(req.params.id);

        if (!habit) return res.status(404).json({ msg: 'Habit not found' });

        if (habit.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Unauthorized' });
        }

        await Habit.findByIdAndDelete(req.params.id);

        // TODO: Should we delete logs too?
        // await HabitLog.deleteMany({ habit: req.params.id });

        res.json({ msg: 'Deleted' });
    } catch (e) {
        res.status(500).send('Server Error');
    }
});

// Toggle/Log habit
router.post('/log', auth, async (req, res) => {
    const { habitId, date, completed, progress } = req.body;

    try {
        // check if exists
        let log = await HabitLog.findOne({
            user: req.user.id,
            habit: habitId,
            date: date
        });

        if (log) {
            log.completed = completed;
            log.progress = progress;
            await log.save();
        } else {
            log = new HabitLog({
                user: req.user.id,
                habit: habitId,
                date,
                completed,
                progress
            });
            await log.save();
        }

        res.json(log);
    } catch (e) {
        console.log(e);
        res.status(500).send('Log error');
    }
});

// Get logs for date
router.get('/logs/:date', auth, async (req, res) => {
    try {
        const logs = await HabitLog.find({
            user: req.user.id,
            date: req.params.date
        });
        res.json(logs);
    } catch (e) {
        res.status(500).send('Server Error');
    }
});

module.exports = router;
