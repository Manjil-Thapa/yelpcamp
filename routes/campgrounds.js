const express = require('express');
const router = express.Router();
const campgrounds = require('../controllers/campgrounds');
const catchAsync = require('../utilities/catchAsync');
const {isLoggedIn, validateCampground, verifyAuthor} = require('../middleware');
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });

const Campground = require('../models/campground');

router.route('/')
    .get(catchAsync(campgrounds.index))                                 // show all campgrounds
    .post(
        isLoggedIn,
        upload.array('image'), 
        validateCampground,
        catchAsync(campgrounds.createCampground))                       // route to new form submission

// route to create new campground
router.get('/new', isLoggedIn, campgrounds.renderNewForm);

router.route('/:id')
    .get(catchAsync(campgrounds.showCampground))                        // route for showing more info about a campground
    .put(
        isLoggedIn, 
        verifyAuthor,
        upload.array('image'), 
        validateCampground, 
        catchAsync(campgrounds.updateCampground))                       // route for edit form submission
    .delete(
        isLoggedIn, 
        verifyAuthor, 
        catchAsync(campgrounds.deleteCampground))                       // route to delete campground


// route to edit/update campground
router.get('/:id/edit', isLoggedIn, verifyAuthor, catchAsync(campgrounds.renderEditForm));


module.exports = router;