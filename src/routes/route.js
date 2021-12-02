const express = require('express');

const router = express.Router();

const { userController, bookController, reviewController } = require('../controllers');
const { userAuth } = require('../middlewares')
// Author routes
router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);

// Book routes
router.post('/books', userAuth, bookController.createBook);

router.get('/books', userAuth, bookController.listBooks);

router.get('/books/:bookId', userAuth, bookController.getBookById);

router.put('/books/:bookId', userAuth, bookController.updateBook);

router.delete('/books/:bookId', userAuth, bookController.deleteBookByID);

// Review routes
router.post('/books/:bookId/review', reviewController.createReview);

router.put('/books/:bookId/review/:reviewId', reviewController.updateReview);

router.delete('/books/:bookId/review/:reviewId', reviewController.deleteReview);

module.exports = router;