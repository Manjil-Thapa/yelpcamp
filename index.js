if(process.env.NODE_ENV !== 'production') {     // if we are in development, require the dotenv package in .env file
    require('dotenv').config();
}

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const ExpressError = require('./utilities/ExpressError');
const methodOverride = require('method-override');
const passport = require('passport');
const passportLocal = require('passport-local');
const User = require('./models/user');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const userRoutes = require('./routes/users')
const campgroundRoutes = require('./routes/campgrounds')
const reviewRoutes = require('./routes/reviews')
const MongoStore = require('connect-mongo');
const { db } = require('./models/user');
// const dbUrl = process.env.DB_URL;
// mongoose.connect('mongodb://127.0.0.1:27017/manjilcampgrounds')
const dbUrl = process.env.DB_URL || 'mongodb://127.0.0.1:27017/manjilcampgrounds';

// mongoose setup (method 1)
// mongoose.connect('mongodb://127.0.0.1:27017/manjilcampgrounds', {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//     useCreateIndex: true,
//     useFindAndModify: false
// });

// const db = mongoose.connection;
// db.on('error', console.error.bind(console, 'Connection to MongoDB is unsuccessful.'))
// db.once('open', () => {
//     console.log('MongoDB successfully connected.')
// });

//mongoose setup (method 2)
mongoose.set('strictQuery', false);
mongoose.connect(dbUrl)
// mongoose.connect(dbUrl)
    .then(() => {
        console.log('MongoDB successfully connected.')
    })
    .catch((e) =>{
        console.log('Connection to MongoDB is unsuccessful.')
        console.log(e)
    })

const app = express();


// sessions
const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60,                                   // hrs*mins*secs
    crypto: {
        secret: 'thisIsTheBestSecret',
    }
})

// const store = new MongoStore ({
//     url: dbUrl,
//     secretL: 'thisIsTheBestSecret',
//     touchAfter: 24 * 60 * 60                                    // hrs*mins*secs
// })

store.on('error', function(e) {
    console.log('Session store error!', e)
})

const sessionConfig = {
    store: store,
    name: 'manjil',                                               // session name can be checked in browers - application, can be changed
    secret: 'thisIsTheBestSecret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,                                          // default to true nowadays - this means it is not accesible through scripts
        // secure: true,                                         // this line means it is only accesible through https
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,           // 
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({extended: true}));                  // this is to parse the req.body otherwise it will not show its content
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(mongoSanitize({
    replaceWith: '_'
}));

app.use(session(sessionConfig))                                 // default place where sessions are stored is the memory store  but we want to store it in mongo
app.use(flash());
// app.use(helmet());                                              // automatically enables all 11 of their middleware

const scriptSrcUrls = [
    'https://stackpath.bootstrapcdn.com/',
    'https://api.tiles.mapbox.com/',
    'https://api.mapbox.com/',
    'https://kit.fontawesome.com/',
    // 'https://code.jquery.com/',          // not used
    'https://cdnjs.cloudflare.com/',
    'https://cdn.jsdelivr.net',
];
const styleSrcUrls = [
    'https://kit-free.fontawesome.com/',
    'https://stackpath.bootstrapcdn.com/',
    'https://api.mapbox.com/',
    'https://api.tiles.mapbox.com/',
    'https://fonts.googleapis.com/',
    'https://use.fontawesome.com/',
    'https://cdn.jsdelivr.net',
];
const connectSrcUrls = [
    "https://api.mapbox.com",
    "https://*.tiles.mapbox.com",
    "https://events.mapbox.com",
];
const fontSrcUrls = [ "https://res.cloudinary.com/dyd7cfacq/" ];
app.use(
    helmet.contentSecurityPolicy({
        directives : {
            defaultSrc : [],
            connectSrc : [ "'self'", ...connectSrcUrls ],
            scriptSrc  : [ "'unsafe-inline'","'unsafe-eval'", "'self'", ...scriptSrcUrls ],
            styleSrc   : [ "'self'", "'unsafe-inline'", ...styleSrcUrls ],
            workerSrc  : [ "'self'", "blob:" ],
            objectSrc  : [],
            imgSrc     : [
                "'self'",                                // coming frmo own url
                "blob:",
                "data:",
                "https://res.cloudinary.com/dyd7cfacq/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT!
                "https://images.unsplash.com/",
            ],
            fontSrc    : [ "'self'", ...fontSrcUrls ],
            mediaSrc   : [ "https://res.cloudinary.com/dyd7cfacq/" ],
            childSrc   : [ "blob:" ]
        },
        crossOriginEmbedderPolicy: false
    })
);

app.use(passport.initialize());
app.use(passport.session());
passport.use(new passportLocal(User.authenticate()));           // it is using the passportlocal and for the passportlocal, the authentication method is located on the User model  

passport.serializeUser(User.serializeUser());                                        // this is telling passport how to serialize the user for a session
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    // console.log(req.query);
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

app.use('/', userRoutes);
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);


app.get('/', (req, res) => {
    res.render('home');
})


// basic 404 error that is from user side
app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

// error handling middleware
app.use((err, req, res, next) => {
    const {statusCode = 500 } = err;
    if (!err.message) err.message = 'Yeah nah, something went wrong mate.'
    res.status(statusCode).render('error', { err })
})


const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Application is serving on port ${port}.`)
});