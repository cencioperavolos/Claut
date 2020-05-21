'use strict'

const express = require('express')
const Word = require('../models/word')
const isLoggedIn = require('../middleware').isLoggedIn
const isOwnerOrisAdmin = require('../middleware').isOwnerOrisAdmin
const router = new express.Router()

// INDEX list all words with pagination
router.get('/', async (req, res) => {
  try {
    const perPage = 10
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
        .exec()
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
        .exec()
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
    console.log('ERROR!!!', e)
    res.status(500).send(e)
  }
})

// SEARCH
router.get('/search', async (req, res) => {
  const perPage = 10
  let position
  try {
    if (req.user && req.user.isAdmin) {
      position = await Word.find({
        clautano: { $lte: req.query.parola }
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

    const page = Math.trunc(position / perPage) + 1

    req.flash('success', res.locals.success[0]) // reinject flash message
    req.flash('error', res.locals.error[0]) // reinject flash message

    res.redirect('/words/?page=' + page + '&parola=' + req.query.parola)
  } catch (e) {
    console.log('ERROR!!!', e)
    res.status(500).send(e.message)
  }
})

// NEW show new word form
router.get('/new/', isLoggedIn, async (req, res) => {
  res.render('words/new')
})

// SHOW information about specific word
router.get('/:id', async (req, res) => {
  try {
    const word = await Word.findById(req.params.id)
    res.render('words/show', { word })
  } catch (e) {
    res.status(401).send(e)
  }
})

// CREATE insert new word into DB
router.post('/', isLoggedIn, async (req, res) => {
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
    res.status(400).send(e) // bad request
  }
})

// EDIT show edit word form
router.get('/:id/edit', isOwnerOrisAdmin, async (req, res) => {
  try {
    const word = await Word.findById(req.params.id)
    res.render('words/edit', {
      word: word
    })
  } catch (e) {
    res.status(500).send(e)
  };

  // const _id = req.params.id
  // const editedWord = req.body
  // try {
  //     word = await Word.findByIdAndUpdate(_id, editedWord, { 'new': true, 'runValidators': true })
  //     if (!word) {
  //         return res.status(404).send()
  //     }
  //     return res.send(word)
  // } catch (e) {
  //     res.status(400).send(e)
  // }
})

// UPDATE worde and redirect to index
router.put('/:id', isOwnerOrisAdmin, async (req, res) => {
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
    res.status(418).send(e)
  }
})

// DESTROY remove word from db and redirect to index
router.delete('/:id', isOwnerOrisAdmin, async (req, res) => {
  try {
    const deleted = await Word.findByIdAndDelete(req.params.id)
    req.flash('success', '"' + deleted.clautano + '" eliminata definitivamente.')
    res.redirect('/words/search/?parola=' + deleted.clautano)
  } catch (e) {
    res.status(418).send(e)
  }
})

module.exports = router
