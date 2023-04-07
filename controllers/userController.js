const User = require("../models/userModel");
// const Forgot = require("../models/forgotPasswordModel");
const Expense = require("../models/expenseModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Sib = require("sib-api-v3-sdk");
const { v4: uuidv4 } = require("uuid");


const signup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const signedUser = await User.findOne({email: email});
    if (!signedUser) {
      const hashedPwd = await bcrypt.hash(password, 10);
      const user = await new User({
        name,
        email,
        password: hashedPwd,
      }).save();
      console.log("sign up successfully");
      return res.json("sign up successfully");
    } else {
      console.log("User already signed up");
      return res.json({ message: "User already signed up" });
    }
  } catch (err) {
    console.log(err);
  }
};
const authUser = (id, name) => {
  return jwt.sign({ userId: id, userName: name }, process.env.JWT_SECRET);
};
const signin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const usr = await User.findOne({ email: email });
    if (!usr) {
      return res.status(404).json({ message: "Email not registered" });
    } else {
      const result = await bcrypt.compare(password, usr.password);
      if (!result) {
        return res.status(401).json({ message: "Password Invalid" });
      } else {
        console.log("login success");
        return res.json({
          message: "login success",
          token: authUser(usr.id, usr.name),
        });
      }
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: err });
  }
};

// const forgotPassword = async (req, res, next) => {
//   const t = await sequelize.transaction();
//   try {
//     const email = req.body.email;
//     const userid = await User.findOne({ where: { email: email } });
//     if (userid) {
//       const uuid = uuidv4();
//       const url = "http://localhost:3000/password/resetpassword/" + uuid;
//       const client = Sib.ApiClient.instance;
//       var apiKey = client.authentications["api-key"];
//       apiKey.apiKey = process.env.EMAIL_API_KEY;

//       const tranEmailApi = new Sib.TransactionalEmailsApi();
//       const sender = {
//         email: "thatanjan@gmail.com",
//         name: "Sumit",
//       };
//       const receivers = [
//         {
//           email: email,
//         },
//       ];
//       await tranEmailApi.sendTransacEmail({
//         sender,
//         to: receivers,
//         subject: "Reset password Link",
//         htmlContent: `<a href=${url}>click here to reset password</a>`,
//       });
//       await Forgot.create(
//         {
//           id: uuid,
//           userId: userid.id,
//           isActive: true,
//         },
//         { transaction: t }
//       );
//       await t.commit();
//       return res.json({ message: "Success" });
//     } else {
//       return res.json({ message: "Email id not registered" });
//     }
//   } catch (err) {
//     await t.rollback();
//     console.log(err);
//     return res.json(err);
//   }
// };
const resetPassword = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const uuid = req.params.id;
    const reset = await Forgot.findByPk(uuid, { transaction: t });
    if (reset.isActive === true) {
      await Forgot.update(
        {
          isActive: false,
        },
        { where: { id: uuid }, transaction: t }
      );
      await t.commit();
      res.status(200).send(`<!DOCTYPE html>
      <html lang="en">
      
      <head>
          <meta charset="UTF-8">
          <meta http-equiv="X-UA-Compatible" content="IE=edge">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet"
              integrity="sha384-GLhlTQ8iRABdZLl6O3oVMWSktQOp6b7In1Zl3/Jr59b6EGGoI1aFkw7cmDA6j6gD" crossorigin="anonymous">
          <script src="https://cdnjs.cloudflare.com/ajax/libs/axios/1.3.2/axios.min.js"
              integrity="sha512-NCiXRSV460cHD9ClGDrTbTaw0muWUBf/zB/yLzJavRsPNUl9ODkUVmUHsZtKu17XknhsGlmyVoJxLg/ZQQEeGA=="
              crossorigin="anonymous" referrerpolicy="no-referrer"></script>
          <title>Forgot Password</title>
      </head>
      
      <body>
          <div class="container-fluid p-5">
              <div class="container w-25 border border-secondary">
                  <h6 class="text-center message text-danger"></h6>
                  <h3 class="text-center text-secondary my-4">Enter New Password</h3>
                  <form class="form">
                      <div class="email p-2">
                          <label for="password">Password:</label>
                          <input class="w-100" id="password" type="password" name="password" value="">
                      </div>
                      <div class="p-2 text-center">
                          <button id="update" type="submit" class="mt-5 mb-3 btn btn-success">Reset Password</button>
                      </div>
                  </form>
              </div>
          </div>
          <script>
              const btn = document.getElementById('update');
              const password = document.getElementById('password');
      
              btn.addEventListener('click', async (e) => {
                  e.preventDefault();
                  const obj = {
                      password: password.value
                  }
                  const updated = await axios.post("http://localhost:3000/password/updatepassword/${uuid}", obj);
      
              })
          </script>
      
      </body>
      
      </html>`);
     
      res.end();
    } else {
      return res.json({ message: "Link Expired" });
    }
  } catch (err) {
    console.log(err);
    await t.rollback();
    console.log(err);
    return res.json(err);
  }
};
const updatepassword = async (req,res)=>{
  const t = await sequelize.transaction();
  try{
    const id = req.params.id;
    const pwd = await bcrypt.hash(req.body.password,10) ;
    const userid = await Forgot.findByPk(id,{transaction:t});
    await User.update({
      password:pwd
    },{where:{id:userid.userId}});
    await t.commit();
    return res.status(200).json({message:"Success"});
  }catch(err){
    await t.rollback();
    console.log(err);
  }
  
}

const getReport = async (req,res)=>{
  try{
    const report = await Expense.find({userId: req.user.id});
    console.log("report generated");
    return res.status(200).json({report});
  }catch(err){
    console.log(err);
    return res.status(400).json({err});
  }
}

module.exports = {
  signup,
  signin,
  // forgotPassword,
  resetPassword,
  updatepassword,
  getReport,
};
