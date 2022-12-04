'use strict'

const User = require('../models/user')
const Word = require('../models/word')
const passport = require('passport')
const passportUtils = require('../util/passportUtils')
const express = require('express')
const router = new express.Router()
const isLoggedIn = require('../middleware').isLoggedIn

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
    password: hash,
  })

  // passport authenticate needs req.body.username & req.body.password
  user
    .save()
    .then((savedUser) => {
      passport.authenticate('local')(req, res, function () {
        req.flash('success', 'Accesso effettuato, ' + user.firstName)
        res.redirect('/words')
      })
    })
    .catch((err) => {
      req.flash('error', err.message)
      return res.redirect('/users/register')
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
      return res.redirect('/users/login')
    }
    if (!user) {
      req.flash('error', 'Nome utente e/o password errati')
      return res.redirect('/users/login')
    }
    req.logIn(user, function (err) {
      if (err) {
        req.flash('error', err.message)
        res.redirect('/users/login')
      }
      req.flash('success', 'Bundì, ' + user.firstName)
      return res.redirect('/')
    })
  })(req, res)
})
// router.post('/login', passport.authenticate('local', {
//   successRedirect: '/words',
//   failureRedirect: '/login',
//   failureFlash: 'Nome utente e/o password errati.',
//   successFlash: 'Benvenuto'
// })
// )

// handling user change password
router.post('/change', isLoggedIn, async (req, res) => {
  if (req.body.newPassword_1 === req.body.newPassword_2) {
    const hash = passportUtils.genPassword(req.body.newPassword_1)
    try {
      await User.findByIdAndUpdate(req.user._id, { password: hash })
      req.flash('success', 'Password modificata.')
      res.redirect('back')
    } catch (e) {
      req.flash('Error updating password', e.message)
      res.redirect('back')
    }
  } else {
    req.flash('error', 'Le password sono diverse.')
    return res.redirect('back')
  }
})

// handling user log out
router.get('/logout', (req, res, next) => {
  const name = req.user.firstName

  req.logout(function (err) {
    if (err) {
      return next(err)
    }
    req.flash('success', 'Sani, ' + name)
    res.redirect('/')
  })

  // req.logout()
  // req.flash('success', 'Sani, ' + name)
  // res.redirect('/')
})

// SHOW user from session
router.get('/show/:id', isLoggedIn, async (req, res) => {
  const totWords = await Word.countDocuments({ 'user.id': req.user._id })
  res.render('users/show', { totWords: totWords })
})

module.exports = router
