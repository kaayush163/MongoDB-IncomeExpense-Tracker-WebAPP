const User = require("../models/signup");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

function isValid(string){
    if(string == undefined || string.length === 0){
        return true;
    }else {
        return false;
    }
}
const postUser = async (req, res, next) => {
  try {
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;

    const userExist = await User.find({email:email});    
    console.log('userExist>>',userExist);
    if(userExist && userExist.length>0){
      return res.status(404).json({ message: "User already Exists, Please Login" });
    }
    if(isValid(name) || isValid(email) || isValid(password)){
        return res.status(400).json({err: "bad parameters . Something is missing in details"});
    }
    
    const salt =await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(password,salt);
      const Users = new User({
        name: name,
        password: hashedPass,
        email: email,
        ispremiumuser : false,
        totalBalance:0,
        totalincome:0,
        totalexpense:0,
    })
    Users.save().then(result => { 
      console.log(result)
      return res.status(201).json({message : "User Created Succesfully"})
    }); 
  } 
  catch(err) {
    return res.status(500).json({ error: err });
  }
};

const generateAccessToken = (id,name,ispremiumuser) => {          
  return jwt.sign({userId : id, name: name, ispremiumuser}, process.env.TOKEN_SECRET);  
}


const postlogin = async (req, res, next) => {
    try {
      const email = req.body.email;
      
      const password = req.body.password;
      
      if(isValid(email) || isValid(password)){
        return res.status(400).json({err: "You haven't fill the data properly.Something is missing!!!"});
      }
      else{
        
        const userExist = await User.find({ email:email });
        console.log('datavalues>>>>',userExist[0].dataValues);
        console.log('datavalues>>>>',userExist[0]);

        if(userExist) {
          bcrypt.compare(password,userExist[0].password,(err, result) => {   
            if (err) {
              throw new Error("Something went wrong");
            }
            if (result) {    
              return res.status(201).json({ 
              message: "User logged in successfully", 
              success: true, 
              token: generateAccessToken(userExist[0].id, userExist[0].name, userExist[0].ispremiumuser)
            });   
            } else {
              return res.status(401).json({ message: "User not authorized. Wrong password", success: false});
            }
          });
         }else if(!userExist){
          return res.status(404).json({error: "User doesn't exist. Try with different email",
            success: false, 
            message: "User doen't exist"
          });
         }
      }
    } 
    catch (err) {
      return res.status(500).json({ message: err ,success: false });
    }

};


module.exports = {postUser, postlogin}