const express = require('express');
const router = express.Router();
const Bookmark = require('../models/Bookmark');
// Bonus: Title fetching (placeholder, can use 'axios' and 'cheerio' later)
// const axios = require('axios');
// const cheerio = require('cheerio');

// GET all bookmarks
router.get('/', async (req, res) => {
    try {
        const { q, tags, deleted } = req.query;
        let query = {};

        // By default, exclude deleted bookmarks unless explicitly requested
        if (deleted === 'true') {
            query.isDeleted = true;
        } else {
            query.isDeleted = { $ne: true };
        }

        if (q) {
            query.$or = [
                { title: { $regex: q, $options: 'i' } },
                { description: { $regex: q, $options: 'i' } },
                { url: { $regex: q, $options: 'i' } }
            ];
        }

        if (tags) {
            const tagList = tags.split(',').map(tag => tag.trim());
            query.tags = { $in: tagList };
        }

        const bookmarks = await Bookmark.find(query).sort({ createdAt: -1 });
        res.json(bookmarks);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET single bookmark
router.get('/:id', getBookmark, (req, res) => {
    res.json(res.bookmark);
});

// POST create bookmark
router.post('/', async (req, res) => {
    // Basic URL validation
    const urlPattern = new RegExp('^(https?:\\/\\/)?' + // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
        '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator

    if (!urlPattern.test(req.body.url)) {
        return res.status(400).json({ message: 'Invalid URL' });
    }

    const bookmark = new Bookmark({
        url: req.body.url,
        title: req.body.title || req.body.url, // Default title to URL if empty
        description: req.body.description,
        tags: req.body.tags,
        isFavorite: req.body.isFavorite
    });

    try {
        const newBookmark = await bookmark.save();
        res.status(201).json(newBookmark);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// PUT update bookmark
router.put('/:id', getBookmark, async (req, res) => {
    if (req.body.url != null) {
        res.bookmark.url = req.body.url;
    }
    if (req.body.title != null) {
        res.bookmark.title = req.body.title;
    }
    if (req.body.description != null) {
        res.bookmark.description = req.body.description;
    }
    if (req.body.tags != null) {
        res.bookmark.tags = req.body.tags;
    }
    if (req.body.isFavorite != null) {
        res.bookmark.isFavorite = req.body.isFavorite;
    }

    try {
        const updatedBookmark = await res.bookmark.save();
        res.json(updatedBookmark);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE bookmark (soft delete)
router.delete('/:id', getBookmark, async (req, res) => {
    try {
        res.bookmark.isDeleted = true;
        res.bookmark.deletedAt = new Date();
        await res.bookmark.save();
        res.json({ message: 'Bookmark moved to recycle bin' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// RESTORE bookmark from recycle bin
router.patch('/:id/restore', getBookmark, async (req, res) => {
    try {
        res.bookmark.isDeleted = false;
        res.bookmark.deletedAt = null;
        await res.bookmark.save();
        res.json({ message: 'Bookmark restored successfully', bookmark: res.bookmark });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// PERMANENT DELETE bookmark
router.delete('/:id/permanent', getBookmark, async (req, res) => {
    try {
        await res.bookmark.deleteOne();
        res.json({ message: 'Bookmark permanently deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Middleware function to get bookmark by ID
async function getBookmark(req, res, next) {
    let bookmark;
    try {
        bookmark = await Bookmark.findById(req.params.id);
        if (bookmark == null) {
            return res.status(404).json({ message: 'Cannot find bookmark' });
        }
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }

    res.bookmark = bookmark;
    next();
}

module.exports = router;
