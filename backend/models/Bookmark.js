const mongoose = require('mongoose');

const bookmarkSchema = new mongoose.Schema({
    url: {
        type: String,
        required: true,
        trim: true
    },
    title: {
        type: String,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    tags: [{
        type: String,
        trim: true
    }],
    isFavorite: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Bookmark', bookmarkSchema);
