const express = require('express');
const router = express.Router({mergeParams: true});
const {validateReview, isLoggedIn, verifyReviewAuthor} = require('../middleware');
const reviews = require('../controllers/reviews');
const ExpressError = require('../utilities/ExpressError');
const catchAsync = require('../utilities/catchAsync');


// route for campground to review
router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview));

// delete route to delete review and reivew reference to the id
router.delete('/:reviewId', isLoggedIn, verifyReviewAuthor, catchAsync (reviews.deleteReview))

module.exports = router;