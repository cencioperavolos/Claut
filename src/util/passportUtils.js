const passport = require('passport')
const LocalStrategy = require('passport-local')
const bcrypt = require('bcryptjs')
const User = require('../models/user')

function validPassword (password, hash) {
  return bcrypt.compareSync(password, hash)
}

function genPassword (password) {
  return bcrypt.hashSync(password, 13) // 14 recommanded!
}

function passportSetup () {
  passport.use(new LocalStrategy(
    function (username, password, done) {
      User.findOne({ username: username }, function (err, user) {
        if (err) { return done(err) }
        if (!user) {
          return done(null, false, { message: 'Incorrect username.' })
        }
        if (!validPassword(password, user.password)) {
          return done(null, false, { message: 'Incorrect password.' })
        }
        return done(null, user)
      })
    }
  ))

  passport.serializeUser(function (user, cb) { // inserisce l'id nella session
    cb(null, user.id)
  })
  passport.deserializeUser(function (id, cb) { // recupera l'user dall'id della session
    User.findById(id, function (err, user) {
      if (err) { return cb(err) }
      user.password = undefined
      cb(null, user)
    })
  }) // TODO manage callback(err)
}

module.exports = {
  validPassword,
  genPassword,
  passportSetup
}
