require("dotenv").config();
const User = require("../models/userModels");
const Validator = require("validator");
const jwt = require("jsonwebtoken");

const regsiterUSer = async (req, res) => {
  try {
    //console.log(req.body,"nn")
    let { name, email, password } = req.body;
    if (!(name && email && password)) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Manadatory fields can not be empty!",
        });
    }

    // check valid email
    const validEmail = Validator.isEmail(email);
    if (!validEmail) {
      return res
        .status(400)
        .json({ success: false, message: "Please enter valid email" });
    }

    const findUser = await User.findOne({ email });
    if (findUser) {
      return res
        .status(400)
        .json({ success: false, message: "Please login with credentails" });
    }
    // save user
    let newUser = {
      name,
      email,
      password,
    };

    await User.create(newUser);
    return res.status(201).json({
      success: true,
      message: "User register successfully",
    });
  } catch (e) {
    // console.log(e,"ee")
    return res.status(500).json({
      success: false,
      message: "Something went wrong!",
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!(email && password)) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Manadatory fields can not be empty",
        });
    }

    // check valid email
    const validEmail = Validator.isEmail(email);
    if (!validEmail) {
      return res
        .status(400)
        .json({ success: false, message: "Please enter valid email" });
    }

    // const find user
    const find_User = await User.findOne({ email });
    if (!find_User) {
      return res
        .status(400)
        .json({ success: false, message: "User does not exists!" });
    }

    // compare password
    const isMatchPassword = await find_User.comparePassword(password);
    if (!isMatchPassword) {
      return res
        .status(400)
        .json({ success: false, message: "Password mismatch!" });
    }

    let userData = {
      id: find_User._id,
      name: find_User.name,
      email: find_User.email,
      role: find_User.role,
    };
    // generate accessToken
    const access_token = jwt.sign(
      { email: find_User.email, role: find_User.role },
      process.env.Jwt_Secret_Key,
      { expiresIn: "1m" }
    );

    // generate refreshTokens
    const refresh_token = jwt.sign(
      { email: find_User.email, role: find_User.role },
      process.env.Jwt_Secret_Key_refreshToken,
      { expiresIn: "1d" }
    );

    return res.status(200).json({
      sucess: true,
      data: userData,
      access_token: access_token,
      refresh_token: refresh_token,
    });
  } catch (e) {
    //    console.log(e,"ee")
    return res.status(500).json({
      success: false,
      message: "Something went wrong!",
    });
  }
};

const getAllUserList = async (req, res) => {
  try {
    const findUser = await User.find({});
    if (!findUser) {
      return res.status(200).json({ success: true, message: "No user found!" });
    }
    return res.status(200).json({ success: true, data: findUser });
  } catch (e) {
    //   console.log(e,"ee")
    return res.status(500).json({
      success: false,
      message: "Something went wrong!",
    });
  }
};


const generateRefreshToken  = async (req, res) => {
  try {
        let{role, refresh_token} = req.body;
        // console.log(req.body,"mm")
        const isValid = await verifyRefreshToken(role,refresh_token);
          //  console.log(isValid,"nn")
        if (!isValid) {
        return res
        .status(401)
        .json({ success: false, error: "Invalid token,try login again" });
        } 
        const accessToken = jwt.sign({role:role }, process.env.Jwt_Secret_Key, {
          expiresIn: "1h",
          });
          return res.status(200).json({ success: true, accessToken });
  
  } catch (e) {
       //console.log(e,"ee")
    return res.status(500).json({
      success: false,
      message: "Something went wrong!",
    });
  }
};

module.exports = {
  regsiterUSer,
  loginUser,
  getAllUserList,
  generateRefreshToken
};


const verifyRefreshToken  = async function(role, token) {
  try {
   const decoded = jwt.verify(token,process.env.Jwt_Secret_Key_refreshToken);
           return decoded.role === role
  } catch (error) {
   console.error(error);
   return false;
  }
 }