
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const expmodel = new Schema({

  text : String,
  amount : Number,
  category : String,
  userId : [{
    type : Schema.Types.ObjectId, ref:'userlogin'
  }]

})

module.exports = mongoose.model('expense',expmodel)