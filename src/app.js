'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const path = require('path')
const methodOverride = require('method-override')
const expressSession = require('express-session')
const passport = require('passport')
const passportUtils = require('./util/passportUtils')
// routes
const wordsRoute = require('./routers/wordsRoute')
const authRoute = require('./routers/authRoute')

// Mongoose config and connect #####################################################
const databaseUrl = process.env.DATABASEURL || 'mongodb://localhost/'
const databseName = 'vocabolario_clautano'
mongoose.connect(databaseUrl + databseName,
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
  secret: 'Keep Me Secure In Environment Variable !?.&*§...',
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

// ADD ROUTES & PERSONAL MIDDLEWARE ################################################
app.use(function (req, res, next) { // iniect curretnuser on response for ejs elaboration
  console.log(req.user)
  res.locals.currentUser = req.user
  next()
})
app.use('/', authRoute)
app.use('/words', wordsRoute)
// Routes ##########################################################################
app.get('/', (req, res) => {
  res.redirect('/words')
})

app.get('/secret', require('./middleware').isLoggedIn, (req, res) => {
  res.render('users/secret')
})

const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log('Server is up on port: ' + port)
})
