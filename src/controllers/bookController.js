const mongoose = require('mongoose')
const fs = require('fs')
const ObjectId = mongoose.Types.ObjectId

const { validator,aws } = require('../utils')
const { systemConfig } = require('../configs')
const { userModel, bookModel, reviewModel } = require('../models')

const createBook = async function (req, res) {
    try {
        const requestBody = JSON.parse(req.body.json)
        console.log(requestBody)
        const userIdFromToken = req.userId;
        const files = req.files;
        

// validate files
        if(!validator.isValidFiles(files)) {
            res.status(400).send({status:false,message:"cover photo is required"})
            return
        }

        if (!validator.isValidRequestBody(requestBody)) {
            res.status(400).send({ status: false, message: 'Invalid request parameters. Please provide book details' })
            return
        }

        if (!validator.isValidObjectId(userIdFromToken)) {
            res.status(400).send({ status: false, message: `${userIdFromToken} is not a valid token id` })
            return
        }

        // Extract params
        const { title, excerpt, userId, ISBN, category, subcategory, releasedAt } = requestBody;

        // Validation to check if parameters Exist
        if (!validator.isValid(title)) {
            res.status(400).send({ status: false, message: 'Title is required' })
            return
        }

        if (!validator.isValid(excerpt)) {
            res.status(400).send({ status: false, message: 'excerpt is required' })
            return
        }

        if (!validator.isValid(userId)) {
            res.status(400).send({ status: false, message: 'Userid is required' })
            return
        }

        if (!validator.isValid(ISBN)) {
            res.status(400).send({ status: false, message: `ISBN is required` })
            return
        }

        if (!validator.isValid(category)) {
            res.status(400).send({ status: false, message: 'category is required' })
            return
        }

        if (!validator.isValid(subcategory)) {
            res.status(400).send({ status: false, message: 'subcategory is required' })
            return
        }

        if (!validator.isValid(releasedAt)) {
            res.status(400).send({ status: false, message: `releasedAt is required` })
            return
        }

        // Validation to check if parameters Exist ends


        // Validation to check parameters type

        if (!validator.isValidString(title)) {
            res.status(400).send({ status: false, message: 'Title should be a String' })
            return
        }

        const isTitleAlreadyUsed = await bookModel.findOne({ title });

        if (isTitleAlreadyUsed) {
            res.status(400).send({ status: false, message: `${title} Title is already used` })
            return
        }

        if (!validator.isValidString(excerpt)) {
            res.status(400).send({ status: false, message: 'excerpt should be a String' })
            return
        }

        if (!validator.isValidObjectId(userId)) {
            res.status(400).send({ status: false, message: `${authorId} is not a valid author id` })
            return
        }

        const isUserIdValid = await userModel.findById(userId);

        if (!isUserIdValid) {
            res.status(400).send({ status: false, message: `User doesn't exist` })
            return
        }

        if (userIdFromToken !== userId) {
            res.status(400).send({ status: false, message: `You cannot create books with others userId` })
            return
        }

        if (!validator.isValidString(ISBN)) {
            res.status(400).send({ status: false, message: 'ISBN should be a String' })
            return
        }

        const isISBNAlreadyUsed = await bookModel.findOne({ ISBN });

        if (isISBNAlreadyUsed) {
            res.status(400).send({ status: false, message: `${ISBN} already exists` })
            return
        }

        if (!validator.isValidString(category)) {
            res.status(400).send({ status: false, message: 'category should be a String' })
            return
        }

// file code
        let bookCover = await aws.uploadFile(files[0])

        if(!bookCover) {
            res.status(400).send({status:false,msg:"no file"})
        }

        // Validation to check parameters type

        const bookData = {
            title,
            excerpt,
            userId,
            ISBN,
            category,
            releasedAt,
           bookCover
        }

        if (subcategory) {
            if (validator.isArray(subcategory)) {
                bookData['subcategory'] = [...subcategory]
            }
            if (validator.isValidString(subcategory)) {
                bookData['subcategory'] = [subcategory]
            }
        }

        const newBook = await bookModel.create(bookData)
        res.status(201).send({ status: true, message: 'Success', data: newBook })
    } catch (error) {
        console.log(error)
        res.status(500).send({ status: false, message: error.message });
    }
}

const listBooks = async function (req, res) {
    try {
        const filterQuery = { isDeleted: false }
        const queryParams = req.query
        const userIdFromToken = req.userId

        if (!validator.isValidObjectId(userIdFromToken)) {
            res.status(400).send({ status: false, message: `${userIdFromToken} is not a valid token id` })
            return
        }

        if (validator.isValidRequestBody(queryParams)) {
            const { userId, category, subcategory } = queryParams

            if (validator.isValid(userId) && validator.isValidObjectId(userId)) {
                filterQuery['userId'] = userId
            }

            if (validator.isValid(category)) {
                filterQuery['category'] = category.trim()
            }

            if (validator.isValid(subcategory)) {
                const subcatArr = subcategory.trim().split(',').map(subcat => subcat.trim());
                filterQuery['subcategory'] = { $all: subcatArr }
            }
        }

        const books = await bookModel.find(filterQuery, { _id: 1, title: 1, excerpt: 1, userId: 1, category: 1, releasedAt: 1, reviews: 1, subcategory: 1 }).sort({ title: 1 })

        if (Array.isArray(books) && books.length === 0) {
            res.status(404).send({ status: false, message: 'No books found' })
            return
        }

        res.status(200).send({ status: true, message: 'Books list', data: books })
    } catch (error) {
        res.status(500).send({ status: false, message: error.message });
    }
}

const getBookById = async function (req, res) {
    try {
        const bookId = req.params.bookId

        const userIdFromToken = req.userId

        if (!validator.isValidObjectId(bookId)) {
            res.status(400).send({ status: false, message: `${bookId} is not a valid book id` })
            return
        }

        if (!validator.isValidObjectId(userIdFromToken)) {
            res.status(400).send({ status: false, message: `${userIdFromToken} is not a valid token id` })
            return
        }

        const book = await bookModel.findOne({_id: bookId, isDeleted: false, deletedAt: null}, { __v: 0 })

        if (!book) {
            res.status(404).send({ status: false, message: "Book not found" })
        }

        if (book) {
            let reviews = await reviewModel.find({ bookId: book._id, isDeleted: false, deletedAt: null },{createdAt:0, __v: 0, updatedAt:0, isDeleted:0})
            if (reviews) {
                res.status(201).send({
                    status: true, message: "Books List", data: {
                        book,
                        "reviewsData": reviews
                    }
                })
            }
        }
    } catch (error) {
        res.status(500).send({ status: false, message: error.message });
    }
}

const updateBook = async function (req, res) {
    try {
        const requestBody = req.body
        const bookId = req.params.bookId
        const userIdFromToken = req.userId

        // Validation stats
        if (!validator.isValidObjectId(bookId)) {
            res.status(400).send({ status: false, message: `${bookId} is not a valid book id` })
            return
        }

        if (!validator.isValidObjectId(userIdFromToken)) {
            res.status(400).send({ status: false, message: `${userIdFromToken} is not a valid token id` })
            return
        }

        const book = await bookModel.findOne({ _id: bookId, isDeleted: false, deletedAt: null })

        if (!book) {
            res.status(404).send({ status: false, message: `Book not found` })
            return
        }

        let userId = book.userId

        if (userId.toString() !== userIdFromToken) {
            res.status(400).send({ status: false, message: `You Dont have access to this Book try using your Id's of books you have posted` })
            return
        }

        if (!validator.isValidRequestBody(requestBody)) {
            res.status(200).send({ status: true, message: 'No paramateres passed. Book unmodified'})
            return
        }

        // Extract params

        const { title, excerpt, releasedAt, ISBN } = requestBody;

        const updatedBookData = {}

        if (validator.isValid(title)) {
            if (!Object.prototype.hasOwnProperty.call(updatedBookData, '$set')) updatedBookData['$set'] = {}
            updatedBookData['$set']['title'] = title
        }

        const isTitleAlreadyUsed = await bookModel.findOne({ title });

        if (isTitleAlreadyUsed) {
            res.status(400).send({ status: false, message: `${title} Title is already used` })
            return
        }

        if (validator.isValid(excerpt)) {
            if (!Object.prototype.hasOwnProperty.call(updatedBookData, '$set')) updatedBookData['$set'] = {}
            updatedBookData['$set']['excerpt'] = excerpt
        }

        if (validator.isValid(releasedAt)) {
            if (!Object.prototype.hasOwnProperty.call(updatedBookData, '$set')) updatedBookData['$set'] = {}
            updatedBookData['$set']['releasedAt'] = releasedAt
        }

        if (validator.isValid(ISBN)) {
            if (!Object.prototype.hasOwnProperty.call(updatedBookData, '$set')) updatedBookData['$set'] = {}
            updatedBookData['$set']['ISBN'] = ISBN
        }


        const isISBNAlreadyUsed = await bookModel.findOne({ ISBN });

        if (isISBNAlreadyUsed) {
            res.status(400).send({ status: false, message: `${ISBN} Title is already used` })
            return
        }

        const updatedBook = await bookModel.findOneAndUpdate({ _id: bookId }, updatedBookData, { new: true })

        res.status(200).send({ status: true, message: 'Book updated successfully', data: updatedBook });

    } catch (error) {
        res.status(500).send({ status: false, message: error.message });
    }
}

const deleteBookByID = async function (req, res) {
    try {
        const bookId = req.params.bookId

        const userIdFromToken = req.userId

        if (!validator.isValidObjectId(bookId)) {
            res.status(400).send({ status: false, message: `${bookId} is not a valid book id` })
        }

        if (!validator.isValidObjectId(userIdFromToken)) {
            res.status(400).send({ status: false, message: `${userIdFromToken} is not a valid token id` })
        }

        const book = await bookModel.findOne({ _id: bookId, isDeleted: false, deletedAt: null })

        if (!book) {
            res.status(404).send({ status: false, message: `Book not found` })
        }


        if (book.isDeleted && deletedAt !== null) {
            res.status(404).send({ status: false, message: `Book is already deleted.` })
        }


        let userId = book.userId

        if (userId.toString() !== userIdFromToken) {
            res.status(400).send({ status: false, message: `You Dont have access to this Book try using your Id's of books you have posted` })
            return
        }

        await bookModel.findOneAndUpdate({ _id: bookId }, { $set: { isDeleted: true, deletedAt: new Date() } })

        res.status(200).send({ status: true, message: `Book deleted successfully` })

    } catch (error) {

        res.status(500).send({ status: false, message: error.message });

    }
}


module.exports = {
    createBook,
    listBooks,
    getBookById,
    updateBook,
    deleteBookByID
}