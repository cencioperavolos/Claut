'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const path = require('path')
const methodOverride = require('method-override')
const expressSession = require('express-session')
const passport = require('passport')
const passportUtils = require('./util/passportUtils')
const flash = require('connect-flash')

require('dotenv').config()

// routes
const wordsRoute = require('./routers/wordsRoute')
const usersRoute = require('./routers/usersRoute')

// Mongoose config and connect #####################################################
const databaseUrl = process.env.DATABASEURL || 'mongodb://localhost/vocabolario_clautano'
mongoose.connect(databaseUrl,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // useCreateIndex: true,
    autoIndex: true
  }).then(() => {
  console.log('Connected to DB.')
}).catch((err) => {
  console.log('Problems on connecting to DB', err)
})

// Express app configuration #######################################################
const app = express()
app.set('view engine', 'ejs')

app.use(bodyParser.urlencoded({ extended: true }))
app.use(methodOverride('_method'))

// Definne path for Express config and Setup static dir to serve
const publicDirectoryPath = path.join(__dirname, '..', 'public')
app.use(express.static(publicDirectoryPath))

// setutp express-session with MongoStore ( database dor storing express sessions ) ##
const MongoStore = require('connect-mongo')(expressSession)
const sessionStore = new MongoStore({ mongooseConnection: mongoose.connection, collection: 'sessions' })
app.use(expressSession({
  secret: process.env.EXPRESS_SESSION_SECRET ,
  resave: false,
  saveUninitialized: false,
  store: sessionStore,
  cookie: {
    // maxAge: 1000 * 60 * 60 * 24 * 7 * 2, // two weeks
    maxAge: 1000 * 60 * 15, // 15 minutes
    httpOnly: true // no js can acess cookie
    // secure: true, //only https
    // ephemeral: true // destroy cookie when the browser closes
  }
}))

// PASSPORT connfiguration #########################################################
passportUtils.passportSetup()
app.use(passport.initialize())
app.use(passport.session())

// ADD FLASH, ROUTES & PERSONAL MIDDLEWARE ################################################
app.use(flash())
app.use(function (req, res, next) {
  res.locals.currentUser = req.user // injects curretnuser on response for ejs elaboration
  res.locals.error = req.flash('error') // injects flash error message
  res.locals.success = req.flash('success') // injects flash success message
  next()
})
app.use('/users', usersRoute)
app.use('/words', wordsRoute)
// Routes ##########################################################################
app.get('/', (req, res) => {
  res.render('landing')
})

app.get('/secret', require('./middleware').isLoggedIn, (req, res) => {
  res.render('users/secret')
})

const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log('Server is up on port: ' + port)
})
