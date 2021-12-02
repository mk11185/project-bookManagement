const mongoose = require('mongoose')

const bookSchema = new mongoose.Schema({
    title: {
        type: String, 
        required: 'Book title is required', 
        unique: true
    },
    excerpt: {
        type: String, 
        required: 'excerpt is required'
    }, 
    userId: {
        type:  mongoose.Types.ObjectId, 
        required: 'userId is required', 
        refs: 'User'
    },
    ISBN: {
        type: String, 
        required: 'ISBN is required', 
        unique: true
    },
    category: {
        type: String, 
        required: 'Category is required', 
    }, 
    subcategory: {
        type: Array, 
        required: 'subcategory is required', 
    },
    reviews: {
        type: Number, 
        default: 0,
    },
    deletedAt: {
        type: Date
    }, 
    isDeleted: {
        type: Boolean, 
        default: false
    },
    releasedAt: {
        type: Date, 
        required: 'releasedAt is required',
        },
    bookCover : {
        type : String
    }
}, { timestamps: true })

module.exports = mongoose.model('Book', bookSchema, 'book')