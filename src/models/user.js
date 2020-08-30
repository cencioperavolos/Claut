var mongoose = require('mongoose')

var userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    trim: true,
    required: true,
    minlength: 3,
    maxlength: 15
  },
  lastName: {
    type: String,
    trim: true,
    required: true,
    minlength: 3,
    maxlength: 15
  },
  surname: {
    type: String,
    trim: true,
    maxlength: 15
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    required: true,
    unique: true
  },
  username: {
    type: String,
    default: function () { return this.email }
  },
  password: {
    type: String,
    trim: true,
    minlength: 8,
    required: true
   }
}, {
  timestamps: true
})

userSchema.virtual('fullName').get(function () {
  let fn = `${this.firstName} ${this.lastName}`
  if (this.surname.length > 0) { fn = fn.concat(' "' + this.surname + '"') }
  return fn
})

module.exports = mongoose.model('User', userSchema)
