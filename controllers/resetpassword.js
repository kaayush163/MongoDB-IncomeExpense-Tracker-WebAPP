const uuid = require("uuid");
const bcrypt = require("bcrypt");
const Sib = require("sib-api-v3-sdk");
const mongoose = require("mongoose");

const User = require("../models/signup");
const Forgotpassword = require("../models/forgotpassword");

const forgotpassword = async (req, res) => {
  try {
    const email = req.body.email;

    const user = await User.find({ email: email });
    if (user) {
      console.log("id of user>>>>", user);
      const id = uuid.v4();
      console.log("id>>>>>", id);

      await Forgotpassword.create({
        uuid: id,
        active: true,
        userId: user[0]._id,
      }) ///// createForgotpassword is a sequelize method function
        .catch((err) => {
          throw new Error(err);
        });

      const client = Sib.ApiClient.instance; 
      const apiKey = client.authentications["api-key"]; 
      apiKey.apiKey = process.env.SIB_API_KEY;

      console.log("API Key loaded:", process.env.SIB_API_KEY ? "Yes" : "No");
      const tranEmailApi = new Sib.TransactionalEmailsApi();
      const sender = {
        name: "App support",
        email: "kaayush163@gmail.com", //of Sender
      };

      const receivers = [
        {
          email: email,
        },
      ];

      
      tranEmailApi
        .sendTransacEmail({
          sender,
          to: receivers,
          subject: "Sending with sendinblue",
          textContent: `Click the link to reset your password.`,
        })
        .then((response) => {
          console.log("response", response);
          
        })
        .catch((error) => {
          console.log(error);
          throw new Error(error);
        });
    } else {
      throw new Error("User doesnt exist");
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err, success: false });
  }
};

const resetpassword = async (req, res) => {
  try {
    const id = req.params.id;
    const forgotpasswordrequest = await Forgotpassword.find({ uuid: id });
    if (forgotpasswordrequest) {
      
      res.status(200).send(`<html>
                                    <script>
                                        function formsubmitted(e){
                                            e.preventDefault();
                                            console.log('called')
                                        }
                                    </script>

                                    <form action="/password/updatepassword/${id}" method="get">
                                        <label for="newpassword">Enter New password</label>
                                        <input name="newpassword" type="password" required></input>
                                        <button>reset password</button>
                                    </form>
                                </html>`);
      res.end();
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Internal Server Error 500, Link not working in resetpassword",
      err: err,
    });
  }
};

const updatepassword = async (req, res) => {
  try {
    const { newpassword } = req.query;
    const { resetpasswordid } = req.params;
    const row = await Forgotpassword.find({ uuid: resetpasswordid });
    if (row) {
      console.log("row>>>", row);
      const userId = row[0].userId;
      console.log(userId[0]);
      const objectuserId = new mongoose.Types.ObjectId(userId[0].toString());
      console.log("objectuserid>>>>", objectuserId);
      const forgot = Forgotpassword.findOneAndUpdate(
        { uuid: resetpasswordid },
        { $set: { active: false } }
      );

      console.log(forgot);
      const salt = await bcrypt.genSalt(10);
      const hashedPass = await bcrypt.hash(newpassword, salt);

      const updatepass = await User.findOneAndUpdate(
        { _id: objectuserId },
        { $set: { password: hashedPass } }
      );

      console.log(updatepass);
      // res.redirect('/index.html')
      res.redirect("/");
    } else {
      return res.status(404).json({ error: "No user Exists", success: false });
    }
  } catch (error) {
    return res.status(403).json({
      error: error,
      message: "some problem occur in update",
      success: false,
    });
  }
};

module.exports = {
  forgotpassword,
  updatepassword,
  resetpassword,
};
