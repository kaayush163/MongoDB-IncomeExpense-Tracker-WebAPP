const mongoose = require('mongoose')

const Schema = mongoose.Schema;


const orderModel = new Schema({
  
  paymentid : String,
  orderid : String,
  status : String,

  userId : [{
    type : Schema.Types.ObjectId, 
    ref:'userlogin'
  }]
})

module.exports = mongoose.model('order',orderModel)