'use strict'

const Word = require('../models/word')

const exportFunctions = {}

// midddleware for check user login
exportFunctions.isLoggedIn = function (req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  } else {
    res.redirect('/login')
  }
}

// middleware for check word owner or admin user
exportFunctions.isOwnerOrAdmin = async function (req, res, next) {
  if (req.isAuthenticated()) {
    try {
      const word = await Word.findById(req.params.id)
      if (word.user.id.equals(req.user._id) || req.user.admin) {
        next()
      } else {
        res.redirect('back')
      }
    } catch (e) {
      console.log('error ', e)
      res.status(401).send(e.message)
    }
  } else {
    res.send('devi accedere...')
  }
}

module.exports = exportFunctions
