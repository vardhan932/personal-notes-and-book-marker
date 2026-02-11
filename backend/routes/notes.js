const express = require('express');
const router = express.Router();
const Note = require('../models/Note');
const authMiddleware = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(authMiddleware);

// GET all notes (optional search and tag filter)
router.get('/', async (req, res) => {
    try {
        const { q, tags, deleted } = req.query;
        let query = { userId: req.userId };

        // By default, exclude deleted notes unless explicitly requested
        if (deleted === 'true') {
            query.isDeleted = true;
        } else {
            query.isDeleted = { $ne: true };
        }

        if (q) {
            query.$or = [
                { title: { $regex: q, $options: 'i' } },
                { content: { $regex: q, $options: 'i' } }
            ];
        }

        if (tags) {
            const tagList = tags.split(',').map(tag => tag.trim());
            query.tags = { $in: tagList };
        }

        const notes = await Note.find(query).sort({ createdAt: -1 });
        res.json(notes);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET single note
router.get('/:id', getNote, (req, res) => {
    res.json(res.note);
});

// POST create note
router.post('/', async (req, res) => {
    const note = new Note({
        title: req.body.title,
        content: req.body.content,
        tags: req.body.tags,
        isFavorite: req.body.isFavorite,
        reminderDate: req.body.reminderDate,
        userId: req.userId
    });

    try {
        const newNote = await note.save();
        res.status(201).json(newNote);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// PUT update note
router.put('/:id', getNote, async (req, res) => {
    if (req.body.title != null) {
        res.note.title = req.body.title;
    }
    if (req.body.content != null) {
        res.note.content = req.body.content;
    }
    if (req.body.tags != null) {
        res.note.tags = req.body.tags;
    }
    if (req.body.isFavorite != null) {
        res.note.isFavorite = req.body.isFavorite;
    }
    if (req.body.reminderDate !== undefined) {
        res.note.reminderDate = req.body.reminderDate;
    }

    try {
        const updatedNote = await res.note.save();
        res.json(updatedNote);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE note (soft delete)
router.delete('/:id', getNote, async (req, res) => {
    try {
        res.note.isDeleted = true;
        res.note.deletedAt = new Date();
        await res.note.save();
        res.json({ message: 'Note moved to recycle bin' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// BULK DELETE notes (soft delete)
router.post('/bulk-delete', async (req, res) => {
    try {
        const { ids } = req.body;
        if (!ids || !Array.isArray(ids)) {
            return res.status(400).json({ message: 'Invalid IDs provided' });
        }

        await Note.updateMany(
            { _id: { $in: ids }, userId: req.userId },
            { $set: { isDeleted: true, deletedAt: new Date() } }
        );

        res.json({ message: `${ids.length} notes moved to recycle bin` });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// RESTORE note from recycle bin
router.patch('/:id/restore', getNote, async (req, res) => {
    try {
        res.note.isDeleted = false;
        res.note.deletedAt = null;
        await res.note.save();
        res.json({ message: 'Note restored successfully', note: res.note });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// PERMANENT DELETE note
router.delete('/:id/permanent', getNote, async (req, res) => {
    try {
        await res.note.deleteOne();
        res.json({ message: 'Note permanently deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Middleware function to get note by ID
async function getNote(req, res, next) {
    let note;
    try {
        note = await Note.findById(req.params.id);
        if (note == null) {
            return res.status(404).json({ message: 'Cannot find note' });
        }
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }

    res.note = note;
    next();
}

module.exports = router;
