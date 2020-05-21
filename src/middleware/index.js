'use strict'

const Word = require('../models/word')

const exportFunctions = {}

// midddleware for check user login
exportFunctions.isLoggedIn = function (req, res, next) {
  if (req.isAuthenticated()) {
    return next() 
  } else {
    req.flash('error', 'Devi accedere per poter proseguire.')
    res.redirect('/login')
  }
}

// middleware for check word owner or isAdmin user
exportFunctions.isOwnerOrisAdmin = async function (req, res, next) {
  if (req.isAuthenticated()) {
    try {
      const word = await Word.findById(req.params.id)
      if (word.user.id.equals(req.user._id) || req.user.isAdmin) {
        next()
      } else {
        req.flash('error', 'Non sei autorizzato a procedere.')
        res.redirect('back')
      }
    } catch (e) {
      console.log('error ', e)
      res.status(401).send(e.message)
    }
  } else {
    req.flash('error', 'Devi accedere per poter proseguire.')
    res.redirect('/login')
  }
}

module.exports = exportFunctions
