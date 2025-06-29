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
      // user.createForgotpassword({ id , active: true })  ///// createForgotpassword is a sequelize method function
      //     .catch(err => {
      //         throw new Error(err)  //createForgetPassword is a method of sequelize not for mongoose
      //     })

      await Forgotpassword.create({
        uuid: id,
        active: true,
        userId: user[0]._id,
      }) ///// createForgotpassword is a sequelize method function
        .catch((err) => {
          throw new Error(err);
        });

      const client = Sib.ApiClient.instance; /// we take instance from Sib apiclient
      const apiKey = client.authentications["api-key"]; //apiKey is object from client we got
      apiKey.apiKey = process.env.SIB_API_KEY;

      const tranEmailApi = new Sib.TransactionalEmailsApi();
      const sender = {
        email: process.env.SIB_EMAIL, //of Sender
      };

      const receivers = [
        // sending the reset link to the various users who forgotten their password this shou;d be array of objects //contain multiple users
        {
          email: email,
        },
      ];
      tranEmailApi
        .sendTransacEmail({
          ///transEmail is an asynchrounous task so do it by thencatch or async await
          sender,
          to: receivers,
          subject: "Sending with sendinblue",
          textContent: `I will help you to become {{params}}`, //you can pass html content also here
          params: {
            role: "Full Stack",
          },
          htmlContent: `<a href="http://localhost:3000/password/resetpassword/${id}">Reset password</a>`, /////html content overide text content whatever you written in text only html will seen in emil
        })
        .then((response) => {
          console.log("response", response);
          //return res.status(response).json({message: 'Link to reset password sent to your mail ', sucess: true})
        })
        .catch((error) => {
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
      // forgotpasswordrequest.update({ active: false});
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
