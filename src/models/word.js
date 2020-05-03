'use strict'

const mongoose = require('mongoose')

const wordSchema = new mongoose.Schema({
  clautano: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  alternativo: { // termine clautano alternativo
    type: String
  },
  categoria: {
    type: String
  }, 
  traduzione: {
    type: String,
    required: true
  },
  user: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    fullName: String
  }

})

const Word = mongoose.model('Word', wordSchema)

module.exports = Word