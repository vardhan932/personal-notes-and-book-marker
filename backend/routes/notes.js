const express = require('express');
const router = express.Router();
const Note = require('../models/Note');

// GET all notes (optional search and tag filter)
router.get('/', async (req, res) => {
    try {
        const { q, tags } = req.query;
        let query = {};

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
        isFavorite: req.body.isFavorite
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

    try {
        const updatedNote = await res.note.save();
        res.json(updatedNote);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE note
router.delete('/:id', getNote, async (req, res) => {
    try {
        await res.note.deleteOne();
        res.json({ message: 'Note deleted' });
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
