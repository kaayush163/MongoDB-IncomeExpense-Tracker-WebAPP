const jwt = require('jsonwebtoken');
const User = require('../models/signup');

const authenticate = (req, res, next) => { 

    try {
        let token = req.header('Authorization') ; 
        //token = token.split(" ")[1];

        let user = jwt.verify(token,process.env.TOKEN_SECRET); //THIS IS DECRYPTION using token secret key   

        User.findById(user.userId).then((user) => {
            req.user = user; 
            next(); 
        })
    } 
    catch (err) 
    {
        return res.status(401).json({ error:"problem in auth.js", success: false });
    }
};

module.exports = {authenticate};
