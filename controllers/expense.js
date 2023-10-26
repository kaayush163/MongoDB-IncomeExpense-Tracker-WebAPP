const Expense = require("../models/expense");
const User = require("../models/signup");
const mongoose = require('mongoose')
const S3Service = require('../services/S3services');
const UserServices = require('../services/userservices')


function isValid(string){
  if(string == undefined || string.length === 0){
      return true;
  }else {
      return false;
  }
}


const downloadexpense = async(req,res) => {
 
  try{
    if(req.user.ispremiumuser == true) {
      const expenses = await UserServices.getExpenses(req,res)
      
       const userId = req.user.id;
       console.log('expenses of user>>>>>',expenses[0].dataValues);
       
       
       const stringifiedExpenses = JSON.stringify(expenses); 
       console.log('stringified>>>>',stringifiedExpenses);
 
       const filename = `Expense${userId}/${new Date()}.txt`;              
       console.log(filename);
 
       
       let fileURl=await S3Service.uploadToS3(stringifiedExpenses,filename);   
       
       await S3Service.urlExport(fileURl, userId);  


       console.log(fileURl);    
       res.status(201).json({fileURl, success: true})                            
    }else {
      res.status(402).json("You are not a premium user");
    }  
  }
  catch(err){
    console.log(err);
    res.status(500).json({err:err,fileURl:'', success:false})  
  }
  
}


exports.getUpdateExpense = async(req,res) => {
  try{
    const all = await User.find({_id: req.user._id});
    console.log('alldetail tot>>>>',all);
     return res.status(200).json({all, success: true});
     
  }
  catch(err){
    console.log(err);
    return res.status(500).json({error:err, status:false,message:"Not able to get all expenses"});
  }
  
}


exports.getExpense = async (req, res, next) => {
  try {

    const PAGE = req.query.page || 1;
    console.log("pages>>>",PAGE);
    const ITEMS_PER_PAGE = +req.query.count || 5;   
    console.log(ITEMS_PER_PAGE);
    const userId = req.user._id;
    

    const count = await Expense.count({userId:userId})
    console.log('Number of records', count);

    await Expense.find({userId: userId}).limit(ITEMS_PER_PAGE).skip((PAGE - 1) * ITEMS_PER_PAGE)   
    .then((rows) => {
      
      
      console.log("currentpage",PAGE);
      console.log("nextpage",Number(PAGE)+1);
      console.log("lastpage",Math.ceil(count / ITEMS_PER_PAGE));
      
      res.json({         
        rows:rows,
        currentpage: PAGE,
        hasnextpage:(ITEMS_PER_PAGE*PAGE)<count,   
        nextpage:Number(PAGE)+1,   
        haspreviouspage: PAGE > 1,
        previouspage: PAGE - 1,
        lastpage: Math.ceil(count / ITEMS_PER_PAGE)
      })
      
      
      return rows.data
    })
    .catch(err => console.log(err));

  } 
  catch (err) {
    
    console.log(err);
    return res.status(500).json({error:err, status:false,message:"Not able to get all expenses"});
  }
};

exports.postExpense = async (req, res, next) => {
  
  
  
  try {
    
    const amount = req.body.amount;
    const text = req.body.text;
    const category = req.body.category;
    if(isValid(amount) || isValid(text) || isValid(category)){
      return res.status(400).json({success: false, message: 'Some Parameter is missing'});
    }
    const data = await Expense.create({
      text : text,
      amount: amount,
      category: category,
      userId: req.user._id         
    });    
    
    
    

    const totalBal = Number(req.user.totalBalance) + amount
    console.log('totalBal>>>>',totalBal);

    let totalexp = Number(req.user.totalexpense);
    let totalinc = Number(req.user.totalincome);
    
     if(amount<0){
      totalexp = Number(req.user.totalexpense) + amount;
      console.log('totalexp>>>',totalexp);
     }
     else if(amount>=0){
      totalinc = Number(req.user.totalincome) + amount;
      console.log('totalinc>>>',totalinc);
     }
      
    await User.findOneAndUpdate({ _id: req.user._id},{$set: {     
      totalBalance : totalBal,
      totalincome : totalinc,
      totalexpense : totalexp}});
   
    return res.status(201).json({data, success: true});
  } catch (err) {
    
    return res.status(500).json({ success: false, error: err });
  }
};


exports.deleteExpense = async (req, res, next) => {
  
  try {
    const expenseId = req.params.expenseId;              
    console.log('expenseid>>>>',expenseId);
    const expenseField = await Expense.findById(expenseId);   
    console.log('expensefirled>>>>',expenseField.amount);

    if(expenseId == undefined || expenseId.length === 0){
     return res.status(400).json({success: false});                
    }

    
    await expenseField.deleteOne({_id:expenseId,userId: req.user._id});  
    const totalBal = Number(req.user.totalBalance) - (expenseField.amount);                                                    
    console.log('totalBalance left>>',totalBal);

    let totalexp = Number(req.user.totalexpense);
    let totalinc = Number(req.user.totalincome);
    
     if(expenseField.amount < 0){
      totalexp = Number(req.user.totalexpense) - expenseField.amount;
      console.log('totalexp>>>',totalexp);
     }
     else if(expenseField.amount >= 0){
      totalinc = Number(req.user.totalincome) - expenseField.amount;
      console.log('totalinc>>>',totalinc);
     }
    

    await User.findOneAndUpdate({ _id: req.user._id},{$set: {     
      totalBalance : totalBal,
      totalincome : totalinc,
      totalexpense : totalexp}});
    return res.status(201).json({ delete: expenseField , success: true, message: "deleted successfully"});
  } catch (err) {
    
    console.error(err);
    return res.status(500).json({ success: false, message: "Failed to delete"})
  }
};

exports.editExpense = async (req, res, next) => {
  
  try {
    const expenseId = req.params.expenseId;    
    console.log('expenseid>>>>',expenseId);
    const expenseField = await Expense.findById(expenseId);
    console.log('expensefirled>>>>',expenseField.amount);

    const amount = req.body.amount;
    const text = req.body.text;
    const category = req.body.category;

    if(isValid(amount) || isValid(text) || isValid(category) || expenseId == undefined || expenseId.length === 0){
      return res.status(400).json({success: false, message:"some edit parameter is missing"});
    }
    const data = await Expense.findOneAndUpdate({ _id: expenseId, userId: req.user._id },
      {
        text : text,
        amount: amount,
        category: category,
        
      });
    
    const totalBal = Number(req.user.totalBalance) - (expenseField.amount) + amount;    
    console.log('totalBal>>',totalBal);

    let totalexp = Number(req.user.totalexpense);
    let totalinc = Number(req.user.totalincome);
    
     if(expenseField.amount < 0){
      totalexp = Number(req.user.totalexpense) - expenseField.amount + amount;
      console.log('totalexp>>>',totalexp);
     }
     else if(expenseField.amount >= 0){
      totalinc = Number(req.user.totalincome) - expenseField.amount + amount;
      console.log('totalinc>>>',totalinc);
     }

     await User.findOneAndUpdate({ _id: req.user._id},{$set: {     
      totalBalance : totalBal,
      totalincome : totalinc,
      totalexpense : totalexp}});
    return res.status(201).json(data);
  } catch (err) {
    
   return res.status(500).json({ error: err });
  }
};

module.exports.downloadexpense = downloadexpense;
