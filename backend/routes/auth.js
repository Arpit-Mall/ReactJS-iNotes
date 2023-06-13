const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const UserSchema = require("../models/UserSchema");
const bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
const JWT_SEC="MyNameIsArpit@Mall";
var FetchUser = require("../middleware/fetchUser");




// ROUTE 1: Create a User using: POST "/api/auth/createuser". No login required
router.post("/createuser",  
  [
    body("name", "Enter a valid name").isLength({ min: 2 }),
    body("email", "Enter a valid email").isEmail(),
    body("password", "Password must be atleast 5 characters").isLength({ min: 4 }),
  ], async(req, res) => {

    let success = false;

    // If there are errors, return Bad request and the errors
    const error = validationResult(req);
    if (!error.isEmpty()) 
     {
         return res.status(400).json({ success, error: error.array() });
     }
    // console.log(req.body);

    try {
          // Check whether the user with this email exists already
          let user = await UserSchema.findOne({email:req.body.email});
          if(user)
            {
              return res.status(400).json({ success, error:"Sorry a user with this email already exist"});
            }

          const salt = await bcrypt.genSalt(10);
          const Secpass= await bcrypt.hash(req.body.password,salt);   
          
          // Create a new user
          user = await UserSchema.create({
              name: req.body.name,
              email: req.body.email,
              password: Secpass})
          
          const data ={
            user:{
              id:user.id
            }
          }
          const authToken =jwt.sign(data,JWT_SEC);
          
          success=true;
          res.send({success,authToken})  
          // res.send(user);
        } 
    catch (error) 
      {
        console.error(error.message);
        res.status(500).send("Internal Server Error"); 
      }
  }
);


// ROUTE 2: Authenticate a User using: POST "/api/auth/login". No login required
router.post("/login",
[
  body("email","Enter a valid email").isEmail(),
  body("password","Password cannot be blank").exists()
],async(req,res) => {
  
  let success = false;

  // If there are errors, return Bad request and the errors
  const error = validationResult(req);
  if (!error.isEmpty()) 
    {
      return res.status(400).json({ error: error.array() });
    }

  const {email,password}=req.body;
  try
    {
      const user = await UserSchema.findOne({email});
      if(!user)
        {
          return res.status(400).json({error:"Please try to login with correct credentials"});
        }

      const passwordCompare = await bcrypt.compare(password,user.password);
      if(!passwordCompare)
        {
          return res.status(400).json({success,error:"Please try to login with correct credentials"});
        }

      const data = {
        user:{
          id:user.id
        }
      }
      
      const authToken = jwt.sign(data,JWT_SEC);
      success=true;
      res.json({success,authToken});
    } 
  catch (error)
    {
      console.error(error.message);
      res.status(500).send("Internal Server Error");
    }
});


// ROUTE 3: Get loggedin User Details using: POST "/api/auth/getuser". Login required
router.post("/getuser", FetchUser, async (req,res) =>{
  try 
    {
      const userId = req.user.id;
      const user = await UserSchema.findById(userId).select("-password");
      res.send(user);
    } 
  catch (error) 
    {
      console.error(error.message);
      res.statusCode(500).send("Internal Server Error");
    }
});

module.exports = router;
