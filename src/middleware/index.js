'use strict'

const exportedFUncionts = {}

// midddleware for check user login
exportedFUncionts.isLoggedIn = function (req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  } else {
    res.redirect('/login')
  }
}

module.exports = exportedFUncionts
