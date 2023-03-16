const { campgroundJoiSchema, reviewJoiSchema } = require('./schemas');
const ExpressError = require('./utilities/ExpressError');
const Campground = require('./models/campground');
const Review = require('./models/review');

module.exports.isLoggedIn = (req, res, next) => {
    if(!req.isAuthenticated()){         
        //store url from user that is requesting          
        req.session.returnTo = req.originalUrl                                           //isAuthenticated comes from passport
        req.flash('error', 'You must be signed in')
        return res.redirect('/login');
    }
    next();
}

// you can name whatever for returnTo


// joi campgroundschema validation checks before mongoose is even involved
module.exports.validateCampground = (req, res, next) => {
    const { error } = campgroundJoiSchema.validate(req.body);
    if (error){
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

// middleware to verify authorization
module.exports.verifyAuthor = async (req, res, next) => {
    const {id} = req.params;
    const campground = await Campground.findById(id);
    if (!campground.author.equals(req.user._id)) {
        req.flash('error', 'You do not have the permission to do that.');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}

// to verify the author assiociated with the review
module.exports.verifyReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;                                    // destructure id as well because to redirect, our route is /campgrounds/id/reviews/reviewId
    const review = await Review.findById(reviewId);
    if (!review.author.equals(req.user._id)) {
        req.flash('error', 'You do not have the permission to do that.');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}

// joi reviewschema validation
module.exports.validateReview = (req, res, next) => {
    const { error } = reviewJoiSchema.validate(req.body);
    if (error){
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}
