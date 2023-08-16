const jwt = require("jsonwebtoken");
const Razorpay = require('razorpay');
const Order = require('../models/order');
const User = require('../models/signup')
const mongoose = require('mongoose');



exports.purchasepremium = async(req,res) => {
    try{
        var rzp = new Razorpay({
            key_secret : process.env.RAZORPAY_KEY_SECRET,
            key_id : process.env.RAZORPAY_KEY_ID,
        })
        const amount = 2500;

        rzp.orders.create({amount, currency:"INR"},(err, order) => {    
            console.log('orderid>>>>>',order.id);
            if(err) {
                throw new Error(JSON.stringify(err));
            }
            Order.create({                                              
                userId: req.user._id.toString(),                                     
                orderid: order.id,
                status:'PENDING'
            }).then(() => {
                return res.status(201).json({ order, key_id: rzp.key_id}); 
            });      
        })
    }
    catch(err){
        console.log(err);
        return res.status(500).json({ message: 'Something went wrong', error: err})
    }
}

function generateAccessToken(userid,name,ispremiumuser){        
   return jwt.sign({userId : userid,name: name,ispremiumuser}, process.env.TOKEN_SECRET);  
}



exports.updateTransaction = async (req,res) => {   
    try{
        const userId = req.user._id;   
        const name = req.user.name;
        const { payment_id, order_id} = req.body;

        const order=await Order.find({orderid: order_id})   
        
        console.log('update transaction on order deatil',order);

        
        

        const promise1 = Order.findOneAndUpdate({orderid: order_id}, {paymentid: payment_id, status: 'SUCCESSFUL'})   
        const promise2 = User.findOneAndUpdate({_id: req.user._id}, {isPremiumUser: true})


        Promise.all([promise1,promise2]).then(() => {
            return res.status(202).json({
                success: true, 
                message:"Transaction success",
                token: generateAccessToken(userId,name,true)  
                
            });
        }).catch((err) => {
            throw new Error(err);
        })
    }
    catch(err){
        console.log(err);
        return res.status(500).json({error: err, success: false, message:"Payment failed"});
    }
}