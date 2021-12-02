const mongoose = require('mongoose')

const reviewSchema = new mongoose.Schema({
  bookId: {
    type: mongoose.Types.ObjectId,
    required: 'bookId is required',
    refs: "Book"
  },
  reviewedBy: {
    type: String,
    required: 'reviewedBy is required',
    default: 'Guest',
  },
  reviewedAt: {
    type: Date,
    required: 'reviewedAt is required',
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: 'rating is required'
  },
  review: {
    type: String,
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date
  }
}, { timestamps: true })

module.exports = mongoose.model('Review', reviewSchema, 'review')