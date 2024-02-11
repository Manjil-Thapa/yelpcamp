const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require('./review');

// setup virtual property which can only be added to a schema (lesson398 for mongoose virtual). add properties to a schema but dont exist in the database but have access to it

const ImageSchema = new Schema({
  // this aint a schema model. wont be exporting
  url: String,
  filename: String,
});
ImageSchema.virtual('thumbnail').get(function () {
  // coming from mongoose. not stored in mongo. since url is alrd stored
  return this.url.replace('/upload', '/upload/w_250'); // replacing url /upload to /upload/w_250
});

const opts = { toJSON: { virtuals: true } }; // to stringify json virtuals to show pop up for our e.g on the map

const CampgroundSchema = new Schema(
  {
    title: String,
    images: [ImageSchema],
    geometry: {
      type: {
        type: String,
        enum: ['Point'],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    price: Number,
    description: String,
    location: String,
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    reviews: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Review', // referencing to review model to get object id
      },
    ],
  },
  opts
);

CampgroundSchema.virtual('properties.popUpMarkup').get(function () {
  return `<strong><a href='/campgrounds/${this._id}'>${this.title}</a><strong>
    <p>${this.description.substring(0, 25)}</p>`;
});

CampgroundSchema.post('findOneAndDelete', async function (doc) {
  //query middleware
  if (doc) {
    await Review.deleteMany({
      _id: {
        $in: doc.reviews,
      },
    });
  }
}); // passing the option to run json virtuals

const Campground = mongoose.model('Campground', CampgroundSchema);
module.exports = Campground;
