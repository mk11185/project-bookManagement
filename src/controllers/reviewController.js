const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId

const { validator } = require('../utils')
const { systemConfig } = require('../configs')
const { userModel, bookModel, reviewModel } = require('../models')


const createReview = async function (req, res) {
    try {
        const requestBody = req.body;
        const bookId = req.params.bookId;

        if (!validator.isValidRequestBody(requestBody)) {
            res.status(400).send({ status: false, message: 'Invalid request parameters. Please provide review details' })
            return
        }

        // Extract params
        const { reviewedBy, rating, review } = requestBody;

        // Validation starts
        if (!validator.isValid(bookId)) {
            res.status(400).send({ status: false, message: 'bookId is required' })
            return
        }

        if (!validator.isValidObjectId(bookId)) {
            res.status(400).send({ status: false, message: `${bookId} is not a valid book id` })
        }

        let book = await bookModel.findOne({ _id: bookId, isDeleted: false, deletedAt: null })

        if (!book) {
            res.status(404).send({ status: false, message: 'Book not found' })
            return
        }

        if (!validator.isValid(rating)) {
            res.status(400).send({ status: false, message: 'rating is required' })
            return
        }

        if (!validator.isValidNumber(rating)) {
            res.status(400).send({ status: false, message: 'rating should be a String' })
            return
        }

        if (!validator.ratingRange(rating)) {
            res.status(400).send({ status: false, message: 'rating should be in a range 1-5' })
            return
        }
        // Validation ends

        const reviewData = {
            bookId,
            reviewedBy,
            reviewedAt: new Date(),
            rating,
            review
        }

        const newReview = await reviewModel.create(reviewData)

        const bookReview = await bookModel.findOneAndUpdate({ _id: bookId, isDeleted: false, deletedAt: null }, { $inc: { reviews: 1 } })

        let reviewDisplay = {_id: newReview._id, rating: newReview.rating, reviewedBy: newReview.reviewedBy, reviewedAt: newReview. reviewedAt , review: newReview.review}

        res.status(201).send({ status: true, message: 'Review added successfully', data: reviewDisplay })

    } catch (error) {
        console.log(error)
        res.status(500).send({ status: false, message: error.message });
    }
}


const updateReview = async function (req, res) {
    try {
        const requestBody = req.body
        const bookId = req.params.bookId
        const reviewId = req.params.reviewId

        // Validation stats
        if (!validator.isValidObjectId(bookId)) {
            res.status(400).send({ status: false, message: `${bookId} is not a valid book id` })
            return
        }

        const book = await bookModel.findOne({ _id: bookId, isDeleted: false, deletedAt: null })

        if (!book) {
            res.status(404).send({ status: false, message: `Book not found` })
            return
        }

        if (!validator.isValidObjectId(reviewId)) {
            res.status(400).send({ status: false, message: `${reviewId} is not a valid review id` })
            return
        }

        let reviewExist = await reviewModel.findOne({ _id: reviewId, isDeleted: false, deletedAt: null })

        if (!reviewExist) {
            res.status(400).send({ status: false, message: `Review Not found` })
            return
        }

        if (!validator.isValidRequestBody(requestBody)) {
            res.status(200).send({ status: true, message: 'No paramateres passed. Book unmodified' })
            return
        }

        // Extract params

        const { reviewedBy, rating, review } = requestBody;

        const updatedReviewData = {}

        if (validator.isValid(reviewedBy)) {
            if (!Object.prototype.hasOwnProperty.call(updatedReviewData, '$set')) updatedReviewData['$set'] = {}
            updatedReviewData['$set']['reviewedBy'] = reviewedBy
        }

        if (validator.isValid(rating)) {
            if (!validator.ratingRange(rating)) {
                res.status(400).send({ status: false, message: 'rating should be in a range 1-5' })
                return
            }
            if (!Object.prototype.hasOwnProperty.call(updatedReviewData, '$set')) updatedReviewData['$set'] = {}
            updatedReviewData['$set']['rating'] = rating
        }

        if (validator.isValid(review)) {
            if (!Object.prototype.hasOwnProperty.call(updatedReviewData, '$set')) updatedReviewData['$set'] = {}
            updatedReviewData['$set']['review'] = review
        }

        const updatedReview = await reviewModel.findOneAndUpdate({ _id: reviewId }, updatedReviewData, { new: true }).select("-createdAt -__v  -updatedAt -isDeleted")

        res.status(200).send({ status: true, message: 'Review updated successfully', data: updatedReview });

    } catch (error) {
        res.status(500).send({ status: false, message: error.message });
    }
}


const deleteReview = async function (req, res) {
    try {
        const bookId = req.params.bookId
        const reviewId = req.params.reviewId

        if (!validator.isValidObjectId(bookId)) {
            res.status(400).send({ status: false, message: `${bookId} is not a valid book id` })
        }

        const book = await bookModel.findOne({ _id: bookId, isDeleted: false, deletedAt: null })

        if (!book) {
            res.status(404).send({ status: false, message: `Book not found` })
        }

        if (!validator.isValidObjectId(reviewId)) {
            res.status(400).send({ status: false, message: `${reviewId} is not a valid review id` })
        }

        let reviewExist = await reviewModel.findOne({ _id: reviewId, isDeleted: false, deletedAt: null });

        if (!reviewExist) {
            res.status(400).send({ status: false, message: `Review not found` })
            return
        }

        await reviewModel.findOneAndUpdate({ _id: reviewId }, { $set: { isDeleted: true, deletedAt: new Date() } })

        await bookModel.findOneAndUpdate({ _id: bookId, isDeleted: false, deletedAt: null }, { $inc: { reviews: -1 } })

        res.status(200).send({ status: true, message: `Review deleted successfully` })

    } catch (error) {

        res.status(500).send({ status: false, message: error.message });

    }
}



module.exports = {
    createReview,
    updateReview,
    deleteReview
}