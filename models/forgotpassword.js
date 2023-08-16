const mongoose = require('mongoose')

const Schema = mongoose.Schema

const forgotModel = new Schema({
  uuid : String,
  active : Boolean,
  userId : [{
    type : Schema.Types.ObjectId, 
    ref:'userlogin'
  }]
})

module.exports = mongoose.model('forgotpassword',forgotModel)
