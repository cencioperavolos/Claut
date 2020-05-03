var mongoose = require('mongoose')

var userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 12
  },
  lastName: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 12
  },
  surname: {
    type: String,
    maxlength: 12
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

userSchema.virtual('fullName').get(function () {
  let fn = `${this.firstName} ${this.lastName}`
  if (this.surname.length > 0) {fn = fn.concat(' "' + this.surname + '"') }
  return fn
})

module.exports = mongoose.model('User', userSchema)