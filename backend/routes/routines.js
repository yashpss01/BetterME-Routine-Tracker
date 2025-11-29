const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Routine = require('../models/Routine');

// List all
router.get('/', auth, async (req, res) => {
    try {
        const list = await Routine.find({ user: req.user.id }).populate('habits');
        res.json(list);
    } catch (e) {
        console.error("Routine fetch error:", e);
        res.status(500).send('Server Error');
    }
});

// Add new
router.post('/', auth, async (req, res) => {
    const { name, habits } = req.body;

    if (!name) return res.status(400).json({ msg: 'Name missing' });

    try {
        const newRoutine = new Routine({
            user: req.user.id,
            name,
            habits
        });

        await newRoutine.save();
        res.json(newRoutine);
    } catch (e) {
        res.status(500).send('Server Error');
    }
});

// Remove
router.delete('/:id', auth, async (req, res) => {
    try {
        const routine = await Routine.findById(req.params.id);

        if (!routine) return res.status(404).json({ msg: 'Not found' });

        // verify ownership
        if (routine.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not yours' });
        }

        await Routine.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Deleted' });
    } catch (e) {
        console.error(e.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
