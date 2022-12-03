'use strict'

const express = require('express')
const Expression = require('../models/expression')
const isExpressionOwnerOrAdmin =
  require('../middleware').isExpressionOwnerOrAdmin
const isLoggedIn = require('../middleware').isLoggedIn
const router = new express.Router()

function diacriticSensitiveRegex(string = '') {
  return string
    .replace(/a/g, '[a,á,à,ä]')
    .replace(/e/g, '[e,é,ë]')
    .replace(/i/g, '[i,í,ï]')
    .replace(/o/g, '[o,ó,ö,ò]')
    .replace(/u/g, '[u,ü,ú,ù]')
}

// SEARCH with pagination
router.get('/search', async (req, res, next) => {
  const perPage = 5
  // var page = req.param('page') || 0
  const page = isNaN(req.query.page) ? 0 : +req.query.page - 1 // default page to 1

  let expressions
  let count
  const ricerca = diacriticSensitiveRegex(req.query.parola)
  try {
    if (req.user && req.user.isAdmin) {
      count = await Expression.find({
        clautano: { $regex: ricerca, $options: 'i' },
      }).count()
      expressions = await Expression.find({
        clautano: { $regex: ricerca, $options: 'i' },
      })
        .limit(perPage)
        .skip(perPage * page)
        .sort('-createdOn')
    } else {
      count = await Expression.find({
        clautano: { $regex: ricerca, $options: 'i' },
        $or: [
          { 'user.isVerified': true },
          { 'user.id': req.user ? req.user._id : undefined },
        ],
      }).count()
      expressions = await Expression.find({
        clautano: { $regex: ricerca, $options: 'i' },
        $or: [
          { 'user.isVerified': true },
          { 'user.id': req.user ? req.user._id : undefined },
        ],
      })
        .limit(perPage)
        .skip(perPage * page)
        .sort('-createdOn')
    }
  } catch (e) {
    next(e)
  }
  res.render('expressions/index', {
    expressions,
    page: page + 1,
    pages: Math.ceil(count / perPage),
    ricerca,
  })
})

// NEW show new expression form
router.get('/new', isLoggedIn, async (req, res) => {
  res.render('expressions/new')
})

// CREATE insert new expression into DB
router.post('/', isLoggedIn, async (req, res, next) => {
  const linkedWords = JSON.parse(req.body.expression.words)
  req.body.expression.words = linkedWords
  const newExpression = new Expression(req.body.expression)
  newExpression.user.id = req.user._id
  newExpression.user.fullName = req.user.fullName
  newExpression.user.isVerified = req.user.isVerified
  try {
    await newExpression.save()
    req.flash('success', 'Nuova espressione tipica inserita.')
    res.redirect('/expressions/' + newExpression._id)
  } catch (e) {
    next(e)
  }
})

// SHOW information about specific expression
router.get('/:id', async (req, res, next) => {
  try {
    const expression = await Expression.findById(req.params.id)
      .populate('words')
      .exec()
    res.render('expressions/show', { expression })
  } catch (e) {
    next(e)
  }
})

// EDIT show edit expression form
router.get('/:id/edit', isExpressionOwnerOrAdmin, async (req, res, next) => {
  try {
    const expression = await Expression.findById(req.params.id)
      .populate('words')
      .exec()
    res.render('expressions/edit', { expression })
  } catch (e) {
    next(e)
  }
})

// UPDATE word and redirect to index
router.put('/:id', isExpressionOwnerOrAdmin, async (req, res, next) => {
  const linkedWords = JSON.parse(req.body.expression.words)
  req.body.expression.words = linkedWords

  try {
    const exp = await Expression.findByIdAndUpdate(
      req.params.id,
      req.body.expression,
      {
        new: true,
        runValidators: true,
      }
    )
    if (!exp) {
      res.status(404).send('Word not found!')
    }
    req.flash('success', 'Espressione modificata.')
    res.redirect('/expressions/' + exp._id)
  } catch (e) {
    next(e)
  }
})

// DESTROY remove word from db and redirect to index
router.delete('/:id', isExpressionOwnerOrAdmin, async (req, res, next) => {
  try {
    const deleted = await Expression.findByIdAndDelete(req.params.id)
    req.flash(
      'success',
      'Espressione "' + deleted.clautano + '" eliminata definitivamente.'
    )
    res.redirect('/')
  } catch (e) {
    next(e)
  }
})

module.exports = router
