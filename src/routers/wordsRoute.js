'use strict'

const express = require('express')
const Word = require('../models/word')
const isLoggedIn = require('../middleware').isLoggedIn
const isOwnerOrisAdmin = require('../middleware').isOwnerOrisAdmin
const router = new express.Router()

const perPage = 10

// INDEX list all words with pagination
router.get('/', async (req, res, next) => {
  try {
    const current = (isNaN(req.query.page)) ? 0 : +req.query.page - 1 // default page to 1
    const k = (current === 0) ? 0 : 1 // if not first page (k=1) read last word of previous page for first letter BCD... title

    let totale
    let words
    if (req.user && req.user.isAdmin) {
      totale = await Word.estimatedDocumentCount()
      words = await Word.find({})
        .collation({
          locale: 'it',
          strength: 1
        })
        .sort({ clautano: 'asc' })
        .skip((perPage * current - k))
        .limit(perPage + k)
    } else {
      totale = await Word.countDocuments({
        $or: [{ 'user.isVerified': true }, { 'user.id': req.user ? req.user._id : undefined }]
      })
      words = await Word.find({
        $or: [{ 'user.isVerified': true }, { 'user.id': req.user ? req.user._id : undefined }]
      })
        .collation({
          locale: 'it',
          strength: 1
        })
        .sort({ clautano: 'asc' })
        .skip((perPage * current - k))
        .limit(perPage + k)
    }

    if (k === 0) { // if fist page add fake empty word for A title
      words.unshift({ clautano: ' ' })
    }

    res.render('words/indexPage', {
      words: words,
      page: current + 1,
      pages: Math.ceil(totale / perPage)
    })
  } catch (e) {
    next(e)
  }
})

// SEARCH
router.get('/search', async (req, res, next) => {
  let position
  try {
    if (req.user && req.user.isAdmin) {
      position = await Word.find({
        clautano: { $lte: req.query.parola } // Less than equal find index position of word
      }).collation({ locale: 'it', strength: 1 })
        .sort({ clautano: 1 })
        .countDocuments()
    } else {
      position = await Word.find({
        clautano: { $lte: req.query.parola },
        $or: [{ 'user.isVerified': true }, { 'user.id': req.user ? req.user._id : undefined }]
      }).collation({ locale: 'it', strength: 1 })
        .sort({ clautano: 1 })
        .countDocuments()
    }
    // Returns number of page for position, 1 if position == 0
    const page = Math.ceil(position / perPage) > 0 ? Math.ceil(position / perPage) : 1

    req.flash('success', res.locals.success[0]) // reinject flash message
    req.flash('error', res.locals.error[0]) // reinject flash message

    res.redirect('/words/?page=' + page + '&parola=' + req.query.parola)
  } catch (e) {
    next()
  }
})

// NEW show new word form
router.get('/new/', isLoggedIn, async (req, res) => {
  res.render('words/new')
})

// SHOW information about specific word
router.get('/:id', async (req, res, next) => {
  try {
    const word = await Word.findById(req.params.id)
    res.render('words/show', { word })
  } catch (e) {
    next()
  }
})

// CREATE insert new word into DB
router.post('/', isLoggedIn, async (req, res, next) => {
  const newWord = new Word(
    req.body.word
  )
  newWord.user.id = req.user._id
  newWord.user.fullName = req.user.fullName
  newWord.user.isVerified = req.user.isVerified
  try {
    await newWord.save()
    // res.status(201).send(newWord) //created
    req.flash('success', 'Nuova parola inserita.')
    res.redirect('/words/' + newWord._id)
  } catch (e) {
    if (e.code === 11000) {
      try {
        const presentWord = await Word.findOne({ clautano: newWord.clautano })
        req.flash('error', 'La parola "' + newWord.clautano + '" è già presente.')
        res.redirect('/words/' + presentWord._id)
      } catch (er) {
        next(er)
      }
    } else {
      next(e)
    }
  }
})

// EDIT show edit word form
router.get('/:id/edit', isOwnerOrisAdmin, async (req, res, next) => {
  try {
    const word = await Word.findById(req.params.id)
    res.render('words/edit', {
      word: word
    })
  } catch (e) {
    next(e)
  };
})

// UPDATE worde and redirect to index
router.put('/:id', isOwnerOrisAdmin, async (req, res, next) => {
  if (!req.body.word.voc_claut_1996) { req.body.word.voc_claut_1996 = false }
  try {
    const word = await Word.findByIdAndUpdate(req.params.id, req.body.word, {
      new: true,
      runValidators: true
    })
    if (!word) {
      res.status(404).send('Word not found!')
    }
    req.flash('success', 'Parola modificata.')
    res.redirect('/words/search/?parola=' + word.clautano)
  } catch (e) {
    next(e)
  }
})

// DESTROY remove word from db and redirect to index
router.delete('/:id', isOwnerOrisAdmin, async (req, res, next) => {
  try {
    const deleted = await Word.findByIdAndDelete(req.params.id)
    req.flash('success', '"' + deleted.clautano + '" eliminata definitivamente.')
    res.redirect('/words/search/?parola=' + deleted.clautano)
  } catch (e) {
    next(e)
  }
})

module.exports = router
