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
      res.redirect('/secret')
    })
  }).catch((err) => {
    const errorMsg = 'Something bad has hrouterened! ' + err.message
    console.log(errorMsg)
    return res.render('users/register', { errorMsg })
  })
})

// show login form
router.get('/login', (req, res) => {
  res.render('users/login')
})

// handling user login - passport authenticate needs req.body.username & req.body.password
router.post('/login', passport.authenticate('local', {
  successRedirect: '/secret',
  failureRedirect: '/login'
})
)

// handling user log out
router.get('/logout', (req, res) => {
  req.logout()
  res.redirect('/')
})

module.exports = router
