'use strict'

const Word = require('../models/word')
const Expression = require('../models/expression')

const exportFunctions = {}

// middleware to secure all express requests on production
exportFunctions.secureRequest = function (req, res, next) {
  if (process.env.NODE_ENV === 'production') {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`)
    } else { next() }
  } else { next() }
}

// midddleware for check user login
exportFunctions.isLoggedIn = function (req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  } else {
    req.flash('error', 'Devi accedere per poter proseguire.')
    res.redirect('/users/login')
  }
}

// middleware for check word owner or isAdmin user
exportFunctions.isWordOwnerOrAdmin = async function (req, res, next) {
  if (req.isAuthenticated()) {
    try {
      const word = await Word.findById(req.params.id)
      if (word.user.id.equals(req.user._id) || req.user.isAdmin) {
        next()
      } else {
        req.flash('error', 'Non sei autorizzato a procedere.')
        res.redirect('back')
      }
    } catch (e) { // errore di connessione
      next(e)
    }
  } else {
    req.flash('error', 'Devi accedere per poter proseguire.')
    res.redirect('/users/login')
  }
}

// middleware for check expression owner or isAdmin user
exportFunctions.isExpressionOwnerOrAdmin = async function (req, res, next) {
  if (req.isAuthenticated()) {
    try {
      const expression = await Expression.findById(req.params.id)
      if (expression.user.id.equals(req.user._id) || req.user.isAdmin) {
        next()
      } else {
        req.flash('error', 'Non sei autorizzato a procedere.')
        res.redirect('back')
      }
    } catch (e) { // errore di connessione
      next(e)
    }
  } else {
    req.flash('error', 'Devi accedere per poter proseguire.')
    res.redirect('/users/login')
  }
}

module.exports = exportFunctions
