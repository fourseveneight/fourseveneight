const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Article name required'],
    },
    content: {
        type: String,
        required: [true, 'Article must have body'],
    },
    date: {
        type: Date,
        default: Date.now(),
    }, 
    author: {
        type: String,
        required: [true, 'Article must have author'],
    },
    status: {
        type: Boolean,
        default: false,
    }
})

const Article = mongoose.model('Article', articleSchema);
module.exports = Article;
