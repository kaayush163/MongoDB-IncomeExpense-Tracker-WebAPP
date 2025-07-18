
const AWS = require('aws-sdk');
const linkmodel  = require('../models/downloadurlsModel');
const mongoose = require('mongoose');

exports.uploadToS3 = (data,filename) => {
   
    const BUCKET_NAME = 'expensetracking1234';
    const IAM_USER_KEY = process.env.IAM_USER_KEY;
    const IAM_USER_SECRET = process.env.IAM_USER_SECRET;
 
    let s3bucket = new AWS.S3({     ///inittializing S3 buket
        accessKeyId: IAM_USER_KEY,
        secretAccessKey: IAM_USER_SECRET,
    
    })   
 
     ///now upload to get xml url
     var params = {
       Bucket: BUCKET_NAME,
       Key: filename,   
       Body: data,
       ACL:'public-read'        //to read xml file publically accessible
     }
     
    return new Promise((resolve,reject) => {
     s3bucket.upload(params, (err,s3response) => {
       if(err){
         console.log('Something went wrong', err)
         reject(err);
       }else{
         resolve(s3response.Location)
         console.log('success', s3response);
       }
     })
   })
 
 }


exports.urlExport = async function(url, userid){

  try{
  //  await linkmodel.create({
  //      userId : userid,
  //      url : url
  // })
  const links = new linkmodel({
    userId : userid,
    url : url
  })
  await links.save()
  console.log("Db Updation done")
  } catch(e){
   console.log(e)
   console.log("url exp")
  }

  
}

exports.urlsFetch = async function(userid){

  try{
      // const list = await linkmodel.findAll({
      //     where : { userId : userid}
      // })
      // return list;

      console.log(userid)
      const list = await linkmodel.find({userId : new mongoose.Types.ObjectId(userid)} )
      .then((response)=>{
          console.log("list urls", JSON.stringify(response))
          return response;
      })
      console.log("Db fetch done")
      console.log(list)
      return list;
  
  } catch(e){
   console.log(e)
  }

  
}
