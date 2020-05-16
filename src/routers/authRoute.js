'use strict'

const User = require('../models/user')
const passport = require('passport')
const passportUtils = require('../util/passportUtils')
const express = require('express')
const router = new express.Router()

// show register form
router.get('/register', (req, res) => {
  res.render('users/register')
})

// handling user signup
router.post('/register', (req, res) => {
  const hash = passportUtils.genPassword(req.body.password)
  const user = new User({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    surname: req.body.surname,
    email: req.body.email,
    password: hash
  })

  // passport authenticate needs req.body.username & req.body.password
  user.save().then((savedUser) => {
    passport.authenticate('local')(req, res, function () {
      req.flash('success', 'Accesso effettuato, ' + user.firstName)
      res.redirect('/secret')
    })
  }).catch((err) => {
    req.flash('error', err.message)
    return res.redirect('/register')
  })
})

// show login form
router.get('/login', (req, res) => {
  res.render('users/login')
})

// handling user login - passport authenticate needs req.body.username & req.body.password
router.post('/login', function (req, res) {
  passport.authenticate('local', function (err, user, info) {
    if (err) {
      req.flash('error', err.message)
      return res.redirect('/login')
    }
    if (!user) {
      req.flash('error', 'Nome utente e/o password errati')
      return res.redirect('/login')
    }
    req.logIn(user, function (err) {
      if (err) {
        req.flash('error', err.message)
        res.redirect('/login')
      }
      req.flash('success', 'Bundì, ' + user.firstName)
      return res.redirect('/secret')
    })
  })(req, res)
})
// router.post('/login', passport.authenticate('local', {
//   successRedirect: '/secret',
//   failureRedirect: '/login',
//   failureFlash: 'Nome utente e/o password errati.',
//   successFlash: 'Benvenuto'
// })
// )

// handling user log out
router.get('/logout', (req, res) => {
  const name = req.user.firstName
  req.logout()
  req.flash('success', 'Sani, ' + name)
  res.redirect('/words')
})

module.exports = router
