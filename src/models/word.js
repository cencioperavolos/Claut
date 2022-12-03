 'use strict'

const mongoose = require('mongoose')

const wordSchema = new mongoose.Schema({
  clautano: {
    type: String,
    required: true,
    // unique: true, ADDED COMPOUND INDEX WITH CATEGORIA
    trim: true
  },
  alternativo: { // termine clautano alternativo
    type: String,
    trim: true
  },
  categoria: {
    type: String,
    trim: true,
  },
  traduzione: {
    type: String,
    required: true,
    trim: true
  },
  user: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    fullName: String,
    isVerified: Boolean // managed by User
  },
  voc_claut_1996: { // se vero la parola è presa dal 'VOCABOLARIO CLAUTANO - Borsatti, Giordani, Peressini - 1996'
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
})

wordSchema.index({
  clautano: 1,
  categoria: 1
}, { unique: true })

const Word = mongoose.model('Word', wordSchema)

module.exports = Word
