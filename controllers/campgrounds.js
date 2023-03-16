const Campground = require('../models/campground');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });
const { cloudinary } = require('../cloudinary');

module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({})
    res.render('campgroundRoutes/index', { campgrounds })
}

module.exports.renderNewForm = (req, res) => {
    res.render('campgroundRoutes/new')
};

module.exports.createCampground = async (req, res, next) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()

    const campground = new Campground(req.body.campground);
    campground.geometry = geoData.body.features[0].geometry;                    // getting data from mapbox json
    campground.images = req.files.map(f => ({ url: f.path, filename: f.filename })) // from cloudinary
    campground.author = req.user._id;               // current logged in author
    await campground.save();
    console.log(campground);
    req.flash('success', 'Successfully created a new campground!');
    res.redirect(`campgrounds/${campground._id}`)
};

module.exports.showCampground = async (req, res) => {
    const showCampground = await Campground.findById(req.params.id).populate({
        path:'reviews',                                                             //populating all the reviews from the review array on the one campground we are finding
        populate: {                                                                 //then populate the author that is acssiocated with the reviews
            path:'author'
        }
    }).populate('author');                                                          //then seperately populate the one author on the campground
    if ( !showCampground ) {
        req.flash('error', 'Campground not found');
        return res.redirect('/campgrounds');
    }
    res.render('campgroundRoutes/show', { showCampground });
};

module.exports.renderEditForm = async (req, res) => {
    const {id} = req.params;
    const campground = await Campground.findById(id)
    if (!campground) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgroundRoutes/edit', { campground })
};

module.exports.updateCampground = async (req, res) => {
    const {id} = req.params;
    console.log(req.body);
    const updateSite = await Campground.findByIdAndUpdate(id, {...req.body.campground});
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    updateSite.images.push(...imgs);
    await updateSite.save();
    if(req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {                                   // deleting from cloudinary data
            await cloudinary.uploader.destroy(filename);
        }
        await updateSite.updateOne({$pull: { images: { filename: { $in: req.body.deleteImages }}}});
        console.log(updateSite);
    }
    req.flash('success', 'Successfully updated campground information!');
    res.redirect(`/campgrounds/${ updateSite.id }`);
};

module.exports.deleteCampground = async (req, res) => {
    const {id} = req.params
    const deleteSite = await Campground.findByIdAndDelete(id)
    req.flash('success', 'Campground has been deleted')
    res.redirect('/campgrounds')
};