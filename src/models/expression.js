'use strict'

const mongoose = require('mongoose')

const expressionSchema = new mongoose.Schema({
  clautano: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  italiano: {
    type: String,
    required: true,
    trim: true
  },
  words: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Word'
    }
  ],
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

const Expression = mongoose.model('Expression', expressionSchema)

module.exports = Expression
