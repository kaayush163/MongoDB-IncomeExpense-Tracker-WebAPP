const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const userLoginsModel = new Schema({

  name : String,
  password : String,
  email : String,
  ispremiumuser : Boolean,
  totalBalance : Number,
  totalincome : Number,
  totalexpense: Number
})

module.exports = mongoose.model('userlogin',userLoginsModel)