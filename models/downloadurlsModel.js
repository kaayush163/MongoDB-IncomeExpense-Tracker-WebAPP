const mongoose = require('mongoose');

const Schema = mongoose.Schema

const linksModel = new Schema({
  url : String,

  userId: [{
    type: Schema.Types.ObjectId,
    ref:'userlogin'
  }]
})


module.exports = mongoose.model('url',linksModel)