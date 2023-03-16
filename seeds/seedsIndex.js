const mongoose = require('mongoose');
const Campground = require('../models/campground')                              // require campground model
const cities = require('./cities')                                              // require cities array
const { places, descriptors } = require('./seedsHelpers');


mongoose.set('strictQuery', false);
mongoose.connect('mongodb://127.0.0.1:27017/manjilcampgrounds')
    .then(() => {
        console.log('MongoDB successfully connected.')
    })
    .catch((e) =>{
        console.log('Connection to MongoDB is unsuccessful.')
        console.log(e)
    })


// passing in the places and descriptors array with randomization
const sample = ray => ray[Math.floor(Math.random() * ray.length)]               // this is a one-liner implicit return

// clear all database first and then populate with seeds
const seedDB = async () => {
    await Campground.deleteMany({});
    for ( let i = 0; i < 250; i++ ){
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10
        const randomName = new Campground({
            author: '63f9b3ac7644c25489a6d3ea',                                 // your USER ID
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: 'Lorem ipsum, dolor sit amet consectetur adipisicing elit. Ut facere expedita, quia quaerat accusamus placeat aliquam maiores neque vero ducimus excepturi enim ad nam, deserunt facilis consequatur pariatur. Harum et itaque facere numquam libero eius dolorum facilis ad necessitatibus dignissimos.',
            price: price,                //remb you can use short hand method to just writing price
            geometry: { 
                type: 'Point', 
                coordinates: [
                    cities[random1000].longitude, 
                    cities[random1000].latitude,
                ]
            },
            images: [
                {
                  url: 'https://res.cloudinary.com/dyd7cfacq/image/upload/v1678723287/YelpCamp/z3otesnqrcxq9rpnkzid.webp',
                  filename: 'YelpCamp/z3otesnqrcxq9rpnkzid'
                },
                {
                  url: 'https://res.cloudinary.com/dyd7cfacq/image/upload/v1678723287/YelpCamp/dz0uyehqgv3coyqy16i9.jpg',
                  filename: 'YelpCamp/dz0uyehqgv3coyqy16i9'
                },
                {
                  url: 'https://res.cloudinary.com/dyd7cfacq/image/upload/v1678723288/YelpCamp/yo5ngxwwh4kh7bkozuyd.jpg',
                  filename: 'YelpCamp/yo5ngxwwh4kh7bkozuyd'
                }
            ]
        })
        await randomName.save();
    }
}

seedDB()
    .then(() => {
        console.log('Closing MongoDB connection..')
        mongoose.connection.close()
    })