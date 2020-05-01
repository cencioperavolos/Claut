var mongoose = require('mongoose')

var userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  surname: {
    type: String,
    default: ''
  },
  admin: {
    type: Boolean,
    default: false
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  username: {
    type: String,
    default: function () { return this.email }
  },
  password: { type: String }
})

module.exports = mongoose.model('User', userSchema)
